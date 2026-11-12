import { localizedCollectionSeo, localizedSource } from '@/lib/server/localized-content';
import type { Metadata, Viewport } from 'next';
import { fetchCertificates } from '@/lib/strapi/certificates';
import { getDictionary } from '@/lib/getDictionary';
import { SITE_NAME, SITE_URL, brandedTitle } from '@/lib/seo';

interface CertificatePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata(
  props: CertificatePageProps
): Promise<Metadata> {
  const { locale: rawLocale } = await props.params;
  const locale = rawLocale as 'en' | 'zh';
  const t = await getDictionary(locale);

  const domain = SITE_URL;
  const urlPath = locale === 'zh' ? '/zh/certificate' : '/certificate';
  const baseUrl = `${domain}${urlPath}`;

  const seo = t.certificate.seo;
  const title = seo.title;
  const description = seo.description;
  const keywords = seo.keywords;
  const ogTitle = seo.ogTitle ?? title;
  const ogDescription = seo.ogDescription ?? description;

  return {
    title: { absolute: brandedTitle(title) },
    description,
    keywords,
    authors: [{ name: 'Shain Wai Yan', url: domain }],
    creator: 'Shain Wai Yan',
    publisher: 'Shain Wai Yan',
    ...await localizedCollectionSeo('certificates', '/certificate', locale === 'zh' ? 'zh' : 'en'),
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: baseUrl,
      siteName: SITE_NAME,
      type: 'profile',
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      images: [
        {
          url: `${domain}/images/neoclassical_statue_collage.png`,
          width: 1200,
          height: 630,
          alt: ogTitle,
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      images: [`${domain}/images/neoclassical_statue_collage.png`],
    },
  };
}

export const viewport: Viewport = {
  themeColor: '#191970',
  colorScheme: 'light dark',
};

export const dynamic = 'force-static';
export const revalidate = 3600;

export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'zh' }
  ];
}

import CertificateView from '@/components/content-views/CertificateView';

export default async function CertificatePage(props: CertificatePageProps) {
  const { locale } = await props.params;

  const { certificates, error } = await fetchCertificates(localizedSource(locale === 'zh' ? 'zh' : 'en'));

  return <CertificateView certificates={certificates} error={error} locale={locale==='zh'?'zh':'en'}/>;
}
