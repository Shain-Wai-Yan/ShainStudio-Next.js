import { Metadata } from 'next';
import { getDictionary } from '@/lib/getDictionary';
import { isSupportedLocale, DEFAULT_LOCALE } from '@/lib/locales';
import PortfolioClient from '@/components/portfolio/PortfolioClient';

interface PortfolioProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PortfolioProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isSupportedLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const translations = await getDictionary(locale);
  const t = translations.portfolioPage;

  return {
    title: `${t.cards.headline} | Shain Wai Yan`,
    description: t.cta.p.substring(0, 160),
    alternates: {
      languages: {
        'en': 'https://www.shainwaiyan.com/portfolio',
        'zh': 'https://www.shainwaiyan.com/zh/portfolio',
      },
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
    <PortfolioClient locale={locale as 'en' | 'zh'} t={t} />
  );
}
