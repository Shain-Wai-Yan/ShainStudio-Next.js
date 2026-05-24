import type { Metadata, Viewport } from 'next';
import { fetchCertificates, transformCertificate } from '@/lib/strapi/certificates';
import { CertificateVaultClient } from '@/components/certificates/CertificateVaultClient';
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

  const seo = t.certificate.seo;
  const title = seo.title;
  const description = seo.description;
  const keywords = seo.keywords;
  const ogTitle = seo.ogTitle ?? title;
  const ogDescription = seo.ogDescription ?? description;

  return {
    title,
    description,
    keywords,
    authors: [{ name: 'Shain Wai Yan', url: domain }],
    creator: 'Shain Wai Yan',
    publisher: 'Shain Wai Yan',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-snippet': -1,
        'max-image-preview': 'large',
        'max-video-preview': -1,
      },
    },
    alternates: {
      canonical: baseUrl,
      languages: {
        en: `${domain}/certificate`,
        zh: `${domain}/zh/certificate`,
        'x-default': `${domain}/certificate`,
      },
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: baseUrl,
      siteName: 'Shain Wai Yan Portfolio',
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
      site: '@shainwaiyan',
      creator: '@shainwaiyan',
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

export default async function CertificatePage(props: CertificatePageProps) {
  const { locale } = await props.params;
  const t = await getDictionary(locale as 'en' | 'zh');
  const basePath = locale === 'en' ? '' : `/${locale}`;
  const domain = 'https://www.shainwaiyan.com';

  const { certificates, error } = await fetchCertificates();

  // Build JSON-LD: Person schema with EducationalOccupationalCredential items
  const credentialItems = certificates.slice(0, 20).map((cert) => {
    const transformed = transformCertificate(cert);
    return {
      '@type': 'EducationalOccupationalCredential',
      'name': transformed.Title,
      'description': transformed.Description || `Verified credential issued by ${transformed.IssuedBy}`,
      'credentialCategory': 'Professional Certificate',
      'recognizedBy': {
        '@type': 'Organization',
        'name': transformed.IssuedBy,
      },
      ...(transformed.Date ? { 'dateCreated': transformed.Date } : {}),
    };
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfilePage',
        '@id': `${domain}/certificate`,
        'url': `${domain}/certificate`,
        'name': 'Verified Professional Certifications | Shain Wai Yan',
        'description': 'A curated vault of verified credentials from Google, Meta, HubSpot, and leading global platforms — spanning SEO, digital marketing, e-commerce, and strategy.',
        'inLanguage': 'en-US',
        'mainEntity': {
          '@type': 'Person',
          '@id': `${domain}/#person`,
          'name': 'Shain Wai Yan',
          'alternateName': ['xolbine', '明元易'],
          'url': domain,
          'jobTitle': 'Digital Marketing Specialist & Brand Strategist',
          'knowsAbout': [
            'Digital Marketing',
            'SEO',
            'Social Media Marketing',
            'E-Commerce',
            'Brand Strategy',
            'Business Development',
          ],
          'hasCredential': credentialItems.length > 0 ? credentialItems : [
            {
              '@type': 'EducationalOccupationalCredential',
              'name': 'Google Digital Marketing & E-Commerce Professional Certificate',
              'credentialCategory': 'Professional Certificate',
              'recognizedBy': { '@type': 'Organization', 'name': 'Google' },
            },
            {
              '@type': 'EducationalOccupationalCredential',
              'name': 'Meta Social Media Marketing Professional Certificate',
              'credentialCategory': 'Professional Certificate',
              'recognizedBy': { '@type': 'Organization', 'name': 'Meta' },
            },
          ],
          'sameAs': [
            'https://www.linkedin.com/in/shainwaiyan',
            'https://github.com/shainwaiyan',
          ],
        },
      },
      {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': domain,
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'Professional Certificates & Achievements',
            'item': `${domain}/certificate`,
          },
        ],
      },
    ],
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Breadcrumb
        items={[
          { label: t.certificate.breadcrumbs.home, href: basePath || '/' },
          { label: t.certificate.breadcrumbs.certificate, href: `${basePath}/certificate` },
        ]}
      />

      <div className="bg-white dark:bg-gray-950">
        {error ? (
          <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 text-center">
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-2xl p-8 max-w-2xl mx-auto shadow-sm">
              <p className="text-red-700 dark:text-red-400 font-bold mb-2 text-lg">
                {t.certificate.labels.errorTitle}
              </p>
              <p className="text-red-600 dark:text-red-500 text-sm leading-relaxed">{error}</p>
            </div>
          </div>
        ) : (
          <CertificateVaultClient
            certificates={certificates}
            dictionary={t}
            locale={locale}
          />
        )}
      </div>
    </>
  );
}