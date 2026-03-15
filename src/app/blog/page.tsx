import { Metadata } from 'next';
import { fetchAllBlogs, fetchBlogCategories, fetchBlogTags } from '@/lib/strapi/blogs';
import BlogHero from '@/components/blog/BlogHero';
import BlogListingClient from '@/components/blog/BlogListingClient';

export const metadata: Metadata = {
  title: 'Blog | Digital Marketing Insights',
  description: 'Explore in-depth articles on digital marketing, brand strategy, AI-powered campaigns, and industry insights.',
  alternates: {
    canonical: '/blog',
    languages: { en: '/blog', zh: '/zh/blog' },
  },
  openGraph: {
    type: 'website',
    url: 'https://www.shainwaiyan.com/blog',
    title: 'Blog | Digital Marketing Insights',
    description: 'Explore in-depth articles on digital marketing, brand strategy, AI-powered campaigns, and industry insights.',
    images: 'https://www.shainwaiyan.com/images/Shain Studio.png',
    locale: 'en_US',
    alternateLocale: 'zh_CN',
  },
};

export default async function BlogPage() {
  // Fetch all posts server-side (100 max) so client filtering works on the full dataset
  const { blogs, error } = await fetchAllBlogs('en', { pageSize: 100 });
  const { categories } = await fetchBlogCategories('en');
  const { tags } = await fetchBlogTags('en');

  return (
    <main className="min-h-screen bg-white dark:bg-[#121212]">
      <BlogHero
        title="Digital Marketing Insights"
        subtitle="Explore strategies, trends, and actionable insights on digital marketing, AI, and brand strategy."
        language="en"
      />
      <BlogListingClient
        allBlogs={blogs}
        categories={categories}
        tags={tags}
        language="en"
        error={error}
      />
    </main>
  );
}