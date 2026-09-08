import { Metadata } from 'next';
import { getDictionary } from '@/lib/getDictionary';
import { isSupportedLocale, DEFAULT_LOCALE } from '@/lib/locales';
import PortfolioClient, { PortfolioDictionary } from '@/components/portfolio/PortfolioClient';
import { getPortfolioCounts } from '@/lib/getPortfolioCounts';
import { DEFAULT_OG_IMAGE, SITE_URL } from '@/lib/seo';

interface PortfolioProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PortfolioProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isSupportedLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const translations = await getDictionary(locale);
  const t = translations.portfolioPage;
  
  const domain = SITE_URL;
  const urlPath = locale === 'zh' ? '/zh/portfolio' : '/portfolio';
  const baseUrl = `${domain}${urlPath}`;

  const title = locale === 'zh' ? '精选作品 | Shain Studio' : 'Selected Work | Shain Studio';
  const description = t.cta.p;

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: baseUrl,
      languages: {
        en: `${domain}/portfolio`,
        zh: `${domain}/zh/portfolio`,
        'x-default': `${domain}/portfolio`,
      },
    },
    openGraph: {
      title,
      description,
      url: baseUrl,
      type: 'website',
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

// export const dynamic = 'force-static'; // Removed to allow dynamic fetching for counts
export const revalidate = 3600;

export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'zh' }
  ];
}

export default async function PortfolioPage({ params }: PortfolioProps) {
  const { locale: rawLocale } = await params;
  const locale = isSupportedLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  
  // Fetch dynamic counts concurrently
  const [translations, dynamicCounts] = await Promise.all([
    getDictionary(locale),
    getPortfolioCounts()
  ]);

  
  const t = translations.portfolioPage;

  return (
    <PortfolioClient 
      locale={locale as 'en' | 'zh'} 
      t={t as unknown as PortfolioDictionary} 
      dynamicCounts={dynamicCounts}
    />
  );
}
