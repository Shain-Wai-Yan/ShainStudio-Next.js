/**
 * Photography API Route
 *
 * Key fix: Strapi returns `category` as a relation object
 * { id, documentId, name, createdAt, updatedAt, publishedAt, slug }
 * NOT a plain string. We must extract `.name` from it.
 *
 * Same applies to `tags` — may be a relation array of objects.
 */

import { NextRequest, NextResponse } from 'next/server';

// ─── Strapi URLs ──────────────────────────────────────────────────────────────

const STRAPI_URLS: string[] = [
  process.env.NEXT_PUBLIC_STRAPI_URL || 'https://api.shainwaiyan.com',
  'https://backend-cms-89la.onrender.com',
].filter(Boolean);

const FETCH_TIMEOUT_MS = 10000;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TransformedPhoto {
  id: number;
  documentId?: string;
  title: string;
  description?: string;
  location: string;
  category?: string;
  image: string | null;
  tags: string[];
  language: 'en' | 'zh';
  createdAt: string;
  updatedAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (process.env.VIP_SECRET_KEY) {
      headers['x-shain-secret'] = process.env.VIP_SECRET_KEY;
    }
    return await fetch(url, {
      headers,
      signal: ctrl.signal,
    });
  } finally {
    clearTimeout(t);
  }
}

