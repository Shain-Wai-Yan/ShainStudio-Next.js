import { Metadata } from 'next';
import { getDictionary } from '@/lib/getDictionary';
import { isSupportedLocale, DEFAULT_LOCALE } from '@/lib/locales';
import BusinessPlanClient from '@/components/business-plans/BusinessPlanClient';
import { DEFAULT_OG_IMAGE, absoluteUrl, languageAlternates } from '@/lib/seo';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isSupportedLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const t = await getDictionary(locale);

  const title = `${t.businessPlans.title} | Shain Wai Yan`;
  const description = t.businessPlans.description.substring(0, 160);
  const url = absoluteUrl(locale, '/portfolio/business-plans');

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: languageAlternates('/portfolio/business-plans'),
    },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      images: [DEFAULT_OG_IMAGE],
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
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

export default async function BusinessPlansPage({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale = isSupportedLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const t = await getDictionary(locale);

  return <BusinessPlanClient locale={locale as 'en' | 'zh'} t={t} />;
}