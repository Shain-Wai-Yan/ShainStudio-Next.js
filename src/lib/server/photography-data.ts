import 'server-only';
import { boundedInteger } from '@/lib/utils/pagination';
import { STRAPI_ORIGIN_URL } from '@/lib/strapi/config';
import type { PhotographyRepository } from './photography-repository';
import type { Photo, PhotoCollection, PhotoFeedPage, PhotoFeedQuery, PhotoSearchQuery, PhotographyLocale } from '@/lib/strapi/photography';

const FETCH_TIMEOUT_MS = 10_000;
const MAX_PAGE_SIZE = 24;
const MAX_SEARCH_LENGTH = 80;
type CacheMode = { revalidate: number } | { noStore: true };

export function slugifyCollection(value: string): string {
  return value.normalize('NFKD').toLowerCase().trim().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function normalizeSeed(seed: number): number {
  return Number.isFinite(seed) ? Math.abs(Math.trunc(seed)) % 64 : 0;
}

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

export function seededPageOrder(pageCount: number, seed: number): number[] {
  if (pageCount <= 1) return pageCount === 1 ? [1] : [];
  // Keep the only partial page last so the first screen always receives a full
  // batch. Full pages still receive a deterministic session-specific order.
  const result = Array.from({ length: pageCount - 1 }, (_, index) => index + 1);
  const random = mulberry32(normalizeSeed(seed) + 1);
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return [...result, pageCount];
}

function seededShuffle<T>(items: T[], seed: number): T[] {
  const result = [...items];
  const random = mulberry32(seed + 1);
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

async function fetchStrapi(path: string, mode: CacheMode): Promise<Record<string, unknown>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (process.env.VIP_SECRET_KEY) headers['x-shain-secret'] = process.env.VIP_SECRET_KEY;
  try {
    const response = await fetch(`${STRAPI_ORIGIN_URL}/api/${path}`, {
      headers,
      signal: controller.signal,
      ...('noStore' in mode
        ? { cache: 'no-store' as const }
        : { next: { revalidate: mode.revalidate, tags: ['strapi', 'photography'] } }),
    });
    if (!response.ok) throw new Error(`Photography source returned HTTP ${response.status}`);
    return await response.json() as Record<string, unknown>;
  } finally {
    clearTimeout(timeout);
  }
}

function makeAbsolute(url: string): string {
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return `${STRAPI_ORIGIN_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

function relationValue(value: unknown, key: string): string | undefined {
  if (!value || typeof value !== 'object') return typeof value === 'string' ? value : undefined;
  const object = value as Record<string, unknown>;
  if (typeof object[key] === 'string') return object[key];
  const directAttributes = object.attributes as Record<string, unknown> | undefined;
  if (typeof directAttributes?.[key] === 'string') return directAttributes[key];
  const data = object.data as Record<string, unknown> | undefined;
  const attributes = data?.attributes as Record<string, unknown> | undefined;
  return typeof attributes?.[key] === 'string' ? attributes[key] : undefined;
}

function imageMeta(value: unknown): { url: string | null; width?: number; height?: number } {
  if (!value) return { url: null };
  if (typeof value === 'string') return { url: makeAbsolute(value) };
  if (typeof value !== 'object') return { url: null };
  const raw = value as Record<string, unknown>;
  const data = raw.data as Record<string, unknown> | undefined;
  const attributes = data?.attributes as Record<string, unknown> | undefined;
  const image = attributes ?? data ?? raw;
  return {
    url: typeof image.url === 'string' ? makeAbsolute(image.url) : null,
    width: typeof image.width === 'number' && image.width > 0 ? image.width : undefined,
    height: typeof image.height === 'number' && image.height > 0 ? image.height : undefined,
  };
}

function tagsFrom(value: unknown): string[] {
  const raw = Array.isArray(value) ? value : value && typeof value === 'object' && Array.isArray((value as Record<string, unknown>).data) ? (value as { data: unknown[] }).data : [];
  return raw.map((tag) => relationValue(tag, 'name')).filter((tag): tag is string => Boolean(tag));
}

export function transformPhoto(record: Record<string, unknown>): Photo {
  const attributes = record.attributes;
  const raw = attributes && typeof attributes === 'object' ? { ...(attributes as Record<string, unknown>), id: record.id, documentId: record.documentId } : record;
  const image = imageMeta(raw.image);
  const category = relationValue(raw.category, 'name');
  return {
    id: typeof raw.id === 'number' ? raw.id : 0,
    documentId: typeof raw.documentId === 'string' ? raw.documentId : undefined,
    title: typeof raw.title === 'string' && raw.title.trim() ? raw.title : 'Untitled',
    description: typeof raw.description === 'string' ? raw.description : undefined,
    location: typeof raw.location === 'string' ? raw.location : '',
    category,
    categorySlug: category ? slugifyCollection(category) : undefined,
    image: image.url,
    width: image.width,
    height: image.height,
    altText: typeof raw.alt_text === 'string' && raw.alt_text.trim() ? raw.alt_text : undefined,
    tags: tagsFrom(raw.tags),
    language: raw.language === 'zh' ? 'zh' : 'en',
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : '',
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : '',
  };
}

function pagination(data: Record<string, unknown>) {
  const meta = data.meta as { pagination?: { total?: number; pageCount?: number } } | undefined;
  return { total: meta?.pagination?.total ?? 0, pageCount: meta?.pagination?.pageCount ?? 0 };
}

function records(data: Record<string, unknown>): Photo[] {
  return Array.isArray(data.data) ? (data.data as Record<string, unknown>[]).map(transformPhoto) : [];
}

function addPopulate(params: URLSearchParams) {
  ['url', 'width', 'height'].forEach((field, index) => params.set(`populate[image][fields][${index}]`, field));
  params.set('populate[category][fields][0]', 'name');
  params.set('populate[tags][fields][0]', 'name');
}

function addFilters(params: URLSearchParams, collectionName?: string, search?: string) {
  if (collectionName) params.set('filters[category][name][$eq]', collectionName);
  if (search) {
    params.set('filters[$or][0][title][$containsi]', search);
    params.set('filters[$or][1][location][$containsi]', search);
    params.set('filters[$or][2][category][name][$containsi]', search);
    params.set('filters[$or][3][tags][name][$containsi]', search);
  }
}

class StrapiPhotographyRepository implements PhotographyRepository {
  async getFeed(input: PhotoFeedQuery): Promise<PhotoFeedPage> {
    const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Math.trunc(input.pageSize || MAX_PAGE_SIZE)));
    const page = Math.max(1, Math.trunc(input.page || 1));
    const seed = normalizeSeed(input.seed);
    const collectionName = await this.collectionName(input.collection);
    if (input.collection && !collectionName) return { photos: [], page, pageCount: 0, total: 0, hasMore: false };
    const countParams = new URLSearchParams({ 'pagination[page]': '1', 'pagination[pageSize]': '1' });
    addFilters(countParams, collectionName);
    const total = pagination(await fetchStrapi(`photographies?${countParams}`, { revalidate: 300 })).total;
    const pageCount = Math.ceil(total / pageSize);
    if (pageCount === 0 || page > pageCount) return { photos: [], page, pageCount, total, hasMore: false };
    const sourcePage = seededPageOrder(pageCount, seed)[page - 1];
    const params = new URLSearchParams({ 'pagination[page]': String(sourcePage), 'pagination[pageSize]': String(pageSize), 'sort[0]': 'updatedAt:desc', 'sort[1]': 'id:desc' });
    addPopulate(params);
    addFilters(params, collectionName);
    const photos = seededShuffle(records(await fetchStrapi(`photographies?${params}`, { revalidate: 300 })), seed * 10_007 + sourcePage);
    return { photos, page, pageCount, total, hasMore: page < pageCount };
  }

  async search(input: PhotoSearchQuery): Promise<PhotoFeedPage> {
    const search = input.search.trim().slice(0, MAX_SEARCH_LENGTH);
    const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Math.trunc(input.pageSize || MAX_PAGE_SIZE)));
    const page = Math.max(1, Math.trunc(input.page || 1));
    const collectionName = await this.collectionName(input.collection);
    if (input.collection && !collectionName) return { photos: [], page, pageCount: 0, total: 0, hasMore: false };
    if (search.length < 2) return { photos: [], page, pageCount: 0, total: 0, hasMore: false };
    const params = new URLSearchParams({ 'pagination[page]': String(page), 'pagination[pageSize]': String(pageSize), 'sort[0]': 'updatedAt:desc', 'sort[1]': 'id:desc' });
    addPopulate(params);
    addFilters(params, collectionName, search);
    const data = await fetchStrapi(`photographies?${params}`, { noStore: true });
    const meta = pagination(data);
    return { photos: records(data), page, pageCount: meta.pageCount, total: meta.total, hasMore: page < meta.pageCount };
  }

  async getCollections(language: PhotographyLocale): Promise<PhotoCollection[]> {
    void language;
    const params = new URLSearchParams({ 'pagination[pageSize]': '100', 'fields[0]': 'name', 'fields[1]': 'slug', 'populate[photographies][count]': 'true', sort: 'name:asc' });
    const data = await fetchStrapi(`categories?${params}`, { revalidate: 3600 });
    if (!Array.isArray(data.data)) return [];
    return (data.data as Record<string, unknown>[]).flatMap((entry) => {
      const raw = entry.attributes && typeof entry.attributes === 'object' ? entry.attributes as Record<string, unknown> : entry;
      const name = typeof raw.name === 'string' ? raw.name.trim() : '';
      const count = (raw.photographies as { count?: number } | undefined)?.count ?? 0;
      return name && count > 0 ? [{ name, slug: slugifyCollection(name), count, thumbnail: null }] : [];
    });
  }

  async getPhoto(documentId: string, language: PhotographyLocale): Promise<Photo | null> {
    void language;
    if (!/^[a-z0-9]{8,40}$/i.test(documentId)) return null;
    const params = new URLSearchParams({ 'filters[documentId][$eq]': documentId, 'pagination[pageSize]': '1' });
    addPopulate(params);
    return records(await fetchStrapi(`photographies?${params}`, { revalidate: 300 }))[0] ?? null;
  }

  async getRelated(photo: Photo, limit: number): Promise<Photo[]> {
    if (!photo.category) return [];
    const params = new URLSearchParams({ 'pagination[pageSize]': String(Math.min(12, Math.max(1, limit))), 'filters[category][name][$eq]': photo.category, 'sort[0]': 'updatedAt:desc' });
    if (photo.documentId) params.set('filters[documentId][$ne]', photo.documentId);
    addPopulate(params);
    return records(await fetchStrapi(`photographies?${params}`, { revalidate: 300 }));
  }

  async getSitemapPhotos(): Promise<Photo[]> {
    const output: Photo[] = [];
    for (let page = 1; page <= 100; page += 1) {
      const params = new URLSearchParams({ 'pagination[page]': String(page), 'pagination[pageSize]': '100', 'fields[0]': 'title', 'fields[1]': 'updatedAt', sort: 'updatedAt:desc' });
      const data = await fetchStrapi(`photographies?${params}`, { revalidate: 300 });
      output.push(...records(data));
      if (page >= pagination(data).pageCount) break;
    }
    return output.filter((photo) => Boolean(photo.documentId));
  }

  private async collectionName(slug?: string): Promise<string | undefined> {
    if (!slug) return undefined;
    return (await this.getCollections('en')).find((collection) => collection.slug === slug)?.name;
  }
}

export const repository: PhotographyRepository = new StrapiPhotographyRepository();

export async function getPhotography(searchParams: URLSearchParams) {
  const language: PhotographyLocale = searchParams.get('language') === 'zh' ? 'zh' : 'en';
  const page = boundedInteger(searchParams.get('page'), 1, 10_000);
  const pageSize = boundedInteger(searchParams.get('pageSize'), 20, MAX_PAGE_SIZE);
  const seed = boundedInteger(searchParams.get('seed'), 0, 63);
  const collection = searchParams.get('collection') || (searchParams.get('category') ? slugifyCollection(searchParams.get('category')!) : undefined);
  const search = searchParams.get('search')?.trim().slice(0, MAX_SEARCH_LENGTH);
  const result = search && search.length >= 2
    ? await repository.search({ page, pageSize, seed, collection, search, language })
    : await repository.getFeed({ page, pageSize, seed, collection, language });
  return { ...result, error: null };
}
