import { Metadata } from 'next';
import { getDictionary } from '@/lib/getDictionary';
import { MarketingPlanClient } from '@/components/marketing-plans/MarketingPlanClient';

interface MarketingPlanPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata(props: MarketingPlanPageProps): Promise<Metadata> {
  const params = await props.params;
  const locale = params?.locale || 'en';
  
  // Safely extract seo translations
  const dict = await getDictionary(locale as any);
  
  return {
    title: dict.marketingPlans.seo.title,
    description: dict.marketingPlans.seo.description,
    alternates: {
      canonical: '/portfolio/marketing-plans',
      languages: {
        'en': '/portfolio/marketing-plans',
        'zh': '/zh/portfolio/marketing-plans',
      },
    },
    openGraph: {
      title: dict.marketingPlans.seo.title,
      description: dict.marketingPlans.seo.description,
      url: '/portfolio/marketing-plans',
    },
  };
}

export default async function MarketingPlanPage(props: MarketingPlanPageProps) {
  const params = await props.params;
  const locale = params?.locale || 'en';
  const dict = await getDictionary(locale as any);

  return <MarketingPlanClient locale={locale} dict={dict} />;
}