import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { createHash, timingSafeEqual } from 'node:crypto';
import {CONTENT_TYPES} from '@/lib/strapi/content-contract';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SECRET = process.env.STRAPI_REVALIDATION_SECRET;
const MAX_BODY_BYTES = 16 * 1024;

async function readPayload(request: NextRequest): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) throw new Error('Invalid JSON payload');
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new RangeError('Payload too large');
      }
      chunks.push(value);
    }
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } finally {
    reader.releaseLock();
  }
}

const MODELS:Record<string,string>=Object.fromEntries(Object.entries(CONTENT_TYPES).map(([name,type])=>[name,type.endpoint]));
function contentType(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  for (const [name, endpoint] of Object.entries(MODELS)) {
    if ([name, endpoint, `api::${name}.${name}`].includes(value)) return endpoint;
  }
  return null;
}

export async function POST(request: NextRequest) {
  if (!SECRET) {
    return NextResponse.json({ error: 'Revalidation is not configured' }, { status: 503 });
  }

  const authorization = request.headers.get('authorization');
  const digest = (value: string) => createHash('sha256').update(value).digest();
  if (!authorization || !timingSafeEqual(digest(authorization), digest(`Bearer ${SECRET}`))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: { model?: unknown; uid?: unknown; event?: unknown; entry?: { slug?: unknown; documentId?: unknown; publishedAt?: unknown; locale?: unknown }; slug?: unknown; documentId?: unknown };
  try {
    const value = await readPayload(request);
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid JSON payload');
    payload = value;
  } catch (error) {
    if (error instanceof RangeError) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
    }
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const type = contentType(payload.uid ?? payload.model);
  if (!type) {
    return NextResponse.json({ error: 'Unsupported Strapi content type' }, { status: 400 });
  }

  const publishedDelete = payload.event === 'entry.delete' && typeof payload.entry?.publishedAt === 'string' && !!payload.entry.publishedAt;
  if (!['entry.publish', 'entry.unpublish'].includes(String(payload.event)) && !publishedDelete) {
    return NextResponse.json({ revalidated: false, skipped: true, type });
  }
  if (type === 'clients') {
    revalidateTag('clients', 'max');
    return NextResponse.json({ revalidated: true, type, paths: ['/en','/zh'], mode: 'stale-while-revalidate' });
  }
  const locale = payload.entry?.locale ?? 'en';
  if (!['en','zh-CN'].includes(String(locale))) {
    return NextResponse.json({ error: 'Unsupported content locale' }, { status: 400 });
  }
  // Data dependencies invalidate ISR outputs, reciprocal hreflang and sitemap.
  // Avoid path invalidation: it would expire unrelated locale snapshots.
  const endpoints = new Set([type]);
  if (['categories','tags','project-types'].includes(type)) {
    for (const endpoint of ['blogs','coding-projects','marketing-projects','photographies','arts','certificates','business-plans','marketing-plans']) endpoints.add(endpoint);
  }
  // English publication also changes shared routing/assets in existing Chinese
  // rows. Chinese-only edits still leave the English body cache intact.
  const tags = [...endpoints].flatMap(endpoint => (locale==='en'?['en','zh-CN']:['zh-CN']).map(language=>`${endpoint}:${language}`));
  for (const tag of tags) revalidateTag(tag, { expire: 0 });
  return NextResponse.json({ revalidated: true, type, locale, tags });
}
