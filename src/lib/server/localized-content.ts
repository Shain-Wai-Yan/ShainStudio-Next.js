import 'server-only';
import { unstable_cache } from 'next/cache';
import { fetchFromStrapi, type FetchOptions } from '@/lib/strapi/client';
import { STRAPI_API_URL } from '@/lib/strapi/config';
import type { ContentLocale, ContentLocalization } from '@/types/localization';
import { collectionLocalization, localizedSeo } from '@/lib/content-localization';
import {LOCALIZED_ENDPOINTS,publicPopulation} from '@/lib/strapi/content-contract';

type Row = Record<string, unknown>;
type Query = NonNullable<FetchOptions['queryParams']>;
const LOCALIZED = LOCALIZED_ENDPOINTS;
const RELATIONS: Record<string, string> = { category: 'categories', tags: 'tags', project_type: 'project-types' };
const MAX_SNAPSHOT_ROWS = 2500;
const MAX_SNAPSHOT_BYTES = 8 * 1024 * 1024;
const inFlight = new Map<string, Promise<Row[]>>();
const MAX_ACTIVE_LOCALE_LOADS = 16;
const MAX_WAITING_LOCALE_LOADS = 64;
const LOCALE_ADMISSION_TIMEOUT_MS = 20_000;
let waitingLocaleLoads = 0;

async function waitForLocaleLoad(deadline: number): Promise<void> {
  const remaining = deadline - Date.now();
  if (remaining <= 0) throw new Error('CMS locale loader admission timed out');
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('CMS locale loader admission timed out')), remaining);
    // A failed read also frees a slot. Its original caller still receives the error.
    void Promise.race([...inFlight.values()].map(load => load.then(() => {}, () => {})))
      .then(() => { clearTimeout(timer); resolve(); });
  });
}
export const cmsLocale = (locale: ContentLocale) => locale === 'zh' ? 'zh-CN' : 'en';

function flat(value: unknown): Row {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid CMS record');
  const row = value as Row;
  return row.attributes && typeof row.attributes === 'object' ? { ...row, ...row.attributes as Row } : row;
}

/** Complete locale snapshot: inner requests never have independent lifetimes. */
export async function loadPublishedLocale(endpoint: string, locale: ContentLocale, query: Query): Promise<Row[]> {
  const result: Row[] = [];
  const seen = new Set<string>();
  let expectedTotal: number | undefined;
  let expectedPages: number | undefined;
  let bytes = 0;
  for (let page = 1; page <= Math.ceil(MAX_SNAPSHOT_ROWS / 100); page++) {
    const response = await fetchFromStrapi<{ data: unknown[]; meta: { pagination: { page: number; pageCount: number; total: number } } }>(endpoint, {
      cache: 'no-store', queryParams: { ...query, locale: cmsLocale(locale), status: 'published',
        'pagination[page]': page, 'pagination[pageSize]': 100, 'sort[0]': 'documentId:asc' },
    });
    if (response.error || !response.data) throw new Error(response.error || 'CMS unavailable');
    const { data, meta } = response.data;
    const pagination = meta?.pagination;
    if (!Array.isArray(data) || !pagination || pagination.page !== page || !Number.isInteger(pagination.total)
      || pagination.total < 0 || !Number.isInteger(pagination.pageCount) || pagination.pageCount < 0) throw new Error('Invalid CMS pagination envelope');
    expectedTotal ??= pagination.total;
    expectedPages ??= pagination.pageCount;
    if (pagination.total > MAX_SNAPSHOT_ROWS) throw new Error('CMS collection exceeds the bounded locale index; use a server-side catalog query');
    bytes += Buffer.byteLength(JSON.stringify(data));
    if (bytes > MAX_SNAPSHOT_BYTES) throw new Error('CMS locale snapshot exceeds its memory budget');
    if (pagination.total !== expectedTotal || pagination.pageCount !== expectedPages) throw new Error('CMS collection changed during pagination; retry the snapshot');
    for (const value of data) {
      const row = flat(value);
      if (typeof row.documentId !== 'string' || !/^[a-z0-9_-]{1,255}$/i.test(row.documentId)
        || seen.has(row.documentId) || (row.locale != null && row.locale !== cmsLocale(locale))) throw new Error('Invalid or duplicate CMS document identity/locale');
      if (!row.publishedAt) throw new Error('Draft data returned through published CMS query');
      seen.add(row.documentId); result.push(row);
    }
    if (page >= pagination.pageCount) {
      if (result.length !== pagination.total) throw new Error('Incomplete CMS collection');
      return result;
    }
    if (!data.length) throw new Error('Unexpected empty CMS page');
  }
  throw new Error('CMS pagination safety limit exceeded');
}

