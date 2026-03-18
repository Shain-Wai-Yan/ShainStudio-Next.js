import { NextRequest, NextResponse } from 'next/server';

const STRAPI_API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'https://api.shainwaiyan.com/api';

function calculateReadingTime(content: string): string {
  if (!content) return '1 min read';
  const words = content.replace(/<[^>]*>/g, '').trim().split(/\s+/).length;
  return `${Math.ceil(words / 200)} min read`;
}

/**
 * Resolves a Strapi media object to a flat absolute URL string.
 * Handles both Strapi v4 (.data.attributes.url) and v5 (.url) shapes,
 * and falls back through format sizes if needed.
 */
function resolveMediaUrl(media: Record<string, unknown> | null | undefined): string | null {
  if (!media) return null;
  // Strapi v5 flat shape
  if (media.url) return media.url as string;
  // Strapi v4 nested shape
  if (media.data && (media.data as Record<string, unknown>).attributes) {
    return ((media.data as Record<string, unknown>).attributes as Record<string, unknown>).url as string;
  }
  // Fallback through format sizes
  if (media.formats) {
    const fmts = media.formats as Record<string, { url: string }>;
    for (const fmt of ['large', 'medium', 'small', 'thumbnail']) {
      if (fmts[fmt]?.url) return fmts[fmt].url;
    }
  }
  return null;
}

function transformPost(strapiPost: Record<string, unknown>) {
  if (!strapiPost) return null;
  try {
    const data = (strapiPost.attributes as Record<string, unknown>) || strapiPost;

    const title       = (data.Title as string)        || (data.title as string)       || 'Untitled Post';
    const slug        = (data.slug as string)          || `post-${strapiPost.id}`;
    const excerpt     = (data.excerpt as string)       || '';
    const publishDate = (data.publishDate as string)   || (data.createdAt as string)   || '';
    const updatedAt   = (data.updatedAt as string)     || '';
    const author      = (data.author as string)        || 'Shain Wai Yan';
    const content     = (data.content as string)       || '';

    // ── Featured Image ─────────────────────────────────────────────────────
    const featuredImage = resolveMediaUrl(
      data.featuredImage as Record<string, unknown> | null | undefined
    );

    if (process.env.NODE_ENV === 'development') {
      console.log(`[blogs/slug] "${title}" image:`, JSON.stringify(data.featuredImage), '→', featuredImage);
    }

    // ── SEO — resolve metaTitle, metaDescription, ogImage ─────────────────
    const rawSeo = (data.Seo || data.seo) as Record<string, unknown> | null | undefined;
    const seoOgImageUrl = resolveMediaUrl(
      rawSeo?.ogImage as Record<string, unknown> | null | undefined
    );

    const seo = rawSeo
      ? {
          metaTitle:       (rawSeo.metaTitle       as string | undefined) ?? undefined,
          metaDescription: (rawSeo.metaDescription as string | undefined) ?? undefined,
          ogImageUrl:      seoOgImageUrl,
        }
      : {};

    if (process.env.NODE_ENV === 'development') {
      console.log(`[blogs/slug] "${title}" seo ogImage:`, JSON.stringify(rawSeo?.ogImage), '→', seoOgImageUrl);
    }

    // ── Categories ─────────────────────────────────────────────────────────
    const postCategories: string[] = [];
    const cats = data.categories as Record<string, unknown> | unknown[] | undefined;
    const cat  = data.category  as Record<string, unknown> | string | undefined;

    if (cats && !Array.isArray(cats) && Array.isArray((cats as Record<string, unknown>).data)) {
      ((cats as Record<string, unknown>).data as Record<string, unknown>[]).forEach((c) => {
        const n = ((c.attributes as Record<string, unknown>)?.name as string);
        if (n) postCategories.push(n.trim());
      });
    } else if (cat && typeof cat === 'object' && (cat as Record<string, unknown>).name) {
      postCategories.push(((cat as Record<string, unknown>).name as string).trim());
    } else if (typeof cat === 'string' && cat) {
      postCategories.push(cat.trim());
    } else if (Array.isArray(cats)) {
      (cats as unknown[]).forEach((c) => {
        if (typeof c === 'string') postCategories.push(c.trim());
        else if (c && typeof c === 'object') postCategories.push(((c as Record<string, unknown>).name as string)?.trim() || '');
      });
    }

    // ── Tags ───────────────────────────────────────────────────────────────
    const postTags: string[] = [];
    const tags = data.tags as Record<string, unknown> | unknown[] | undefined;

    if (tags && !Array.isArray(tags) && Array.isArray((tags as Record<string, unknown>).data)) {
      ((tags as Record<string, unknown>).data as Record<string, unknown>[]).forEach((t) => {
        const n = ((t.attributes as Record<string, unknown>)?.name as string);
        if (n) postTags.push(n.trim());
      });
    } else if (Array.isArray(tags)) {
      (tags as unknown[]).forEach((t) => {
        if (typeof t === 'string') postTags.push(t.trim());
        else if (t && typeof t === 'object') postTags.push(((t as Record<string, unknown>).name as string)?.trim() || '');
      });
    }

    return {
      id: strapiPost.id as number,
      title, slug, excerpt, content,
      featuredImage,
      publishDate, updatedAt, author,
      categories: postCategories.filter(Boolean),
      tags: postTags.filter(Boolean),
      readingTime: calculateReadingTime(content),
      language: (slug.includes('zh-') ? 'zh' : 'en') as 'en' | 'zh',
      seo,
    };
  } catch (err) {
    console.error('[blogs/slug] Transform error:', err);
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) return NextResponse.json({ error: 'Slug required' }, { status: 400 });

    // Vanilla JS uses filters[slug][$eq] (lowercase) — match that
    const url = `${STRAPI_API_URL}/blogs?filters[slug][$eq]=${encodeURIComponent(slug)}&populate=*`;
    console.log('[blogs/slug] Fetching:', url);

    const res = await fetch(url, {
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      console.error('[blogs/slug] Strapi error:', res.status);
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const data = await res.json();

    if (!data.data?.length) {
      console.warn('[blogs/slug] Not found:', slug);
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    const post = transformPost(data.data[0]);
    if (!post) return NextResponse.json({ error: 'Failed to process post' }, { status: 500 });

    return NextResponse.json({ post });
  } catch (err) {
    console.error('[blogs/slug] Error:', err);
    return NextResponse.json({ error: 'Failed to fetch blog post' }, { status: 500 });
  }
}