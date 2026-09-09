import type { Metadata } from 'next';
import { getDictionarySync } from '@/lib/getDictionary';
import { DEFAULT_OG_IMAGE, SITE_URL, brandedTitle } from '@/lib/seo';

interface AMVEditingLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata(
  props: Omit<AMVEditingLayoutProps, 'children'>
): Promise<Metadata> {
  const { locale } = await props.params;
  const t = getDictionarySync(locale as 'en' | 'zh');

  return {
    title: { absolute: brandedTitle(t.amvEditing.seo.title, 'Shain Studio') },
    description: t.amvEditing.seo.description,
    robots: locale === 'zh' ? { index: false, follow: true } : { index: true, follow: true },
    keywords: t.amvEditing.seo.keywords,
    authors: [{ name: locale === 'zh' ? '明元易' : 'Shain Wai Yan' }],
    openGraph: {
      title: t.amvEditing.seo.openGraphTitle,
      description: t.amvEditing.seo.openGraphDesc,
      type: 'website',
      url: locale === 'en' ? 'https://www.shainwaiyan.com/hobbies/amv-editing' : `https://www.shainwaiyan.com/${locale}/hobbies/amv-editing`,
      siteName: t.amvEditing.seo.siteName,
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      alternateLocale: locale === 'zh' ? 'en_US' : 'zh_CN',
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t.amvEditing.seo.openGraphTitle,
      description: t.amvEditing.seo.openGraphDesc,
      images: [DEFAULT_OG_IMAGE],
    },
    alternates: {
      canonical: `${SITE_URL}/hobbies/amv-editing`,
    },
  };
}

export default function AMVEditingLayout({
  children,
}: AMVEditingLayoutProps) {
  return children;
}
