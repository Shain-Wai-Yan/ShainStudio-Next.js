import { NextRequest, NextResponse } from 'next/server';

const STRAPI_API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'https://api.shainwaiyan.com/api';

function calculateReadingTime(content: string): string {
  if (!content) return '1 min read';
  const words = content.replace(/<[^>]*>/g, '').trim().split(/\s+/).length;
  return `${Math.ceil(words / 200)} min read`;
}

/**
 * Direct port of vanilla JS transformPostData.
 * No abstractions — handles the image exactly as the working vanilla JS does.
 */
function transformPost(strapiPost: Record<string, unknown>) {
  if (!strapiPost) return null;
  try {
    const data = (strapiPost.attributes as Record<string, unknown>) || strapiPost;

    const title      = (data.Title as string)       || (data.title as string)       || 'Untitled Post';
    const slug       = (data.slug as string)         || `post-${strapiPost.id}`;
    const excerpt    = (data.excerpt as string)      || '';
    const publishDate = (data.publishDate as string) || (data.createdAt as string)  || '';
    const updatedAt  = (data.updatedAt as string)    || '';
    const author     = (data.author as string)       || 'Shain Wai Yan';
    const content    = (data.content as string)      || '';

    // ── Image — exact copy of vanilla JS ─────────────────────────────────
    let featuredImage: string | null = null;
    const fi = data.featuredImage as Record<string, unknown> | null | undefined;
    if (fi) {
      if (fi.url) {
        featuredImage = fi.url as string;
      } else if (fi.data && (fi.data as Record<string, unknown>).attributes) {
        featuredImage = ((fi.data as Record<string, unknown>).attributes as Record<string, unknown>).url as string;
      } else if (fi.formats) {
        const fmts = fi.formats as Record<string, { url: string }>;
        for (const fmt of ['large', 'medium', 'small', 'thumbnail']) {
          if (fmts[fmt]?.url) { featuredImage = fmts[fmt].url; break; }
        }
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[blogs] "${title}" image field:`, JSON.stringify(fi), '→', featuredImage);
    }

    // ── Categories ────────────────────────────────────────────────────────
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

    // ── Tags ──────────────────────────────────────────────────────────────
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
      seo: ((data.seo || data.Seo || {}) as Record<string, unknown>),
    };
  } catch (err) {
    console.error('[blogs] Transform error:', err);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page     = searchParams.get('page')     ?? '1';
    const pageSize = searchParams.get('pageSize') ?? '100';

    const url = `${STRAPI_API_URL}/blogs?pagination[page]=${page}&pagination[pageSize]=${pageSize}&populate=*&sort=publishDate:desc`;
    console.log('[blogs] Fetching:', url);

    const res = await fetch(url, {
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      console.error('[blogs] Strapi error:', res.status, res.statusText);
      return NextResponse.json({ posts: [], error: `Strapi error: ${res.statusText}` }, { status: res.status });
    }

    const data = await res.json();
    const posts = (data.data ?? []).map(transformPost).filter(Boolean);

    console.log(`[blogs] Fetched ${posts.length} posts`);
    return NextResponse.json({
      posts,
      total: data.meta?.pagination?.total ?? 0,
      pageCount: data.meta?.pagination?.pageCount ?? 1,
    });
  } catch (err) {
    console.error('[blogs] Error:', err);
    return NextResponse.json({ posts: [], error: 'Failed to fetch blogs' }, { status: 500 });
  }
}