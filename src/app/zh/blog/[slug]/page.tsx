import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchBlogBySlug, fetchRelatedBlogs } from '@/lib/strapi/blogs';
import BlogPostHeader from '@/components/blog/BlogPostHeader';
import BlogPostContent from '@/components/blog/BlogPostContent';
import RelatedPosts from '@/components/blog/RelatedPosts';

const SITE_URL = 'https://www.shainwaiyan.com';

interface ChineseBlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: ChineseBlogPostPageProps): Promise<Metadata> {
  const { slug } = await props.params;
  const { blog } = await fetchBlogBySlug(slug, 'zh');
  if (!blog) return { title: '文章未找到' };

  // ── Prefer SEO-specific fields, fall back to post fields ─────────────────
  const metaTitle       = blog.Seo?.metaTitle       || blog.Title;
  const metaDescription = blog.Seo?.metaDescription || blog.Description;
  // ogImage: prefer dedicated SEO ogImage, then fall back to featuredImage
  const ogImage         = blog.Seo?.ogImageUrl       || blog.FeaturedImage;

  return {
    title: `${metaTitle} | Shain Studio`,
    description: metaDescription,
    authors: blog.Author ? [{ name: blog.Author }] : undefined,
    keywords: blog.Tags?.join(', '),
    alternates: {
      // ── Absolute URLs — fixes the "all posts share one canonical" Search Console warning
      canonical: `${SITE_URL}/zh/blog/${blog.Slug}`,
      languages: {
        en: `${SITE_URL}/blog/${blog.Slug}`,
        zh: `${SITE_URL}/zh/blog/${blog.Slug}`,
      },
    },
    openGraph: {
      type: 'article',
      url: `${SITE_URL}/zh/blog/${blog.Slug}`,
      title: metaTitle,
      description: metaDescription,
      images: ogImage ? [{ url: ogImage }] : [],
      authors: blog.Author ? [blog.Author] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      // ── Per-post twitter title/description — fixes generic site-wide twitter tags
      title: metaTitle,
      description: metaDescription,
      images: ogImage ? [ogImage] : [],
    },
  };
}

export default async function ChineseBlogPostPage(props: ChineseBlogPostPageProps) {
  const { slug } = await props.params;
  const { blog, error } = await fetchBlogBySlug(slug, 'zh');

  if (error || !blog) notFound();

  const { blogs: relatedBlogs } = await fetchRelatedBlogs(blog.Category, blog.Slug, 'zh', 3);

  return (
    <main className="min-h-screen bg-white dark:bg-[#121212]">

      {/* Breadcrumb */}
      <nav className="bg-[#f8f9fa] dark:bg-[#1e1e1e] px-4 sm:px-6 lg:px-8 py-3 border-b border-[#d0d0d0] dark:border-[#444]">
        <ol className="flex items-center gap-1.5 text-xs max-w-5xl mx-auto flex-wrap">
          <li>
            <Link href="/zh" className="text-[#191970] dark:text-[#ffd700] hover:underline transition-colors">
              主页
            </Link>
          </li>
          <li className="text-[#999]">›</li>
          <li>
            <Link href="/zh/blog" className="text-[#191970] dark:text-[#ffd700] hover:underline transition-colors">
              博客
            </Link>
          </li>
          <li className="text-[#999]">›</li>
          <li className="text-[#333] dark:text-[#e0e0e0] font-medium truncate max-w-[200px] sm:max-w-xs">
            {blog.Title}
          </li>
        </ol>
      </nav>

      {/* Post header */}
      <BlogPostHeader blog={blog} language="zh" />

      {/* Post body */}
      <section className="py-8 md:py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <BlogPostContent blog={blog} language="zh" />
        </div>
      </section>

      {/* Related posts */}
      {relatedBlogs.length > 0 && (
        <div className="bg-[#f8f9fa] dark:bg-[#1a1a1a] py-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <RelatedPosts posts={relatedBlogs} language="zh" />
          </div>
        </div>
      )}
    </main>
  );
}