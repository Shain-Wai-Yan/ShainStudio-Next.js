import type { Metadata, Viewport } from 'next';
import { fetchCertificates } from '@/lib/strapi/certificates';
import { CertificateMarquee } from '@/components/certificates/CertificateMarquee';
import { Breadcrumb } from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: 'Professional Certificates & Achievements | Shain Wai Yan',
  description: 'View my professional certifications and achievements from leading institutions and platforms in digital marketing, business strategy, and professional development.',
  alternates: {
    canonical: '/certificate',
    languages: {
      'en': '/certificate',
      'zh': '/zh/certificate',
    },
  },
};

export const viewport: Viewport = {
  themeColor: '#191970',
  colorScheme: 'light dark',
};

export default async function CertificatePage() {
  const { certificates, error } = await fetchCertificates();

  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Certificate', href: '/certificate' },
        ]}
      />

      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">

          {/* Header — tighter sizing */}
          <div className="mb-8 md:mb-12 text-center">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#191970] dark:text-[#a67c00] mb-3">
              Professional Certificates & Achievements
            </h1>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              A collection of professional certifications and achievements from leading institutions and platforms in digital marketing, business strategy, and professional development.
            </p>
          </div>

          {/* Certificates Display */}
          {error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-8 text-center">
              <p className="text-red-700 dark:text-red-400 font-semibold mb-2">Unable to Load Certificates</p>
              <p className="text-red-600 dark:text-red-500 text-sm">{error}</p>
            </div>
          ) : certificates.length === 0 ? (
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-12 text-center">
              <p className="text-gray-600 dark:text-gray-400 text-lg">No certificates available at the moment.</p>
            </div>
          ) : (
            <CertificateMarquee certificates={certificates} />
          )}
        </div>
      </div>
    </>
  );
}