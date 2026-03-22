import { Metadata } from 'next';
import { Suspense } from 'react';
import { MarketingInMotionClient } from '@/components/marketing-in-motion/MarketingInMotionClient';
import { getDictionary } from '@/lib/getDictionary'; // ✅ CHANGE: async
import { isSupportedLocale, DEFAULT_LOCALE } from '@/lib/locales';

interface MarketingInMotionPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata(
  props: MarketingInMotionPageProps
): Promise<Metadata> {
  const { locale: rawLocale } = await props.params;
  const locale = isSupportedLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const t = await getDictionary(locale); // ✅ CHANGE: async

  const basePath = locale === 'en' ? '' : `/${locale}`;

  return {
    title: t.marketingInMotion.seo.title,
    description: t.marketingInMotion.seo.description,
    keywords: t.marketingInMotion.seo.keywords,
    alternates: {
      canonical: `https://www.shainwaiyan.com${basePath}/portfolio/marketing-in-motion`,
      languages: {
        en: 'https://www.shainwaiyan.com/portfolio/marketing-in-motion',
        zh: 'https://www.shainwaiyan.com/zh/portfolio/marketing-in-motion',
      },
    },
    openGraph: {
      type: 'website',
      url: `https://www.shainwaiyan.com${basePath}/portfolio/marketing-in-motion`,
      title: t.marketingInMotion.seo.title,
      description: t.marketingInMotion.seo.description,
      images: [{ url: '/images/Shain Studio.png' }],
      siteName: t.marketingInMotion.seo.siteName || 'Shain Wai Yan Portfolio',
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      alternateLocale: locale === 'zh' ? 'en_US' : 'zh_CN',
    },
    twitter: {
      card: 'summary_large_image',
      title: t.marketingInMotion.seo.twitterTitle || t.marketingInMotion.seo.title,
      description: t.marketingInMotion.seo.twitterDescription || t.marketingInMotion.seo.description,
      images: ['/images/Shain Studio.png'],
    },
  };
}

export default async function MarketingInMotionPage(props: MarketingInMotionPageProps) {
  const { locale: rawLocale } = await props.params;
  const locale = isSupportedLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const t = await getDictionary(locale); // ✅ CHANGE: async

  const basePath = locale === 'en' ? '' : `/${locale}`;

  const BREADCRUMBS = [
    { label: t.marketingInMotion.breadcrumbs.home, href: basePath || '/' },
    { label: t.marketingInMotion.breadcrumbs.portfolio, href: `${basePath}/portfolio` },
    { label: t.marketingInMotion.breadcrumbs.marketingInMotion, href: `${basePath}/portfolio/marketing-in-motion` },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] transition-colors duration-300">
      <Suspense fallback={<PageFallback loadingText={t.marketingInMotion.fallback.loading} />}>
        <MarketingInMotionClient
          locale={locale as 'en' | 'zh'}
          breadcrumbItems={BREADCRUMBS}
          labels={t.marketingInMotion.labels}
        />
      </Suspense>
    </div>
  );
}

function PageFallback({ loadingText }: { loadingText: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#121212]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-[#191970] dark:border-[#a67c00] border-t-transparent animate-spin" />
        <p className="text-gray-500 dark:text-gray-400 text-sm">{loadingText}</p>
      </div>
    </div>
  );
}