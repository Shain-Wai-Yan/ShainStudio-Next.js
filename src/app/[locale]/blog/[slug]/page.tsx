import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchBlogBySlug, fetchRelatedBlogs } from '@/lib/strapi/blogs';
import BlogPostHeader from '@/components/blog/BlogPostHeader';
import BlogPostContent from '@/components/blog/BlogPostContent';
import RelatedPosts from '@/components/blog/RelatedPosts';
import { getDictionary } from '@/lib/getDictionary';

const SITE_URL = 'https://www.shainwaiyan.com';

interface BlogPostPageProps {
  params: Promise<{ slug: string; locale?: string }>;
}

export async function generateMetadata(props: BlogPostPageProps): Promise<Metadata> {
  const params = await props.params;
  const { slug, locale = 'en' } = params;
  const t = await getDictionary(locale);
  const { blog } = await fetchBlogBySlug(slug, locale as 'en' | 'zh');
  if (!blog) return { title: t.blog.postNotFound || 'Post Not Found' };

  // ── Prefer SEO-specific fields, fall back to post fields ─────────────────
  const metaTitle       = blog.Seo?.metaTitle       || blog.Title;
  const metaDescription = blog.Seo?.metaDescription || blog.Description;
  // ogImage: prefer dedicated SEO ogImage, then fall back to featuredImage
  const ogImage         = blog.Seo?.ogImageUrl       || blog.FeaturedImage;

  const urlPath = locale === 'en' ? `/blog/${blog.Slug}` : `/${locale}/blog/${blog.Slug}`;

  return {
    title: `${metaTitle} | Shain Studio`,
    description: metaDescription,
    authors: blog.Author ? [{ name: blog.Author }] : undefined,
    keywords: blog.Tags?.join(', '),
    alternates: {
      canonical: `${SITE_URL}${urlPath}`,
      languages: {
        en: `${SITE_URL}/blog/${blog.Slug}`,
        zh: `${SITE_URL}/zh/blog/${blog.Slug}`,
      },
    },
    openGraph: {
      type: 'article',
      url: `${SITE_URL}${urlPath}`,
      title: metaTitle,
      description: metaDescription,
      images: ogImage ? [{ url: ogImage }] : [],
      authors: blog.Author ? [blog.Author] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: ogImage ? [ogImage] : [],
    },
  };
}

export default async function BlogPostPage(props: BlogPostPageProps) {
  const params = await props.params;
  const { slug, locale = 'en' } = params;
  const lang = locale as 'en' | 'zh';
  const t = await getDictionary(locale);
  const { blog, error } = await fetchBlogBySlug(slug, lang);

  if (error || !blog) notFound();

  const { blogs: relatedBlogs } = await fetchRelatedBlogs(blog.Category, blog.Slug, lang, 3);
  const basePath = locale === 'en' ? '' : `/${locale}`;

  return (
    <main className="min-h-screen bg-white dark:bg-[#121212]">

      {/* ── Breadcrumb — matches vanilla .breadcrumb ── */}
      <nav className="bg-[#f8f9fa] dark:bg-[#1e1e1e] px-4 sm:px-6 lg:px-8 py-3 border-b border-[#d0d0d0] dark:border-[#444]">
        <ol className="flex items-center gap-1.5 text-xs max-w-5xl mx-auto flex-wrap">
          <li>
            <Link href={`${basePath}/`} className="text-[#191970] dark:text-[#ffd700] hover:underline transition-colors">
              {t.nav.home}
            </Link>
          </li>
          <li className="text-[#999]">›</li>
          <li>
            <Link href={`${basePath}/blog`} className="text-[#191970] dark:text-[#ffd700] hover:underline transition-colors">
              {t.nav.blog}
            </Link>
          </li>
          <li className="text-[#999]">›</li>
          <li className="text-[#333] dark:text-[#e0e0e0] font-medium truncate max-w-[200px] sm:max-w-xs">
            {blog.Title}
          </li>
        </ol>
      </nav>

      {/* ── Post header (featured image + meta) ── */}
      <BlogPostHeader blog={blog} language={lang} />

      {/* ── Post body ── */}
      <section className="py-8 md:py-12">
        {/* Max-width container matching vanilla .blog-post (800px) */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <BlogPostContent blog={blog} language={lang} />
        </div>
      </section>

      {/* ── Related posts ── */}
      {relatedBlogs.length > 0 && (
        <div className="bg-[#f8f9fa] dark:bg-[#1a1a1a] py-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <RelatedPosts posts={relatedBlogs} language={lang} />
          </div>
        </div>
      )}
    </main>
  );
}