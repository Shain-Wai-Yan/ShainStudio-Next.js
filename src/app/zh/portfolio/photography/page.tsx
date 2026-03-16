import { Metadata } from 'next';
import { Breadcrumb } from '@/components/Breadcrumb';
import { PhotographyGallery } from '@/components/photography/PhotographyGallery';
import { fetchAllPhotography } from '@/lib/strapi/photography';

export const metadata: Metadata = {
  title: '摄影作品集 | Shain Wai Yan',
  description: '探索 Shain Wai Yan 的摄影作品集，包含风景、建筑等精彩影像。',
  alternates: { canonical: '/zh/portfolio/photography' },
  openGraph: {
    title: '摄影作品集 | Shain Wai Yan',
    description: '探索我的摄影作品集，包含风景、人像、建筑等多种风格的摄影作品。',
    url: '/zh/portfolio/photography',
  },
};

export default async function PhotographyPage() {
  const { photos, error } = await fetchAllPhotography('zh', { pageSize: 100 });

  const breadcrumbItems = [
    { label: '首页', href: '/zh' },
    { label: '作品集', href: '/zh/portfolio' },
    { label: '摄影', href: '/zh/portfolio/photography' },
  ];

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <Breadcrumb items={breadcrumbItems} />

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-[#191970] dark:text-white mb-3">
            摄影作品集
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            通过镜头探索世界的美妙瞬间。每一张照片都讲述了一个独特的故事，捕捉了光线、色彩和情感的完美融合。
          </p>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-8 text-center">
            <p className="text-red-600 dark:text-red-400 font-medium text-sm">
              加载失败，请稍后再试。
            </p>
          </div>
        ) : photos.length > 0 ? (
          <PhotographyGallery initialPhotos={photos} language="zh" />
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-gray-400 dark:text-gray-500 font-medium">暂无摄影作品。</p>
          </div>
        )}
      </div>
    </main>
  );
}