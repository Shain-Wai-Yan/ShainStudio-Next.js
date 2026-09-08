import { fetchMarketingPlans, transformMarketingPlan } from '@/lib/strapi/marketing-plans';
import { Metadata } from 'next';
import { getDictionary } from '@/lib/getDictionary';
import { isSupportedLocale, DEFAULT_LOCALE } from '@/lib/locales';
import { DEFAULT_OG_IMAGE, SITE_URL, brandedTitle } from '@/lib/seo';
import { MarketingPlanClient } from '@/components/marketing-plans/MarketingPlanClient';

interface MarketingPlanPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata(props: MarketingPlanPageProps): Promise<Metadata> {
  const params = await props.params;
  const locale = isSupportedLocale(params?.locale) ? params.locale : DEFAULT_LOCALE;
  const dict = await getDictionary(locale);
  
  const basePath = locale === 'en' ? '' : `/${locale}`;

  return {
    title: { absolute: brandedTitle(dict.marketingPlans.seo.title, 'Shain Studio') },
    description: dict.marketingPlans.seo.description,
    robots: locale === 'zh' ? { index: false, follow: true } : { index: true, follow: true },
    alternates: {
      canonical: `${SITE_URL}/portfolio/marketing-plans`,
    },
    openGraph: {
      title: dict.marketingPlans.seo.title,
      description: dict.marketingPlans.seo.description,
      url: `https://www.shainwaiyan.com${basePath}/portfolio/marketing-plans`,
      type: 'website',
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: dict.marketingPlans.seo.title,
      description: dict.marketingPlans.seo.description,
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

export default async function MarketingPlanPage(props: MarketingPlanPageProps) {
  const params = await props.params;
  const locale = isSupportedLocale(params?.locale) ? params.locale : DEFAULT_LOCALE;
  const [dict, result] = await Promise.all([getDictionary(locale), fetchMarketingPlans(1, 100)]);

  return <MarketingPlanClient initialPlans={result.plans.map(transformMarketingPlan)} initialError={result.error} locale={locale as 'en' | 'zh'} dict={{ nav: dict.nav, marketingPlans: dict.marketingPlans }} />;
}
