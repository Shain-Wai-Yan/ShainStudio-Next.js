import React from 'react';
import { getClientLogos } from '@/lib/server/clients';
import { Metadata } from 'next';
import { getDictionary } from '@/lib/getDictionary';
import type { Dictionary } from '@/lib/getDictionary';
import { isSupportedLocale, DEFAULT_LOCALE } from '@/lib/locales';
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE, absoluteUrl, languageAlternates } from '@/lib/seo';
import '@/components/landing/studio.css';

// GsapHero is above-the-fold — direct import so it ships with the initial bundle
import GsapHero from '@/components/landing/GsapHero';

// Render sections directly. Server-side next/dynamic does not defer their client
// JavaScript; optional scroll effects are loaded by useStudioReveal instead.
import StudioMarquee from '@/components/landing/GsapMarquee';
import GsapStats from '@/components/landing/GsapStats';
import GsapBento from '@/components/landing/GsapBento';
import GsapMarketing from '@/components/landing/GsapMarketing';
import GsapCta from '@/components/landing/GsapCta';

/* ─────────────────────────────────────────────────────────── */
/*  TYPES                                                       */
/* ─────────────────────────────────────────────────────────── */
interface StatDef { value: number; suffix: string; label: string }
interface ProjectDef { tag: string; award?: string; title: string; desc: string; href: string }

interface HomePage {
  badge: string;
  eyebrow: string;
  citationRole?: string;
  title: string;
  titleHighlight: string;
  subtitle: string;
  description: string;
  metaDescription?: string;
  viewPortfolio: string;
  getInTouch: string;
  clientsLabel?: string;
  marqueeItems?: string[];
  stats?: StatDef[];
  projects?: ProjectDef[];
  stack?: string[];
  ctaTitle?: string;
  ctaHighlight?: string;
  ctaSub?: string;
  ctaButton?: string;
  ctaSecondary?: string;
}

/* ─────────────────────────────────────────────────────────── */
/*  METADATA                                                    */
/* ─────────────────────────────────────────────────────────── */
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = isSupportedLocale(resolvedParams.locale) ? resolvedParams.locale : DEFAULT_LOCALE;
  const t = await getDictionary(locale);

  // Assert type for typescript
  const hp = t.homePage as unknown as HomePage;

  const title = locale === 'zh'
    ? '技术营销作品集 | 明元易'
    : 'Technical Marketing Portfolio | Shain Wai Yan';
  const description = hp.metaDescription || hp.description || 'The Shain Studio portfolio of Shain Wai Yan.';
  const url = absoluteUrl(locale);

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: url,
      languages: languageAlternates(),
      // Re-declare RSS discovery: a page-level `alternates` replaces the
      // layout's wholesale, and home is where feed readers look first.
      types: { 'application/rss+xml': `${SITE_URL}/feed.xml` },
    },
    // Explicit OG so og:title matches the absolute page title above
    // (otherwise the layout's og:title leaks through and mismatches).
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      images: [DEFAULT_OG_IMAGE],
      siteName: SITE_NAME,
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

/* ─────────────────────────────────────────────────────────── */
/*  PAGE COMPONENT                                              */
/* ─────────────────────────────────────────────────────────── */
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  const locale = isSupportedLocale(resolvedParams.locale) ? resolvedParams.locale : DEFAULT_LOCALE;
  const [t, clientLogos]: [Dictionary, Awaited<ReturnType<typeof getClientLogos>>] = await Promise.all([getDictionary(locale), getClientLogos()]);
  const hp = t.homePage as unknown as HomePage;

  const resolvedStats = hp.stats || [
    { value: 99, suffix: "/100", label: "SEO Health" },
    { value: 100, suffix: "K+", label: "Views" },
    { value: 2, suffix: "×", label: "National Awards" },
  ];

  const resolvedProjects = hp.projects || [
    {
      tag: "AI · Healthcare",
      award: "🏆 2nd Prize",
      title: "MedCare AI",
      desc: "National award-winning AI healthcare prototype built on Next.js and Cloudflare.",
      href: "https://medcare.shainwaiyan.com/"
    }
  ];

  return (
    <>
      <div className="studio-home" data-locale={locale}>
        <GsapHero hp={hp} locale={locale} clientLogos={clientLogos} />
        <StudioMarquee locale={locale} items={hp.marqueeItems} />
        <GsapStats stats={resolvedStats} locale={locale} />
        <GsapBento projects={resolvedProjects} locale={locale} />
        <GsapMarketing data={t.gsapMarketing} />
      </div>
      <GsapCta hp={hp} locale={locale} />
    </>
  );
}

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "zh" }];
}
