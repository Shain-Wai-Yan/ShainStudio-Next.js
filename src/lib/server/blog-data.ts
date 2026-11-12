import 'server-only';
import { localizedSource } from '@/lib/server/localized-content';
import type { ContentLocale } from '@/types/localization';
import { STRAPI_ORIGIN_URL } from '@/lib/strapi/config';
import { boundedInteger } from '@/lib/utils/pagination';

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
  const nested = media.data as Record<string, unknown> | null | undefined;
  const file = (nested?.attributes as Record<string, unknown> | undefined) ?? nested ?? media;
  let url = typeof file.url === 'string' ? file.url : undefined;
  if (!url && file.formats) {
    const formats = file.formats as Record<string, { url?: string }>;
    for (const size of ['large', 'medium', 'small', 'thumbnail']) {
      if (formats[size]?.url) { url = formats[size].url; break; }
    }
  }
  if (!url) return null;
  return new URL(url, `${STRAPI_ORIGIN_URL}/`).toString();
}

/**
 * Direct port of vanilla JS transformPostData.
 * No abstractions — handles the image exactly as the working vanilla JS does.
 */
export function transformPost(strapiPost: Record<string, unknown>) {
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

    // ── Featured Image — exact copy of vanilla JS ─────────────────────────
    const featuredImage = resolveMediaUrl(
      data.featuredImage as Record<string, unknown> | null | undefined
    );

    if (process.env.NODE_ENV === 'development') {
      console.log(`[blogs] "${title}" image field:`, JSON.stringify(data.featuredImage), '→', featuredImage);
    }

    // ── SEO — resolve metaTitle, metaDescription, ogImage ─────────────────
    const rawSeo = (data.Seo || data.seo) as Record<string, unknown> | null | undefined;
    const seoOgImageUrl = resolveMediaUrl(
      rawSeo?.ogImage as Record<string, unknown> | null | undefined
    );

    const seo = rawSeo
      ? {
          canonicalUrl: rawSeo.canonicalUrl as string | undefined,
          noIndex: Boolean(rawSeo.noIndex),
          metaTitle:       (rawSeo.metaTitle       as string | undefined) ?? undefined,
          metaDescription: (rawSeo.metaDescription as string | undefined) ?? undefined,
          ogImageUrl:      seoOgImageUrl,
        }
      : {};

    if (process.env.NODE_ENV === 'development') {
      console.log(`[blogs] "${title}" seo ogImage:`, JSON.stringify(rawSeo?.ogImage), '→', seoOgImageUrl);
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
      documentId: data.documentId as string,
      localization: data.localization as import('@/types/localization').ContentLocalization | undefined,
      title, slug, excerpt, content,
      featuredImage,
      publishDate, updatedAt, author,
      categories: postCategories.filter(Boolean),
      tags: postTags.filter(Boolean),
      readingTime: calculateReadingTime(content), // always calculated server-side from full content
      language: ((data.localization as import('@/types/localization').ContentLocalization | undefined)?.resolvedLocale ?? (data.locale === 'zh-CN' ? 'zh' : 'en')) as ContentLocale,
      seo,
    };
  } catch (err) {
    console.error('[blogs] Transform error:', err);
    return null;
  }
}


export async function getBlogPosts(sp: URLSearchParams) {
  const page = boundedInteger(sp.get('page'), 1, 10000);
  const pageSize = boundedInteger(sp.get('pageSize'), 100, 100);
  const language: ContentLocale = sp.get('language') === 'zh' ? 'zh' : 'en';
  const queryParams: Record<string, string | number | boolean> = {
    'pagination[page]': page, 'pagination[pageSize]': pageSize,
    populate: '*', sort: 'publishDate:desc',
  };
  const { data, error } = await localizedSource(language)<{
    data: Record<string, unknown>[];
    meta?: { pagination?: { total?: number; pageCount?: number } };
  }>('blogs', { tags: ['strapi', 'blogs'], queryParams });
  if (error || !data) throw new Error(error || 'CMS unavailable');
  const posts = (data.data ?? []).map(transformPost).filter(p => p !== null).map(post => (
    sp.get('minimal') === 'true' ? { ...post, content: undefined } : post
  ));
  return { posts, total: data.meta?.pagination?.total ?? posts.length,
    pageCount: data.meta?.pagination?.pageCount ?? 1 };
}

export async function getBlogPost(slug: string, language: ContentLocale = 'en') {
  if (!/^[a-z0-9-]+$/i.test(slug) || slug.length > 200) return null;
  const { data, error } = await localizedSource(language)<{ data: Record<string, unknown>[] }>('blogs', {
    tags: ['strapi', 'blogs'],
    queryParams: { 'filters[slug][$eq]': slug, populate: '*', 'pagination[pageSize]': 1 },
  });
  if (error || !data) throw new Error(error || 'CMS unavailable');
  return data.data?.[0] ? transformPost(data.data[0]) : null;
}
