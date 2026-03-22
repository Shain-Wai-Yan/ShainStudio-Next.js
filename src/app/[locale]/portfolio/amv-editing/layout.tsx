import type { Metadata } from 'next';
import { getDictionarySync } from '@/lib/getDictionary';

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
    title: t.amvEditing.seo.title,
    description: t.amvEditing.seo.description,
    keywords: t.amvEditing.seo.keywords,
    authors: [{ name: locale === 'zh' ? '明元易' : 'Shain Wai Yan' }],
    openGraph: {
      title: t.amvEditing.seo.openGraphTitle,
      description: t.amvEditing.seo.openGraphDesc,
      type: 'website',
      url: locale === 'en' ? 'https://www.shainwaiyan.com/portfolio/amv-editing' : `https://www.shainwaiyan.com/${locale}/portfolio/amv-editing`,
      siteName: t.amvEditing.seo.siteName,
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      alternateLocale: locale === 'zh' ? 'en_US' : 'zh_CN',
    },
    alternates: {
      canonical: locale === 'en' ? '/portfolio/amv-editing' : `/${locale}/portfolio/amv-editing`,
      languages: {
        en: '/portfolio/amv-editing',
        zh: '/zh/portfolio/amv-editing',
      },
    },
  };
}

export default function AMVEditingLayout({
  children,
}: AMVEditingLayoutProps) {
  return children;
}
