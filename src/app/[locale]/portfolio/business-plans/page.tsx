import { fetchBusinessPlans, transformBusinessPlan } from '@/lib/strapi/business-plans';
import { Metadata } from 'next';
import { getDictionary } from '@/lib/getDictionary';
import { isSupportedLocale, DEFAULT_LOCALE } from '@/lib/locales';
import BusinessPlanClient from '@/components/business-plans/BusinessPlanClient';
import { DEFAULT_OG_IMAGE, absoluteUrl, brandedTitle } from '@/lib/seo';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isSupportedLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const t = await getDictionary(locale);

  const title = `${t.businessPlans.title} | Shain Studio`;
  const description = t.businessPlans.description.substring(0, 160);
  const url = absoluteUrl(locale, '/portfolio/business-plans');

  return {
    title: { absolute: brandedTitle(title, 'Shain Studio') },
    description,
    robots: locale === 'zh' ? { index: false, follow: true } : { index: true, follow: true },
    alternates: {
      canonical: absoluteUrl('en', '/portfolio/business-plans'),
    },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      images: [DEFAULT_OG_IMAGE],
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
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
  const [t, result] = await Promise.all([getDictionary(locale), fetchBusinessPlans(1, 100)]);

  return <BusinessPlanClient initialPlans={result.plans.map(transformBusinessPlan)} initialError={result.error} locale={locale as 'en' | 'zh'} t={{ nav: t.nav, businessPlans: t.businessPlans }} />;
}
