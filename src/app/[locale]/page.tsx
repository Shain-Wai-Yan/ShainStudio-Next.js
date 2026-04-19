import React from 'react';
import Link from 'next/link';
import TrackedLink from '@/components/analytics/TrackedLink';
import { Metadata } from 'next';
import { getDictionary } from '@/lib/getDictionary';
import type { Dictionary } from '@/lib/getDictionary';
import { isSupportedLocale, DEFAULT_LOCALE } from '@/lib/locales';
import HeroTypewriter from '@/components/HeroTypewriter';
import AnimatedCounter from '@/components/AnimatedCounter';
import CreativeCursor from '@/components/CreativeCursor';

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
  marqueeItems: string[];
  stats: StatDef[];
  projects: ProjectDef[];
  stack: string[];
  ctaTitle: string;
  ctaHighlight: string;
  ctaSub: string;
  ctaButton: string;
  ctaSecondary: string;
}

/* ─────────────────────────────────────────────────────────── */
/*  HERO                                                        */
/* ─────────────────────────────────────────────────────────── */
const Hero = ({ t, basePath }: { t: Dictionary; basePath: string }) => {
  const hp = t.homePage as unknown as HomePage;
  
  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden bg-white dark:bg-[#090910] pt-[80px]">
      {/* Noise texture overlay */}
      <div className="absolute inset-0 z-0 opacity-[0.035] dark:opacity-[0.055] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\\\'0 0 256 256\\\' xmlns=\\\'http://www.w3.org/2000/svg\\\'%3E%3Cfilter id=\\\'noise\\\'%3E%3CfeTurbulence type=\\\'fractalNoise\\\' baseFrequency=\\\'0.9\\\' numOctaves=\\\'4\\\' stitchTiles=\\\'stitch\\\'/%3E%3C/filter\\\'%3E%3Crect width=\\\'100%25\\\' height=\\\'100%25\\\' filter=\\\'url(%23noise)\\\'/%3E%3C/svg%3E")' }} />
      
      {/* Grid background */}
      <div className="absolute inset-0 z-0 opacity-100" style={{ backgroundImage: 'linear-gradient(rgba(25,25,112,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(25,25,112,0.045) 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
      <div className="hidden dark:block absolute inset-0 z-0 opacity-100" style={{ backgroundImage: 'linear-gradient(rgba(212,175,55,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.04) 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
      
      {/* Radial glow */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(25,25,112,0.07)_0%,transparent_70%)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(212,175,55,0.07)_0%,transparent_70%)]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-12 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ── Text column ── */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#191970]/20 dark:border-[#d4af37]/25 bg-white/70 dark:bg-[#090910]/60 backdrop-blur-md text-[#191970] dark:text-[#d4af37] text-xs font-semibold tracking-wide mb-7 mx-auto lg:mx-0 animate-fade-in-up">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffd700] animate-pulse shadow-[0_0_8px_rgba(255,215,0,0.8)]" />
              {hp.badge}
            </div>

            {/* Eyebrow */}
            <p className="text-[0.78rem] font-bold tracking-[0.18em] uppercase text-[#191970]/50 dark:text-[#d4af37] mb-3 animate-fade-in-up md:animation-delay-200">
              {hp.eyebrow}
            </p>

            {/* Main headline */}
            <h1 className="text-[clamp(3rem,7vw,6.5rem)] font-extrabold leading-[1.05] tracking-tight text-[#0f0f45] dark:text-[#f0f0ff] mb-4 animate-fade-in-up md:animation-delay-400">
              {hp.title}{' '}
              <span className="bg-gradient-to-r from-[#191970] via-[#ffd700] to-[#a67c00] bg-[length:200%_auto] text-transparent bg-clip-text animate-[heroTextShimmer_5s_linear_infinite]">
                {hp.titleHighlight}
              </span>
            </h1>

            {/* Typewriter role */}
            <div className="mb-4 text-xl sm:text-2xl font-semibold min-h-[2rem] text-[#191970] dark:text-[#d4af37] animate-fade-in-up md:animation-delay-400">
              <HeroTypewriter />
            </div>

            {/* Sub copy */}
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-xl leading-relaxed mb-9 mx-auto lg:mx-0 animate-fade-in-up md:animation-delay-400">
              {hp.description}
            </p>

            {/* CTA row */}
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start animate-fade-in-up md:animation-delay-500 relative z-20">
              <TrackedLink
                href={`${basePath}/portfolio`}
                eventName="view_portfolio_hero"
                className="group relative inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-[0.95rem] text-white bg-gradient-to-br from-[#191970] to-[#2a2a9a] dark:from-[#d4af37] dark:to-[#a67c00] dark:text-[#0f0f45] shadow-[0_4px_20px_rgba(25,25,112,0.3)] dark:shadow-[0_4px_20px_rgba(212,175,55,0.3)] transition-all hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] skew-x-[-15deg] group-hover:animate-[waveEffect_1.5s_ease-out_infinite]" />
                <span className="relative z-10">{hp.viewPortfolio}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="relative z-10 group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </TrackedLink>

              <TrackedLink
                href={`${basePath}/contact`}
                eventName="get_in_touch_hero"
                className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-[0.95rem] text-[#191970] dark:text-[#d4af37] bg-white/50 dark:bg-[#090910]/40 backdrop-blur-md border-[1.5px] border-[#191970]/30 dark:border-[#d4af37]/40 hover:bg-[#191970]/5 dark:hover:border-[#d4af37] transition-all hover:-translate-y-0.5"
              >
                {hp.getInTouch}
              </TrackedLink>
            </div>
          </div>

          {/* ── Visual column ── */}
          <div className="flex items-center justify-center animate-fade-in-up md:animation-delay-400 mt-10 lg:mt-0 relative z-10">
            <div className="relative w-full max-w-sm" data-cursor="view">
              {/* Central card */}
              <div
                className="rounded-2xl border border-[#191970]/10 dark:border-white/10 p-8 shadow-xl bg-white/60 dark:bg-[#1a1a24]/60 backdrop-blur-xl relative z-10 transform transition-transform duration-700 hover:rotate-1 hover:scale-[1.02]"
              >
                {/* Profile indicator */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-black text-lg bg-gradient-to-br from-[#191970] to-[#2a2a9a] dark:from-[#d4af37] dark:to-[#a67c00] dark:text-[#0f0f45]">
                    S
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[#0f0f45] dark:text-white">Shain Wai Yan</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">xolbine · 明元易</div>
                  </div>
                  <div className="ml-auto px-3 py-1 rounded-full text-[0.65rem] font-bold uppercase tracking-wider bg-[#191970]/10 text-[#191970] dark:bg-[#d4af37]/15 dark:text-[#d4af37]">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
                    Open
                  </div>
                </div>

                {/* Stat pills */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { n: '99', u: '/100', label: 'SEO Score' },
                    { n: '100K', u: '+', label: 'View Count' },
                    { n: '2×', u: '', label: 'National Award' },
                    { n: 'HSK4', u: '', label: 'Chinese Level' },
                  ].map(({ n, u, label }) => (
                    <div key={label} className="rounded-xl p-3 text-center bg-[#191970]/5 border border-[#191970]/10 dark:bg-[#000]/30 dark:border-white/5 transition-colors hover:bg-[#191970]/10 dark:hover:bg-[#000]/50">
                      <div className="font-black text-lg leading-none text-[#191970] dark:text-[#d4af37]">
                        {n}<span className="text-sm opacity-80">{u}</span>
                      </div>
                      <div className="text-xs mt-1.5 text-gray-500 dark:text-gray-400 font-medium">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Tag cloud */}
                <div className="flex flex-wrap gap-2">
                  {['Next.js', 'Vibe Coder', 'SEO', 'AI', 'Marketer'].map(tag => (
                    <span key={tag} className="px-3 py-1 rounded-full text-[0.7rem] font-semibold bg-[#ffd700]/10 text-[#a67c00] dark:bg-[#d4af37]/10 dark:text-[#d4af37] border border-[#ffd700]/30 dark:border-[#d4af37]/30 transition-transform hover:-translate-y-0.5">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Floating accent cards */}
              <div className="absolute -top-5 -right-5 rounded-xl px-4 py-3 shadow-xl text-xs font-bold hidden sm:block bg-[#ffd700] dark:bg-[#d4af37] text-[#0f0f45] rotate-[4deg] animate-float z-20 transition-transform hover:scale-110 cursor-default">
                🏆 Award Winner
              </div>
              <div className="absolute -bottom-5 -left-5 rounded-xl px-4 py-3 shadow-xl text-xs font-bold text-white hidden sm:block bg-[#191970] -rotate-[3deg] animate-float animation-delay-2000 z-20 transition-transform hover:scale-110 cursor-default">
                ✦ Systems Architect
              </div>

              {/* Ambient glow */}
              <div className="absolute inset-0 rounded-2xl blur-[40px] opacity-20 -z-10 bg-[radial-gradient(ellipse,#ffd700_0%,#191970_60%,transparent_100%)] dark:opacity-30 dark:bg-[radial-gradient(ellipse,#d4af37_0%,#191970_60%,transparent_100%)]" />
            </div>
          </div>

        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce opacity-40">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            className="text-[#191970] dark:text-[#d4af37]">
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────────────────── */
/*  MARQUEE STRIP                                               */
/* ─────────────────────────────────────────────────────────── */
const MarqueeStrip = ({ t }: { t: Dictionary }) => {
  const hp = t.homePage as unknown as HomePage;
  const items: string[] = hp.marqueeItems || [];
  const doubled = [...items, ...items];
  
  return (
    <div className="py-4 overflow-hidden bg-[#f4f4f8] dark:bg-[#0e0e18] border-y border-[#191970]/5 dark:border-[#d4af37]/10" aria-hidden="true">
      <div className="mask-image-fade">
        <div className="flex w-max animate-[marqueeScroll_30s_linear_infinite] hover:[animation-play-state:paused]">
          {doubled.map((item, i) => (
            <span key={i} className="inline-flex items-center px-7 text-[0.85rem] font-bold tracking-[0.12em] uppercase text-[#191970] dark:text-[#d4af37] whitespace-nowrap">
              {item}
              <span className="text-[#ffd700] dark:text-[#a67c00] text-lg px-2 ml-7">✦</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────── */
/*  STATS                                                       */
/* ─────────────────────────────────────────────────────────── */
const Stats = ({ t }: { t: Dictionary }) => {
  const hp = t.homePage as unknown as HomePage;
  const stats = hp.stats || [
    { value: 99, suffix: '/100', label: 'SEO Health Score' },
    { value: 100, suffix: 'K+', label: 'Combined Views' },
    { value: 2, suffix: '×', label: 'Award Winner' },
    { value: 3, suffix: '', label: 'Languages' },
  ];

  return (
    <section className="py-20 lg:py-28 bg-white dark:bg-[#090910]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-[0.72rem] font-extrabold tracking-[0.2em] uppercase text-[#191970]/45 dark:text-[#d4af37]/70 block mb-3">By the numbers</span>
          <h2 className="text-[clamp(2rem,4.5vw,3.5rem)] font-black leading-[1.08] tracking-tight text-[#0f0f45] dark:text-[#f0f0ff]">Numbers that speak.</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-[#191970]/10 dark:bg-[#d4af37]/15 rounded-2xl overflow-hidden border border-[#191970]/10 dark:border-[#d4af37]/10">
          {stats.map((s) => (
            <div key={s.label} className="bg-white dark:bg-[#0d0d18] p-8 md:p-10 text-center transition-colors hover:bg-gray-50 dark:hover:bg-[#111120]">
              <div className="text-[clamp(2rem,5vw,3.5rem)] font-black leading-none text-[#191970] dark:text-[#d4af37] mb-2 font-mono">
                <AnimatedCounter target={s.value} suffix={s.suffix} />
              </div>
              <div className="text-[0.78rem] tracking-[0.1em] uppercase text-gray-500 dark:text-gray-400 font-semibold">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────────────────── */
/*  BENTO PROJECTS                                              */
/* ─────────────────────────────────────────────────────────── */
const bentoGradients = [
  'linear-gradient(135deg, rgba(25,25,112,0.02) 0%, rgba(255,215,0,0.06) 100%)',
  'linear-gradient(135deg, rgba(255,215,0,0.03) 0%, rgba(25,25,112,0.05) 100%)',
  'linear-gradient(135deg, rgba(25,25,112,0.05) 0%, rgba(42,42,154,0.03) 100%)',
  'linear-gradient(135deg, rgba(212,175,55,0.05) 0%, rgba(25,25,112,0.03) 100%)',
];

const BentoProjects = ({ t, basePath }: { t: Dictionary; basePath: string }) => {
  const hp = t.homePage as unknown as HomePage;
  const projects = hp.projects || [];

  return (
    <section className="py-24 lg:py-32 bg-[#f9f9fb] dark:bg-[#0e0e18] border-y border-[#191970]/5 dark:border-[#d4af37]/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-14 text-center md:text-left flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <span className="text-[0.72rem] font-extrabold tracking-[0.2em] uppercase text-[#191970]/45 dark:text-[#d4af37]/70 block mb-3">Selected work</span>
            <h2 className="text-[clamp(2.5rem,4.5vw,4rem)] font-black leading-[1.05] tracking-tight text-[#0f0f45] dark:text-[#f0f0ff]">Built, not just designed.</h2>
          </div>
          <TrackedLink
            href={`${basePath}/portfolio`}
            eventName="view_all_work_bento"
            className="hidden md:inline-flex items-center gap-2 group text-[#191970] dark:text-[#d4af37] font-bold text-[0.95rem] hover:opacity-80 transition-opacity"
          >
            View All Work
            <span className="w-8 h-8 rounded-full border border-current flex items-center justify-center transition-transform group-hover:translate-x-1 group-hover:bg-[#191970] group-hover:text-[#ffd700] dark:group-hover:bg-[#d4af37] dark:group-hover:text-[#0f0f45]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </TrackedLink>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 auto-rows-[250px] md:auto-rows-[300px]">
          {projects.map((p, i) => {
            const colSpan = i === 0 || i === 3 ? 'md:col-span-7' : 'md:col-span-5';
            return (
              <Link
                key={p.title}
                href={`${basePath}${p.href}`}
                className={`group relative rounded-[24px] overflow-hidden bg-white dark:bg-[#13131f] border border-[#191970]/10 dark:border-white/5 p-8 flex flex-col justify-end transition-all duration-500 hover:-translate-y-1.5 shadow-sm hover:shadow-[0_20px_40px_rgba(25,25,112,0.08)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] ${colSpan}`}
                data-cursor="view"
              >
                {/* Gradient background reveal on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                  style={{ background: bentoGradients[i % bentoGradients.length] }}
                />

                {/* Top right icon */}
                <div className="absolute top-6 right-6 w-11 h-11 rounded-full border-[1.5px] border-[#191970]/15 dark:border-[#d4af37]/20 flex items-center justify-center text-[#191970] dark:text-[#d4af37] transition-all duration-300 group-hover:bg-[#191970] group-hover:text-[#ffd700] group-hover:border-[#191970] dark:group-hover:bg-[#d4af37] dark:group-hover:text-[#0f0f45] dark:group-hover:border-[#d4af37] group-hover:rotate-45">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>

                <div className="relative z-10">
                  {p.award && (
                    <div className="inline-flex items-center gap-1.5 text-[0.65rem] font-bold tracking-widest uppercase text-white bg-[#191970] dark:bg-[#d4af37] dark:text-[#0f0f45] px-3 py-1.5 rounded-full mb-3 shadow-md">
                      {p.award}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-[0.7rem] font-bold tracking-[0.12em] uppercase text-[#191970]/60 dark:text-[#d4af37]/80 mb-2">
                    {p.tag}
                  </div>
                  <h3 className="text-[clamp(1.4rem,2.5vw,1.8rem)] font-extrabold text-[#0f0f45] dark:text-white mb-2.5 leading-[1.15] group-hover:text-[#191970] transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-[0.9rem] text-gray-600 dark:text-gray-400 leading-relaxed max-w-md m-0">
                    {p.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-10 md:hidden flex justify-center">
          <TrackedLink
            href={`${basePath}/portfolio`}
            eventName="view_all_work_bento_mobile"
            className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold bg-[#191970]/5 text-[#191970] dark:bg-[#d4af37]/10 dark:text-[#d4af37]"
          >
            View All Work
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </TrackedLink>
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────────────────── */
/*  STACK SHOWCASE                                              */
/* ─────────────────────────────────────────────────────────── */
const StackShowcase = ({ t }: { t: Dictionary }) => {
  const hp = t.homePage as unknown as HomePage;
  const stack = hp.stack || [
    'Next.js', 'TypeScript', 'Cloudflare Workers', 'Strapi', 'Twilio',
    'Cursor AI', 'v0', 'TradingView API', 'AmneziaWG', 'SEO', 'Vercel',
  ];

  return (
    <section className="py-20 bg-white dark:bg-[#090910]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-[0.72rem] font-extrabold tracking-[0.2em] uppercase text-[#191970]/45 dark:text-[#d4af37]/70 block mb-3">The Orchestration Stack</span>
          <h2 className="text-[clamp(1.8rem,3vw,2.5rem)] font-black text-[#0f0f45] dark:text-[#f0f0ff]">Tools I build with.</h2>
        </div>
        <div className="flex flex-wrap gap-3 justify-center items-center max-w-4xl mx-auto">
          {stack.map((s) => (
            <span key={s} className="inline-flex items-center px-5 py-2.5 rounded-full text-[0.85rem] font-bold border border-[#191970]/10 text-[#191970] bg-gray-50/50 hover:bg-[#191970]/5 hover:border-[#191970]/30 hover:-translate-y-0.5 transition-all dark:border-[#d4af37]/20 dark:text-[#d4af37] dark:bg-[#000]/20 dark:hover:bg-[#d4af37]/10 dark:hover:border-[#d4af37]/50">
              {s}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────────────────── */
/*  CTA                                                         */
/* ─────────────────────────────────────────────────────────── */
const Cta = ({ t, basePath }: { t: Dictionary; basePath: string }) => {
  const hp = t.homePage as unknown as HomePage;
  
  return (
    <section className="relative py-28 lg:py-36 overflow-hidden bg-[#0f0f45] dark:bg-[#050508] text-center">
      {/* Noise overlay */}
      <div className="absolute inset-0 z-0 opacity-[0.06] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\\\'0 0 256 256\\\' xmlns=\\\'http://www.w3.org/2000/svg\\\'%3E%3Cfilter id=\\\'noise\\\'%3E%3CfeTurbulence type=\\\'fractalNoise\\\' baseFrequency=\\\'0.9\\\' numOctaves=\\\'4\\\' stitchTiles=\\\'stitch\\\'/%3E%3C/filter\\\'%3E%3Crect width=\\\'100%25\\\' height=\\\'100%25\\\' filter=\\\'url(%23noise)\\\'/%3E%3C/svg%3E")' }} />
      
      {/* Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_50%_50%,rgba(255,215,0,0.08)_0%,transparent_70%)] dark:bg-[radial-gradient(ellipse_70%_80%_at_50%_50%,rgba(212,175,55,0.05)_0%,transparent_70%)]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h2 className="text-[clamp(2.5rem,6vw,5.5rem)] font-black text-white leading-[1.05] tracking-tight mb-5">
          {hp.ctaTitle}{' '}
          <span className="bg-gradient-to-r from-[#ffd700] via-[#ffe88a] to-[#d4af37] bg-[length:200%_auto] text-transparent bg-clip-text animate-[heroTextShimmer_4s_linear_infinite]">
            {hp.ctaHighlight}
          </span>
        </h2>
        <p className="text-white/60 text-lg sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed font-medium">
          {hp.ctaSub}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-5 justify-center mt-8">
          <TrackedLink
            href={`${basePath}/contact`}
            eventName="get_in_touch_cta"
            className="group relative inline-flex items-center justify-center gap-2 px-9 py-4 rounded-xl font-bold text-[1rem] bg-gradient-to-r from-[#ffd700] to-[#d4af37] text-[#0f0f45] shadow-[0_8px_30px_rgba(255,215,0,0.25)] transition-all hover:scale-105 active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[150%] skew-x-[-15deg] group-hover:animate-[waveEffect_1.5s_ease-out_infinite]" />
            <span className="relative z-10">{hp.ctaButton}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="relative z-10">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </TrackedLink>
          
          <TrackedLink
            href={`${basePath}/portfolio`}
            eventName="see_work_cta"
            className="inline-flex items-center justify-center px-9 py-4 rounded-xl font-bold text-[1rem] border-2 border-white/20 text-white/90 hover:bg-white/10 hover:border-white/40 transition-all active:scale-95"
          >
            {hp.ctaSecondary}
          </TrackedLink>
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────────────────── */
/*  PAGE                                                        */
/* ─────────────────────────────────────────────────────────── */
interface HomeProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: HomeProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isSupportedLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const t = await getDictionary(locale);
  const hp = t.homePage as unknown as HomePage;

  const baseUrl = locale === 'en' ? 'https://www.shainwaiyan.com' : `https://www.shainwaiyan.com/${locale}`;

  return {
    title: `${hp.title} ${hp.titleHighlight} | Shain Wai Yan`,
    description: hp.description,
    alternates: {
      canonical: baseUrl,
      languages: {
        en: 'https://www.shainwaiyan.com',
        zh: 'https://www.shainwaiyan.com/zh',
        'x-default': 'https://www.shainwaiyan.com',
      },
    },
    openGraph: { url: baseUrl },
  };
}

export const dynamic = 'force-static';
export const revalidate = 3600;

export async function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'zh' }];
}

export default async function Home({ params }: HomeProps) {
  const { locale: rawLocale } = await params;
  const locale = isSupportedLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const basePath = locale === 'en' ? '' : `/${locale}`;
  const t = await getDictionary(locale);

  return (
    <main className="overflow-x-hidden pt-[0px]">
      {/* Creative dual-layer cursor (client-only) */}
      <CreativeCursor />

      <Hero t={t} basePath={basePath} />
      <MarqueeStrip t={t} />
      <Stats t={t} />
      <BentoProjects t={t} basePath={basePath} />
      <StackShowcase t={t} />
      <Cta t={t} basePath={basePath} />
    </main>
  );
}
