import type { ContentLocale, ContentLocalization } from '@/types/localization';
import { SITE_URL, safeCanonicalUrl } from '@/lib/seo';

export function localizedSeo(path: string, locale: ContentLocale, localization?: ContentLocalization, noIndex = false, canonicalOverride?: string) {
  const translated = locale === 'zh' && localization?.chinesePublished && !localization.isFallback;
  const canonicalPath = translated ? `/zh${path === '/' ? '' : path}` : path;
  const fallback = `${SITE_URL}${canonicalPath}`;
  const candidate = safeCanonicalUrl(canonicalOverride, fallback);
  const candidateIsChinese = new URL(candidate).pathname === '/zh' || new URL(candidate).pathname.startsWith('/zh/');
  const canonical = candidateIsChinese === Boolean(translated) ? candidate : fallback;
  const languages: Record<string,string> = {};
  if (localization?.englishPublished ?? locale === 'en') languages.en = `${SITE_URL}${path}`;
  if (localization?.chinesePublished) languages['zh-CN'] = `${SITE_URL}/zh${path === '/' ? '' : path}`;
  if (Object.keys(languages).length) languages['x-default'] = languages.en ?? languages['zh-CN'];
  return { robots: { index: !noIndex && (locale === 'en' || Boolean(translated)), follow:true },
    alternates: { canonical, ...(Object.keys(languages).length ? { languages } : {}) } };
}

export function collectionLocalization(locale: ContentLocale, rows: Array<{localization?: ContentLocalization}>): ContentLocalization {
  const englishPublished = rows.some(row => row.localization?.englishPublished);
  const chinesePublished = rows.some(row => row.localization?.chinesePublished);
  return { documentId:'collection',requestedLocale:locale,resolvedLocale: locale === 'zh' && chinesePublished ? 'zh':'en',
    isFallback: locale === 'zh' && !chinesePublished,englishPublished,chinesePublished };
}
