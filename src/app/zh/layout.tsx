import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "数字营销与品牌策略师 | Shain Wai Yan (xolbine)",
    template: "%s | Shain Wai Yan (xolbine)",
  },
  description: "Shain Wai Yan (xolbine、明元易) 的数字营销与品牌策略作品集。探索AI驱动的营销活动、内容策略和市场分析。",
  authors: [{ name: "Shain Wai Yan" }],
  robots: "index, follow, max-image-preview:large",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#191970" },
    { media: "(prefers-color-scheme: dark)", color: "#a67c00" },
  ],
  colorScheme: "light dark",
  metadataBase: new URL("https://www.shainwaiyan.com"),
  alternates: {
    canonical: '/zh',
    languages: {
      'en': '/',
      'zh': '/zh',
      'x-default': '/',
    },
  },
  openGraph: {
    type: 'website',
    url: 'https://www.shainwaiyan.com/zh',
    title: '数字营销与品牌策略师 | Shain Wai Yan',
    description: '在Shain Wai Yan (xolbine)的作品集中探索AI驱动的营销活动、内容策略和市场分析。',
    images: 'https://www.shainwaiyan.com/images/Shain Studio.png',
    siteName: "Shain的作品集",
    locale: "zh_CN",
    alternateLocale: "en_US",
  },
  twitter: {
    card: 'summary_large_image',
    url: 'https://www.shainwaiyan.com/zh',
    title: '数字营销与品牌策略师 | Shain Wai Yan',
    description: '在Shain Wai Yan (xolbine)的作品集中探索AI驱动的营销活动、内容策略和市场分析。',
    images: 'https://www.shainwaiyan.com/images/Shain Studio.png',
  },
  icons: {
    icon: [
        { url: '/images/Shain Studio.png', type: 'image/png' },
        { url: '/images/Shain Studio.png', sizes: '32x32', type: 'image/png' },
        { url: '/images/Shain Studio.png', sizes: '96x96', type: 'image/png' },
        { url: '/images/Shain Studio.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/images/Shain Studio.png',
    apple: '/images/Shain Studio.png',
  }
};

export default function ChineseLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
