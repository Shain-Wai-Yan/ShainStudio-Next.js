import { Suspense } from 'react';
import { Metadata } from 'next';

import { MarketingInMotionClient } from '@/components/marketing-in-motion/MarketingInMotionClient';
import { getDictionary } from '@/lib/getDictionary';
import { isSupportedLocale, DEFAULT_LOCALE } from '@/lib/locales';
import { fetchMarketingProjects } from '@/lib/strapi/marketing-in-motion';

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
        'x-default': 'https://www.shainwaiyan.com/portfolio/marketing-in-motion',
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
  const t = await getDictionary(locale);

  // Pre-fetch data dynamically server-side for maximum SEO availability
  const { projects } = await fetchMarketingProjects(1, 100);

  const basePath = locale === 'en' ? '' : `/${locale}`;

  const BREADCRUMBS = [
    { label: t.marketingInMotion.breadcrumbs.home, href: basePath || '/' },
    { label: t.marketingInMotion.breadcrumbs.portfolio, href: `${basePath}/portfolio` },
    { label: t.marketingInMotion.breadcrumbs.marketingInMotion, href: `${basePath}/portfolio/marketing-in-motion` },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `https://www.shainwaiyan.com${basePath}/portfolio/marketing-in-motion#collection`,
    name: t.marketingInMotion.seo.title,
    description: t.marketingInMotion.seo.description,
    url: `https://www.shainwaiyan.com${basePath}/portfolio/marketing-in-motion`,
    publisher: {
      '@type': 'Organization',
      name: 'Shain Studio',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.shainwaiyan.com/images/Shain Studio.png'
      }
    },
    mainEntity: {
      '@type': 'ItemList',
      '@id': `https://www.shainwaiyan.com${basePath}/portfolio/marketing-in-motion#itemlist`,
      itemListElement: projects.map((project, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'CreativeWork',
          '@id': `https://www.shainwaiyan.com${basePath}/portfolio/marketing-in-motion/${project.slug}#creativework`,
          name: project.title,
          url: `https://www.shainwaiyan.com${basePath}/portfolio/marketing-in-motion/${project.slug}`
        }
      }))
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={<div className="py-20 text-center text-[#666] dark:text-[#b0b0b0]">Loading projects...</div>}>
        <MarketingInMotionClient
          locale={locale as 'en' | 'zh'}
          breadcrumbItems={BREADCRUMBS}
          labels={t.marketingInMotion.labels}
          initialProjects={projects}
        />
      </Suspense>
    </div>
  );
}