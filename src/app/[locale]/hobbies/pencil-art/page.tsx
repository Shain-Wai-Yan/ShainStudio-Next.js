import { Breadcrumb } from '@/components/Breadcrumb';
import { PencilArtGallery } from '@/components/art/PencilArtGallery';
import { getDictionary } from '@/lib/getDictionary';
import { isSupportedLocale, DEFAULT_LOCALE } from '@/lib/locales';
import { getArtPieces } from '@/lib/server/art-data';
import type { ArtGalleryPiece } from '@/lib/strapi/art';

interface PencilArtPageProps {
  params: Promise<{ locale: string }>;
}

export const revalidate = 3600;
export const dynamic = 'force-static';

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'zh' }];
}

export default async function PencilArtPage({ params }: PencilArtPageProps) {
  const { locale: rawLocale } = await params;
  const locale = isSupportedLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const t = await getDictionary(locale);
  const basePath = locale === 'en' ? '' : `/${locale}`;

  const breadcrumbItems = [
    { label: t.pencilArt.breadcrumbs.home, href: basePath || '/' },
    { label: locale === 'zh' ? '工作之外' : 'Beyond Work', href: `${basePath}/hobbies` },
    { label: t.pencilArt.breadcrumbs.pencilArt, href: `${basePath}/hobbies/pencil-art` },
  ];

  let arts: ArtGalleryPiece[] = [];
  try {
    const feed = await getArtPieces({ pageSize: 50 });
    arts = feed.arts.map(({ id, title, slug, image, width, height, altText }) => ({
      id,
      title,
      slug,
      image,
      width,
      height,
      altText,
    }));
  } catch (error) {
    console.error('[PencilArtPage] Art collection unavailable:', error);
  }

  return (
    <section className="min-h-screen bg-white dark:bg-[#0a0b10] text-neutral-900 dark:text-neutral-100 transition-colors duration-300" aria-labelledby="pencil-art-title">
      <h1 id="pencil-art-title" className="sr-only">{t.pencilArt.title}</h1>
      <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 pt-20 sm:pt-24 pb-4">
        {/* Minimal Breadcrumbs */}
        <div className="opacity-75 hover:opacity-100 transition-opacity mb-2">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* Minimalist Art Gallery Showcase — Single Piece at a time, No Title on Canvas */}
        <PencilArtGallery
          arts={arts}
          locale={locale}
          translations={t.pencilArt.labels}
        />
      </div>
    </section>
  );
}
