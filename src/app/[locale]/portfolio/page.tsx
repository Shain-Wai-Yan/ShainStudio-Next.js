import { Metadata } from 'next';
import { getDictionary } from '@/lib/getDictionary';
import { isSupportedLocale, DEFAULT_LOCALE } from '@/lib/locales';
import PortfolioClient, { PortfolioDictionary } from '@/components/portfolio/PortfolioClient';

interface PortfolioProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PortfolioProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isSupportedLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const translations = await getDictionary(locale);
  const t = translations.portfolioPage;
  
  const domain = 'https://www.shainwaiyan.com';
  const urlPath = locale === 'zh' ? '/zh/portfolio' : '/portfolio';
  const baseUrl = `${domain}${urlPath}`;

  const title = `${t.cards.headline} | Shain Wai Yan (xolbine)`;
  const description = t.cta.p;

  return {
    title,
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
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export const dynamic = 'force-static';
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
  const translations = await getDictionary(locale);
  const t = translations.portfolioPage;

  return (
    <PortfolioClient locale={locale as 'en' | 'zh'} t={t as unknown as PortfolioDictionary} />
  );
}
