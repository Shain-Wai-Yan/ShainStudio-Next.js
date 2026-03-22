import { Metadata } from 'next';
import { fetchAllBlogs, fetchBlogCategories, fetchBlogTags } from '@/lib/strapi/blogs';
import BlogHero from '@/components/blog/BlogHero';
import BlogListingClient from '@/components/blog/BlogListingClient';
import { getDictionary } from '@/lib/getDictionary';

interface BlogPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata(props: BlogPageProps): Promise<Metadata> {
  const params = await props.params;
  const locale = params?.locale || 'en';
  const t = await getDictionary(locale);

  const urlPath = locale === 'en' ? '/blog' : `/${locale}/blog`;

  return {
    title: `${t.blog.title} | ${t.blog.subtitle}`,
    description: t.blog.description,
    alternates: {
      canonical: urlPath,
      languages: { en: '/blog', zh: '/zh/blog' },
    },
    openGraph: {
      type: 'website',
      url: `https://www.shainwaiyan.com${urlPath}`,
      title: `${t.blog.title} | ${t.blog.subtitle}`,
      description: t.blog.description,
      images: 'https://www.shainwaiyan.com/images/Shain Studio.png',
      locale: locale === 'en' ? 'en_US' : 'zh_CN',
      alternateLocale: locale === 'en' ? 'zh_CN' : 'en_US',
    },
  };
}

export default async function BlogPage(props: BlogPageProps) {
  const params = await props.params;
  const locale = (params?.locale || 'en') as 'en' | 'zh';
  const t = await getDictionary(locale);

  // Fetch all posts server-side (100 max) so client filtering works on the full dataset
  const { blogs, error } = await fetchAllBlogs(locale, { pageSize: 100 });
  const { categories } = await fetchBlogCategories(locale);
  const { tags } = await fetchBlogTags(locale);

  return (
    <main className="min-h-screen bg-white dark:bg-[#121212]">
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