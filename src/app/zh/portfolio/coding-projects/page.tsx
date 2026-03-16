import { Metadata } from 'next';
import { GithubGalleryZH } from '@/components/coding-project/GithubGalleryZH';
import { Breadcrumb } from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: '编程项目 – GitHub 资料展示器',
  description: '探索明元易（Shain Wai Yan、xolbine）的编程项目，包括 GitHub 资料展示器及其他个人开发作品。体验基于现代设计理念构建的交互式网络应用。',
  alternates: {
    canonical: '/zh/portfolio/coding-project',
  },
  openGraph: {
    title: '编程项目 – GitHub 资料展示器 | 明元易',
    description: '探索明元易（Shain Wai Yan、xolbine）的编程项目，包括 GitHub 资料展示器及其他个人开发作品。',
    url: '/zh/portfolio/coding-project',
  },
};

export default function CodingProjectPageZH() {
  const breadcrumbItems = [
    { label: '首页', href: '/zh' },
    { label: '作品集', href: '/zh/portfolio' },
    { label: '编程项目', href: '/zh/portfolio/coding-project' },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <Breadcrumb items={breadcrumbItems} />

        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#191970' }}>
            编程项目
          </h1>
          <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
            作为一名数字营销和品牌策略专家，我对技术充满热情，并通过编程技能来增强我的营销能力并创建交互式工具。虽然我并非专业程序员或计算机科学专业毕业生，但编程已成为我商业和营销专长的重要补充，使我能够构建将战略与实施相结合的定制解决方案。
          </p>
        </div>

        {/* GitHub Gallery Section */}
        <section aria-labelledby="github-heading" className="mb-12">
          <h2 id="github-heading" className="text-xl font-bold mb-6" style={{ color: '#191970' }}>
            我的代码展示
          </h2>
          <GithubGalleryZH />
        </section>
      </div>
    </main>
  );
}