import { serializeJsonLd } from '@/lib/utils/json-ld';
import { Suspense } from 'react';
import { Metadata } from 'next';
import { fetchAllBlogs, fetchBlogCategories, fetchBlogTags } from '@/lib/server/blogs';
import BlogHero from '@/components/blog/BlogHero';
import BlogListingClient from '@/components/blog/BlogListingClient';
import { getDictionary } from '@/lib/getDictionary';
import { isSupportedLocale, DEFAULT_LOCALE } from '@/lib/locales';
import { DEFAULT_OG_IMAGE, SITE_URL, brandedTitle, personRef } from '@/lib/seo';

interface BlogPageProps {
  params: Promise<{ locale: string }>;
}

export const revalidate = 300;

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'zh' }];
}

export async function generateMetadata(props: BlogPageProps): Promise<Metadata> {
  const params = await props.params;
  const locale = isSupportedLocale(params?.locale) ? params.locale : DEFAULT_LOCALE;
  const t = await getDictionary(locale);

  const isZh = locale === 'zh';
  const urlPath = isZh ? '/zh/blog' : '/blog';
  const domain = SITE_URL;

  const title = isZh
    ? '数字营销博客与案例分析'
    : 'Digital Marketing Blog & Case Studies';

  return {
    title: { absolute: brandedTitle(title, 'Shain Studio') },
    description: t.blog.description,
    robots: isZh ? { index: false, follow: true } : { index: true, follow: true },
    alternates: {
      canonical: `${domain}/blog`,
    },
    openGraph: {
      type: 'website',
      url: `${domain}${urlPath}`,
      title,
      description: t.blog.description,
      images: [DEFAULT_OG_IMAGE],
      locale: isZh ? 'zh_CN' : 'en_US',
      alternateLocale: isZh ? 'en_US' : 'zh_CN',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: t.blog.description,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export default async function BlogPage(props: BlogPageProps) {
  const params = await props.params;
  const locale = (isSupportedLocale(params?.locale) ? params.locale : DEFAULT_LOCALE) as 'en' | 'zh';
  const t = await getDictionary(locale);

  // Fetch all posts server-side (100 max) so client filtering works on the full dataset
  const [{ blogs, error }, { categories }, { tags }] = await Promise.all([
    fetchAllBlogs(locale, { pageSize: 100 }),
    fetchBlogCategories(locale),
    fetchBlogTags(locale),
  ]);

  const isZh = locale === 'zh';
  const domain = SITE_URL;

  // Dynamic JSON-LD structured as CollectionPage -> ItemList
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${domain}${isZh ? '/zh/blog' : '/blog'}#collection`,
    name: isZh ? '数字营销博客' : 'Digital Marketing Blog',
    description: t.blog.description,
    url: `${domain}${isZh ? '/zh/blog' : '/blog'}`,
    publisher: personRef(),
    mainEntity: {
      '@type': 'ItemList',
      '@id': `${domain}${isZh ? '/zh/blog' : '/blog'}#itemlist`,
      itemListElement: blogs.map((blog, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${domain}${isZh ? '/zh' : ''}/blog/${blog.Slug}`,
        name: blog.Title,
      }))
    }
  };

  return (
    <main className="min-h-screen bg-white dark:bg-[#121212]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <BlogHero
        title={t.blog.subtitle}
        subtitle={t.blog.description}
        language={locale}
      />
      <Suspense fallback={<div className="py-20 text-center text-[#666] dark:text-[#b0b0b0]">Loading blogs...</div>}>
        <BlogListingClient
          allBlogs={blogs}
          categories={categories}
          tags={tags}
          language={locale}
          error={error}
          labels={t.blog.labels}
        />
      </Suspense>
    </main>
  );
}