function cachedLocale(endpoint: string, locale: ContentLocale, query: Query, seconds: number) {
  const key = JSON.stringify(Object.entries(query).sort(([a],[b]) => a.localeCompare(b)));
  return unstable_cache(async () => {
    const flightKey = JSON.stringify([STRAPI_API_URL, endpoint, locale, key]);
    const existing = inFlight.get(flightKey);
    if (existing) return existing;
    if (inFlight.size >= MAX_ACTIVE_LOCALE_LOADS) {
      if (waitingLocaleLoads >= MAX_WAITING_LOCALE_LOADS) throw new Error('CMS locale loader queue is full');
      waitingLocaleLoads++;
      try {
        const deadline = Date.now() + LOCALE_ADMISSION_TIMEOUT_MS;
        while (inFlight.size >= MAX_ACTIVE_LOCALE_LOADS) {
          await waitForLocaleLoad(deadline);
          const shared = inFlight.get(flightKey);
          if (shared) return shared;
        }
      } finally { waitingLocaleLoads--; }
    }
    const pending = loadPublishedLocale(endpoint, locale, query).finally(() => inFlight.delete(flightKey));
    inFlight.set(flightKey, pending);
    return pending;
  },
    ['bilingual-published-v2', STRAPI_API_URL, endpoint, locale, key],
    { tags: [`${endpoint}:${cmsLocale(locale)}`], revalidate: seconds })();
}

/** Merge by documentId before filtering/pagination; Chinese-only publication is valid. */
export function resolvePublishedRows(english: Row[], chinese: Row[], locale: ContentLocale): Row[] {
  const en = new Map(english.map(row => [String(row.documentId), row]));
  const zh = new Map(chinese.map(row => [String(row.documentId), row]));
  const source = locale === 'en' ? en : new Map([...en, ...zh]);
  return [...source].map(([documentId, row]) => {
    const resolvedLocale = locale === 'zh' && zh.has(documentId) ? 'zh' : 'en';
    const localization: ContentLocalization = { documentId, requestedLocale: locale, resolvedLocale,
      isFallback: locale !== resolvedLocale, englishPublished: en.has(documentId), chinesePublished: zh.has(documentId) };
    return { ...row, localization };
  });
}

function parseFilters(query: Query): Row {
  const root: Row = {};
  for (const [key, value] of Object.entries(query)) {
    if (!key.startsWith('filters[')) continue;
    const parts = [...key.matchAll(/\[([^\]]+)\]/g)].map(match => match[1]);
    let object = root;
    parts.forEach((part,index) => { if (index === parts.length-1) object[part] = value;
      else { object[part] ??= {}; object = object[part] as Row; } });
  }
  return root;
}

function matches(value: unknown, filter: Row): boolean {
  if (Array.isArray(value)) return value.some(item => matches(item, filter));
  return Object.entries(filter).every(([key, expected]) => {
    if (key === '$or') return Object.values(expected as Row).some(item => matches(value,item as Row));
    if (key === '$and') return Object.values(expected as Row).every(item => matches(value,item as Row));
    if (key === '$not') return !matches(value,expected as Row);
    if (key === '$eq') return String(value) === String(expected);
    if (key === '$ne') return String(value) !== String(expected);
    if (key === '$containsi') return String(value ?? '').toLowerCase().includes(String(expected).toLowerCase());
    if (key === '$startsWith') return String(value ?? '').startsWith(String(expected));
    if (key === '$notNull') return value != null;
    if (key.startsWith('$')) throw new Error(`Unsupported content filter: ${key}`);
    return matches(value && typeof value === 'object' ? (value as Row)[key] : undefined,expected as Row);
  });
}

