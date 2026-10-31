import 'server-only';
import { unstable_cache } from 'next/cache';
import { fetchFromStrapi } from '@/lib/strapi/client';
import { STRAPI_API_URL, STRAPI_ORIGIN_URL } from '@/lib/strapi/config';
import type { ClientLogo } from '@/types/client';

function object(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown> : null;
}

export function normalizeClient(value: unknown): ClientLogo | null {
  const record = object(value);
  const image = object(record?.image);
  if (!record || typeof record.documentId !== 'string' || !/^[a-zA-Z0-9_-]{1,255}$/.test(record.documentId)
    || typeof record.name !== 'string' || !record.name.trim()
    || !image || typeof image.url !== 'string' || !image.url.trim()
    || (image.mime !== undefined && (typeof image.mime !== 'string' || !image.mime.startsWith('image/')))) return null;
  try {
    const url = new URL(image.url, `${STRAPI_ORIGIN_URL}/`);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null;
    return { id: record.documentId, src: url.href, alt: record.name.trim() };
  } catch { return null; }
}

/** All pages must succeed before the aggregate can replace previously good data. */
export async function fetchPublishedClients(): Promise<ClientLogo[]> {
  const clients: ClientLogo[] = [];
  const seen = new Set<string>();
  let rawCount = 0;
  let total: number | undefined;
  let pageCount = 1;
  for (let page = 1; page <= pageCount; page++) {
    const result = await fetchFromStrapi<unknown>('clients', {
      cache: 'no-store',
      queryParams: {
        status: 'published', populate: 'image',
        'pagination[page]': page, 'pagination[pageSize]': 100,
        'sort[0]': 'name:asc', 'sort[1]': 'documentId:asc',
      },
    });
    if (result.error) throw new Error('Client collection is unavailable.');
    const envelope = object(result.data);
    const pagination = object(object(envelope?.meta)?.pagination);
    if (!Array.isArray(envelope?.data) || !pagination
      || pagination.page !== page || !Number.isInteger(pagination.pageCount) || Number(pagination.pageCount) < 0
      || !Number.isInteger(pagination.total) || Number(pagination.total) < 0
      || !Number.isInteger(pagination.pageSize) || Number(pagination.pageSize) < 1
      || Number(pagination.pageCount) !== Math.ceil(Number(pagination.total) / Number(pagination.pageSize))
      || envelope.data.length > Number(pagination.pageSize)) throw new Error('Invalid client collection response.');
    if (total !== undefined && (pagination.total !== total || pagination.pageCount !== pageCount)) {
      throw new Error('Client pagination changed during refresh; retry the collection.');
    }
    total = Number(pagination.total);
    pageCount = Number(pagination.pageCount);
    rawCount += envelope.data.length;
    for (const value of envelope.data) {
      const client = normalizeClient(value);
      if (!client) continue;
      if (seen.has(client.id)) throw new Error('Duplicate client document in paginated response.');
      seen.add(client.id);
      clients.push(client);
    }
  }
  if (rawCount !== total || (rawCount > 0 && clients.length === 0)) throw new Error('Incomplete or invalid client collection.');
  return clients.sort((a, b) => a.alt.toLowerCase().localeCompare(b.alt.toLowerCase(), 'en')
    || a.alt.localeCompare(b.alt, 'en', { sensitivity: 'variant' }) || a.id.localeCompare(b.id, 'en'));
}

const cachedClients = unstable_cache(fetchPublishedClients, ['published-clients-v1', STRAPI_API_URL], {
  tags: ['clients'], revalidate: 300,
});

/** Catch outside the cache: a cold miss may hide the strip, never cache an error as []. */
export async function getClientLogos(): Promise<ClientLogo[]> {
  try { return await cachedClients(); }
  catch { console.error('[Clients] Unable to load client logos; leaving the homepage available.'); return []; }
}
