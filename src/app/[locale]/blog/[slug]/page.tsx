import { localizedSeo } from '@/lib/content-localization';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchBlogBySlug, fetchRelatedBlogs } from '@/lib/server/blogs';
import { getDictionary } from '@/lib/getDictionary';
import { SITE_URL, DEFAULT_OG_IMAGE, brandedTitle } from '@/lib/seo';

interface BlogPostPageProps {
  params: Promise<{ slug: string; locale?: string }>;
}

// Build no CMS detail pages up front. Each slug is generated on first request,
// cached, and refreshed with ISR without making deployments depend on Strapi.
export const revalidate = 300;
export function generateStaticParams() {
  return [];
}

export async function generateMetadata(props: BlogPostPageProps): Promise<Metadata> {
  const params = await props.params;
  const { slug, locale = 'en' } = params;
  const t = await getDictionary(locale);
  const { blog } = await fetchBlogBySlug(slug, locale === 'zh' ? 'zh' : 'en');
  if (!blog) return { title: t.blog.postNotFound || 'Post Not Found' };

  // ── Prefer SEO-specific fields, fall back to post fields ─────────────────
  const metaTitle       = blog.Seo?.metaTitle       || blog.Title;
  const metaDescription = blog.Seo?.metaDescription || blog.Description;
  // ogImage: prefer dedicated SEO ogImage, then fall back to featuredImage
  const ogImage         = blog.Seo?.ogImageUrl       || blog.FeaturedImage || DEFAULT_OG_IMAGE;

  const urlPath = locale === 'en' ? `/blog/${blog.Slug}` : `/${locale}/blog/${blog.Slug}`;

  return {
    title: { absolute: brandedTitle(metaTitle, 'Shain Studio') },
    description: metaDescription,
    authors: blog.Author ? [{ name: blog.Author }] : undefined,
    keywords: blog.Tags?.join(', '),
    ...localizedSeo(`/blog/${blog.Slug}`, locale === 'zh' ? 'zh' : 'en', blog.localization, blog.Seo?.noIndex, blog.Seo?.canonicalUrl),
    openGraph: {
      type: 'article',
      url: `${SITE_URL}${urlPath}`,
      title: metaTitle,
      description: metaDescription,
      images: ogImage ? [{ url: ogImage }] : [],
      authors: blog.Author ? [blog.Author] : undefined,
      publishedTime: blog.PublishedDate || blog.createdAt || undefined,
      modifiedTime: blog.updatedAt || undefined,
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: ogImage ? [ogImage] : [],
    },
  };
}

import BlogView from '@/components/content-views/BlogView';

export default async function BlogPostPage(props: BlogPostPageProps) {
  const params = await props.params;
  const { slug, locale = 'en' } = params;
  const lang = locale as 'en' | 'zh';
  const { blog, error } = await fetchBlogBySlug(slug, locale === 'zh' ? 'zh' : 'en');

  if (error) throw new Error(error);
  if (!blog) notFound();

  const { blogs: relatedBlogs } = await fetchRelatedBlogs(blog.Category, blog.Slug, lang, 3);
  return <BlogView blog={blog} relatedBlogs={relatedBlogs} locale={lang} />;
}
