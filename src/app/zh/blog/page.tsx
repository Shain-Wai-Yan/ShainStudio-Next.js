import { Metadata } from 'next';
import { fetchAllBlogs, fetchBlogCategories, fetchBlogTags } from '@/lib/strapi/blogs';
import BlogHero from '@/components/blog/BlogHero';
import BlogListingClient from '@/components/blog/BlogListingClient';

export const metadata: Metadata = {
  title: '博客 | 数字营销洞察',
  description: '探索数字营销、品牌战略、AI驱动的营销活动和行业洞察的深度文章。',
  alternates: {
    canonical: '/zh/blog',
    languages: { en: '/blog', zh: '/zh/blog' },
  },
  openGraph: {
    type: 'website',
    url: 'https://www.shainwaiyan.com/zh/blog',
    title: '博客 | 数字营销洞察',
    description: '探索数字营销、品牌战略、AI驱动的营销活动和行业洞察的深度文章。',
    images: 'https://www.shainwaiyan.com/images/Shain Studio.png',
    locale: 'zh_CN',
    alternateLocale: 'en_US',
  },
};

export default async function ChineseBlogPage() {
  const { blogs, error } = await fetchAllBlogs('zh', { pageSize: 100 });
  const { categories } = await fetchBlogCategories('zh');
  const { tags } = await fetchBlogTags('zh');

  return (
    <main className="min-h-screen bg-white dark:bg-[#121212]">
      <BlogHero
        title="数字营销洞察"
        subtitle="探索数字营销、品牌战略、AI驱动的营销活动和行业洞察的深度文章。"
        language="zh"
      />
      <BlogListingClient
        allBlogs={blogs}
        categories={categories}
        tags={tags}
        language="zh"
        error={error}
      />
    </main>
  );
}