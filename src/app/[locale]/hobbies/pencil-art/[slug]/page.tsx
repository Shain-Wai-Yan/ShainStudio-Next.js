import { localizedSeo } from '@/lib/content-localization';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDictionary } from '@/lib/getDictionary';
import { isSupportedLocale, DEFAULT_LOCALE } from '@/lib/locales';
import { brandedTitle, DEFAULT_OG_IMAGE } from '@/lib/seo';
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

  const piece = await getArtPieceBySlug(slug, locale);
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
    ...localizedSeo(`/hobbies/pencil-art/${slug}`, locale, piece.localization),
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

import ArtView from '@/components/content-views/ArtView';

export default async function ArtPieceSlugPage({ params }: ArtSlugPageProps) {
  const { locale: rawLocale, slug } = await params;
  const locale = isSupportedLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

  const [piece, feed] = await Promise.all([
    getArtPieceBySlug(slug, locale),
    getArtPieces({ pageSize: 50, locale }),
  ]);

  if (!piece) {
    notFound();
  }

  return <ArtView piece={piece} feed={feed} locale={locale} />;
}
