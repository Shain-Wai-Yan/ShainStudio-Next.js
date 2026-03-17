import { Suspense } from 'react';
import type { Metadata } from 'next';
import { MarketingInMotionClient } from '@/components/marketing-in-motion/MarketingInMotionClient';

export const metadata: Metadata = {
  title: '营销实战 | Shain Studio — 策略与案例研究',
  description:
    '探索 Shain Studio 的营销策略、活动与案例研究。从课程作业到自主实验，了解我作为现代营销人如何思考、规划和执行。',
  keywords: [
    '营销活动',
    '营销策略',
    '案例研究',
    '数字营销',
    '品牌策略',
    'Shain Wai Yan',
    'Shain Studio',
  ],
  alternates: {
    canonical: 'https://www.shainwaiyan.com/zh/portfolio/marketing-in-motion',
    languages: {
      en: 'https://www.shainwaiyan.com/portfolio/marketing-in-motion',
      zh: 'https://www.shainwaiyan.com/zh/portfolio/marketing-in-motion',
    },
  },
  openGraph: {
    type: 'website',
    title: '营销实战 | Shain Studio — 策略与案例研究',
    description:
      '探索 Shain Studio 的营销策略、活动与案例研究。从课程作业到自主实验，了解我作为现代营销人如何思考、规划和执行。',
    images: [{ url: '/images/Shain Studio.png' }],
    siteName: 'Shain Wai Yan 作品集',
    locale: 'zh_CN',
  },
  twitter: {
    card: 'summary_large_image',
    title: '营销实战 | Shain Studio',
    description: '探索 Shain Wai Yan 的营销策略、活动与案例研究。',
    images: ['/images/Shain Studio.png'],
  },
};

const ZH_LABELS = {
  heroTitle: '我创作的营销策略、活动与案例研究',
  heroDescription:
    '从课程作业到自主实验——每一个项目都体现了我作为现代营销人的思考、规划与执行方式。',
  featuredTitle: '精选项目',
  searchPlaceholder: '搜索项目...',
  allCategories: '全部分类',
  allTools: '全部工具',
  allTags: '全部标签',
  allTypes: '全部类型',
  refresh: '刷新项目',
  showing: '显示',
  of: '共',
  projects: '个项目',
  viewDetails: '查看详情',
  loadMore: '加载更多项目',
  loadingText: '正在加载营销项目...',
  errorText: '哎呀！出现了问题',
  retryText: '重试',
  noProjects: '未找到项目',
  noProjectsHint: '请尝试调整您的搜索或筛选条件。',
};

const BREADCRUMBS = [
  { label: '首页', href: '/zh' },
  { label: '作品集', href: '/zh/portfolio' },
  { label: '营销实战', href: '/zh/portfolio/marketing-in-motion' },
];

export default function ZhMarketingInMotionPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] transition-colors duration-300">
      <Suspense fallback={<PageFallback />}>
        <MarketingInMotionClient
          locale="zh"
          breadcrumbItems={BREADCRUMBS}
          labels={ZH_LABELS}
        />
      </Suspense>
    </div>
  );
}

function PageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#121212]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-[#191970] dark:border-[#a67c00] border-t-transparent animate-spin" />
        <p className="text-gray-500 dark:text-gray-400 text-sm">加载中...</p>
      </div>
    </div>
  );
}