"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitTextTitle } from "./SplitTextTitle";
import { Globe, Users, TrendingUp, Zap } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ─────────────────────────────────────────────── */
/*  TYPES                                           */
/* ─────────────────────────────────────────────── */

interface MarketingPillarData {
  index: string;
  eyebrow: string;
  title: string;
  body: string;
}

export interface GsapMarketingProps {
  data: {
    header: {
      eyebrow: string;
      line1: string;
      line2: string;
      line3: string;
      description: string;
    };
    pillars: MarketingPillarData[];
    intersection: {
      line1: string;
      line2: string;
      line3: string;
    };
    verdict: {
      eyebrow: string;
      text1: string;
      highlight1: string;
      highlight2: string;
      text2: string;
      items: string[];
    };
  };
}

const PILLAR_STYLES = [
  {
    icon: Users,
    accent: "from-[#bf953f] via-[#fcf6ba] to-[#b38728]",
    bg: "bg-[#fafafa] dark:bg-[#0a0a1a]",
  },
  {
    icon: TrendingUp,
    accent: "from-[#d4af37] via-[#f9f295] to-[#d4af37]",
    bg: "bg-white dark:bg-[#0f0f2a]",
  },
  {
    icon: Globe,
    accent: "from-[#bf953f] via-[#fcf6ba] to-[#b38728]",
    bg: "bg-[#fafafa] dark:bg-[#0a0a1a]",
  },
  {
    icon: Zap,
    accent: "from-[#d4af37] via-[#f9f295] to-[#d4af37]",
    bg: "bg-white dark:bg-[#0f0f2a]",
  },
];

/* ─────────────────────────────────────────────── */
/*  SUB‑COMPONENTS                                 */
/* ─────────────────────────────────────────────── */

