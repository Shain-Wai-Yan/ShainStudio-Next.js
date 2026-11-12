import {Breadcrumb} from '@/components/Breadcrumb';
import {PencilArtDetailView} from '@/components/art/PencilArtDetailView';
import ContentLanguageNotice from '@/components/shared/ContentLanguageNotice';
import {getDictionary} from '@/lib/getDictionary';
import type {ArtPiece,ArtFeedPage} from '@/lib/strapi/art';

/** Shared by the published route and authenticated saved-draft preview. */
export default async function ArtView({piece, feed, locale}: {piece: ArtPiece; feed: ArtFeedPage; locale: 'en' | 'zh'}) {
  const t=await getDictionary(locale); const basePath=locale==='en'?'':`/${locale}`;
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

        <ContentLanguageNotice localization={piece.localization} />
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
