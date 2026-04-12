import React from 'react';
import Link from 'next/link';
import TrackedLink from '@/components/analytics/TrackedLink';
import { Metadata } from 'next';
import { getDictionary } from '@/lib/getDictionary';
import type { Dictionary } from '@/lib/getDictionary';
import { isSupportedLocale, DEFAULT_LOCALE } from '@/lib/locales';
import {
  FaBullhorn, FaChartLine, FaUsers, FaComments,
  FaRobot, FaChartPie, FaBullseye, FaBrain,
  FaAward, FaUsersCog, FaArrowRight
} from 'react-icons/fa';
import WhatIDoSection from '@/components/home/WhatIDoSection';

/* ── HERO ────────────────────────────────────── */
const Hero = ({ t, basePath }: { t: Dictionary, basePath: string }) => (
  <section
    className="relative min-h-screen flex items-center justify-center overflow-hidden mt-[80px] px-4 py-12 sm:p-8"
    style={{ backgroundColor: 'var(--background)' }}
  >
    {/* Animated background blobs */}
    <div className="absolute inset-0 z-0 pointer-events-none">
      {[
        { cls: 'w-40 h-40 sm:w-64 sm:h-64 -top-16 -right-16 sm:-top-24 sm:-right-24', dur: '15s', rev: false },
        { cls: 'w-32 h-32 sm:w-48 sm:h-48 -bottom-8 -left-8 sm:-bottom-12 sm:-left-12',  dur: '20s', rev: true  },
        { cls: 'w-24 h-24 sm:w-36 sm:h-36 top-[40%] right-[20%]',                        dur: '18s', rev: false },
        { cls: 'w-16 h-16 sm:w-24 sm:h-24 bottom-[30%] left-[15%]',                      dur: '12s', rev: false },
        { cls: 'w-14 h-14 sm:w-20 sm:h-20 top-[20%] left-[10%]',                         dur: '10s', rev: false },
      ].map((b, i) => (
        <div
          key={i}
          className={`absolute rounded-full opacity-10 ${b.cls}`}
          style={{
            backgroundColor: 'var(--primary)',
            animation: `float ${b.dur} ease-in-out infinite ${b.rev ? 'reverse' : ''}`,
            animationDelay: `${i * 0.8}s`,
          }}
        />
      ))}
    </div>

    {/* Dot pattern */}
    <div
      className="absolute inset-0 z-0 opacity-10 pointer-events-none"
      style={{
        backgroundImage: 'radial-gradient(var(--primary) 1px, transparent 1px)',
        backgroundSize: '30px 30px',
      }}
    />

    <div className="container mx-auto px-4 sm:px-6 lg:px-8 z-10 relative w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">

        {/* ── Text column ── */}
        <div className="text-center lg:text-left">
          {/* Animated badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold mb-5 sm:mb-6"
            style={{
              background: 'linear-gradient(270deg, var(--primary), var(--accent), var(--primary-light), var(--accent-light))',
              backgroundSize: '300% 300%',
              animation: 'heroGradient 6s ease infinite',
              color: 'white',
            }}
          >
            <span className="w-2 h-2 rounded-full bg-white/80 animate-pulse" />
            {t.homePage.badge}
          </div>

          <h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4"
            style={{ color: 'var(--primary-dark)' }}
          >
            {t.homePage.title}{' '}
            <span
              className="inline-block"
              style={{
                background: 'linear-gradient(90deg, var(--primary) 0%, var(--accent) 30%, var(--accent-light) 50%, var(--accent) 70%, var(--primary) 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'heroTextShimmer 4s linear infinite',
              }}
            >
              {t.homePage.titleHighlight}
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-2xl font-light mb-5 sm:mb-8" style={{ color: 'var(--text-light)' }}>
            {t.homePage.subtitle}
          </p>
          <p className="max-w-xl mx-auto lg:mx-0 opacity-90 mb-8 sm:mb-10 leading-relaxed text-sm sm:text-base" style={{ color: 'var(--text-light)' }}>
            {t.homePage.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
            {/* Primary CTA */}
            <TrackedLink
              href={`${basePath}/portfolio`}
              eventName="view_portfolio_hero"
              className="group relative inline-flex items-center justify-center font-bold py-3 px-6 sm:px-8 rounded-lg overflow-hidden transition-transform duration-300 hover:scale-105 shadow-lg text-sm sm:text-base"
            >
              <span
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(270deg, var(--primary-dark), var(--primary), var(--primary-light))',
                  backgroundSize: '300% 300%',
                  animation: 'heroGradient 4s ease infinite',
                }}
              />
              <span className="relative z-10 text-white">{t.homePage.viewPortfolio}</span>
            </TrackedLink>

            {/* Secondary CTA */}
            <TrackedLink
              href={`${basePath}/contact`}
              eventName="get_in_touch_hero"
              className="group relative inline-flex items-center justify-center font-bold py-3 px-6 sm:px-8 rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 text-sm sm:text-base"
            >
              <span
                className="absolute inset-0 rounded-lg p-[2px]"
                style={{
                  background: 'linear-gradient(270deg, var(--primary-dark), var(--primary), var(--accent), var(--primary-light))',
                  backgroundSize: '300% 300%',
                  animation: 'heroGradient 4s ease infinite',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                }}
              />
              <span
                className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(270deg, var(--primary-dark), var(--primary), var(--primary-light))',
                  backgroundSize: '300% 300%',
                  animation: 'heroGradient 4s ease infinite',
                }}
              />
              <span
                className="relative z-10 transition-colors duration-300 group-hover:text-white"
                style={{ color: 'var(--primary)' }}
              >
                {t.homePage.getInTouch}
              </span>
            </TrackedLink>
          </div>
        </div>

        {/* ── CUBE column ── */}
        <div
          className="flex items-center justify-center relative mt-10 lg:mt-0"
          style={{ perspective: '900px', height: '280px', minHeight: '280px' }}
        >
          {/* Ambient glow */}
          <div
            className="absolute rounded-full blur-3xl opacity-30 pointer-events-none"
            style={{
              width: '200px', height: '60px',
              bottom: '10px', left: '50%',
              transform: 'translateX(-50%)',
              background: 'radial-gradient(ellipse, var(--accent) 0%, var(--primary) 60%, transparent 100%)',
              animation: 'glowPulse 4s ease-in-out infinite alternate',
            }}
          />

          {/* Outer orbit ring */}
          <div
            className="absolute rounded-full pointer-events-none border border-dashed border-[#ffd700] dark:border-white"
            style={{
              width: 'min(260px, 70vw)',
              height: 'min(260px, 70vw)',
              opacity: 0.25,
              animation: 'orbitSpin 18s linear infinite',
            }}
          />
          {/* Inner orbit ring */}
          <div
            className="absolute rounded-full pointer-events-none border border-solid border-[#191970] dark:border-white"
            style={{
              width: 'min(210px, 56vw)',
              height: 'min(210px, 56vw)',
              opacity: 0.18,
              animation: 'orbitSpin 12s linear infinite reverse',
            }}
          />

          {/* Orbit dots */}
          {[0, 60, 120, 180, 240, 300].map((deg, i) => (
            <div
              key={i}
              className="absolute pointer-events-none"
              style={{
                width: 'min(260px, 70vw)',
                height: 'min(260px, 70vw)',
                animation: 'orbitSpin 18s linear infinite',
                animationDelay: `${i * -3}s`,
              }}
            >
              <div
                className="absolute rounded-full bg-[#ffd700] dark:bg-white"
                style={{
                  width: '5px', height: '5px',
                  opacity: 0.7,
                  top: '50%', left: '50%',
                  transform: `rotate(${deg}deg) translateX(min(128px, 34vw)) translateY(-50%)`,
                  boxShadow: '0 0 5px currentColor',
                }}
              />
            </div>
          ))}

          {/* Cube wrapper */}
          <div
            style={{
              width: 'min(160px, 42vw)',
              height: 'min(160px, 42vw)',
              position: 'relative',
              transformStyle: 'preserve-3d',
              animation: 'cubeRotate 22s infinite linear',
            }}
          >
            {[
              { label: t.hero.cube?.marketing || 'Marketing',  transform: 'translateZ(min(80px, 21vw))',                 delay: '0s'   },
              { label: t.hero.cube?.strategy || 'Strategy',   transform: 'rotateY(180deg) translateZ(min(80px, 21vw))', delay: '0.5s' },
              { label: t.hero.cube?.creativity || 'Creativity', transform: 'rotateY(90deg) translateZ(min(80px, 21vw))',  delay: '1s'   },
              { label: t.hero.cube?.results || 'Results',    transform: 'rotateY(-90deg) translateZ(min(80px, 21vw))', delay: '1.5s' },
              { label: t.hero.cube?.innovation || 'Innovation', transform: 'rotateX(90deg) translateZ(min(80px, 21vw))',  delay: '2s'   },
              { label: t.hero.cube?.excellence || 'Excellence', transform: 'rotateX(-90deg) translateZ(min(80px, 21vw))', delay: '2.5s' },
            ].map(({ label, transform, delay }) => (
              <div
                key={label}
                style={{
                  position: 'absolute',
                  width: 'min(160px, 42vw)',
                  height: 'min(160px, 42vw)',
                  transform,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'clamp(0.7rem, 2.5vw, 1.05rem)',
                  fontWeight: 'bold',
                  color: 'white',
                  letterSpacing: '0.04em',
                  background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 35%, var(--primary-light) 65%, var(--accent) 100%)',
                  backgroundSize: '400% 400%',
                  animation: 'cubeFaceShift 8s ease-in-out infinite alternate',
                  animationDelay: delay,
                  border: '1.5px solid var(--accent)',
                  boxShadow:
                    'inset 0 1px 0 rgba(255,255,255,0.15),' +
                    'inset 0 0 30px rgba(255,215,0,0.06),' +
                    'inset 0 0 60px rgba(25,25,112,0.25),' +
                    '0 0 15px rgba(25,25,112,0.4)',
                }}
              >
                <span style={{ position: 'absolute', top: '8px', left: '10px', width: '16px', height: '16px', borderTop: '2px solid var(--accent)', borderLeft: '2px solid var(--accent)', opacity: 0.6, borderRadius: '2px 0 0 0' }} />
                <span style={{ position: 'absolute', bottom: '8px', right: '10px', width: '16px', height: '16px', borderBottom: '2px solid var(--accent)', borderRight: '2px solid var(--accent)', opacity: 0.6, borderRadius: '0 0 2px 0' }} />
                <span style={{ position: 'absolute', inset: 0, background: 'linear-gradient(115deg, transparent 25%, rgba(255,255,255,0.09) 50%, transparent 75%)', backgroundSize: '250% 250%', animation: 'cubeSweep 4s linear infinite', animationDelay: delay, pointerEvents: 'none' }} />
                <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, var(--accent), transparent)', opacity: 0.5, animation: 'shimmerLine 3s ease-in-out infinite', animationDelay: delay }} />
                <span style={{ position: 'relative', zIndex: 1, textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>

    {/* Scroll hint */}
    <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-bounce">
      <span className="text-xs sm:text-sm" style={{ color: 'var(--text-light)' }}>{t.common?.scrollHint || 'Scroll to explore'}</span>
      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
        viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--primary)' }}>
        <path d="M19 9l-7 7-7-7" />
      </svg>
    </div>

  </section>
);

/* ── EXPERTISE ───────────────────────────────── */
const Expertise = ({ t, basePath }: { t: Dictionary, basePath: string }) => {
  const expertiseData = [
    {
      icon: <FaBullhorn size={48} className="text-[#ffd700] dark:text-[#d4af37]" />,
      title: t.expertise?.items?.[0]?.title || 'Digital Marketing',
      description: t.expertise?.items?.[0]?.description || 'Strategic campaigns.',
    },
    {
      icon: <FaChartLine size={48} className="text-[#ffd700] dark:text-[#d4af37]" />,
      title: t.expertise?.items?.[1]?.title || 'Market Analysis',
      description: t.expertise?.items?.[1]?.description || 'In-depth research.',
    },
    {
      icon: <FaUsers size={48} className="text-[#ffd700] dark:text-[#d4af37]" />,
      title: t.expertise?.items?.[2]?.title || 'Brand Development',
      description: t.expertise?.items?.[2]?.description || 'Creating identities.',
    },
    {
      icon: <FaComments size={48} className="text-[#ffd700] dark:text-[#d4af37]" />,
      title: t.expertise?.items?.[3]?.title || 'Content Strategy',
      description: t.expertise?.items?.[3]?.description || 'Engaging content.',
    },
  ];

  return (
    <section className="bg-[#f9f9f9] dark:bg-[#1e1e1e] py-16 sm:py-20 px-4 sm:px-8 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#191970] dark:text-[#d4af37] relative inline-block">
            {t.expertise.title}
            <span className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-[#191970] to-[#ffd700] dark:from-[#704700] dark:to-[#f9df85] rounded-full" />
          </h2>
          <p className="text-[#666666] dark:text-[#b0b0b0] text-lg sm:text-xl mt-8 max-w-xl mx-auto">
            {t.expertise.subtitle}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {expertiseData.map((item, index) => (
            <div key={index} style={{ height: '280px', perspective: '1000px' }} className="group">
              <div
                className="relative w-full h-full transition-transform duration-700 group-hover:[transform:rotateY(180deg)] focus-within:[transform:rotateY(180deg)]"
                style={{ transformStyle: 'preserve-3d' }}
                tabIndex={0}
                role="button"
                aria-label={`${item.title} — click to see more`}
              >
                <div className="absolute w-full h-full rounded-lg flex flex-col items-center justify-center p-6 sm:p-8 shadow-md bg-white dark:bg-[#2a2a2a]" style={{ backfaceVisibility: 'hidden' }}>
                  <div className="mb-5 sm:mb-6">{item.icon}</div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#191970] dark:text-[#d4af37] text-center">{item.title}</h3>
                </div>
                <div className="absolute w-full h-full rounded-lg flex flex-col items-center justify-center p-6 sm:p-8 shadow-md bg-[#191970] dark:bg-gradient-to-br dark:from-[#704700] dark:via-[#a67c00] dark:to-[#d4af37] text-center" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                  <p className="mb-5 sm:mb-6 leading-relaxed text-white text-sm">{item.description}</p>
                  <Link href={`${basePath}/portfolio`} className="inline-block px-5 sm:px-6 py-2 bg-[#ffd700] dark:bg-[#191970] text-[#191970] dark:text-[#d4af37] rounded font-bold transition-all duration-300 hover:bg-white hover:-translate-y-1 text-sm">
                    {t.common?.learnMore || 'Learn More'}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ── AI SHOWCASE ─────────────────────────────── */
const AiShowcase = ({ t, basePath }: { t: Dictionary, basePath: string }) => (
  <section className="bg-[#f9f9f9] dark:bg-[#1e1e1e] py-16 sm:py-20 px-4 sm:px-8 relative overflow-hidden">
    <div className="absolute inset-0 z-0" style={{ backgroundImage: 'linear-gradient(to right, rgba(25,25,112,0.05) 1px, transparent 1px),linear-gradient(to bottom, rgba(25,25,112,0.05) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
    <div className="absolute inset-0 z-0 hidden dark:block" style={{ backgroundImage: 'linear-gradient(to right, rgba(166,124,0,0.05) 1px, transparent 1px),linear-gradient(to bottom, rgba(166,124,0,0.05) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 z-10 relative">
      <div className="text-center mb-12 sm:mb-16">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-[#191970] dark:text-[#d4af37]">{t.aiShowcase.title}</h2>
        <p className="text-lg sm:text-xl text-[#666666] dark:text-[#b0b0b0] max-w-3xl mx-auto">{t.aiShowcase.subtitle}</p>
      </div>
      <div className="flex flex-col lg:flex-row items-center justify-between max-w-[1200px] mx-auto gap-10 lg:gap-12">
        <div className="w-full lg:flex-1 flex justify-center items-center min-h-[220px] lg:min-h-[400px]">
          <div className="relative w-[160px] h-[160px] sm:w-[200px] sm:h-[200px] flex justify-center items-center">
            <div className="absolute w-full h-full rounded-full border-2 border-[#191970] dark:border-[#d4af37]" style={{ opacity: 0, animation: 'brainPulse 3s infinite' }} />
            <div className="w-[110px] h-[110px] sm:w-[140px] sm:h-[140px] rounded-full relative z-[2] flex items-center justify-center bg-gradient-to-br from-[#191970] to-[#2a2a9a] dark:from-[#704700] dark:via-[#a67c00] dark:to-[#d4af37]" style={{ boxShadow: '0 0 40px rgba(25,25,112,0.4), inset 0 0 30px rgba(255,215,0,0.1)', animation: 'aiPulse 3s infinite alternate' }}>
              <svg width="65" height="65" viewBox="0 0 100 100" fill="none" style={{ animation: 'float 4s ease-in-out infinite' }}>
                <circle cx="50" cy="50" r="45" stroke="#ffd700" strokeWidth="2" opacity="0.6" />
                <circle cx="50" cy="50" r="35" stroke="#ffd700" strokeWidth="1.5" opacity="0.4" />
                <circle cx="50" cy="50" r="8" fill="#ffd700" />
                <circle cx="30" cy="35" r="5" fill="#ffd700" opacity="0.8" />
                <circle cx="70" cy="35" r="5" fill="#ffd700" opacity="0.8" />
                <circle cx="25" cy="60" r="5" fill="#ffd700" opacity="0.8" />
                <circle cx="75" cy="60" r="5" fill="#ffd700" opacity="0.8" />
                <line x1="50" y1="50" x2="30" y2="35" stroke="#ffd700" strokeWidth="1.5" opacity="0.6" />
                <line x1="50" y1="50" x2="70" y2="35" stroke="#ffd700" strokeWidth="1.5" opacity="0.6" />
                <line x1="50" y1="50" x2="25" y2="60" stroke="#ffd700" strokeWidth="1.5" opacity="0.6" />
                <line x1="50" y1="50" x2="75" y2="60" stroke="#ffd700" strokeWidth="1.5" opacity="0.6" />
              </svg>
            </div>
          </div>
        </div>
        <div className="w-full lg:flex-1 p-6 sm:p-8 bg-white dark:bg-[#2a2a2a] rounded-xl shadow-xl">
          <h3 className="text-[#191970] dark:text-[#d4af37] text-xl sm:text-[1.8rem] mb-4 font-bold">{t.aiShowcase?.heading || "The Future of Marketing is Here"}</h3>
          <p className="text-[#333333] dark:text-[#e0e0e0] mb-6 sm:mb-8 leading-relaxed text-sm sm:text-[1.05rem]">
            {t.aiShowcase?.body || "I combine traditional marketing expertise with cutting-edge AI tools to create innovative, data-driven strategies that deliver exceptional results."}
          </p>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {[
              { icon: <FaRobot className="text-[#191970] dark:text-[#d4af37] text-base sm:text-lg" />, label: t.aiShowcase?.items?.[0]?.label || 'AI-Powered Content' },
              { icon: <FaChartPie className="text-[#191970] dark:text-[#d4af37] text-base sm:text-lg" />, label: t.aiShowcase?.items?.[1]?.label || 'Predictive Analytics' },
              { icon: <FaBullseye className="text-[#191970] dark:text-[#d4af37] text-base sm:text-lg" />, label: t.aiShowcase?.items?.[2]?.label || 'Audience Insights' },
              { icon: <FaBrain className="text-[#191970] dark:text-[#d4af37] text-base sm:text-lg" />, label: t.aiShowcase?.items?.[3]?.label || 'Prompt Engineering' },
            ].map(({ icon, label }, i) => (
              <div key={i} className="flex items-center gap-2 sm:gap-3">
                {icon}
                <span className="text-[#333333] dark:text-[#e0e0e0] font-medium text-xs sm:text-sm">{label}</span>
              </div>
            ))}
          </div>
          <TrackedLink
            href={`${basePath}/portfolio`}
            eventName="view_portfolio_ai_showcase"
            className="inline-block py-2.5 sm:py-3 px-6 sm:px-8 bg-[#191970] dark:bg-gradient-to-r dark:from-[#704700] dark:via-[#a67c00] dark:to-[#d4af37] text-white dark:text-[#0f0f45] rounded font-bold transition-all duration-300 hover:brightness-110 hover:shadow-lg text-sm sm:text-base"
          >
            {t.aiShowcase?.cta || "See AI Marketing in Action"}
          </TrackedLink>
        </div>
      </div>
    </div>
  </section>
);



/* ── CERTIFICATE PREVIEW ─────────────────────── */
const CertificatePreview = ({ t, basePath }: { t: Dictionary, basePath: string }) => {
  const certificates = [
    { icon: <FaAward size={40} className="text-[#ffd700] dark:text-[#d4af37]" />, title: t.certificatePreview?.items?.[0]?.title, description: t.certificatePreview?.items?.[0]?.description },
    { icon: <FaChartPie size={40} className="text-[#ffd700] dark:text-[#d4af37]" />, title: t.certificatePreview?.items?.[1]?.title, description: t.certificatePreview?.items?.[1]?.description },
    { icon: <FaUsersCog size={40} className="text-[#ffd700] dark:text-[#d4af37]" />, title: t.certificatePreview?.items?.[2]?.title, description: t.certificatePreview?.items?.[2]?.description },
  ];

  return (
    <section className="relative py-16 sm:py-20 px-4 sm:px-8 bg-white dark:bg-[#121212]">
      <div className="absolute inset-0 z-0" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(25,25,112,0.01) 10px, rgba(25,25,112,0.01) 20px),radial-gradient(circle at 20% 50%, rgba(255,215,0,0.05) 0%, transparent 50%),radial-gradient(circle at 80% 80%, rgba(25,25,112,0.05) 0%, transparent 50%)' }} />
      <div className="absolute inset-0 z-0 opacity-0 dark:opacity-100" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(166,124,0,0.01) 10px, rgba(166,124,0,0.01) 20px),radial-gradient(circle at 20% 50%, rgba(212,175,55,0.05) 0%, transparent 50%),radial-gradient(circle at 80% 80%, rgba(166,124,0,0.05) 0%, transparent 50%)' }} />
      <div className="absolute -top-12 -right-12 w-40 sm:w-48 h-40 sm:h-48 rounded-full opacity-5 dark:opacity-10 z-0 bg-gradient-to-br from-[#191970] to-[#2a2a9a] dark:from-[#704700] dark:to-[#a67c00]" />
      <div className="absolute -bottom-20 -left-20 w-56 sm:w-72 h-56 sm:h-72 rounded-full opacity-[0.03] dark:opacity-[0.05] z-0 bg-gradient-to-br from-[#ffd700] to-[#ffe347] dark:from-[#d4af37] dark:to-[#f9df85]" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#191970] dark:text-[#d4af37] relative inline-block">
            {t.certificatePreview?.title || "Professional Certifications"}
            <span className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-[90px] sm:w-[100px] h-1 bg-gradient-to-r from-[#191970] to-[#ffd700] dark:from-[#704700] dark:to-[#f9df85] rounded-full" />
          </h2>
          <p className="text-[#666666] dark:text-[#b0b0b0] text-lg sm:text-xl font-medium mt-8">{t.certificatePreview?.subtitle || "Credentials that validate my expertise"}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {certificates.map((cert, index) => (
            <div key={index} className="relative group text-center bg-white dark:bg-[#2a2a2a] border border-[#e0e0e0] dark:border-[#444444] rounded-lg p-6 sm:p-8 shadow-md hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 overflow-hidden" style={{ animation: 'certificateFade 0.6s ease forwards', animationDelay: `${(index + 1) * 0.1}s`, opacity: 0 }}>
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[rgba(255,215,0,0.05)] dark:to-[rgba(212,175,55,0.05)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="flex justify-center mb-5 sm:mb-6 relative z-10 transition-transform duration-400 group-hover:scale-110">{cert.icon}</div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#191970] dark:text-[#d4af37] mb-2 relative z-10">{cert.title}</h3>
              <p className="text-[#333333] dark:text-[#e0e0e0] mb-5 sm:mb-6 text-xs sm:text-sm leading-relaxed relative z-10">{cert.description}</p>
              <Link href={`${basePath}/certificate`} className="inline-block text-[#191970] dark:text-[#d4af37] font-semibold transition-all duration-300 relative z-10 py-2 px-4 hover:text-[#ffd700] dark:hover:text-[#f9df85] hover:scale-105 text-sm">
                {t.certificatePreview?.viewCertHover || "View Certificate →"}
              </Link>
            </div>
          ))}
        </div>
        <div className="text-center mt-12 sm:mt-16">
          <Link href={`${basePath}/certificate`} className="inline-block py-3 px-6 sm:px-8 bg-[#191970] dark:bg-gradient-to-r dark:from-[#704700] dark:via-[#a67c00] dark:to-[#d4af37] text-white dark:text-[#0f0f45] font-bold rounded transition-all duration-400 hover:scale-105 hover:shadow-lg text-sm sm:text-base">
            {t.certificatePreview?.viewAll || "View All Certificates"}
          </Link>
        </div>
      </div>
    </section>
  );
};

/* ── CTA ─────────────────────────────────────── */
const Cta = ({ t, basePath }: { t: Dictionary, basePath: string }) => (
  <section className="relative py-16 sm:py-20 overflow-hidden bg-gradient-to-r from-[#191970] via-[#2a2a9a] to-[#ffd700] dark:from-[#191970] dark:via-[#704700] dark:to-[#d4af37]">
    <div className="absolute inset-0 opacity-10 dark:opacity-5 z-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,215,0,0.15) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
      <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{t.cta?.title || "Ready to Transform Your Marketing?"}</h2>
      <p className="mt-4 text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed text-white/80">
        {t.cta?.subtitle || "Let's discuss how my expertise can help achieve your business goals."}
      </p>
      <TrackedLink
        href={`${basePath}/contact`}
        eventName="get_in_touch_cta"
        className="inline-flex items-center gap-3 bg-[#191970] text-white font-bold py-3 sm:py-4 px-8 sm:px-10 rounded-lg transition-transform duration-300 hover:scale-105 shadow-lg hover:shadow-xl text-base sm:text-lg"
      >
        <span>{t.cta?.button || "Get In Touch"}</span>
        <FaArrowRight />
      </TrackedLink>
    </div>
  </section>
);

/* ── PAGE ────────────────────────────────────── */
interface HomeProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: HomeProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isSupportedLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const t = await getDictionary(locale);
  
  const baseUrl = locale === 'en' ? 'https://www.shainwaiyan.com' : `https://www.shainwaiyan.com/${locale}`;

  return {
    title: `${t.homePage.titleHighlight} | ${t.homePage.subtitle}`,
    description: t.homePage.description,
    alternates: {
      canonical: baseUrl,
      languages: {
        'en': 'https://www.shainwaiyan.com',
        'zh': 'https://www.shainwaiyan.com/zh',
        'x-default': 'https://www.shainwaiyan.com',
      },
    },
    openGraph: {
      url: baseUrl,
    },
  };
}

export const dynamic = 'force-static';
export const revalidate = 3600;

export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'zh' }
  ];
}

export default async function Home({ params }: HomeProps) {
  const { locale: rawLocale } = await params;
  const locale = isSupportedLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const basePath = locale === 'en' ? '' : `/${locale}`;
  const t = await getDictionary(locale);

  return (
    <main>
      <Hero t={t} basePath={basePath} />
      <Expertise t={t} basePath={basePath} />
      <AiShowcase t={t} basePath={basePath} />
      <WhatIDoSection t={t} basePath={basePath} />
      <CertificatePreview t={t} basePath={basePath} />
      <Cta t={t} basePath={basePath} />
    </main>
  );
}
