import type { Locale } from '@/lib/locales';

/**
 * Single source of truth for the site's entity graph (Person / Organization / WebSite)
 * and canonical URL helpers. Every page must import these instead of hardcoding
 * URLs, job titles, or social profiles — inconsistent copies of this data are what
 * break entity reconciliation in Google's Knowledge Graph.
 */

export const SITE_URL = 'https://www.shainwaiyan.com';
export const PERSON_ID = `${SITE_URL}/#person`;
export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

/** Square brand logo — used for icons, manifest, and Organization.logo. */
export const LOGO_IMAGE = `${SITE_URL}/images/Shain%20Studio.png`;
/** Default social share image (1200×630 cover: face + name + title + domain). */
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og-cover.png`;
/** Face photo — Person.image must be the person, not the logo. */
export const PERSON_IMAGE = `${SITE_URL}/images/profile.avif`;

export const PERSON = {
  name: 'Shain Wai Yan',
  alternateName: ['xolbine', 'Xolbine', '明元易'],
  jobTitle: {
    en: 'Digital Marketing & Brand Strategist',
    zh: '数字营销与品牌策略师',
  } satisfies Record<Locale, string>,
  email: 'contact@shainwaiyan.com',
  sameAs: [
    'https://www.linkedin.com/in/shainwaiyan/',
    'https://github.com/Shain-Wai-Yan',
    'https://www.youtube.com/@shaineditamv',
    'https://www.facebook.com/shainwy',
  ],
} as const;

export const ORGANIZATION = {
  name: 'Shain Studio',
} as const;

const PERSON_DESCRIPTION: Record<Locale, string> = {
  en: 'AI-powered digital marketing & brand strategy expert specialising in content strategy and market analysis.',
  zh: 'AI驱动的数字营销与品牌策略专家，专注于内容策略与市场分析。',
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

/** Reference-only Organization node for publisher fields. */
export function orgRef() {
  return { '@id': ORG_ID };
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
    worksFor: { '@id': ORG_ID },
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

export function organizationJsonLd() {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: ORGANIZATION.name,
    url: SITE_URL,
    logo: { '@type': 'ImageObject', url: LOGO_IMAGE, width: 1024, height: 1024 },
    founder: { '@id': PERSON_ID },
    email: PERSON.email,
    sameAs: [...PERSON.sameAs],
  };
}

export function websiteJsonLd(locale: Locale) {
  const isZh = locale === 'zh';
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE_URL,
    name: isZh ? 'Shain的作品集' : "Shain's Portfolio",
    description: isZh
      ? 'Shain Wai Yan (xolbine) 的数字营销与品牌策略作品集。'
      : 'Digital Marketing & Brand Strategy portfolio of Shain Wai Yan (xolbine).',
    inLanguage: isZh ? 'zh-CN' : 'en-US',
    publisher: { '@id': PERSON_ID },
  };
}