async function fetchFromAnyStrapi(path: string): Promise<unknown> {
  const errors: string[] = [];
  for (const base of STRAPI_URLS) {
    const url = `${base}/api/${path}`;
    console.log(`[Photography API] Trying: ${url}`);
    try {
      const res = await fetchWithTimeout(url, FETCH_TIMEOUT_MS);
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        errors.push(`${base} → HTTP ${res.status}: ${body.slice(0, 150)}`);
        console.warn(`[Photography API] ${base} → ${res.status}`);
        continue;
      }
      const data = await res.json();
      console.log(`[Photography API] Success from: ${base}`);
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${base} → ${msg}`);
      console.warn(`[Photography API] ${base} failed: ${msg}`);
    }
  }
  throw new Error(`All Strapi instances failed:\n${errors.join('\n')}`);
}

function makeAbsolute(url: string): string {
  if (!url) return url;
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return `${STRAPI_URLS[0]}${url.startsWith('/') ? '' : '/'}${url}`;
}

/**
 * Extracts a plain string from a Strapi field that may be:
 * - already a string  → return as-is
 * - a relation object → return obj.name (or obj.slug as fallback)
 * - null/undefined    → return undefined
 */
function extractStringField(
  value: unknown,
  nameKey = 'name'
): string | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') return value || undefined;

  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;

    // Direct relation object: { id, name, slug, ... }
    if (typeof obj[nameKey] === 'string') return obj[nameKey] as string;
    if (typeof obj.slug === 'string') return obj.slug as string;

    // Strapi v4 nested: { data: { attributes: { name } } }
    const data = obj.data as Record<string, unknown> | null | undefined;
    if (data && typeof data === 'object') {
      const attrs = data.attributes as Record<string, unknown> | undefined;
      if (attrs && typeof attrs[nameKey] === 'string') return attrs[nameKey] as string;
      if (attrs && typeof attrs.slug === 'string') return attrs.slug as string;
    }
  }

  return undefined;
}

/**
 * Extracts an image URL from whatever shape Strapi returns.
 */
function extractImageUrl(image: unknown): string | null {
  if (!image) return null;
  if (typeof image === 'string') return makeAbsolute(image);
  if (typeof image !== 'object') return null;

  const img = image as Record<string, unknown>;

  // Strapi v5 flat: { url, width, height }
  if (typeof img.url === 'string') return makeAbsolute(img.url);

  // Strapi v4 nested: { data: { attributes: { url } } }
  const data = img.data as Record<string, unknown> | null | undefined;
  if (data && typeof data === 'object') {
    const attrs = data.attributes as Record<string, unknown> | undefined;
    if (attrs) {
      if (typeof attrs.url === 'string') return makeAbsolute(attrs.url);
      // formats fallback
      const formats = attrs.formats as Record<string, { url: string }> | undefined;
      if (formats) {
        for (const size of ['large', 'medium', 'small', 'thumbnail']) {
          if (formats[size]?.url) return makeAbsolute(formats[size].url);
        }
      }
    }
    if (typeof data.url === 'string') return makeAbsolute(data.url);
  }

  return null;
}

/**
 * Extracts tags as a flat string[] from:
 * - string[]                                     (Strapi v5 component)
 * - { id, name, ... }[]                          (populated relation objects)
 * - { data: [{ id, attributes: { name } }] }     (Strapi v4 relation)
 */
function extractTags(tags: unknown): string[] {
  if (!tags) return [];

  if (Array.isArray(tags)) {
    return tags
      .map((t) => {
        if (typeof t === 'string') return t;
        if (typeof t === 'object' && t !== null) {
          const obj = t as Record<string, unknown>;
          // Populated relation object: { id, name, ... }
          if (typeof obj.name === 'string') return obj.name;
          // Strapi v4: { id, attributes: { name } }
          const attrs = obj.attributes as Record<string, unknown> | undefined;
          if (attrs && typeof attrs.name === 'string') return attrs.name;
        }
        return null;
      })
      .filter((t): t is string => t !== null && t !== '');
  }

  // { data: [...] } shape
  if (typeof tags === 'object') {
    const obj = tags as Record<string, unknown>;
    if (Array.isArray(obj.data)) {
      return (obj.data as Record<string, unknown>[])
        .map((item) => {
          if (typeof item.name === 'string') return item.name;
          const attrs = item.attributes as Record<string, unknown> | undefined;
          return attrs && typeof attrs.name === 'string' ? attrs.name : null;
        })
        .filter((t): t is string => t !== null && t !== '');
    }
  }

  return [];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformPhoto(photo: Record<string, any>): TransformedPhoto {
  // Log raw shape once during development so you can see exactly what Strapi sends
  if (process.env.NODE_ENV === 'development') {
    console.log(
      '[Photography API] Raw photo fields:',
      JSON.stringify(
        { id: photo.id, category: photo.category, tags: photo.tags, image: typeof photo.image },
        null,
        2
      )
    );
  }

  return {
    id: photo.id,
    documentId: photo.documentId,
    title: typeof photo.title === 'string' ? photo.title : 'Untitled',
    description: typeof photo.description === 'string' ? photo.description : undefined,
    location: typeof photo.location === 'string' ? photo.location : 'Unknown',
    // THE KEY FIX: category is a relation object — extract its .name string
    category: extractStringField(photo.category),
    image: extractImageUrl(photo.image),
    // tags may also be relation objects — extract .name from each
    tags: extractTags(photo.tags),
    language: (photo.language as 'en' | 'zh') ?? 'en',
    createdAt: photo.createdAt,
    updatedAt: photo.updatedAt,
  };
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const sp       = request.nextUrl.searchParams;
    const language = (sp.get('language') as 'en' | 'zh') || 'en';
    const page     = Math.max(1, parseInt(sp.get('page')     || '1',  10));
    const pageSize = Math.max(1, parseInt(sp.get('pageSize') || '20', 10));
    const category = sp.get('category') || null;
    const search   = sp.get('search')   || null;

    console.log(
      `[Photography API] language=${language} page=${page} pageSize=${pageSize}` +
      (category ? ` cat=${category}` : '') +
      (search   ? ` q=${search}`     : '')
    );

    const params = new URLSearchParams({
      'pagination[page]':     String(page),
      'pagination[pageSize]': String(pageSize),
      'populate':             '*',
      'sort':                 'updatedAt:desc',
    });

    // Category filter — use the name field on the relation
    if (category) {
      params.set('filters[category][name][$eq]', category);
    }

    if (search) {
      params.set('filters[$or][0][title][$containsi]',    search);
      params.set('filters[$or][1][location][$containsi]', search);
    }

    // ── Fetch ──────────────────────────────────────────────────────────────
    let data: Record<string, unknown>;
    try {
      data = (await fetchFromAnyStrapi(
        `photographies?${params.toString()}`
      )) as Record<string, unknown>;
    } catch (fetchErr) {
      const msg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
      console.error('[Photography API] All instances unreachable:', msg);
      return NextResponse.json(
        { photos: [], total: 0, pageCount: 0, error: 'Strapi is currently unavailable.' },
        { status: 200 }
      );
    }

    const rawPhotos = Array.isArray(data?.data)
      ? (data.data as Record<string, unknown>[])
      : [];

    if (rawPhotos.length === 0) {
      console.warn('[Photography API] 0 photos returned. Check Strapi collection / filters.');
    }

    let photos = rawPhotos.map(transformPhoto);

    // Post-fetch language filter — only apply if it doesn't wipe everything
    const langFiltered = photos.filter((p) => p.language === language);
    if (langFiltered.length > 0) photos = langFiltered;

    const meta       = data?.meta as Record<string, Record<string, number>> | undefined;
    const total      = meta?.pagination?.total    ?? photos.length;
    const pageCount  = meta?.pagination?.pageCount ?? 1;

    console.log(`[Photography API] Returning ${photos.length} photos (total: ${total})`);

    return NextResponse.json({ photos, total, pageCount, error: null });

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Photography API] Unhandled error:', message);
    return NextResponse.json(
      { photos: [], total: 0, pageCount: 0, error: message },
      { status: 200 }
    );
  }
}