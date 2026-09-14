import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Breadcrumb } from '@/components/Breadcrumb';
import { PencilArtDetailView } from '@/components/art/PencilArtDetailView';
import { getDictionary } from '@/lib/getDictionary';
import { isSupportedLocale, DEFAULT_LOCALE } from '@/lib/locales';
import { brandedTitle, SITE_URL, DEFAULT_OG_IMAGE } from '@/lib/seo';
import { getArtPieceBySlug, getArtPieces } from '@/lib/server/art-data';

interface ArtSlugPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

// Build no CMS detail pages up front. Each slug is generated on first request,
// cached, and refreshed with ISR without making deployments depend on Strapi.
export const revalidate = 3600;
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: ArtSlugPageProps): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = isSupportedLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const t = await getDictionary(locale);
  const basePath = locale === 'en' ? '' : `/${locale}`;

  const piece = await getArtPieceBySlug(slug);
  if (!piece) {
    return {
      title: brandedTitle('Artwork Not Found', 'Shain Studio'),
    };
  }

  const pieceTitle = `${piece.title} · ${t.pencilArt.title}`;
  const description =
    piece.altText ||
    `${piece.title} - original graphite drawing and sketchbook art by Shain Wai Yan.`;
  const ogImage = piece.image || DEFAULT_OG_IMAGE;

  return {
    title: { absolute: brandedTitle(pieceTitle, 'Shain Studio') },
    description,
    robots: locale === 'zh' ? { index: false, follow: true } : { index: true, follow: true },
    alternates: {
      canonical: `${SITE_URL}/hobbies/pencil-art/${slug}`,
      languages: {
        en: `${SITE_URL}/hobbies/pencil-art/${slug}`,
        zh: `${SITE_URL}/zh/hobbies/pencil-art/${slug}`,
        'x-default': `${SITE_URL}/hobbies/pencil-art/${slug}`,
      },
    },
    openGraph: {
      title: brandedTitle(pieceTitle, 'Shain Studio'),
      description,
      type: 'article',
      url: `https://www.shainwaiyan.com${basePath}/hobbies/pencil-art/${slug}`,
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      alternateLocale: locale === 'zh' ? 'en_US' : 'zh_CN',
      images: [{ url: ogImage, width: piece.width || 1200, height: piece.height || 1500 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: pieceTitle,
      description,
      images: [ogImage],
    },
  };
}

export default async function ArtPieceSlugPage({ params }: ArtSlugPageProps) {
  const { locale: rawLocale, slug } = await params;
  const locale = isSupportedLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const t = await getDictionary(locale);
  const basePath = locale === 'en' ? '' : `/${locale}`;

  const [piece, feed] = await Promise.all([
    getArtPieceBySlug(slug),
    getArtPieces({ pageSize: 50 }),
  ]);

  if (!piece) {
    notFound();
  }

  // Find prev/next items (circular wrapping so arrow navigation is seamless from any artwork)
  const currentIndex = feed.arts.findIndex((a) => a.slug === piece.slug);
  const total = feed.arts.length;
  const previous =
    total > 1 && currentIndex >= 0
      ? feed.arts[(currentIndex - 1 + total) % total]
      : null;
  const next =
    total > 1 && currentIndex >= 0
      ? feed.arts[(currentIndex + 1) % total]
      : null;

  const breadcrumbItems = [
    { label: t.pencilArt.breadcrumbs.home, href: basePath || '/' },
    { label: locale === 'zh' ? '工作之外' : 'Beyond Work', href: `${basePath}/hobbies` },
    { label: t.pencilArt.breadcrumbs.pencilArt, href: `${basePath}/hobbies/pencil-art` },
    { label: piece.title, href: `${basePath}/hobbies/pencil-art/${piece.slug}` },
  ];

  return (
    <section className="min-h-screen bg-white dark:bg-[#0a0b10] text-neutral-900 dark:text-neutral-100 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-12">
        <div className="opacity-75 hover:opacity-100 transition-opacity">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        <PencilArtDetailView
          piece={piece}
          prevPiece={previous ? { title: previous.title, slug: previous.slug } : null}
          nextPiece={next ? { title: next.title, slug: next.slug } : null}
          locale={locale}
          translations={t.pencilArt.labels}
        />
      </div>
    </section>
  );
}
