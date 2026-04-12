import type { Metadata, Viewport } from 'next';
import { fetchCertificates } from '@/lib/strapi/certificates';
import { CertificateMarquee } from '@/components/certificates/CertificateMarquee';
import { Breadcrumb } from '@/components/Breadcrumb';
import { getDictionary } from '@/lib/getDictionary';

interface CertificatePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata(
  props: CertificatePageProps
): Promise<Metadata> {
  const { locale: rawLocale } = await props.params;
  const locale = rawLocale as 'en' | 'zh';
  const t = await getDictionary(locale);
  
  const domain = 'https://www.shainwaiyan.com';
  const urlPath = locale === 'zh' ? '/zh/certificate' : '/certificate';
  const baseUrl = `${domain}${urlPath}`;

  const title = t.certificate.seo.title;
  const description = t.certificate.seo.description;

  return {
    title,
    description,
    alternates: {
      canonical: baseUrl,
      languages: {
        en: `${domain}/certificate`,
        zh: `${domain}/zh/certificate`,
        'x-default': `${domain}/certificate`,
      },
    },
    openGraph: {
      title,
      description,
      url: baseUrl,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export const viewport: Viewport = {
  themeColor: '#1A3A2A',
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

export default async function CertificatePage(props: CertificatePageProps) {
  const { locale } = await props.params;
  const t = await getDictionary(locale as 'en' | 'zh');
  const basePath = locale === 'en' ? '' : `/${locale}`;

  const { certificates, error } = await fetchCertificates();

  return (
    <>
      <Breadcrumb
        items={[
          { label: t.certificate.breadcrumbs.home, href: basePath || '/' },
          { label: t.certificate.breadcrumbs.certificate, href: `${basePath}/certificate` },
        ]}
      />

      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">

          {/* Header */}
          <div className="mb-8 md:mb-12 text-center">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#191970] dark:text-[#a67c00] mb-3">
              {t.certificate.labels.heroTitle}
            </h1>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t.certificate.labels.heroDescription}
            </p>
          </div>

          {/* Certificates Display */}
          {error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-8 text-center">
              <p className="text-red-700 dark:text-red-400 font-semibold mb-2">
                {t.certificate.labels.errorTitle}
              </p>
              <p className="text-red-600 dark:text-red-500 text-sm">{error}</p>
            </div>
          ) : certificates.length === 0 ? (
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-12 text-center">
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {t.certificate.labels.noData}
              </p>
            </div>
          ) : (
            <CertificateMarquee certificates={certificates} />
          )}
        </div>
      </div>
    </>
  );
}