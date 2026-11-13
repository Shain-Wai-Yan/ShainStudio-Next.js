import Link from 'next/link';
import Script from 'next/script';
import BlogPostHeader from '@/components/blog/BlogPostHeader';
import BlogPostContent from '@/components/blog/BlogPostContent';
import RelatedPosts from '@/components/blog/RelatedPosts';
import TableOfContents from '@/components/shared/TableOfContents';
import ContentLanguageNotice from '@/components/shared/ContentLanguageNotice';
import {serializeJsonLd} from '@/lib/utils/json-ld';
import {SITE_URL,PERSON_ID,personRef} from '@/lib/seo';
import {getDictionary} from '@/lib/getDictionary';
import type {BlogPost} from '@/lib/strapi/blogs';

/** Shared by the published route and authenticated saved-draft preview. */
export default async function BlogView({blog, relatedBlogs, locale}: {blog: BlogPost; relatedBlogs: BlogPost[]; locale: 'en' | 'zh'}) {
  const lang=locale;
  const t=await getDictionary(locale);
  const basePath = locale === 'en' ? '' : `/${locale}`;
  const urlPath = locale === 'en' ? `/blog/${blog.Slug}` : `/${locale}/blog/${blog.Slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    inLanguage: locale === 'zh' ? 'zh-CN' : 'en-US',
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
      <ContentLanguageNotice localization={blog.localization} />
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
