import type { Metadata } from 'next';
import { Alex_Brush } from 'next/font/google';
import { getDictionary } from '@/lib/getDictionary';
import { isSupportedLocale, DEFAULT_LOCALE } from '@/lib/locales';
import { DEFAULT_OG_IMAGE, SITE_URL, brandedTitle } from '@/lib/seo';

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
    robots: locale === 'zh' ? { index: false, follow: true } : { index: true, follow: true },
    authors: [{ name: locale === 'zh' ? '明元易' : 'Shain Wai Yan' }],
    alternates: {
      canonical: `${SITE_URL}/hobbies/pencil-art`,
      languages: {
        en: `${SITE_URL}/hobbies/pencil-art`,
        zh: `${SITE_URL}/zh/hobbies/pencil-art`,
        'x-default': `${SITE_URL}/hobbies/pencil-art`,
      },
    },
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