export function pageResolvedRows(rows: Row[], query: Query) {
  const filters = parseFilters(query);
  const filtered = rows.filter(row => matches(row, filters));
  const sorts = Object.entries(query)
    .filter(([key]) => key === 'sort' || key.startsWith('sort['))
    .map(([,value]) => String(value).split(':'));
  filtered.sort((a,b) => {
    for (const [field, direction] of sorts) {
      const compared = String(a[field] ?? '').localeCompare(String(b[field] ?? ''),'en',{numeric:true});
      if (compared) return direction === 'desc' ? -compared : compared;
    }
    return String(a.documentId).localeCompare(String(b.documentId));
  });
  const page = Math.max(1,Math.trunc(Number(query['pagination[page]']) || 1));
  const pageSize = Math.min(100,Math.max(1,Math.trunc(Number(query['pagination[pageSize]']) || 25)));
  return { data: filtered.slice((page-1)*pageSize,page*pageSize),
    meta: { pagination: { page,pageSize,total:filtered.length,pageCount:Math.ceil(filtered.length/pageSize) } } };
}

function prepareLocaleQuery(endpoint: string, options: FetchOptions): Query {
  if (!LOCALIZED.has(endpoint)) throw new Error('Unsupported localized collection');
  const query: Query = {};
  for (const [key,value] of Object.entries(options.queryParams ?? {})) {
    if (key === 'populate' || key.startsWith('populate[') || key.startsWith('fields[')
      || /^filters\[(?:documentId|slug|Slug)\]\[(?:\$eq|\$in)\](?:\[\d+\])?$/.test(key)) query[key] = value;
  }
  for (const field of Object.keys(RELATIONS)) {
    if (query.populate !== '*' && Object.keys(options.queryParams ?? {}).some(key => key.startsWith(`filters[${field}]`))) {
      query[`populate[${field}][fields][0]`] = 'name';
      query[`populate[${field}][fields][1]`] = 'slug';
    }
  }
  // Always include identity/publication metadata when selecting narrow fields.
  if (Object.keys(query).some(key => key.startsWith('fields['))) {
    let index = Math.max(-1, ...Object.keys(query).map(key => Number(key.match(/^fields\[(\d+)\]$/)?.[1] ?? -1))) + 1;
    for (const field of ['documentId','locale','publishedAt','slug']) {
      if (field === 'slug' && ['certificates','photographies'].includes(endpoint)) continue;
      query[`fields[${index++}]`] = field === 'slug' && ['business-plans','marketing-plans'].includes(endpoint) ? 'Slug' : field;
    }
  }
  if (query.populate === '*') {
    delete query.populate;
    Object.assign(query,publicPopulation(endpoint));
  }
  return query;
}

/** The sitemap needs both locales' indexing fields, with no taxonomy overlays. */
export async function getSitemapLocaleRows(endpoint: string, queryParams: Query) {
  const query = prepareLocaleQuery(endpoint, { queryParams });
  const [english, chinese] = await Promise.all([
    cachedLocale(endpoint, 'en', query, 300),
    cachedLocale(endpoint, 'zh', query, 300),
  ]);
  return { english, rows: resolvePublishedRows(english, chinese, 'zh') };
}

export async function getLocalizedRows(endpoint: string, locale: ContentLocale, options: FetchOptions = {}): Promise<Row[]> {
  const query = prepareLocaleQuery(endpoint, options);
  const seconds = options.revalidate ?? 300;
  // Separate cached locale snapshots retain English body data when Chinese changes.
  const english = await cachedLocale(endpoint,'en',query,seconds);
  // English views need only counterpart identities for reciprocal alternates.
  const chinese = await cachedLocale(endpoint,'zh',locale === 'en'
    ? { ...Object.fromEntries(Object.entries(query).filter(([key])=>key.startsWith('filters['))), 'fields[0]':'documentId','fields[1]':'locale','fields[2]':'publishedAt' }
    : query,seconds);
  const resolved = resolvePublishedRows(english,chinese,locale);
  // Relabel relations by document identity, including English fallback documents.
  if (locale === 'zh' && !['categories','tags','project-types'].includes(endpoint)) {
    for (const [field,target] of Object.entries(RELATIONS)) {
      if (!resolved.some(row => row[field] != null)) continue;
      const labels = await getLocalizedRows(target,locale,{ queryParams: { 'fields[0]':target === 'project-types' ? 'ProjectType' : 'name','fields[1]':'slug' }, revalidate:seconds });
      const byId = new Map(labels.map(row => [String(row.documentId),row]));
      const overlay = (item: unknown) => item && typeof item === 'object'
        ? { ...item, ...(byId.get(String((item as Row).documentId)) ?? {}) } : item;
      for (const row of resolved) if (Array.isArray(row[field])) row[field] = (row[field] as unknown[]).map(overlay);
      else if (row[field]) row[field] = overlay(row[field]);
    }
  }
  return resolved;
}

