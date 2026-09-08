import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SECRET = process.env.STRAPI_REVALIDATION_SECRET;

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
  photography: { tag: 'photography', paths: ['/portfolio/photography', '/zh/portfolio/photography'] },
  'marketing-plans': { tag: 'marketing-plans', paths: ['/portfolio/marketing-plans', '/zh/portfolio/marketing-plans'] },
  'business-plans': { tag: 'business-plans', paths: ['/portfolio/business-plans', '/zh/portfolio/business-plans'] },
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
  if (value.includes('certificate')) return 'certificates';
  return null;
}

function slugFor(type: ContentType, value: unknown): string | null {
  if (typeof value !== 'string' || !/^[a-z0-9-]{1,200}$/i.test(value)) return null;
  if (type === 'blogs') return value.startsWith('zh-') ? `/zh/blog/${value}` : `/blog/${value}`;
  if (type === 'marketing-projects') return `/portfolio/marketing-in-motion/${value}`;
  if (type === 'coding-projects') return `/portfolio/coding-projects/${value}`;
  return null;
}

export async function POST(request: NextRequest) {
  if (!SECRET) {
    return NextResponse.json({ error: 'Revalidation is not configured' }, { status: 503 });
  }

  const authorization = request.headers.get('authorization');
  if (authorization !== `Bearer ${SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: { model?: unknown; entry?: { slug?: unknown; documentId?: unknown }; slug?: unknown; documentId?: unknown };
  try {
    payload = await request.json();
  } catch {
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
  if (detailPath) revalidatePath(detailPath);

  const documentId = payload.entry?.documentId ?? payload.documentId;
  const photoPath = type === 'photography' && typeof documentId === 'string' && /^[a-z0-9]{8,40}$/i.test(documentId)
    ? `/portfolio/photography/photo/${documentId}`
    : null;
  if (photoPath) {
    revalidatePath(photoPath);
    revalidatePath(`/zh${photoPath}`);
  }

  return NextResponse.json({ revalidated: true, type, paths: [...content.paths, ...(detailPath ? [detailPath] : []), ...(photoPath ? [photoPath, `/zh${photoPath}`] : [])] });
}
