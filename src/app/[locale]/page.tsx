import React from 'react';
import fs from 'fs';
import path from 'path';
import { Metadata } from 'next';
import { getDictionary } from '@/lib/getDictionary';
import type { Dictionary } from '@/lib/getDictionary';
import { isSupportedLocale, DEFAULT_LOCALE } from '@/lib/locales';
import { SITE_URL, DEFAULT_OG_IMAGE, absoluteUrl, languageAlternates } from '@/lib/seo';
import dynamic from 'next/dynamic';

// GsapHero is above-the-fold — direct import so it ships with the initial bundle
import GsapHero from '@/components/landing/GsapHero';

// Below-fold sections: next/dynamic splits their JS into separate chunks
// (no ssr:false — HTML is still server-rendered so SEO/accessibility is preserved)
const GsapMarquee  = dynamic(() => import('@/components/landing/GsapMarquee'));
const GsapStats    = dynamic(() => import('@/components/landing/GsapStats'));
const GsapBento    = dynamic(() => import('@/components/landing/GsapBento'));
const GsapMarketing = dynamic(() => import('@/components/landing/GsapMarketing'));
const GsapCta      = dynamic(() => import('@/components/landing/GsapCta'));

/* ─────────────────────────────────────────────────────────── */
/*  TYPES                                                       */
/* ─────────────────────────────────────────────────────────── */
interface StatDef { value: number; suffix: string; label: string }
interface ProjectDef { tag: string; award?: string; title: string; desc: string; href: string }
interface ClientLogoDef { src: string; alt: string }

/* ─────────────────────────────────────────────────────────── */
/*  CLIENT LOGOS                                                */
/* ─────────────────────────────────────────────────────────── */
const CLIENT_IMAGE_RE = /\.(png|jpe?g|webp|avif|svg)$/i;

// The hero's "clients" strip is sourced from the filesystem, so adding a
// client is just dropping an image into public/images/Clients — the next
// build picks it up with no code change.
function getClientLogos(): ClientLogoDef[] {
  try {
    const dir = path.join(process.cwd(), 'public', 'images', 'Clients');
    return fs
      .readdirSync(dir)
      .filter((file) => CLIENT_IMAGE_RE.test(file))
      .sort((a, b) => a.localeCompare(b))
      .map((file) => ({
        src: `/images/Clients/${file}`,
        alt: file.replace(CLIENT_IMAGE_RE, ''),
      }));
  } catch {
    // Folder missing or unreadable — the hero simply renders without the strip
    return [];
  }
}

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

  const title = hp.title ? `Shain Studio | ${hp.title} ${hp.titleHighlight}` : 'Shain Studio';
  const description = hp.metaDescription || hp.description || 'Shain Wai Yan Portfolio';
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
      siteName: locale === 'zh' ? 'Shain的作品集' : "Shain's Portfolio",
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
  const t: Dictionary = await getDictionary(locale);
  const hp = t.homePage as unknown as HomePage;

  const resolvedMarqueeItems = hp.marqueeItems || [
    "Digital Marketing", "Vibe Coding", "SEO Entity Management", "Next.js", "System Architecture", "AI Orchestration"
  ];

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
      <div className="font-sans antialiased text-slate-900 dark:text-slate-50 bg-white dark:bg-black selection:bg-amber-500/30">
        <GsapHero hp={hp} locale={locale} clientLogos={getClientLogos()} />
        <GsapMarquee items={resolvedMarqueeItems} />
        <GsapStats stats={resolvedStats} />
        <GsapBento projects={resolvedProjects} locale={locale} />
        <GsapMarketing data={t.gsapMarketing} />
        <GsapCta hp={hp} locale={locale} />
      </div>
    </>
  );
}

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "zh" }];
}
