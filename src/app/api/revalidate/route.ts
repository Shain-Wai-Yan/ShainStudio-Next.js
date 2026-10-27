import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { createHash, timingSafeEqual } from 'node:crypto';

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

const CONTENT = {
  blogs: { tag: 'blogs', paths: ['/blog', '/zh/blog'] },
  'marketing-projects': {
    tag: 'marketing-projects',
    paths: ['/portfolio/marketing-in-motion', '/zh/portfolio/marketing-in-motion'],
  },
  'coding-projects': {
    tag: 'coding-projects',
    paths: ['/portfolio/coding-projects', '/zh/portfolio/coding-projects'],
  },
  photography: { tag: 'photography', paths: ['/hobbies', '/zh/hobbies', '/hobbies/photography', '/zh/hobbies/photography'] },
  'marketing-plans': { tag: 'marketing-plans', paths: ['/portfolio/marketing-plans', '/zh/portfolio/marketing-plans'] },
  'business-plans': { tag: 'business-plans', paths: ['/portfolio/business-plans', '/zh/portfolio/business-plans'] },
  arts: { tag: 'arts', paths: ['/hobbies', '/zh/hobbies', '/hobbies/pencil-art', '/zh/hobbies/pencil-art'] },
  certificates: { tag: 'certificates', paths: ['/certificate', '/zh/certificate'] },
} as const;

type ContentType = keyof typeof CONTENT;

function contentType(model: unknown): ContentType | null {
  const value = typeof model === 'string' ? model.toLowerCase() : '';
  if (value.includes('blog')) return 'blogs';
  if (value.includes('marketing-project')) return 'marketing-projects';
  if (value.includes('coding-project')) return 'coding-projects';
  if (value.includes('photograph')) return 'photography';
  if (value.includes('marketing-plan')) return 'marketing-plans';
  if (value.includes('business-plan')) return 'business-plans';
  if (['art', 'arts', 'api::art.art', 'pencil-art'].includes(value)) return 'arts';
  if (value.includes('certificate')) return 'certificates';
  return null;
}

function slugFor(type: ContentType, value: unknown): string | null {
  if (typeof value !== 'string' || !/^[a-z0-9-]{1,200}$/i.test(value)) return null;
  if (type === 'blogs') return value.startsWith('zh-') ? `/zh/blog/${value}` : `/blog/${value}`;
  if (type === 'marketing-projects') return `/portfolio/marketing-in-motion/${value}`;
  if (type === 'coding-projects') return `/portfolio/coding-projects/${value}`;
  if (type === 'arts') return `/hobbies/pencil-art/${value}`;
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

  let payload: { model?: unknown; entry?: { slug?: unknown; documentId?: unknown }; slug?: unknown; documentId?: unknown };
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

  const type = contentType(payload.model);
  if (!type) {
    return NextResponse.json({ error: 'Unsupported Strapi content type' }, { status: 400 });
  }

  const content = CONTENT[type];
  revalidateTag(content.tag, { expire: 0 });
  for (const path of content.paths) revalidatePath(path);

  const detailPath = slugFor(type, payload.entry?.slug ?? payload.slug);
  const detailPaths = detailPath ? (type === 'arts' ? [detailPath, `/zh${detailPath}`] : [detailPath]) : [];
  for (const path of detailPaths) revalidatePath(path);

  const documentId = payload.entry?.documentId ?? payload.documentId;
  const photoPath = type === 'photography' && typeof documentId === 'string' && /^[a-z0-9]{8,40}$/i.test(documentId)
    ? `/hobbies/photography/photo/${documentId}`
    : null;
  if (photoPath) {
    revalidatePath(photoPath);
    revalidatePath(`/zh${photoPath}`);
  }

  return NextResponse.json({ revalidated: true, type, paths: [...content.paths, ...detailPaths, ...(photoPath ? [photoPath, `/zh${photoPath}`] : [])] });
}
