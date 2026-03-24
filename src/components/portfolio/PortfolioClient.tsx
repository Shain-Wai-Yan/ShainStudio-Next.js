'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';

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

// ─── Tilt card ────────────────────────────────────────────────────────────────

function TiltCard({ item, index, exploreText, isZh }: { item: any; index: number; exploreText: string; isZh: boolean }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glow, setGlow] = useState({ x: 50, y: 50 });
  const [hovered, setHovered] = useState(false);

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = (e.clientX - r.left) / r.width;
    const cy = (e.clientY - r.top) / r.height;
    setTilt({ x: (cy - 0.5) * -10, y: (cx - 0.5) * 10 });
    setGlow({ x: cx * 100, y: cy * 100 });
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={onMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setTilt({ x: 0, y: 0 }); setHovered(false); }}
      className="relative group tilt-card"
      style={{
        transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: hovered ? 'transform 0.08s ease-out' : 'transform 0.5s ease-out',
        animationDelay: `${index * 0.09}s`,
      }}
    >
      <Link
        href={item.href}
        className="
          block h-full
          bg-white dark:bg-[#0f0f28]
          border border-[#191970]/12 dark:border-[rgba(212,175,55,0.1)]
          hover:border-[#191970]/35 dark:hover:border-[rgba(212,175,55,0.32)]
          shadow-[0_2px_16px_rgba(25,25,112,0.07)] dark:shadow-none
          hover:shadow-[0_8px_40px_rgba(25,25,112,0.16)] dark:hover:shadow-[0_20px_60px_rgba(0,0,0,0.6)]
          transition-[border-color,box-shadow] duration-300
          focus:outline-none focus-visible:ring-2 focus-visible:ring-[#191970] dark:focus-visible:ring-[#ffd700]
          overflow-hidden
        "
      >
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#d4af37] via-[#ffd700] to-[#d4af37] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-400" />

        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 dark:hidden"
          style={{
            background: `radial-gradient(circle at ${glow.x}% ${glow.y}%, rgba(25,25,112,0.06) 0%, transparent 60%)`,
            opacity: hovered ? 1 : 0,
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 hidden dark:block"
          style={{
            background: `radial-gradient(circle at ${glow.x}% ${glow.y}%, rgba(212,175,55,0.09) 0%, transparent 60%)`,
            opacity: hovered ? 1 : 0,
          }}
        />

        <div className="relative z-10 flex flex-col h-full p-6 gap-4">
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-black tracking-[0.28em] uppercase tabular-nums text-[#191970]/25 dark:text-[#d4af37]/35 group-hover:text-[#191970]/50 dark:group-hover:text-[#d4af37]/60 transition-colors duration-200">
              {item.number}
            </span>
            <div className={`p-2.5 bg-[#191970]/6 dark:bg-[#d4af37]/8 border border-[#191970]/10 dark:border-[#d4af37]/12 text-[#191970] dark:text-[#d4af37] group-hover:bg-[#191970] dark:group-hover:bg-[#d4af37] group-hover:text-white dark:group-hover:text-[#0a0a1a] group-hover:border-[#191970] dark:group-hover:border-[#d4af37] transition-all duration-250`}>
              {item.icon}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p className={`text-[9px] ${isZh ? 'font-bold' : 'font-black uppercase'} tracking-[0.24em] mb-2 text-[#191970]/40 dark:text-[#d4af37]/50`} style={{ fontFamily: isZh ? 'ZCOOL QingKe HuangYou, sans-serif' : 'inherit' }}>
              {item.subtitle}
            </p>
            <h2 className={`text-[15px] ${isZh ? 'font-bold' : 'font-black'} text-[#111111] dark:text-white leading-tight mb-3 group-hover:text-[#191970] dark:group-hover:text-[#ffd700] transition-colors duration-200`} style={{ fontFamily: isZh ? 'ZCOOL XiaoWei, sans-serif' : 'inherit' }}>
              {item.title}
            </h2>
            <p className="text-xs text-[#555555] dark:text-white/40 leading-relaxed line-clamp-3 group-hover:text-[#333333] dark:group-hover:text-white/60 transition-colors duration-200" style={{ fontFamily: isZh ? 'ZCOOL QingKe HuangYou, sans-serif' : 'inherit' }}>
              {item.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {item.tags.map((tag: string) => (
              <span
                key={tag}
                className={`text-[9px] ${isZh ? 'font-bold' : 'font-bold uppercase'} tracking-wider px-2 py-0.5 bg-[#191970]/5 dark:bg-[#d4af37]/8 text-[#191970] dark:text-[#d4af37] border border-[#191970]/10 dark:border-[#d4af37]/15 group-hover:bg-[#191970]/10 dark:group-hover:bg-[#d4af37]/15 transition-colors`}
                style={{ fontFamily: isZh ? 'ZCOOL QingKe HuangYou, sans-serif' : 'inherit' }}
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#191970]/8 dark:border-white/6">
            <span className="text-xs font-black text-[#191970] dark:text-[#d4af37]">{item.stat}</span>
            <span className={`flex items-center gap-1 text-[10px] ${isZh ? 'font-black' : 'font-black uppercase'} tracking-wider text-[#191970] dark:text-[#d4af37] group-hover:gap-2.5 transition-all duration-200`}>
              {exploreText}
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
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

// ─── Scroll observer ──────────────────────────────────────────────────────────

function ScrollObserver() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('revealed')),
      { threshold: 0.1 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}

// ─── Main page ────────────────────────────────────────────────────────────────

interface Props {
  locale: 'en' | 'zh';
  t: any;
}

export default function PortfolioClient({ locale, t }: Props) {

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
  const displayFont = isZh ? "'ZCOOL XiaoWei', sans-serif" : "'Bebas Neue', sans-serif";
  const basePath = locale === 'en' ? '' : `/${locale}`;

  // Data
  const ITEMS = [
    {
      id: 'business-plans',
      href: `${basePath}/portfolio/business-plans`,
      number: '01',
      title: t.items['business-plans'].title,
      subtitle: t.items['business-plans'].subtitle,
      description: t.items['business-plans'].description,
      tags: t.items['business-plans'].tags,
      stat: t.items['business-plans'].stat,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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
      stat: t.items['marketing-plans'].stat,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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
      stat: t.items['marketing-in-motion'].stat,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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
      stat: t.items['coding-projects'].stat,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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
      stat: t.items['photography'].stat,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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
      stat: t.items['amv-editing'].stat,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="2" width="20" height="20" rx="2.18"/>
          <line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/>
          <line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/>
        </svg>
      ),
    },
  ];

  const MARQUEE = t.marquee;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=ZCOOL+QingKe+HuangYou&family=ZCOOL+XiaoWei&display=swap');
        
        .font-display { font-family: ${displayFont}; letter-spacing:0.02em; ${isZh ? 'font-weight:400;' : ''} }

        @keyframes fadeSlideUp {
          from { opacity:0; transform:translateY(28px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeSlideIn {
          from { opacity:0; transform:translateX(-20px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes scaleReveal {
          from { opacity:0; transform:scale(0.94) translateY(14px); }
          to   { opacity:1; transform:scale(1)    translateY(0); }
        }
        @keyframes marqueeScroll {
          from { transform:translateX(0); }
          to   { transform:translateX(-50%); }
        }
        @keyframes pulseRing {
          0%   { transform:scale(1);   opacity:0.7; }
          100% { transform:scale(2.5); opacity:0; }
        }
        @keyframes floatBadge {
          0%,100% { transform:translateY(0); }
          50%      { transform:translateY(-8px); }
        }
        @keyframes scanLine {
          0%   { transform:translateY(-100%); opacity:0; }
          10%  { opacity:0.6; }
          90%  { opacity:0.6; }
          100% { transform:translateY(600%); opacity:0; }
        }
        @keyframes revealBlock {
          from { opacity:0; transform:translateY(22px); }
          to   { opacity:1; transform:translateY(0); }
        }

        /* Hero stagger */
        .anim-0 { opacity:0; animation:fadeSlideIn 0.9s cubic-bezier(0.16,1,0.3,1) 0.05s forwards; }
        .anim-1 { opacity:0; animation:fadeSlideUp 1s  cubic-bezier(0.16,1,0.3,1) 0.18s forwards; }
        .anim-2 { opacity:0; animation:fadeSlideUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.42s forwards; }
        .anim-3 { opacity:0; animation:fadeSlideUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.62s forwards; }

        /* Card reveal */
        .tilt-card { opacity:0; animation:scaleReveal 0.55s cubic-bezier(0.16,1,0.3,1) both; }

        /* Marquee */
        .marquee-track { animation:marqueeScroll 26s linear infinite; }
        .marquee-track:hover { animation-play-state:paused; }

        /* CTA ring */
        .cta-ring::after {
          content:''; position:absolute; inset:0;
          border:2px solid currentColor;
          animation:pulseRing 2s cubic-bezier(0.4,0,0.6,1) infinite;
          pointer-events:none;
        }

        /* Floating ✦ */
        .float-star { animation:floatBadge 3.6s ease-in-out infinite; }

        /* Scan line across hero */
        .scan-line {
          position:absolute; left:0; right:0; height:2px;
          background:linear-gradient(90deg,transparent,rgba(212,175,55,0.3),transparent);
          animation:scanLine 6s ease-in-out infinite;
          pointer-events:none;
        }

        /* Outline headline */
        .outline-on-navy {
          -webkit-text-stroke:2px rgba(255,215,0,0.6);
          color:transparent;
        }
        .outline-on-dark {
          -webkit-text-stroke:1.5px rgba(212,175,55,0.55);
          color:transparent;
        }

        /* Diagonal clip */
        .clip-diag { clip-path:polygon(0 5%,100% 0%,100% 95%,0% 100%); }

        /* Scroll reveal */
        .reveal { opacity:0; transform:translateY(20px); transition:opacity 0.75s cubic-bezier(0.16,1,0.3,1),transform 0.75s cubic-bezier(0.16,1,0.3,1); }
        .reveal.revealed { opacity:1; transform:translateY(0); }

        /* Card hover top bar */
        .duration-400 { transition-duration:400ms; }

        /* Ink brush bg overlay — light mode only */
        .ink-grid {
          background-image:
            linear-gradient(rgba(255,215,0,0.04) 1px,transparent 1px),
            linear-gradient(90deg,rgba(255,215,0,0.04) 1px,transparent 1px);
          background-size:40px 40px;
        }

        /* Cards section — light mode gets a dramatic tonal bg */
        .cards-bg-light {
          background:linear-gradient(160deg,#f0f0f8 0%,#fafafa 40%,#eef0f8 100%);
        }
      `}</style>

      <ScrollObserver />

      <div className="min-h-screen bg-white dark:bg-[#0a0a1a] transition-colors duration-300">

        {/* ══════════════════════════════════════════════════════════════════
            HERO — Navy in light mode (same drama as dark mode)
        ══════════════════════════════════════════════════════════════════ */}
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
                  <path d="M12 5v14M5 12l7 7 7-7"/>
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

        {/* ══════════════════════════════════════════════════════════════════
            MARQUEE — Navy bg in light mode to bridge hero into content
        ══════════════════════════════════════════════════════════════════ */}
        <div className="overflow-hidden border-y border-[#ffd700]/20 bg-[#0f0f45] dark:bg-[#0a0a1a] dark:border-[#d4af37]/10 py-3.5">
          <div className="flex whitespace-nowrap marquee-track select-none">
            {[...MARQUEE, ...MARQUEE].map((tStr, i) => (
              <span
                key={i}
                className={`inline-flex items-center px-5 text-[10px] ${isZh ? 'font-bold' : 'font-black uppercase'} tracking-[0.18em] ${
                  tStr === '✦' ? 'text-[#ffd700]' : 'text-white/25 dark:text-white/20'
                }`}
                style={{ fontFamily: isZh ? 'ZCOOL QingKe HuangYou, sans-serif' : 'inherit' }}
              >
                {tStr}
              </span>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            CARDS GRID — Elevated off-white in light, near-black in dark
        ══════════════════════════════════════════════════════════════════ */}
        <section
          id="work"
          className="cards-bg-light dark:bg-[#0a0a1a] py-24"
        >
          <div className="max-w-7xl mx-auto px-6 sm:px-10">

            {/* Section header */}
            <div className="reveal flex items-end justify-between mb-14">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-px w-8 bg-[#191970] dark:bg-[#d4af37]" />
                  <span className={`text-[9px] ${isZh ? 'font-bold' : 'font-black uppercase'} tracking-[0.3em] text-[#191970] dark:text-[#d4af37]`} style={{ fontFamily: isZh ? 'ZCOOL QingKe HuangYou, sans-serif' : 'inherit' }}>
                    {t.cards.eyebrow}
                  </span>
                </div>
                <h2 className="font-display text-[#191970] dark:text-black leading-none" style={{ fontSize: 'clamp(2.8rem,6vw,5rem)' }}>
                  {t.cards.headline}
                </h2>
              </div>
              <p className="hidden sm:block text-xs text-[#555] dark:text-black max-w-[200px] text-right leading-relaxed" style={{ fontFamily: isZh ? 'ZCOOL QingKe HuangYou, sans-serif' : 'inherit' }}>
                {t.cards.sub}
              </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ITEMS.map((item, i) => (
                <TiltCard key={item.id} item={item} index={i} exploreText={t.cards.explore} isZh={isZh} />
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            DIAGONAL CTA — Navy in both modes for brand consistency
        ══════════════════════════════════════════════════════════════════ */}
        <div className="clip-diag bg-[#191970] dark:bg-[#0f0f2e] py-32 relative overflow-hidden">

          {/* Gold dust radial glows */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 rounded-full blur-[90px] bg-[#ffd700]/8 pointer-events-none" aria-hidden="true" />
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-60 h-60 rounded-full blur-[70px] bg-white/5 pointer-events-none" aria-hidden="true" />

          {/* Dot matrix */}
          <div
            className="absolute inset-0 pointer-events-none opacity-25"
            style={{
              backgroundImage: 'radial-gradient(circle,rgba(255,215,0,0.2) 1px,transparent 1px)',
              backgroundSize: '22px 22px',
            }}
            aria-hidden="true"
          />

          <div className="reveal relative z-10 max-w-3xl mx-auto px-6 text-center">
            <p className={`text-[9px] ${isZh ? 'font-bold' : 'font-black uppercase'} tracking-[0.35em] text-[#ffd700]/65 mb-5`} style={{ fontFamily: isZh ? 'ZCOOL QingKe HuangYou, sans-serif' : 'inherit' }}>
               {t.cta.eyebrow}
            </p>
            <h2 className="font-display text-white leading-[0.9] mb-6" style={{ fontSize: 'clamp(2.8rem,8vw,7rem)' }}>
              {t.cta.headline[0]}<br />
              <span className="outline-on-navy">{t.cta.headline[1]}</span><br />
              {t.cta.headline[2]}
            </h2>
            <p className="text-white/45 text-sm leading-relaxed mb-10 max-w-md mx-auto" style={{ fontFamily: isZh ? 'ZCOOL QingKe HuangYou, sans-serif' : 'inherit' }}>
              {t.cta.p}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href={`${basePath}/contact`}
                className={`relative inline-flex items-center gap-2.5 px-10 py-3.5 ${isZh ? 'font-bold' : 'font-black uppercase tracking-[0.1em]'} text-sm text-[#0f0f45] overflow-hidden cta-ring hover:bg-[#ffe347] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd700]/50 bg-[#ffd700]`}
                style={{ fontFamily: isZh ? 'ZCOOL QingKe HuangYou, sans-serif' : 'inherit' }}
              >
                {t.cta.btnContact}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
              <Link
                href={`${basePath}/about`}
                className={`inline-flex items-center gap-2 px-10 py-3.5 font-bold text-sm ${isZh ? '' : 'uppercase tracking-[0.1em]'} border border-[#ffd700]/35 text-[#ffd700]/75 hover:bg-white/5 hover:border-[#ffd700]/60 hover:text-[#ffd700] transition-all duration-200 focus:outline-none`}
                style={{ fontFamily: isZh ? 'ZCOOL QingKe HuangYou, sans-serif' : 'inherit' }}
              >
                {t.cta.btnAbout}
              </Link>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            FOOTER NAV
        ══════════════════════════════════════════════════════════════════ */}
        <footer className="border-t border-[#191970]/8 dark:border-[#d4af37]/8 bg-[#f8f9fa] dark:bg-black/25 py-10">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-6">
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

      </div>
    </>
  );
}
