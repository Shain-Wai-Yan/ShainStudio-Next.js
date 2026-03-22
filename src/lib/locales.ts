/**
 * Supported locales in the application
 */
export const SUPPORTED_LOCALES = ['en', 'zh'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

/**
 * Default locale for the application
 */
export const DEFAULT_LOCALE: Locale = 'en';

/**
 * Locale metadata
 */
export const LOCALE_METADATA: Record<Locale, { name: string; nativeName: string; flag: string }> = {
  en: { name: 'English', nativeName: 'English', flag: '🇺🇸' },
  zh: { name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
};

/**
 * Validate if a string is a supported locale
 */
export function isSupportedLocale(locale: unknown): locale is Locale {
  return typeof locale === 'string' && SUPPORTED_LOCALES.includes(locale as Locale);
}

/**
 * Get locale display name
 */
export function getLocaleName(locale: Locale): string {
  return LOCALE_METADATA[locale].name;
}

/**
 * Get native locale name
 */
export function getNativeLocaleName(locale: Locale): string {
  return LOCALE_METADATA[locale].nativeName;
}

/**
 * Get the other locale (toggle between en and zh)
 */
export function getOtherLocale(locale: Locale): Locale {
  return locale === 'en' ? 'zh' : 'en';
}

/**
 * Convert locale to HTML lang attribute
 */
export function getHtmlLang(locale: Locale): string {
  return locale === 'zh' ? 'zh-CN' : 'en';
}
