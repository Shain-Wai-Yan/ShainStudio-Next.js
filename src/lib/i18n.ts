import enTranslations from '@/locales/en.json';
import zhTranslations from '@/locales/zh.json';

export type Locale = 'en' | 'zh';

const translations: Record<Locale, typeof enTranslations> = {
  en: enTranslations,
  zh: zhTranslations,
};

/**
 * Get translations for a specific locale
 */
export function getTranslations(locale: Locale) {
  return translations[locale] || translations['en'];
}

/**
 * Detect locale from Accept-Language header
 */
export function detectLocaleFromHeader(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return 'en';

  // Parse Accept-Language header
  const locales = acceptLanguage
    .split(',')
    .map(lang => lang.split(';')[0].trim().toLowerCase());

  // Check if any locale matches Chinese
  if (locales.some(lang => lang.startsWith('zh'))) {
    return 'zh';
  }

  return 'en';
}

/**
 * Validate and normalize locale
 */
export function normalizeLocale(locale: string | undefined): Locale {
  if (locale === 'zh') return 'zh';
  return 'en';
}

/**
 * Get language name for display
 */
export function getLanguageName(locale: Locale): string {
  return locale === 'zh' ? '中文' : 'English';
}

/**
 * Get the other locale (toggle between en and zh)
 */
export function getOtherLocale(locale: Locale): Locale {
  return locale === 'en' ? 'zh' : 'en';
}
