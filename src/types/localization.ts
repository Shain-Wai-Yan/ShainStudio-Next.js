export type ContentLocale = 'en' | 'zh';
export interface ContentLocalization {
  documentId: string;
  requestedLocale: ContentLocale;
  resolvedLocale: ContentLocale;
  isFallback: boolean;
  englishPublished: boolean;
  chinesePublished: boolean;
}
export interface LocalizedContent {
  localization?: ContentLocalization;
}
