import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import CImage from '@/components/ui/CImage';
import { Breadcrumb } from '@/components/Breadcrumb';
import { repository } from '@/lib/server/photography-data';
import { DEFAULT_LOCALE, isSupportedLocale } from '@/lib/locales';
import { DEFAULT_OG_IMAGE, PERSON_ID, SITE_URL, brandedTitle } from '@/lib/seo';
import { serializeJsonLd } from '@/lib/utils/json-ld';

export const revalidate = 300;
export const dynamicParams = true;
interface Props { params: Promise<{ locale: string; documentId: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale, documentId } = await params;
  const locale = isSupportedLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const photo = await repository.getPhoto(documentId, locale);
  if (!photo) return { title: 'Photo Not Found | Shain Studio' };
  const canonical = `${SITE_URL}/portfolio/photography/photo/${documentId}`;
  const description = photo.description || [photo.title, photo.location, photo.category].filter(Boolean).join(' · ');
  return {
    title: { absolute: brandedTitle(photo.title, 'Shain Studio') }, description,
    robots: locale === 'zh' ? { index: false, follow: true } : { index: true, follow: true }, alternates: { canonical },
    openGraph: { type: 'article', url: canonical, title: photo.title, description, images: [photo.image || DEFAULT_OG_IMAGE], siteName: 'Shain Studio', locale: locale === 'zh' ? 'zh_CN' : 'en_US' },
    twitter: { card: 'summary_large_image', title: photo.title, description, images: [photo.image || DEFAULT_OG_IMAGE] },
  };
}

export default async function PhotoPage({ params }: Props) {
  const { locale: rawLocale, documentId } = await params;
  const locale = isSupportedLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const basePath = locale === 'en' ? '' : `/${locale}`;
  const photo = await repository.getPhoto(documentId, locale);
  if (!photo) notFound();
  const related = await repository.getRelated(photo, 8);
  const canonical = `${SITE_URL}/portfolio/photography/photo/${documentId}`;
  const description = photo.description || [photo.location, photo.category].filter(Boolean).join(' · ');
  const jsonLd = { '@context': 'https://schema.org', '@type': 'ImageObject', '@id': `${canonical}#image`, contentUrl: photo.image, url: canonical, name: photo.title, caption: description || photo.title, representativeOfPage: true, creator: { '@id': PERSON_ID }, creditText: 'Shain Wai Yan', uploadDate: photo.createdAt || undefined, dateModified: photo.updatedAt || undefined, width: photo.width, height: photo.height };
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 md:py-12 lg:px-8">
        <Breadcrumb items={[{ label: locale === 'zh' ? '首页' : 'Home', href: basePath || '/' }, { label: locale === 'zh' ? '摄影' : 'Photography', href: `${basePath}/portfolio/photography` }, { label: photo.title, href: `${basePath}/portfolio/photography/photo/${documentId}` }]} />
        <article className="grid overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,.7fr)]">
          <div className="relative flex min-h-[50vh] items-center justify-center bg-black p-3 sm:p-6">{photo.image ? <CImage src={photo.image} alt={photo.altText || photo.title} width={photo.width ?? 1600} height={photo.height ?? 1200} quality={88} sizes="(max-width: 1024px) 100vw, 70vw" className="max-h-[78vh] h-auto w-auto max-w-full object-contain" priority /> : <p className="text-white/60">Image unavailable</p>}</div>
          <div className="flex flex-col justify-between p-6 sm:p-8"><div><p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#191970] dark:text-[#ffd700]">Shain Studio Photography</p><h1 className="text-2xl font-bold text-gray-950 dark:text-white sm:text-3xl">{photo.title}</h1>{photo.location && <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">{photo.location}</p>}{photo.category && <Link href={`${basePath}/portfolio/photography?collection=${photo.categorySlug}`} className="mt-5 inline-flex rounded-full bg-[#191970]/8 px-3 py-1.5 text-sm font-medium text-[#191970] dark:bg-[#ffd700]/10 dark:text-[#ffd700]">{photo.category}</Link>}{photo.tags && photo.tags.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{photo.tags.map((tag) => <span key={tag} className="text-xs text-gray-500 dark:text-gray-400">#{tag}</span>)}</div>}{photo.description && <p className="mt-6 text-sm leading-7 text-gray-600 dark:text-gray-300">{photo.description}</p>}</div><div className="mt-8 flex flex-wrap gap-3"><Link href={`${basePath}/portfolio/photography`} className="rounded-full bg-[#191970] px-5 py-2.5 text-sm font-semibold text-white dark:bg-[#ffd700] dark:text-[#191970]">Back to gallery</Link><a href={canonical} className="rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-200">Permanent link</a></div></div>
        </article>
        {related.length > 0 && <section className="mt-14" aria-labelledby="related-photography"><h2 id="related-photography" className="mb-5 text-xl font-bold text-gray-950 dark:text-white">{locale === 'zh' ? '相关摄影' : 'Related photography'}</h2><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{related.map((item) => item.documentId && <Link key={item.documentId} href={`${basePath}/portfolio/photography/photo/${item.documentId}`} className="group overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-800">{item.image && <CImage src={item.image} alt={item.altText || item.title} width={item.width ?? 600} height={item.height ?? 400} quality={65} sizes="(max-width: 640px) 50vw, 25vw" className="aspect-[4/3] h-auto w-full object-cover transition duration-300 group-hover:scale-105" />}<span className="block px-3 py-2 text-sm font-medium text-gray-800 dark:text-gray-100">{item.title}</span></Link>)}</div></section>}
      </div>
    </main>
  );
}
