import type { Metadata } from 'next';
import { getDictionarySync } from '@/lib/getDictionary';
import { DEFAULT_OG_IMAGE, SITE_URL, brandedTitle } from '@/lib/seo';

interface GamingLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata(
  props: Omit<GamingLayoutProps, 'children'>
): Promise<Metadata> {
  const { locale } = await props.params;
  const t = getDictionarySync(locale as 'en' | 'zh');

  return {
    title: { absolute: brandedTitle(t.gaming.seo.title, 'Shain Studio') },
    description: t.gaming.seo.description,
    robots: locale === 'zh' ? { index: false, follow: true } : { index: true, follow: true },
    keywords: t.gaming.seo.keywords,
    authors: [{ name: locale === 'zh' ? '明元易' : 'Shain Wai Yan' }],
    openGraph: {
      title: t.gaming.seo.openGraphTitle,
      description: t.gaming.seo.openGraphDesc,
      type: 'website',
      url:
        locale === 'en'
          ? 'https://www.shainwaiyan.com/hobbies/gaming'
          : `https://www.shainwaiyan.com/${locale}/hobbies/gaming`,
      siteName: t.gaming.seo.siteName,
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      alternateLocale: locale === 'zh' ? 'en_US' : 'zh_CN',
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t.gaming.seo.openGraphTitle,
      description: t.gaming.seo.openGraphDesc,
      images: [DEFAULT_OG_IMAGE],
    },
    alternates: {
      canonical: `${SITE_URL}/hobbies/gaming`,
    },
  };
}

export default function GamingLayout({
  children,
}: GamingLayoutProps) {
  return children;
}
