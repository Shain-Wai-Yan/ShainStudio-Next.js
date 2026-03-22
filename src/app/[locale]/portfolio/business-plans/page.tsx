import { Metadata } from 'next';
import { getDictionary } from '@/lib/getDictionary';
import { isSupportedLocale, DEFAULT_LOCALE } from '@/lib/locales';
import BusinessPlanClient from '@/components/business-plans/BusinessPlanClient';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isSupportedLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const t = await getDictionary(locale);

  return {
    title: `${t.businessPlans.title} | Shain Wai Yan`,
    description: t.businessPlans.description.substring(0, 160),
    alternates: {
      languages: {
        'en': 'https://www.shainwaiyan.com/portfolio/business-plans',
        'zh': 'https://www.shainwaiyan.com/zh/portfolio/business-plans',
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

export default async function BusinessPlansPage({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale = isSupportedLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const t = await getDictionary(locale);

  return <BusinessPlanClient locale={locale as 'en' | 'zh'} t={t} />;
}