/** Injection keeps presentation modules free of server-only imports. */
export function localizedSource(locale: ContentLocale): typeof fetchFromStrapi {
  return async <T>(endpoint: string, options: FetchOptions = {}) => {
    try {
      const query = options.queryParams ?? {};
      // Shared identity/slug detail reads can be scoped directly in Strapi.
      if (['documentId','slug','Slug'].some(field=>query[`filters[${field}][$eq]`] != null)) {
        return { data:pageResolvedRows(await getLocalizedRows(endpoint,locale,options),query) as T,error:null };
      }
      // Resolve fallback/filter/sort on a thin bounded index, then retrieve only
      // the chosen page's bodies and media. Never snapshot every article body
      // merely to return page 1, a count or a related-items list.
      const fields = new Set<string>(['documentId']);
      const indexQuery: Query = {};
      for (const [key,value] of Object.entries(query)) {
        if (key==='sort'||key.startsWith('sort[')) fields.add(String(value).split(':')[0]);
        if (!key.startsWith('filters[')) continue;
        const parts=[...key.matchAll(/\[([^\]]+)\]/g)].map(match=>match[1]);
        const field=parts.find(part=>!part.startsWith('$')&&!/^\d+$/.test(part));
        if (!field) continue;
        if (RELATIONS[field]) {
          indexQuery[`populate[${field}][fields][0]`]='name';
          indexQuery[`populate[${field}][fields][1]`]='slug';
        } else fields.add(field);
      }
      if ([...fields].some(field=>['content','description','Description'].includes(field))) throw new Error('Full-text content filters require a server-side search query');
      [...fields].forEach((field,index)=>{indexQuery[`fields[${index}]`]=field;});
      const index = await getLocalizedRows(endpoint,locale,{...options,queryParams:indexQuery});
      const page = pageResolvedRows(index,query);
      if (!page.data.length) return { data:page as T,error:null };
      const ids=page.data.map(row=>String(row.documentId));
      const scoped:Query={};
      for (const [key,value]of Object.entries(query))if (key==='populate'||key.startsWith('populate[')||key.startsWith('fields[')) scoped[key]=value;
      ids.forEach((id,index)=>{scoped[`filters[documentId][$in][${index}]`]=id;});
      const rows=await getLocalizedRows(endpoint,locale,{...options,queryParams:scoped});
      const byId=new Map(rows.map(row=>[String(row.documentId),row]));
      const data=ids.map(id=>byId.get(id));
      if (data.some(row=>!row)) throw new Error('CMS collection changed while retrieving the selected page');
      if (data.some((row,index)=> (row!.localization as ContentLocalization).resolvedLocale !== (page.data[index].localization as ContentLocalization).resolvedLocale)) throw new Error('CMS locale publication changed while retrieving the selected page');
      return {data:{...page,data} as T,error:null};
    }
    catch (error) { return { data:null, error:error instanceof Error ? error.message : 'CMS unavailable' }; }
  };
}

export async function localizedCollectionSeo(endpoint: string, path: string, locale: ContentLocale) {
  try {
    const rows = await getLocalizedRows(endpoint,locale,{queryParams:{'fields[0]':'documentId'}});
    return localizedSeo(path,locale,collectionLocalization(locale,rows as Array<{localization?: ContentLocalization}>));
  } catch {
    return localizedSeo(path,locale);
  }
}
