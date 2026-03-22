import type { Metadata } from 'next';
import { Breadcrumb } from '@/components/Breadcrumb';
import { PhotographyGallery } from '@/components/photography/PhotographyGallery';
import { fetchAllPhotography } from '@/lib/strapi/photography';
import { getDictionary } from '@/lib/getDictionary'; // ✅ Use async
import { isSupportedLocale, DEFAULT_LOCALE } from '@/lib/locales';

interface PhotographyPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata(
  props: PhotographyPageProps
): Promise<Metadata> {
  const { locale: rawLocale } = await props.params;
  const locale = isSupportedLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const t = await getDictionary(locale); // ✅ Use async
  const basePath = locale === 'en' ? '' : `/${locale}`;

  return {
    title: t.photography.seo.title,
    description: t.photography.seo.description,
    alternates: {
      canonical: `https://www.shainwaiyan.com${basePath}/portfolio/photography`,
      languages: {
        en: 'https://www.shainwaiyan.com/portfolio/photography',
        zh: 'https://www.shainwaiyan.com/zh/portfolio/photography',
      },
    },
    openGraph: {
      title: t.photography.seo.openGraphTitle,
      description: t.photography.seo.openGraphDesc,
      url: `https://www.shainwaiyan.com${basePath}/portfolio/photography`,
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      alternateLocale: locale === 'zh' ? 'en_US' : 'zh_CN',
    },
  };
}

export default async function PhotographyPage(props: PhotographyPageProps) {
  const { locale: rawLocale } = await props.params;
  const locale = isSupportedLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const t = await getDictionary(locale); // ✅ Use async
  const basePath = locale === 'en' ? '' : `/${locale}`;

  const { photos, error } = await fetchAllPhotography(locale as 'en' | 'zh', { pageSize: 100 });

  const breadcrumbItems = [
    { label: t.photography.breadcrumbs.home, href: basePath || '/' },
    { label: t.photography.breadcrumbs.portfolio, href: `${basePath}/portfolio` },
    { label: t.photography.breadcrumbs.photography, href: `${basePath}/portfolio/photography` },
  ];

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <Breadcrumb items={breadcrumbItems} />

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-[#191970] dark:text-white mb-3">
            {t.photography.labels.heroTitle}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            {t.photography.labels.heroDescription}
          </p>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-8 text-center">
            <p className="text-red-600 dark:text-red-400 font-medium text-sm">
              {t.photography.labels.errorText}
            </p>
          </div>
        ) : photos.length > 0 ? (
          <PhotographyGallery initialPhotos={photos} language={locale as 'en' | 'zh'} />
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-gray-400 dark:text-gray-500 font-medium">
              {t.photography.labels.noPhotos}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}