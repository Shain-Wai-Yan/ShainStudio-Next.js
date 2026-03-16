import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '动漫视频剪辑 | 明元易工作室 (xolbine)',
  description:
    '探索明元易（又名 xolbine，Shain Wai Yan）的 AMV（动画音乐视频）剪辑作品集，展示结合故事讲述与震撼视觉效果的动态视频剪辑。',
  keywords:
    '明元易, xolbine, Shain Wai Yan, AMV, 动画音乐视频, 视频剪辑, 作品集, 动画, 音乐视频',
  authors: [{ name: '明元易' }],
  openGraph: {
    title: '动漫视频剪辑 | 明元易工作室',
    description: '动态视频剪辑，融合故事叙述与震撼视觉效果',
    type: 'website',
    url: 'https://www.shainwaiyan.com/zh/portfolio/amv-editing',
    siteName: '明元易工作室',
    locale: 'zh_CN',
    alternateLocale: 'en_US',
  },
  alternates: {
    canonical: '/zh/portfolio/amv-editing',
    languages: {
      en: '/portfolio/amv-editing',
      zh: '/zh/portfolio/amv-editing',
    },
  },
};

export default function AMVEditingLayoutZH({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
