/**
 * Blogs Strapi Integration
 * Thin wrapper — all data transformation happens in the API route (mirrors vanilla JS).
 * This file just fetches from the route and maps field names for components.
 */

import { fetchFromStrapi } from './client';

export interface BlogPost {
  id: number;
  documentId?: string;
  Title: string;
  Slug: string;
  Description?: string;
  Content: string;
  FeaturedImage: string | null;  // absolute URL from Cloudinary/Strapi, or null
  Category?: string;
  Tags?: string[];
  Author?: string;
  Language: 'en' | 'zh';
  PublishedDate?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Maps camelCase API response → PascalCase BlogPost that components expect
function mapPost(p: Record<string, unknown>): BlogPost {
  return {
    id:            p.id as number,
    Title:         String(p.title   ?? 'Untitled'),
    Slug:          String(p.slug    ?? ''),
    Description:   String(p.excerpt ?? ''),
    Content:       String(p.content ?? ''),
    // featuredImage comes from API route already resolved — use directly, no further processing
    FeaturedImage: (p.featuredImage as string | null) ?? null,
    Category:      (p.categories as string[])?.[0] ?? undefined,
    Tags:          (p.tags as string[])             ?? [],
    Author:        String(p.author ?? ''),
    Language:      (p.language as 'en' | 'zh')      ?? 'en',
    PublishedDate: (p.publishDate as string)         ?? '',
    createdAt:     (p.publishDate as string)         ?? new Date().toISOString(),
    updatedAt:     (p.updatedAt   as string)         ?? new Date().toISOString(),
  };
}

// ─── Fetch functions ──────────────────────────────────────────────────────────

export async function fetchAllBlogs(
  language: 'en' | 'zh' = 'en',
  options: { page?: number; pageSize?: number } = {}
): Promise<{ blogs: BlogPost[]; total: number; pageCount: number; error: string | null }> {
  try {
    const { page = 1, pageSize = 12 } = options;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(
      `${appUrl}/api/blogs?page=${page}&pageSize=${pageSize}&language=${language}`,
      { next: { revalidate: 300 }, headers: { 'Content-Type': 'application/json' } }
    );
    if (!res.ok) return { blogs: [], total: 0, pageCount: 0, error: `API Error: ${res.status}` };
    const data = await res.json();
    const blogs = (data.posts ?? []).map(mapPost);
    console.log(`[blogs] Fetched ${blogs.length} posts`);
    return { blogs, total: data.total ?? 0, pageCount: data.pageCount ?? 0, error: null };
  } catch (err) {
    return { blogs: [], total: 0, pageCount: 0, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function fetchBlogBySlug(
  slug: string,
  language: 'en' | 'zh' = 'en'
): Promise<{ blog: BlogPost | null; error: string | null }> {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${appUrl}/api/blogs/${slug}`, {
      next: { revalidate: 300 },
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return { blog: null, error: res.status === 404 ? 'Not found' : `API Error: ${res.status}` };
    const data = await res.json();
    return { blog: mapPost(data.post), error: null };
  } catch (err) {
    return { blog: null, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function fetchRelatedBlogs(
  category: string | undefined,
  currentSlug: string,
  language: 'en' | 'zh' = 'en',
  limit = 3
): Promise<{ blogs: BlogPost[]; error: string | null }> {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${appUrl}/api/blogs?pageSize=100&language=${language}`, {
      next: { revalidate: 300 }, headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return { blogs: [], error: `API Error: ${res.status}` };
    const data = await res.json();
    const all = (data.posts ?? []).map(mapPost) as BlogPost[];
    const related = all
      .filter((p) => p.Slug !== currentSlug && (!category || p.Category?.toLowerCase() === category.toLowerCase()))
      .slice(0, limit);
    return { blogs: related, error: null };
  } catch (err) {
    return { blogs: [], error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function fetchBlogCategories(language: 'en' | 'zh' = 'en'): Promise<{ categories: string[]; error: string | null }> {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${appUrl}/api/blogs?pageSize=100&language=${language}`, {
      next: { revalidate: 300 }, headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return { categories: [], error: `API Error: ${res.status}` };
    const data = await res.json();
    const cats = new Set<string>();
    (data.posts ?? []).forEach((p: Record<string, unknown>) =>
      ((p.categories as string[]) ?? []).forEach((c) => c && cats.add(c))
    );
    return { categories: Array.from(cats), error: null };
  } catch (err) {
    return { categories: [], error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function fetchBlogTags(language: 'en' | 'zh' = 'en'): Promise<{ tags: string[]; error: string | null }> {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${appUrl}/api/blogs?pageSize=100&language=${language}`, {
      next: { revalidate: 300 }, headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return { tags: [], error: `API Error: ${res.status}` };
    const data = await res.json();
    const tagSet = new Set<string>();
    (data.posts ?? []).forEach((p: Record<string, unknown>) =>
      ((p.tags as string[]) ?? []).forEach((t) => t && tagSet.add(t))
    );
    return { tags: Array.from(tagSet), error: null };
  } catch (err) {
    return { tags: [], error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

// ─── Display transform (used by BlogCard, BlogPostHeader) ─────────────────────

function calculateReadingTime(content: string): number {
  return Math.ceil(content.replace(/<[^>]*>/g, '').trim().split(/\s+/).length / 200);
}

export function transformBlog(blog: BlogPost) {
  // FeaturedImage is already a resolved absolute URL string or null.
  // Pass through directly — never process it again.
  const featuredImageUrl = blog.FeaturedImage ?? undefined;

  const readingTime   = calculateReadingTime(blog.Content || '');
  const publishDate   = blog.PublishedDate || blog.publishedAt || blog.createdAt;
  const formattedDate = new Date(publishDate).toLocaleDateString(
    blog.Language === 'zh' ? 'zh-CN' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  return {
    ...blog,
    featuredImageUrl,
    readingTime,
    formattedDate,
    excerpt: blog.Description || blog.Content?.substring(0, 160) || '',
  };
}

// ─── Utilities ────────────────────────────────────────────────────────────────

export function generateTableOfContents(content: string) {
  const regex = /<h([1-6])[^>]*id="([^"]*)"[^>]*>([^<]+)<\/h\1>/g;
  const toc: Array<{ id: string; text: string; level: number }> = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    toc.push({ level: parseInt(match[1]), id: match[2], text: match[3] });
  }
  return toc;
}

export async function searchBlogs(query: string, language: 'en' | 'zh' = 'en') {
  const { blogs, error } = await fetchAllBlogs(language, { pageSize: 100 });
  if (error) return { blogs: [], error };
  const q = query.toLowerCase();
  return {
    blogs: blogs.filter(
      (b) => b.Title.toLowerCase().includes(q) ||
             b.Description?.toLowerCase().includes(q) ||
             b.Content?.toLowerCase().includes(q)
    ),
    error: null,
  };
}