import { localizedCollectionSeo } from '@/lib/server/localized-content';
import type { Metadata } from 'next';
import { Alex_Brush } from 'next/font/google';
import { getDictionary } from '@/lib/getDictionary';
import { isSupportedLocale, DEFAULT_LOCALE } from '@/lib/locales';
import { DEFAULT_OG_IMAGE, brandedTitle } from '@/lib/seo';

interface PencilArtLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

const alexBrush = Alex_Brush({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-signature-face',
  display: 'swap',
});

export async function generateMetadata(
  props: Omit<PencilArtLayoutProps, 'children'>
): Promise<Metadata> {
  const { locale: rawLocale } = await props.params;
  const locale = isSupportedLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const t = await getDictionary(locale);
  const basePath = locale === 'en' ? '' : `/${locale}`;

  return {
    title: { absolute: brandedTitle(t.pencilArt.seo.title, 'Shain Studio') },
    description: t.pencilArt.seo.description,
    authors: [{ name: locale === 'zh' ? '明元易' : 'Shain Wai Yan' }],
    ...await localizedCollectionSeo('arts','/hobbies/pencil-art',locale),
    openGraph: {
      title: t.pencilArt.seo.openGraphTitle,
      description: t.pencilArt.seo.openGraphDesc,
      type: 'website',
      url: `https://www.shainwaiyan.com${basePath}/hobbies/pencil-art`,
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      alternateLocale: locale === 'zh' ? 'en_US' : 'zh_CN',
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t.pencilArt.seo.openGraphTitle,
      description: t.pencilArt.seo.openGraphDesc,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export default function PencilArtLayout({ children }: { children: React.ReactNode }) {
  return <div className={alexBrush.variable}>{children}</div>;
}
