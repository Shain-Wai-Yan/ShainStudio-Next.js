'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { PortfolioCounts } from '@/lib/getPortfolioCounts';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// ─── Particle canvas — gold in both modes, denser on dark ─────────────────────

function ParticleField({ dark }: { dark: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let id: number;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);
    
    const col = '212,175,55';
    const count = dark ? 75 : 65;
    const pts = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.4,
      o: dark ? Math.random() * 0.38 + 0.1 : Math.random() * 0.28 + 0.08,
      p: Math.random() * Math.PI * 2,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach((p) => {
        p.p += 0.018;
        p.x = (p.x + p.vx + canvas.width) % canvas.width;
        p.y = (p.y + p.vy + canvas.height) % canvas.height;
        const a = p.o * (0.65 + 0.35 * Math.sin(p.p));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${col},${a})`;
        ctx.fill();
      });
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 90) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(${col},${(dark ? 0.07 : 0.05) * (1 - d / 90)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      id = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(id); window.removeEventListener('resize', resize); };
  }, [dark]);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true" />;
}

// ─── Animated stat ────────────────────────────────────────────────────────────

function Stat({ n, label, delay, isZh }: { n: string; label: string; delay: string; isZh: boolean }) {
  return (
    <div className="text-center" style={{ opacity: 0, animation: `fadeSlideUp 0.7s cubic-bezier(0.16,1,0.3,1) ${delay} forwards` }}>
      <div className="font-display text-[2.8rem] text-[#ffd700] dark:text-[#d4af37] leading-none drop-shadow-[0_0_12px_rgba(255,215,0,0.4)]" style={{ fontFamily: isZh ? 'ZCOOL QingKe HuangYou, sans-serif' : 'inherit' }}>{n}</div>
      <div className={`text-[9px] ${isZh ? '' : 'uppercase'} tracking-[0.22em] text-white/50 dark:text-white/35 mt-1.5 font-bold`} style={{ fontFamily: isZh ? 'ZCOOL QingKe HuangYou, sans-serif' : 'inherit' }}>{label}</div>
    </div>
  );
}

export interface PortfolioDictionary {
  hero: {
    eyebrow: string;
    headline: [string, string, string];
    subtitlePrefix: string;
    subtitleHighlight: string;
    subtitleSuffix: string;
    stats: Array<{ number: string; label: string }>;
    browseAll: string;
    featured: string;
    scroll: string;
  };
  marquee: string[];
  cards: {
    eyebrow: string;
    headline: string;
    sub: string;
    explore: string;
  };
  items: Record<string, {
    title: string;
    subtitle: string;
    description: string;
    tags: string[];
    stat: string;
  }>;
  cta: {
    eyebrow: string;
    headline: [string, string, string];
    p: string;
    btnContact: string;
    btnAbout: string;
  };
  footer: {
    signature: string;
    copyright: string;
  };
}

interface Props {
  locale: 'en' | 'zh';
  t: PortfolioDictionary;
  dynamicCounts: PortfolioCounts;
}

export default function PortfolioClient({ locale, t, dynamicCounts }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const workSectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const check = () => setDark(document.documentElement.classList.contains('dark') || mq.matches);
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    mq.addEventListener('change', check);
    return () => { obs.disconnect(); mq.removeEventListener('change', check); };
  }, []);

  const isZh = locale === 'zh';
  const displayFont = "var(--font-serif)";
  const basePath = locale === 'en' ? '' : `/${locale}`;

  const formatStat = (original: string, count: number | undefined | null) => {
    if (count === undefined || count === null) return original;
    return original.replace(/\d+/, count.toString());
  };

  const ITEMS = [
    {
      id: 'business-plans',
      href: `${basePath}/portfolio/business-plans`,
      number: '01',
      title: t.items['business-plans'].title,
      subtitle: t.items['business-plans'].subtitle,
      description: t.items['business-plans'].description,
      tags: t.items['business-plans'].tags,
      stat: formatStat(t.items['business-plans'].stat, dynamicCounts.businessPlans),
      colorAccent: 'from-[#d4af37] via-[#ffd700] to-[#d4af37]',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012-2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
        </svg>
      ),
    },
    {
      id: 'marketing-plans',
      href: `${basePath}/portfolio/marketing-plans`,
      number: '02',
      title: t.items['marketing-plans'].title,
      subtitle: t.items['marketing-plans'].subtitle,
      description: t.items['marketing-plans'].description,
      tags: t.items['marketing-plans'].tags,
      stat: formatStat(t.items['marketing-plans'].stat, dynamicCounts.marketingPlans),
      colorAccent: 'from-[#bf953f] via-[#fcf6ba] to-[#b38728]',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/>
          <path d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/>
        </svg>
      ),
    },
    {
      id: 'marketing-in-motion',
      href: `${basePath}/portfolio/marketing-in-motion`,
      number: '03',
      title: t.items['marketing-in-motion'].title,
      subtitle: t.items['marketing-in-motion'].subtitle,
      description: t.items['marketing-in-motion'].description,
      tags: t.items['marketing-in-motion'].tags,
      stat: formatStat(t.items['marketing-in-motion'].stat, dynamicCounts.marketingInMotion),
      colorAccent: 'from-[#d4af37] via-[#f9f295] to-[#d4af37]',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
      ),
    },
    {
      id: 'coding-projects',
      href: `${basePath}/portfolio/coding-projects`,
      number: '04',
      title: t.items['coding-projects'].title,
      subtitle: t.items['coding-projects'].subtitle,
      description: t.items['coding-projects'].description,
      tags: t.items['coding-projects'].tags,
      stat: formatStat(t.items['coding-projects'].stat, dynamicCounts.codingProjects),
      colorAccent: 'from-[#e6c27a] via-[#ffffff] to-[#d4af37]',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
        </svg>
      ),
    },
    {
      id: 'photography',
      href: `${basePath}/portfolio/photography`,
      number: '05',
      title: t.items['photography'].title,
      subtitle: t.items['photography'].subtitle,
      description: t.items['photography'].description,
      tags: t.items['photography'].tags,
      stat: formatStat(t.items['photography'].stat, dynamicCounts.photography),
      colorAccent: 'from-[#d4af37] via-[#ffd700] to-[#d4af37]',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
          <circle cx="12" cy="13" r="4"/>
        </svg>
      ),
    },
    {
      id: 'amv-editing',
      href: `${basePath}/portfolio/amv-editing`,
      number: '06',
      title: t.items['amv-editing'].title,
      subtitle: t.items['amv-editing'].subtitle,
      description: t.items['amv-editing'].description,
      tags: t.items['amv-editing'].tags,
      stat: formatStat(t.items['amv-editing'].stat, dynamicCounts.amvEditing),
      colorAccent: 'from-[#bf953f] via-[#fcf6ba] to-[#b38728]',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="2" width="20" height="20" rx="2.18"/>
          <line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/>
          <line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/>
        </svg>
      ),
    },
  ];

  useGSAP(() => {
    // 3. Dynamic Marquee
    const marqueeParts = gsap.utils.toArray('.marquee-part');
    const marqueeTween = gsap.to(marqueeParts, {
      xPercent: -100,
      repeat: -1,
      duration: 35,
      ease: 'linear'
    }).totalProgress(0.5);

    let scrollTimeout: NodeJS.Timeout;
    ScrollTrigger.create({
      onUpdate: (self) => {
        const velocity = Math.abs(self.getVelocity() || 0);
        const targetScale = 1 + Math.min(velocity / 150, 15);
        gsap.to(marqueeTween, {
          timeScale: targetScale,
          duration: 0.2,
          overwrite: true
        });
        
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          gsap.to(marqueeTween, { timeScale: 1, duration: 0.8, overwrite: true });
        }, 150);
      }
    });

    // 4. Horizontal Scroll Gallery
    const track = trackRef.current;
    if (track && workSectionRef.current) {
      const getScrollAmount = () => track.scrollWidth - window.innerWidth + window.innerWidth * 0.15; 

      const tween = gsap.to(track, {
        x: () => -getScrollAmount(),
        ease: "none",
      });

      ScrollTrigger.create({
        trigger: workSectionRef.current,
        start: "top top",
        end: () => `+=${getScrollAmount()}`,
        pin: true,
        animation: tween,
        scrub: 1,
        invalidateOnRefresh: true,
        anticipatePin: 1, // Fixes some pinning issues
      });

      // Parallax effect on massive numbers
      const parallaxNumbers = gsap.utils.toArray('.parallax-item');
      parallaxNumbers.forEach((item: any) => {
        gsap.to(item, {
          x: 200, 
          ease: "none",
          scrollTrigger: {
            trigger: workSectionRef.current,
            start: "top top",
            end: () => `+=${getScrollAmount()}`,
            scrub: true,
            invalidateOnRefresh: true,
          }
        });
      });
    }

    // 5. Epic CTA Reveal
    gsap.fromTo('.cta-bg-reveal',
      { clipPath: 'circle(15% at 50% 50%)' },
      { 
        clipPath: 'circle(150% at 50% 50%)', 
        ease: 'power1.inOut',
        scrollTrigger: {
          trigger: '.cta-reveal-trigger',
          start: 'top 75%',
          end: 'bottom 40%',
          scrub: true,
        }
      }
    );
    
    gsap.fromTo('.cta-content-fade',
      { opacity: 0, y: 50, scale: 0.95 },
      { 
        opacity: 1, y: 0, scale: 1, stagger: 0.1, duration: 1, ease: 'power3.out',
        scrollTrigger: {
          trigger: '.cta-reveal-trigger',
          start: 'top 55%',
          toggleActions: 'play none none reverse'
        }
      }
    );

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative bg-[#fafafa] dark:bg-black w-full min-h-screen text-[#1e1e48] dark:text-white transition-colors duration-500 overflow-hidden font-sans">

      {/* ──────────────────────────────────────────────────────────────────
          PART 1: HERO (Restored Original)
      ────────────────────────────────────────────────────────────────── */}
      <style>{`
        .font-display { font-family: ${displayFont}; letter-spacing:0.02em; ${isZh ? 'font-weight:400;' : ''} }

        @keyframes fadeSlideUp {
          from { opacity:0; transform:translateY(28px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeSlideIn {
          from { opacity:0; transform:translateX(-20px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes scanLine {
          0%   { transform:translateY(-100%); opacity:0; }
          10%  { opacity:0.6; }
          90%  { opacity:0.6; }
          100% { transform:translateY(600%); opacity:0; }
        }
        @keyframes floatBadge {
          0%,100% { transform:translateY(0); }
          50%      { transform:translateY(-8px); }
        }
        
        .anim-0 { opacity:0; animation:fadeSlideIn 0.9s cubic-bezier(0.16,1,0.3,1) 0.05s forwards; }
        .anim-1 { opacity:0; animation:fadeSlideUp 1s  cubic-bezier(0.16,1,0.3,1) 0.18s forwards; }
        .anim-2 { opacity:0; animation:fadeSlideUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.42s forwards; }
        .anim-3 { opacity:0; animation:fadeSlideUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.62s forwards; }

        .scan-line {
          position:absolute; left:0; right:0; height:2px;
          background:linear-gradient(90deg,transparent,rgba(212,175,55,0.3),transparent);
          animation:scanLine 6s ease-in-out infinite;
          pointer-events:none;
        }

        .float-star { animation:floatBadge 3.6s ease-in-out infinite; }

        .outline-on-navy {
          -webkit-text-stroke:2px rgba(255,215,0,0.6);
          color:transparent;
        }
        .outline-on-dark {
          -webkit-text-stroke:1.5px rgba(212,175,55,0.55);
          color:transparent;
        }
        
        .ink-grid {
          background-image:
            linear-gradient(rgba(255,215,0,0.04) 1px,transparent 1px),
            linear-gradient(90deg,rgba(255,215,0,0.04) 1px,transparent 1px);
          background-size:40px 40px;
        }
        
        .cta-ring::after {
          content:''; position:absolute; inset:0;
          border:2px solid currentColor;
          animation:pulseRing 2s cubic-bezier(0.4,0,0.6,1) infinite;
          pointer-events:none;
        }
        @keyframes pulseRing {
          0%   { transform:scale(1);   opacity:0.7; }
          100% { transform:scale(2.5); opacity:0; }
        }
      `}</style>

      <section className="relative min-h-[96vh] flex flex-col justify-center overflow-hidden bg-[#191970] dark:bg-[#0a0a1a]">
        <ParticleField dark={dark} />

        {/* Ink grid texture */}
        <div className="absolute inset-0 ink-grid pointer-events-none" aria-hidden="true" />

        {/* Moving scan line */}
        <div className="scan-line" aria-hidden="true" />

        {/* Deep radial vignette — adds cinematic depth in light mode */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 70% at 50% 50%, transparent 30%, rgba(10,10,40,0.55) 100%)',
          }}
          aria-hidden="true"
        />

        {/* Vertical accent lines */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {[20, 40, 60, 80].map((p, i) => (
            <div
              key={p}
              className="absolute top-0 bottom-0 w-px"
              style={{
                left: `${p}%`,
                background: 'linear-gradient(to bottom, transparent, rgba(212,175,55,0.07), transparent)',
                opacity: 0,
                animation: `fadeSlideIn 1.4s cubic-bezier(0.16,1,0.3,1) ${0.05 + i * 0.08}s forwards`,
              }}
            />
          ))}
        </div>

        {/* Corner brackets */}
        <div className="absolute top-6 right-6 w-11 h-11 border-t-2 border-r-2 border-[#ffd700]/30 anim-0" aria-hidden="true" />
        <div className="absolute bottom-6 left-6 w-11 h-11 border-b-2 border-l-2 border-[#ffd700]/30 anim-0" aria-hidden="true" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 py-28">

          {/* Eyebrow */}
          <div className="anim-0 flex items-center gap-3 mb-7">
            <div className="h-px w-10 bg-[#ffd700]" />
            <span className={`text-[10px] ${isZh ? 'font-bold' : 'font-black uppercase'} tracking-[0.3em] text-[#ffd700]`} style={{ fontFamily: isZh ? 'ZCOOL QingKe HuangYou, sans-serif' : 'inherit' }}>
              {t.hero.eyebrow}
            </span>
          </div>

          {/* Giant headline */}
          <h1 className="anim-1 font-display leading-[0.88] mb-8" style={{ fontSize: 'clamp(3.8rem,11vw,9.5rem)' }}>
            <span className="block text-white">{t.hero.headline[0]}</span>
            <span className="block outline-on-navy dark:outline-on-dark">
              {t.hero.headline[1]}
            </span>
            <span className="block text-white relative">
              {t.hero.headline[2]}
              <span className="float-star ml-3 text-[#ffd700]" style={{ fontSize: '2.2rem' }} aria-hidden="true">✦</span>
            </span>
          </h1>

          {/* Sub + stats */}
          <div className="anim-2 flex flex-col sm:flex-row items-start sm:items-end gap-8 mb-12">
            <p className="text-white/60 text-lg leading-relaxed max-w-md font-light" style={{ fontFamily: isZh ? 'ZCOOL QingKe HuangYou, sans-serif' : 'inherit' }}>
              {t.hero.subtitlePrefix}
              <em className="not-italic font-semibold text-white/90">{t.hero.subtitleHighlight}</em>
              {t.hero.subtitleSuffix}
            </p>
            <div className="flex gap-8 sm:ml-auto flex-shrink-0">
              <Stat n={t.hero.stats[0].number} label={t.hero.stats[0].label} delay="0.75s" isZh={isZh} />
              <Stat n={t.hero.stats[1].number} label={t.hero.stats[1].label} delay="0.87s" isZh={isZh} />
              <Stat n={t.hero.stats[2].number} label={t.hero.stats[2].label} delay="0.99s" isZh={isZh} />
            </div>
          </div>

          {/* CTAs */}
          <div className="anim-3 flex flex-wrap items-center gap-4">
            <a
              href="#work"
              className={`relative inline-flex items-center gap-2.5 px-8 py-3.5 ${isZh ? 'font-bold' : 'font-black uppercase tracking-[0.1em]'} text-sm text-[#0f0f45] overflow-hidden cta-ring hover:bg-[#ffe347] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd700]/50 bg-[#ffd700]`}
              style={{ fontFamily: isZh ? 'ZCOOL QingKe HuangYou, sans-serif' : 'inherit' }}
            >
              {t.hero.browseAll}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12l7 7-7 7"/>
              </svg>
            </a>
            <Link
              href={`${basePath}/portfolio/marketing-in-motion`}
              className={`inline-flex items-center gap-2.5 px-8 py-3.5 ${isZh ? 'font-bold' : 'font-bold uppercase tracking-[0.1em]'} text-sm border border-[#ffd700]/40 text-[#ffd700]/85 hover:border-[#ffd700]/70 hover:text-[#ffd700] hover:bg-white/5 transition-all duration-200 focus:outline-none`}
              style={{ fontFamily: isZh ? 'ZCOOL QingKe HuangYou, sans-serif' : 'inherit' }}
            >
              {t.hero.featured}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 anim-2">
          <div className="w-px h-10 bg-gradient-to-b from-[#ffd700]/60 to-transparent" />
          <span className={`text-[8px] tracking-[0.32em] ${isZh ? 'font-bold' : 'uppercase font-black'} text-[#ffd700]/45`} style={{ fontFamily: isZh ? 'ZCOOL QingKe HuangYou, sans-serif' : 'inherit' }}>
            {t.hero.scroll}
          </span>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          PART 2: INTERACTIVE MARQUEE
      ────────────────────────────────────────────────────────────────── */}
      <div className="relative border-y border-[#1e1e48]/10 dark:border-white/10 overflow-hidden py-6 md:py-8 bg-[#1e1e48]/[0.02] dark:bg-white/[0.02]">
        <div className="flex whitespace-nowrap opacity-80">
          {[1, 2].map((group) => (
            <div key={group} className="marquee-part flex shrink-0 justify-around items-center gap-8 md:gap-16 pl-8 md:pl-16 min-w-full">
              {t.marquee.map((text, i) => (
                <span key={i} className={`text-xl md:text-3xl font-serif tracking-widest uppercase ${text === '✦' ? 'text-[#d4af37]' : 'text-transparent bg-clip-text bg-gradient-to-r from-[#1e1e48] to-[#1e1e48]/60 dark:from-white dark:to-white/60 font-medium'}`}>
                  {text}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────
          PART 3: CINEMATIC HORIZONTAL GALLERY
      ────────────────────────────────────────────────────────────────── */}
      <section id="work" ref={workSectionRef} className="relative w-full h-screen overflow-hidden bg-[#fafafa] dark:bg-black flex flex-col justify-center py-20 md:py-0">
        
        {/* Massive Background Headline (Static, watermarked behind scrolling cards) */}
        <div className="absolute top-10 md:top-24 left-6 md:left-12 z-0 pointer-events-none w-full opacity-60 md:opacity-100">
          <div className="flex items-center gap-4 mb-4">
            <span className="w-12 h-[2px] bg-[#d4af37]"></span>
            <span className="text-xs md:text-sm font-bold uppercase tracking-[0.25em] text-[#d4af37] font-mono">
              {t.cards.eyebrow}
            </span>
          </div>
          <h2 className="text-[6rem] md:text-[8rem] lg:text-[12rem] font-serif tracking-tighter leading-none text-[#1e1e48]/5 dark:text-white/5 whitespace-nowrap">
            {t.cards.headline}
          </h2>
          <p className="text-base md:text-lg text-[#1e1e48]/60 dark:text-gray-400 max-w-sm mt-4 leading-relaxed font-light">
            {t.cards.sub}
          </p>
        </div>

        {/* Scrollable Horizontal Track */}
        <div ref={trackRef} className="absolute left-0 h-full flex flex-row items-center px-[5vw] gap-6 md:gap-20 pt-44 md:pt-20">
          {ITEMS.map((item) => (
            <div 
              key={item.id} 
              className="relative shrink-0 w-[85vw] md:w-[60vw] lg:w-[45vw] h-[75vh] md:h-[70vh] min-h-[550px] rounded-[2rem] border border-[#1e1e48]/10 dark:border-white/10 bg-white/5 dark:bg-[#0a0a1a]/80 backdrop-blur-3xl overflow-hidden group shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#1e1e48]/5 to-transparent dark:from-black/50 dark:to-transparent z-0" />
              
              {/* Giant Parallax Number filling the background of the card */}
              <div className="parallax-item absolute top-4 md:top-8 -left-4 text-[12rem] md:text-[20rem] font-serif font-black leading-none text-[#1e1e48]/5 dark:text-white/5 z-[1]">
                {item.number}
              </div>

              <Link href={item.href} className="relative z-10 w-full h-full p-8 md:p-14 flex flex-col justify-between">
                
                {/* Top Section */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full border border-[#1e1e48]/20 dark:border-white/20 flex items-center justify-center bg-transparent group-hover:bg-[#1e1e48] dark:group-hover:bg-[#d4af37] text-[#1e1e48] dark:text-[#d4af37] group-hover:text-white dark:group-hover:text-black transition-all duration-500 shadow-sm">
                    {item.icon}
                  </div>
                  <span className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#1e1e48]/60 dark:text-[#d4af37]">
                    {item.subtitle}
                  </span>
                </div>

                {/* Bottom content section */}
                <div className="mt-auto">
                  <h3 className="parallax-item text-4xl md:text-5xl lg:text-6xl font-serif text-[#1e1e48] dark:text-white tracking-tight leading-[1.1] mb-6 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#bf953f] group-hover:via-[#d4af37] group-hover:to-[#b38728] transition-all duration-500">
                    {item.title}
                  </h3>
                  
                  <div className="border-l-2 border-[#1e1e48]/20 dark:border-[#d4af37]/40 pl-6 mb-8 max-w-lg">
                    <p className="text-base md:text-lg text-[#1e1e48]/70 dark:text-gray-300 font-light leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mb-10">
                    {item.tags.map((tag) => (
                      <span key={tag} className="px-5 py-2 rounded-full border border-[#1e1e48]/10 dark:border-white/10 text-[10px] md:text-xs font-bold uppercase tracking-wider text-[#1e1e48]/80 dark:text-gray-300 bg-[#1e1e48]/5 dark:bg-white/5">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between border-t border-[#1e1e48]/10 dark:border-white/10 pt-6">
                    <span className="text-xl md:text-2xl font-serif text-[#1e1e48] dark:text-[#d4af37]">{item.stat}</span>
                    <div className="flex items-center gap-3 text-xs md:text-sm font-bold uppercase tracking-wider text-[#1e1e48] dark:text-white group-hover:text-[#d4af37] transition-all duration-500">
                      <span>{t.cards.explore}</span>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transform group-hover:translate-x-2 transition-transform duration-500">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Colored accent line on hover */}
                <div className={`absolute bottom-0 left-0 h-1.5 w-full bg-gradient-to-r ${item.colorAccent} transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-700 ease-out`} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          PART 4: CTA FOOTER REVEAL
      ────────────────────────────────────────────────────────────────── */}
      <section className="cta-reveal-trigger relative mt-20 md:mt-40 bg-transparent dark:bg-gradient-to-br dark:from-[#bf953f] dark:via-[#fcf6ba] dark:to-[#b38728] overflow-hidden rounded-t-[4rem] md:rounded-t-[6rem]">
        
        {/* Dynamic circular mask that expands on scroll */}
        <div className="cta-bg-reveal absolute inset-0 bg-[#191970] dark:bg-black will-change-[clipPath] z-0">
           {/* Deep grain overlay */}
           <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
           
           {/* Glows */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#d4af37]/10 blur-[150px] pointer-events-none" />
           <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-40 md:py-60 text-center">
          <div className="cta-content-fade flex items-center justify-center gap-4 mb-8">
            <span className="text-xs md:text-sm font-mono font-bold uppercase tracking-[0.3em] text-[#d4af37]">
              {t.cta.eyebrow}
            </span>
          </div>

          <h2 className="cta-content-fade text-5xl md:text-7xl lg:text-[7rem] font-serif tracking-tighter leading-[0.95] text-white mb-10">
             {t.cta.headline[0]}
             <span className="block mt-2 italic text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] via-[#f9f295] to-[#d4af37]">
               {t.cta.headline[1]}
             </span>
             <span className="block mt-2">
               {t.cta.headline[2]}
             </span>
          </h2>

          <p className="cta-content-fade text-lg md:text-2xl text-white/60 font-light leading-relaxed max-w-2xl mx-auto mb-16">
            {t.cta.p}
          </p>

          <div className="cta-content-fade flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href={`${basePath}/contact`} className="group relative inline-flex items-center justify-center gap-4 px-12 py-6 bg-[#d4af37] text-black rounded-full font-bold uppercase tracking-widest overflow-hidden w-full sm:w-auto">
              <span className="absolute inset-0 bg-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-0 text-black"></span>
              <span className="relative z-10 inline-flex items-center gap-3">
                {t.cta.btnContact}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="group-hover:rotate-45 transition-transform duration-500" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </span>
            </Link>

            <Link href={`${basePath}/about`} className="group inline-flex items-center justify-center gap-3 px-12 py-6 border border-white/20 text-white rounded-full font-bold uppercase tracking-widest hover:border-[#d4af37] hover:bg-[#d4af37]/10 transition-all duration-300 w-full sm:w-auto">
              {t.cta.btnAbout}
            </Link>
          </div>
        </div>

        {/* ──────────────────────────────────────────────────────────────────
            PART 5: FOOTER NAV (Original Layout Preference)
        ────────────────────────────────────────────────────────────────── */}
        <footer className="relative z-10 border-t border-[#191970]/8 dark:border-[#d4af37]/8 bg-[#f8f9fa] dark:bg-black py-10 mt-20">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 flex flex-col xl:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 grid place-items-center border border-[#191970]/25 dark:border-[#d4af37]/25">
                <span className="text-[9px] font-black text-[#191970] dark:text-[#d4af37]">S</span>
              </div>
              <span className={`text-[10px] ${isZh ? 'font-bold' : 'font-black uppercase'} tracking-[0.22em] text-[#191970]/45 dark:text-white/30`} style={{ fontFamily: isZh ? 'ZCOOL QingKe HuangYou, sans-serif' : 'inherit' }}>
                {t.footer.signature}
              </span>
            </div>
            <nav className="flex flex-wrap justify-center gap-5" aria-label="Portfolio sections">
              {ITEMS.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`text-[10px] font-semibold ${isZh ? '' : 'uppercase'} tracking-wider text-[#555555] dark:text-white/25 hover:text-[#191970] dark:hover:text-[#d4af37] transition-colors duration-200`}
                  style={{ fontFamily: isZh ? 'ZCOOL QingKe HuangYou, sans-serif' : 'inherit' }}
                >
                  {item.title}
                </Link>
              ))}
            </nav>
            <span className="text-[10px] text-[#666666]/45 dark:text-white/15" style={{ fontFamily: isZh ? 'ZCOOL QingKe HuangYou, sans-serif' : 'inherit' }}>
               {t.footer.copyright.replace('{year}', new Date().getFullYear().toString())}
            </span>
          </div>
        </footer>
      </section>

    </div>
  );
}
