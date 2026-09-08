import 'server-only';
import { cache } from 'react';
import type { BlogPost } from '@/lib/strapi/blogs';
import { getBlogPost, getBlogPosts } from './blog-data';

// Maps camelCase API response → PascalCase BlogPost that components expect
function mapPost(p: Record<string, unknown>): BlogPost {
  // ── Resolve SEO fields ────────────────────────────────────────────────────
  const rawSeo = p.seo as Record<string, unknown> | undefined;
  const seo: BlogPost['Seo'] = rawSeo
    ? {
        metaTitle:       rawSeo.metaTitle       as string | undefined,
        metaDescription: rawSeo.metaDescription as string | undefined,
        ogImageUrl:      rawSeo.ogImageUrl       as string | null | undefined,
      }
    : undefined;

  return {
    id:            p.id            as number,
    Title:         String(p.title   ?? 'Untitled'),
    Slug:          String(p.slug    ?? ''),
    Description:   String(p.excerpt ?? ''),
    Content:       String(p.content ?? ''),
    // FIX: map server-calculated readingTime so listing cards work without full content
    ReadingTime:   (p.readingTime as string)    ?? undefined,
    FeaturedImage: (p.featuredImage as string | null) ?? null,
    Category:      (p.categories as string[])?.[0] ?? undefined,
    Categories:    (p.categories as string[]) ?? [],
    Tags:          (p.tags as string[])             ?? [],
    Author:        String(p.author ?? ''),
    Language:      (p.language as 'en' | 'zh')      ?? 'en',
    PublishedDate: (p.publishDate as string)         ?? '',
    createdAt:     (p.publishDate as string)         ?? '',
    updatedAt:     (p.updatedAt   as string)         ?? '',
    Seo:           seo,
  };
}


const listBlogs = cache(async (language: 'en' | 'zh', page: number, pageSize: number) => {
  try {
    const data = await getBlogPosts(new URLSearchParams({ language, page: String(page), pageSize: String(pageSize), minimal: 'true' }));
    return { blogs: data.posts.map(mapPost), total: data.total, pageCount: data.pageCount, error: null };
  } catch (error) {
    return { blogs: [] as BlogPost[], total: 0, pageCount: 0, error: error instanceof Error ? error.message : 'CMS unavailable' };
  }
});
export async function fetchAllBlogs(language: 'en' | 'zh' = 'en', options: { page?: number; pageSize?: number } = {}) {
  return listBlogs(language, options.page ?? 1, options.pageSize ?? 12);
}
export const fetchBlogBySlug = cache(async (slug: string) => {
  try {
    const post = await getBlogPost(slug);
    return { blog: post ? mapPost(post) : null, error: null };
  } catch (error) {
    return { blog: null, error: error instanceof Error ? error.message : 'CMS unavailable' };
  }
});
export async function fetchRelatedBlogs(category: string | undefined, currentSlug: string, language: 'en' | 'zh' = 'en', limit = 3) {
  const { blogs, error } = await listBlogs(language, 1, 100);
  return { blogs: blogs.filter(p => p.Slug !== currentSlug && (!category || p.Category?.toLowerCase() === category.toLowerCase())).slice(0, limit), error };
}
export async function fetchBlogCategories(language: 'en' | 'zh' = 'en') {
  const { blogs, error } = await listBlogs(language, 1, 100);
  return { categories: [...new Set(blogs.flatMap(p => p.Categories ?? []))], error };
}
export async function fetchBlogTags(language: 'en' | 'zh' = 'en') {
  const { blogs, error } = await listBlogs(language, 1, 100);
  return { tags: [...new Set(blogs.flatMap(p => p.Tags ?? []))], error };
}
