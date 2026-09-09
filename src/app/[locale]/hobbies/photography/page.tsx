import type { Metadata } from 'next';
import { Breadcrumb } from '@/components/Breadcrumb';
import { PhotographyGallery } from '@/components/photography/PhotographyGallery';
import { getDictionary } from '@/lib/getDictionary'; // ✅ Use async
import { isSupportedLocale, DEFAULT_LOCALE } from '@/lib/locales';
import { DEFAULT_OG_IMAGE, SITE_URL, brandedTitle } from '@/lib/seo';
import { repository } from '@/lib/server/photography-data';
import type { PhotoCollection, PhotoFeedPage, PhotographyLocale } from '@/lib/strapi/photography';

interface PhotographyPageProps {
  params: Promise<{ locale: string }>;
}

export const revalidate = 3600;

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'zh' }];
}

export async function generateMetadata(
  props: PhotographyPageProps
): Promise<Metadata> {
  const { locale: rawLocale } = await props.params;
  const locale = isSupportedLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const t = await getDictionary(locale); // ✅ Use async
  const basePath = locale === 'en' ? '' : `/${locale}`;

  return {
    title: { absolute: brandedTitle(t.photography.seo.title, 'Shain Studio') },
    description: t.photography.seo.description,
    robots: locale === 'zh' ? { index: false, follow: true } : { index: true, follow: true },
    alternates: {
      canonical: `${SITE_URL}/hobbies/photography`,
    },
    openGraph: {
      title: t.photography.seo.openGraphTitle,
      description: t.photography.seo.openGraphDesc,
      url: `https://www.shainwaiyan.com${basePath}/hobbies/photography`,
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      alternateLocale: locale === 'zh' ? 'en_US' : 'zh_CN',
      type: 'website',
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t.photography.seo.openGraphTitle,
      description: t.photography.seo.openGraphDesc,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export default async function PhotographyPage(props: PhotographyPageProps) {
  const { locale: rawLocale } = await props.params;
  const locale = isSupportedLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const t = await getDictionary(locale); // ✅ Use async
  const basePath = locale === 'en' ? '' : `/${locale}`;

  const breadcrumbItems = [
    { label: t.photography.breadcrumbs.home, href: basePath || '/' },
    { label: locale === 'zh' ? '工作之外' : 'Beyond Work', href: `${basePath}/hobbies` },
    { label: t.photography.breadcrumbs.photography, href: `${basePath}/hobbies/photography` },
  ];

  let initialFeed: PhotoFeedPage = { photos: [], page: 1, pageCount: 0, total: 0, hasMore: false };
  let initialCollections: PhotoCollection[] = [];

  try {
    const [feedData, collectionsData] = await Promise.all([
      repository.getFeed({ page: 1, pageSize: 24, seed: 0, language: locale as PhotographyLocale }),
      repository.getCollections(locale as PhotographyLocale),
    ]);
    initialFeed = feedData;
    initialCollections = collectionsData;
  } catch (error) {
    console.error('[Photography SSR] Failed to pre-fetch initial data:', error);
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8 md:py-12">
        <Breadcrumb items={breadcrumbItems} />

        {/* Header */}
        <div className="mb-8 md:mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#191970] dark:text-white mb-2 md:mb-3 leading-tight">
            {t.photography.labels.heroTitle}
          </h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed">
            {t.photography.labels.heroDescription}
          </p>
        </div>

        <PhotographyGallery
          language={locale as 'en' | 'zh'}
          initialFeed={initialFeed}
          initialCollections={initialCollections}
        />
      </div>
    </main>
  );
}
