import { Metadata } from 'next';
import { fetchAllBlogs, fetchBlogCategories, fetchBlogTags } from '@/lib/strapi/blogs';
import BlogHero from '@/components/blog/BlogHero';
import BlogListingClient from '@/components/blog/BlogListingClient';
import { getDictionary } from '@/lib/getDictionary';
import { isSupportedLocale, DEFAULT_LOCALE } from '@/lib/locales';

interface BlogPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata(props: BlogPageProps): Promise<Metadata> {
  const params = await props.params;
  const locale = isSupportedLocale(params?.locale) ? params.locale : DEFAULT_LOCALE;
  const t = await getDictionary(locale);

  const isZh = locale === 'zh';
  const urlPath = isZh ? '/zh/blog' : '/blog';
  const domain = 'https://www.shainwaiyan.com';

  const title = isZh
    ? '数字营销博客与案例分析 | 明元易'
    : 'Digital Marketing Blog & Case Studies | Shain Wai Yan';

  return {
    title,
    description: t.blog.description,
    alternates: {
      canonical: `${domain}${urlPath}`,
      languages: {
        en: `${domain}/blog`,
        zh: `${domain}/zh/blog`
      },
    },
    openGraph: {
      type: 'website',
      url: `${domain}${urlPath}`,
      title,
      description: t.blog.description,
      images: `${domain}/images/Shain Studio.png`,
      locale: isZh ? 'zh_CN' : 'en_US',
      alternateLocale: isZh ? 'en_US' : 'zh_CN',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: t.blog.description,
      images: [`${domain}/images/Shain Studio.png`],
    },
  };
}

export default async function BlogPage(props: BlogPageProps) {
  const params = await props.params;
  const locale = (isSupportedLocale(params?.locale) ? params.locale : DEFAULT_LOCALE) as 'en' | 'zh';
  const t = await getDictionary(locale);

  // Fetch all posts server-side (100 max) so client filtering works on the full dataset
  const { blogs, error } = await fetchAllBlogs(locale, { pageSize: 100 });
  const { categories } = await fetchBlogCategories(locale);
  const { tags } = await fetchBlogTags(locale);

  const isZh = locale === 'zh';
  const domain = 'https://www.shainwaiyan.com';

  // Dynamic JSON-LD matching Strapi casing (Title, Slug)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: isZh ? '数字营销博客' : 'Digital Marketing Blog',
    description: t.blog.description,
    url: `${domain}${isZh ? '/zh/blog' : '/blog'}`,
    publisher: {
      '@type': 'Person',
      name: isZh ? '明元易' : 'Shain Wai Yan',
      url: domain,
    },
    mainEntityOfPage: {
      '@type': 'CollectionPage',
      '@id': `${domain}${isZh ? '/zh/blog' : '/blog'}`,
    },
    itemListElement: blogs.map((blog, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${domain}${isZh ? '/zh' : ''}/blog/${blog.Slug}`,
      name: blog.Title,
    })),
  };

  return (
    <main className="min-h-screen bg-white dark:bg-[#121212]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogHero
        title={t.blog.subtitle}
        subtitle={t.blog.description}
        language={locale}
      />
      <BlogListingClient
        allBlogs={blogs}
        categories={categories}
        tags={tags}
        language={locale}
        error={error}
      />
    </main>
  );
}