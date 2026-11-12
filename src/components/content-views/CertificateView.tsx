import {serializeJsonLd} from '@/lib/utils/json-ld';
import {transformCertificate, type Certificate} from '@/lib/strapi/certificates';
import {CertificateVaultClient} from '@/components/certificates/CertificateVaultClient';
import {Breadcrumb} from '@/components/Breadcrumb';
import {getDictionary} from '@/lib/getDictionary';
import {SITE_URL,PERSON_ID} from '@/lib/seo';
export default async function CertificateView({certificates,error,locale}:{certificates:Certificate[];error:string|null;locale:'en'|'zh'}) {
  const t=await getDictionary(locale), basePath=locale==='en'?'':`/${locale}`,domain=SITE_URL;
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
        '@type': 'WebPage',
        '@id': `${domain}/certificate#webpage`,
        'url': `${domain}/certificate`,
        'name': 'Verified Professional Certifications | Shain Wai Yan',
        'description': 'A curated vault of verified credentials from Google, Meta, HubSpot, and leading global platforms — spanning SEO, digital marketing, e-commerce, and strategy.',
        'inLanguage': 'en-US',
        // Reference-only Person: credentials merge into the canonical #person
        // entity (defined in the root layout) instead of redefining it here.
        'mainEntity': {
          '@type': 'Person',
          '@id': PERSON_ID,
          'name': 'Shain Wai Yan',
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
      {locale === 'zh' && <p lang="zh-CN" className="mx-auto max-w-7xl px-4 py-2 text-sm text-stone-500">尚未发布中文版本的内容将显示英文原文。</p>}
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
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
