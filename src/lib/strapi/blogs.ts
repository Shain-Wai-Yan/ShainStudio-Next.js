export interface BlogPost {
  id: number;
  documentId?: string;
  Title: string;
  Slug: string;
  Description?: string;
  Content: string;
  ReadingTime?: string;          // "5 min read" — pre-calculated server-side in route.ts
  FeaturedImage: string | null;  // absolute URL from Cloudinary/Strapi, or null
  Category?: string;
  Categories?: string[];
  Tags?: string[];
  Author?: string;
  Language: 'en' | 'zh';
  PublishedDate?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  // ── SEO fields from Strapi Seo component ─────────────────────────────────
  Seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImageUrl?: string | null;  // already resolved to absolute URL by API route
  };
}

// ─── Display transform (used by BlogCard, BlogPostHeader) ─────────────────────

function calculateReadingTime(content: string): number {
  return Math.ceil(content.replace(/<[^>]*>/g, '').trim().split(/\s+/).length / 200);
}

export function transformBlog(blog: BlogPost) {
  // FeaturedImage is already a resolved absolute URL string or null.
  // Pass through directly — never process it again.
  const featuredImageUrl = blog.FeaturedImage ?? undefined;

  // FIX: prefer server-calculated ReadingTime (available in minimal/listing mode)
  // Fall back to client-side calculation for full post pages where Content is present
  const readingTime = blog.ReadingTime
    ? parseInt(blog.ReadingTime)              // "5 min read" → 5
    : calculateReadingTime(blog.Content || ''); // fallback for slug route (full content)

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
