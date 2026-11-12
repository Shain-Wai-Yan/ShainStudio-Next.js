import { localizedSeo } from '@/lib/content-localization';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { repository } from '@/lib/server/photography-data';
import { DEFAULT_LOCALE, isSupportedLocale } from '@/lib/locales';
import { DEFAULT_OG_IMAGE, brandedTitle } from '@/lib/seo';

export const revalidate = 300;
export const dynamicParams = true;
interface Props { params: Promise<{ locale: string; documentId: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale, documentId } = await params;
  const locale = isSupportedLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const photo = await repository.getPhoto(documentId, locale);
  if (!photo) return { title: 'Photo Not Found | Shain Studio' };
  const canonical = localizedSeo(`/hobbies/photography/photo/${documentId}`,locale,photo.localization).alternates.canonical;
  const description = photo.description || [photo.title, photo.location, photo.category].filter(Boolean).join(' · ');
  return {
    title: { absolute: brandedTitle(photo.title, 'Shain Studio') }, description,
    ...localizedSeo(`/hobbies/photography/photo/${documentId}`,locale,photo.localization),
    openGraph: { type: 'article', url: canonical, title: photo.title, description, images: [photo.image || DEFAULT_OG_IMAGE], siteName: 'Shain Studio', locale: locale === 'zh' ? 'zh_CN' : 'en_US' },
    twitter: { card: 'summary_large_image', title: photo.title, description, images: [photo.image || DEFAULT_OG_IMAGE] },
  };
}

import PhotoView from '@/components/content-views/PhotoView';

export default async function PhotoPage({ params }: Props) {
  const { locale: rawLocale, documentId } = await params;
  const locale = isSupportedLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const photo = await repository.getPhoto(documentId, locale);
  if (!photo) notFound();
  const related = await repository.getRelated(photo, 8);
  return <PhotoView photo={photo} related={related} locale={locale} />;
}
