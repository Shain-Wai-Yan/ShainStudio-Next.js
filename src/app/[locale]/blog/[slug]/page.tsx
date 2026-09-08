import { serializeJsonLd } from '@/lib/utils/json-ld';
import { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { notFound } from 'next/navigation';
import { fetchAllBlogs, fetchBlogBySlug, fetchRelatedBlogs } from '@/lib/server/blogs';
import BlogPostHeader from '@/components/blog/BlogPostHeader';
import BlogPostContent from '@/components/blog/BlogPostContent';
import RelatedPosts from '@/components/blog/RelatedPosts';
import TableOfContents from '@/components/shared/TableOfContents';
import { getDictionary } from '@/lib/getDictionary';
import { SITE_URL, DEFAULT_OG_IMAGE, PERSON_ID, brandedTitle, personRef } from '@/lib/seo';

interface BlogPostPageProps {
  params: Promise<{ slug: string; locale?: string }>;
}

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const [english, chinese] = await Promise.all([
    fetchAllBlogs('en', { pageSize: 100 }),
    fetchAllBlogs('zh', { pageSize: 100 }),
  ]);
  return [
    ...english.blogs.map(blog => ({ locale: 'en', slug: blog.Slug })),
    ...chinese.blogs.map(blog => ({ locale: 'zh', slug: blog.Slug })),
  ];
}

export async function generateMetadata(props: BlogPostPageProps): Promise<Metadata> {
  const params = await props.params;
  const { slug, locale = 'en' } = params;
  const t = await getDictionary(locale);
  const { blog } = await fetchBlogBySlug(slug);
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
    robots: locale === 'zh' ? { index: false, follow: true } : { index: true, follow: true },
    authors: blog.Author ? [{ name: blog.Author }] : undefined,
    keywords: blog.Tags?.join(', '),
    alternates: {
      canonical: `${SITE_URL}/blog/${blog.Slug}`,
    },
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

export default async function BlogPostPage(props: BlogPostPageProps) {
  const params = await props.params;
  const { slug, locale = 'en' } = params;
  const lang = locale as 'en' | 'zh';
  const t = await getDictionary(locale);
  const { blog, error } = await fetchBlogBySlug(slug);

  if (error) throw new Error(error);
  if (!blog) notFound();

  const { blogs: relatedBlogs } = await fetchRelatedBlogs(blog.Category, blog.Slug, lang, 3);
  const basePath = locale === 'en' ? '' : `/${locale}`;
  const urlPath = locale === 'en' ? `/blog/${blog.Slug}` : `/${locale}/blog/${blog.Slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${SITE_URL}${urlPath}#article`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}${urlPath}`
    },
    headline: blog.Seo?.metaTitle || blog.Title,
    image: (blog.Seo?.ogImageUrl || blog.FeaturedImage) ? [{
      '@type': 'ImageObject',
      url: blog.Seo?.ogImageUrl || blog.FeaturedImage
    }] : [],
    datePublished: blog.PublishedDate || blog.createdAt || undefined,
    dateModified: blog.updatedAt || undefined,
    author: [
      !blog.Author || blog.Author === 'Shain Wai Yan'
        ? {
            '@type': 'Person',
            '@id': PERSON_ID,
            name: 'Shain Wai Yan',
            url: `${SITE_URL}/about`,
          }
        : {
            '@type': 'Person',
            name: blog.Author,
            url: `${SITE_URL}${locale === 'zh' ? '/zh' : ''}/about`,
          },
    ],
    publisher: personRef(),
    description: blog.Seo?.metaDescription || blog.Description || blog.Title,
    isPartOf: {
      '@type': 'CollectionPage',
      '@id': `${SITE_URL}${basePath}/blog`,
      name: lang === 'zh' ? '数字营销博客 | 明元易' : 'Digital Marketing Blog | Shain Studio',
      url: `${SITE_URL}${basePath}/blog`
    },
  };
  
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": t.nav.home,
        "item": `${SITE_URL}${basePath}/`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": t.nav.blog,
        "item": `${SITE_URL}${basePath}/blog`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": blog.Title,
        "item": `${SITE_URL}${urlPath}`
      }
    ]
  };

  return (
    <main className="min-h-screen bg-white dark:bg-[#121212]">
      <Script
        id="schema-org"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd([jsonLd, breadcrumbLd]) }}
      />

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

      {/* ── Floating table of contents (desktop) ── */}
      <TableOfContents language={lang} />

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