function PillarCard({
  pillar,
  style,
  cardRef,
}: {
  pillar: MarketingPillarData;
  style: typeof PILLAR_STYLES[number];
  cardRef: (el: HTMLDivElement | null) => void;
}) {
  const Icon = style.icon;
  return (
    <div
      ref={cardRef}
      className={`mkt-card will-change-transform relative w-full rounded-[2rem] border border-[#1e1e48]/10 dark:border-[#d4af37]/15 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.15)] dark:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] overflow-hidden ${style.bg}`}
      style={{ height: "clamp(420px, 65vh, 680px)" }}
    >
      <div className="pointer-events-none absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#d4af37]/5 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-[#1e1e48]/5 dark:bg-[#d4af37]/5 blur-[80px]" />

      <div className="relative z-10 flex flex-col h-full justify-between p-8 md:p-14">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border border-[#1e1e48]/20 dark:border-[#d4af37]/30 flex items-center justify-center backdrop-blur-sm bg-white/50 dark:bg-black/40">
              <Icon className="w-5 h-5 text-[#1e1e48] dark:text-[#d4af37]" />
            </div>
            <p className="text-xs font-mono tracking-[0.25em] uppercase text-[#d4af37]">
              {pillar.eyebrow}
            </p>
          </div>
          <span className="text-[6rem] md:text-[8rem] font-serif font-bold leading-none text-[#1e1e48]/5 dark:text-white/5 select-none -mt-4">
            {pillar.index}
          </span>
        </div>

        <div>
          <h3 className="text-4xl md:text-6xl font-serif tracking-tighter text-[#1e1e48] dark:text-white mb-8 leading-[1.05]">
            {pillar.title}
          </h3>
          <div className="border-l-2 border-[#d4af37]/50 pl-6">
            <p className="text-base md:text-lg text-[#1e1e48]/65 dark:text-gray-300 font-light leading-relaxed max-w-2xl">
              {pillar.body}
            </p>
          </div>
        </div>

        <div className={`absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r ${style.accent} opacity-60`} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────── */
/*  MAIN SECTION                                   */
/* ─────────────────────────────────────────────── */

export default function GsapMarketing({ data }: GsapMarketingProps) {
  const containerRef = useRef<HTMLElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const intersectionRef = useRef<HTMLDivElement>(null);
  const verdictRef = useRef<HTMLDivElement>(null);

  const { header, pillars, intersection, verdict } = data;

  useGSAP(
    () => {
      /* ── 1. Section header reveal ── */
      gsap.fromTo(
        ".mkt-header-line",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.12,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".mkt-header",
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );

      /* ── 2. Stacking sticky cards ── */
      cardsRef.current.forEach((card, i) => {
        if (!card) return;

        ScrollTrigger.create({
          trigger: card,
          start: "top 10%",
          endTrigger: stackRef.current,
          end: "bottom bottom",
          pin: true,
          pinSpacing: false,
          id: `mkt-pin-${i}`,
        });

        if (i < pillars.length - 1) {
          gsap.to(card, {
            scale: 1 - (pillars.length - 1 - i) * 0.025,
            opacity: 0.55,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              start: "top 10%",
              end: `+=${window.innerHeight * 0.85}`,
              scrub: 1.2,
            },
          });
        }
      });

      /* ── 3. The Intersection (Punchy Kinetics) ── */
      const tlIntersection = gsap.timeline({
        scrollTrigger: {
          trigger: intersectionRef.current,
          start: "top 75%",
          end: "bottom 80%",
          toggleActions: "play pause resume reverse",
        },
      });

      tlIntersection
        // Line 1 slides in from left
        .fromTo(
          ".intersect-line-1",
          { opacity: 0, x: -100, filter: "blur(10px)" },
          { opacity: 1, x: 0, filter: "blur(0px)", duration: 1, ease: "power4.out" }
        )
        // Line 2 slides in from right
        .fromTo(
          ".intersect-line-2",
          { opacity: 0, x: 100, filter: "blur(10px)" },
          { opacity: 1, x: 0, filter: "blur(0px)", duration: 1, ease: "power4.out" },
          "-=0.7"
        )
        // Line 3 (Punchline) explodes from center with glow
        .fromTo(
          ".intersect-line-3",
          { opacity: 0, scale: 0.5, y: 50, filter: "blur(20px)" },
          { opacity: 1, scale: 1, y: 0, filter: "blur(0px)", duration: 1.2, ease: "elastic.out(1, 0.5)" },
          "-=0.4"
        );

      /* ── 4. The Verdict (Enhanced Entrance) ── */
      const tlVerdict = gsap.timeline({
        scrollTrigger: {
          trigger: verdictRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      });

      // Eyebrow
      tlVerdict.fromTo(
        ".verdict-eyebrow",
        { opacity: 0, letterSpacing: "0.5em" },
        { opacity: 1, letterSpacing: "0.25em", duration: 1, ease: "power3.out" }
      );

      // Main Text words
      tlVerdict.fromTo(
        ".verdict-word",
        { opacity: 0, y: 30, rotateX: 45 },
        { opacity: 1, y: 0, rotateX: 0, stagger: 0.05, duration: 0.8, ease: "back.out(1.5)" },
        "-=0.6"
      );

      // Checkmark Items with elastic arrow slide
      tlVerdict.fromTo(
        ".verdict-item-line",
        { width: 0, alpha: 0 },
        { width: "2rem", alpha: 1, stagger: 0.1, duration: 0.6, ease: "power3.out" },
        "-=0.2"
      );
      tlVerdict.fromTo(
        ".verdict-item-text",
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, stagger: 0.1, duration: 0.8, ease: "power2.out" },
        "<+0.2"
      );

    },
    { scope: containerRef, dependencies: [pillars] }
  );

  return (
    <section ref={containerRef} className="relative z-10 bg-[#fafafa] dark:bg-black overflow-hidden">
      
      {/* ── HEADER ── */}
      <div className="mkt-header pt-28 md:pt-40 pb-16 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="mkt-header-line flex items-center gap-4 mb-10">
          <span className="w-12 h-[1px] bg-[#d4af37]" />
          <span className="text-[#1e1e48]/60 dark:text-[#d4af37] text-xs md:text-sm font-bold tracking-[0.25em] uppercase font-mono">
            {header.eyebrow}
          </span>
        </div>

        <h2 className="mkt-header-line text-5xl md:text-7xl lg:text-[5.5rem] font-serif tracking-tighter leading-[1.05] text-[#1e1e48] dark:text-white mb-6" style={{ fontFeatureSettings: '"kern" 1, "liga" 1' }}>
          <SplitTextTitle text={header.line1} className="block mb-1" />
          <SplitTextTitle text={header.line2} className="block mb-1" />
          <span className="block">
            <SplitTextTitle
              text={header.line3}
              className="inline-flex"
              charClassName="split-char-mkt inline-block translate-y-[120%] rotate-3 opacity-0 will-change-transform text-transparent bg-clip-text bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#b38728]"
            />
          </span>
        </h2>

        <p className="mkt-header-line text-base md:text-xl text-[#1e1e48]/55 dark:text-gray-400 max-w-2xl font-light leading-relaxed">
          {header.description}
        </p>
      </div>

      {/* ── STACKING CARDS ── */}
      <div ref={stackRef} className="relative px-6 md:px-12 max-w-6xl mx-auto" style={{ paddingBottom: `${pillars.length * 14}vh` }}>
        {pillars.map((pillar, i) => (
          <div key={i} className="mb-12" style={{ marginTop: i === 0 ? 0 : "4vh" }}>
            <PillarCard 
              pillar={pillar} 
              style={PILLAR_STYLES[i]}
              cardRef={(el) => { cardsRef.current[i] = el; }} 
            />
          </div>
        ))}
      </div>

      {/* ── THE INTERSECTION (Punchy Kinetics) ── */}
      <div ref={intersectionRef} className="px-6 md:px-12 max-w-6xl mx-auto pb-32 md:pb-48 mt-[-8vh]">
        <div className="relative text-center flex flex-col items-center justify-center space-y-6 md:space-y-8">
          
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[600px] h-[300px] bg-[#d4af37]/5 blur-[120px] rounded-full pointer-events-none" />

          <p className="intersect-line-1 text-2xl md:text-5xl lg:text-6xl font-serif tracking-tight text-[#1e1e48]/40 dark:text-white/30 italic">
            {intersection.line1}
          </p>
          <p className="intersect-line-2 text-2xl md:text-5xl lg:text-6xl font-serif tracking-tight text-[#1e1e48]/40 dark:text-white/30 italic">
            {intersection.line2}
          </p>
          
          <div className="pt-8 intersect-line-3 relative">
            <h3 className="text-4xl md:text-7xl lg:text-[5.5rem] font-serif font-bold tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#b38728] drop-shadow-[0_0_30px_rgba(212,175,55,0.4)]">
              {intersection.line3.split(" ").map((word, i, arr) => (
                <React.Fragment key={i}>
                  {word}{" "}
                  {i === Math.floor(arr.length / 2) && <br className="hidden md:block" />}
                </React.Fragment>
              ))}
            </h3>
            {/* Sparkles / accents */}
            <div className="absolute -top-4 -right-8 text-[#d4af37] opacity-60 animate-pulse">✦</div>
            <div className="absolute -bottom-8 -left-4 text-[#d4af37] opacity-40 animate-pulse delay-150">✦</div>
          </div>

        </div>
      </div>

      {/* ── THE VERDICT (Enhanced Animation) ── */}
      <div ref={verdictRef} className="px-6 md:px-12 max-w-6xl mx-auto pb-32 md:pb-40 border-t border-[#1e1e48]/8 dark:border-[#d4af37]/10 pt-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-center">
          
          <div>
            <p className="verdict-eyebrow text-xs font-mono tracking-[0.25em] uppercase text-[#d4af37] mb-8 will-change-transform flex items-center gap-4">
               <span className="w-8 h-[1px] bg-[#d4af37]"></span> {verdict.eyebrow}
            </p>
            <p className="text-3xl md:text-5xl font-serif text-[#1e1e48] dark:text-white tracking-tight leading-[1.1] md:leading-[1.15]" style={{ perspective: "1000px" }}>
              {/* Word by word split for animation */}
              {verdict.text1.split(" ").map((w,i)=>(
                 <span key={i} className="verdict-word inline-block mr-[0.25em] will-change-transform">{w}</span>
              ))}
              <span className="verdict-word inline-block mr-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#b38728] will-change-transform">
                {verdict.highlight1}
              </span>
              <span className="verdict-word inline-block mr-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#b38728] will-change-transform">
                {verdict.highlight2}
              </span>
              <br className="hidden md:block"/>
              {verdict.text2.split(" ").map((w,i)=>(
                 <span key={`b-${i}`} className="verdict-word inline-block mr-[0.25em] will-change-transform">{w}</span>
              ))}
            </p>
          </div>
          
          <div className="space-y-6 md:space-y-8 pl-0 md:pl-8 border-l border-transparent md:border-[#1e1e48]/5 dark:md:border-[#d4af37]/10">
            {verdict.items.map((line, i) => (
              <div key={i} className="flex items-center gap-6 group cursor-default">
                <span className="verdict-item-line h-[2px] bg-[#d4af37]/50 group-hover:w-16 group-hover:bg-[#d4af37] transition-all duration-500 ease-out-expo will-change-[width]" />
                <span className="verdict-item-text text-lg md:text-2xl text-[#1e1e48]/70 dark:text-gray-300 font-light group-hover:text-[#1e1e48] dark:group-hover:text-white transition-colors duration-300 will-change-transform">
                  {line}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>

    </section>
  );
}
