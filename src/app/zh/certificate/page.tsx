import type { Metadata, Viewport } from 'next';
import { fetchCertificates } from '@/lib/strapi/certificates';
import { CertificateMarquee } from '@/components/certificates/CertificateMarquee';
import { Breadcrumb } from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: '专业证书与成就 | 闪怀晏',
  description: '查看我的专业证书和成就，来自数字营销、商业战略和专业发展领域的领先机构和平台。',
  alternates: {
    canonical: '/zh/certificate',
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
          { label: '首页', href: '/zh' },
          { label: '证书', href: '/zh/certificate' },
        ]}
      />

      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          {/* Header Section */}
          <div className="mb-12 md:mb-16 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#191970] dark:text-[#a67c00] mb-4 text-balance">
              专业证书与成就
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-balance">
              来自数字营销、商业战略和专业发展领域的领先机构和平台的专业证书和成就的集合。
            </p>
          </div>

          {/* Certificates Display */}
          {error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-8 text-center">
              <p className="text-red-700 dark:text-red-400 font-semibold mb-2">无法加载证书</p>
              <p className="text-red-600 dark:text-red-500 text-sm">{error}</p>
            </div>
          ) : certificates.length === 0 ? (
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-12 text-center">
              <p className="text-gray-600 dark:text-gray-400 text-lg">目前没有可用的证书。</p>
            </div>
          ) : (
            <CertificateMarquee certificates={certificates} />
          )}
        </div>
      </div>
    </>
  );
}
