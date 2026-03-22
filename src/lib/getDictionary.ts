import type { Locale } from './locales';
import { isSupportedLocale, DEFAULT_LOCALE } from './locales';

/**
 * Dictionary type based on structure of translation JSON
 */
export type Dictionary = typeof import('@/locales/en.json');

/**
 * Cache for loaded dictionaries to avoid repeated imports
 */
const dictionaries: Partial<Record<Locale, Dictionary>> = {};

/**
 * Get translations for a specific locale
 * This function dynamically imports locale files to support future locale additions
 */
export async function getDictionary(locale: unknown): Promise<Dictionary> {
  // Normalize and validate locale
  const normalizedLocale = isSupportedLocale(locale) ? locale : DEFAULT_LOCALE;

  // Return from cache if already loaded
  if (dictionaries[normalizedLocale]) {
    return dictionaries[normalizedLocale]!;
  }

  // Dynamically import the appropriate locale file
  try {
    const dictionary = await import(`@/locales/${normalizedLocale}.json`);
    dictionaries[normalizedLocale] = dictionary.default;
    return dictionary.default;
  } catch (error) {
    console.error(`Failed to load dictionary for locale: ${normalizedLocale}`, error);
    // Fallback to default locale
    if (normalizedLocale !== DEFAULT_LOCALE) {
      return getDictionary(DEFAULT_LOCALE);
    }
    throw error;
  }
}

/**
 * Synchronous version for client components
 * Assumes dictionaries are already loaded
 */
import enDict from '@/locales/en.json';
import zhDict from '@/locales/zh.json';

const syncDictionaries: Record<Locale, Dictionary> = {
  en: enDict,
  zh: zhDict,
};

export function getDictionarySync(locale: unknown): Dictionary {
  const normalizedLocale = isSupportedLocale(locale) ? locale : DEFAULT_LOCALE;
  return syncDictionaries[normalizedLocale];
}
