import type { Locale } from '@/lib/locales';

/**
 * Single source of truth for the site's entity graph (Person / WebSite)
 * and canonical URL helpers. Every page must import these instead of hardcoding
 * URLs, job titles, or social profiles — inconsistent copies of this data are what
 * break entity reconciliation in Google's Knowledge Graph.
 */

export const SITE_URL = 'https://www.shainwaiyan.com';
export const SITE_NAME = 'Shain Studio';
export const SITE_ALTERNATE_NAME = 'Shain Wai Yan Portfolio';
export const PERSON_ID = `${SITE_URL}/#person`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

/** Square portfolio logo — used for icons and the web app manifest. */
export const LOGO_IMAGE = `${SITE_URL}/images/Shain%20Studio.png`;
/** Default social share image (1200×630 cover: face + name + title + domain). */
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og-cover.png`;
/** Face photo — Person.image must be the person, not the logo. */
export const PERSON_IMAGE = `${SITE_URL}/images/profile.avif`;

export const PERSON = {
  name: 'Shain Wai Yan',
  alternateName: ['Xolbine', '明元易'],
  jobTitle: {
    en: 'Technical Marketer',
    zh: '技术营销从业者',
  } satisfies Record<Locale, string>,
  email: 'contact@shainwaiyan.com',
  sameAs: [
    'https://www.linkedin.com/in/shainwaiyan/',
    'https://github.com/Shain-Wai-Yan',
    'https://www.youtube.com/@shaineditamv',
    'https://www.facebook.com/shainwy',
  ],
} as const;

/** Produce one stable SERP title without duplicating the brand via a layout template. */
export function brandedTitle(title: string, brand = 'Shain Wai Yan'): string {
  const cleanTitle = title.trim();
  const escapedBrand = brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:^|[|—–-]\\s*)${escapedBrand}\\s*$`, 'i').test(cleanTitle)
    ? cleanTitle
    : `${cleanTitle} | ${brand}`;
}

/** Accept CMS canonicals only when they point back to the public portfolio origin. */
export function safeCanonicalUrl(candidate: string | null | undefined, fallback: string): string {
  if (!candidate) return fallback;
  try {
    const parsed = new URL(candidate, SITE_URL);
    return parsed.origin === SITE_URL ? parsed.toString() : fallback;
  } catch {
    return fallback;
  }
}

const PERSON_DESCRIPTION: Record<Locale, string> = {
  en: 'Technical marketer and creative technologist specialising in MarTech, content strategy, and market analysis.',
  zh: '技术营销从业者与创意科技实践者，专注于MarTech、内容策略与市场分析。',
};

/** Locale-prefixed path: ('zh', '/about') → '/zh/about'; ('en', '/about') → '/about'. */
export function localePath(locale: Locale, path = ''): string {
  const prefix = locale === 'en' ? '' : `/${locale}`;
  return `${prefix}${path}` || '/';
}

/** Absolute URL for a locale + path (en at root, zh under /zh). */
export function absoluteUrl(locale: Locale, path = ''): string {
  const p = localePath(locale, path);
  return p === '/' ? SITE_URL : `${SITE_URL}${p}`;
}

/** hreflang map for a path WITHOUT locale prefix. x-default = English. */
export function languageAlternates(path = ''): Record<string, string> {
  const en = path ? `${SITE_URL}${path}` : SITE_URL;
  return {
    en,
    zh: `${SITE_URL}/zh${path}`,
    'x-default': en,
  };
}

/** Reference-only Person node — use everywhere except the full graph in the layout/About. */
export function personRef() {
  return { '@id': PERSON_ID };
}

/**
 * The canonical, enriched Person entity. Emitted in full in the root layout and on
 * /about (its authoritative biography page); everywhere else reference it via personRef().
 */
export function personJsonLd(locale: Locale) {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: PERSON.name,
    alternateName: [...PERSON.alternateName],
    url: `${SITE_URL}/about`,
    mainEntityOfPage: { '@id': `${SITE_URL}/about` },
    image: { '@type': 'ImageObject', url: PERSON_IMAGE },
    jobTitle: PERSON.jobTitle[locale],
    description: PERSON_DESCRIPTION[locale],
    email: `mailto:${PERSON.email}`,
    alumniOf: [
      { '@type': 'CollegeOrUniversity', name: 'Taunggyi University' },
      { '@type': 'EducationalOrganization', name: 'Strategy First University' },
    ],
    affiliation: {
      '@type': 'CollegeOrUniversity',
      name: 'University of the People',
      sameAs: 'https://www.uopeople.edu/',
    },
    hasCredential: [
      {
        '@type': 'EducationalOccupationalCredential',
        name: 'Google Digital Marketing & E-Commerce Professional Certificate',
        credentialCategory: 'Professional Certificate',
        recognizedBy: { '@type': 'Organization', name: 'Google' },
      },
      {
        '@type': 'EducationalOccupationalCredential',
        name: 'Meta Social Media Marketing Professional Certificate',
        credentialCategory: 'Professional Certificate',
        recognizedBy: { '@type': 'Organization', name: 'Meta' },
      },
      {
        '@type': 'EducationalOccupationalCredential',
        name: 'Professional Diploma in Marketing & Brand Management',
        credentialCategory: 'Diploma',
        recognizedBy: { '@type': 'EducationalOrganization', name: 'Strategy First University' },
      },
    ],
    knowsAbout: [
      'Technical Marketing',
      'MarTech',
      'Creative Technology',
      'Digital Marketing',
      'Brand Strategy',
      'AI Marketing',
      'Content Strategy',
      'Market Analysis',
      'Social Media Marketing',
      'SEO',
    ],
    knowsLanguage: [
      { '@type': 'Language', name: 'Burmese' },
      { '@type': 'Language', name: 'English' },
      { '@type': 'Language', name: 'Chinese' },
    ],
    sameAs: [...PERSON.sameAs],
  };
}

export function websiteJsonLd(locale: Locale) {
  const isZh = locale === 'zh';
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    alternateName: isZh ? [SITE_ALTERNATE_NAME, '明元易个人作品集'] : SITE_ALTERNATE_NAME,
    description: isZh
      ? '明元易（Shain Wai Yan，又名 Xolbine）的个人作品集，以 Shain Studio 呈现技术营销、MarTech 与创意科技作品。'
      : 'Shain Studio is the personal portfolio of Shain Wai Yan (Xolbine, 明元易), presenting work in technical marketing, MarTech, and creative technology.',
    inLanguage: isZh ? 'zh-CN' : 'en-US',
    publisher: { '@id': PERSON_ID },
    creator: { '@id': PERSON_ID },
  };
}
