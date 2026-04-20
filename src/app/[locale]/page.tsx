import React from 'react';
import { Metadata } from 'next';
import { getDictionary } from '@/lib/getDictionary';
import type { Dictionary } from '@/lib/getDictionary';
import { isSupportedLocale, DEFAULT_LOCALE } from '@/lib/locales';


import GsapHero from '@/components/landing/GsapHero';
import GsapMarquee from '@/components/landing/GsapMarquee';
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
  title: string;
  titleHighlight: string;
  subtitle: string;
  description: string;
  viewPortfolio: string;
  getInTouch: string;
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
export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = isSupportedLocale(resolvedParams.locale) ? resolvedParams.locale : DEFAULT_LOCALE;
  const t = await getDictionary(locale);

  // Assert type for typescript
  const hp = t.homePage as unknown as HomePage;

  return {
    title: hp.title ? `${hp.title} ${hp.titleHighlight}` : 'Shain Wai Yan',
    description: hp.description || 'Shain Wai Yan Portfolio',
  };
}

/* ─────────────────────────────────────────────────────────── */
/*  PAGE COMPONENT                                              */
/* ─────────────────────────────────────────────────────────── */
export default async function Page({ params }: { params: { locale: string } }) {
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
      <main className="font-sans antialiased text-slate-900 dark:text-slate-50 bg-white dark:bg-black selection:bg-amber-500/30">
        <GsapHero hp={hp} locale={locale} />
        <GsapMarquee items={resolvedMarqueeItems} />
        <GsapStats stats={resolvedStats} />
        <GsapBento projects={resolvedProjects} locale={locale} />
        <GsapMarketing data={t.gsapMarketing} />
        <GsapCta hp={hp} locale={locale} />
      </main>
    </>
  );
}
