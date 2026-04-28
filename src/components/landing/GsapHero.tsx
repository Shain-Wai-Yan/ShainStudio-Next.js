"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsapSetup";
import { SplitTextTitle } from "./SplitTextTitle";
import { Play, ArrowRight } from "lucide-react";
import Link from "next/link";
import HeroTypewriter from "../HeroTypewriter";

interface HeroHomePageSchema {
  badge?: string;
  eyebrow?: string;
  title?: string;
  titleHighlight?: string;
  description?: string;
  viewPortfolio?: string;
  getInTouch?: string;
}

interface GsapHeroProps {
  hp: HeroHomePageSchema;
  locale: string;
}

export default function GsapHero({ hp, locale }: GsapHeroProps) {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // Butter-smooth entrance timeline
      const tl = gsap.timeline({ delay: 0.2 });

      // 1. Reveal badge and eyebrow
      tl.fromTo(
        ".hero-fade-up-1",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      );

      // 2. Reveal title chars (SplitText style)
      tl.to(
        ".split-char",
        {
          yPercent: 0,
          y: 0,
          rotate: 0,
          opacity: 1,
          stagger: 0.04,
          ease: "back.out(1.2)",
          duration: 0.8,
        },
        "-=0.4"
      );

      // 3. Reveal everything else below
      tl.fromTo(
        ".hero-fade-up-2",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, stagger: 0.1, duration: 0.8, ease: "power2.out" },
        "-=0.4"
      );

      // 4. GPU-composited background circle rotations (replaces CSS animate-spin)
      //    Using GSAP `rotation` tweens keeps these on the compositor thread only.
      gsap.to(".hero-spin-1", {
        rotation: 360,
        duration: 60,
        ease: "none",
        repeat: -1,
        transformOrigin: "center center",
      });
      gsap.to(".hero-spin-2", {
        rotation: -360,
        duration: 90,
        ease: "none",
        repeat: -1,
        transformOrigin: "center center",
      });

      // 5. Parallax fading on scroll
      const heroTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      heroTl
        .to(".hero-bg-layer", {
          yPercent: 30,
          scale: 1.05,
          ease: "none",
        })
        .to(
          ".hero-content",
          {
            yPercent: -20,
            opacity: 0,
            ease: "power1.inOut",
          },
          "<"
        );
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="relative min-h-[90vh] md:min-h-screen flex items-center pt-24 pb-12 overflow-hidden selection:bg-[#d4af37]/30 selection:text-white"
    >
      {/* Parallax Background Layer with Architectural Aesthetic */}
      <div className="hero-bg-layer absolute inset-0 -z-10 bg-slate-50 dark:bg-[#1e1e48] pointer-events-none overflow-hidden">
        {/* Subtle noise */}
        <div className="absolute inset-0 bg-noise opacity-[0.03] dark:opacity-[0.05] mix-blend-overlay"></div>
        
        {/* Awwwards style geometric architecture lines */}
        <div className="absolute inset-0 z-0">
          <div className="absolute left-1/4 top-0 w-[1px] h-full bg-gradient-to-b from-transparent via-[#1e1e48]/10 dark:via-white/5 to-transparent"></div>
          <div className="absolute left-3/4 top-0 w-[1px] h-full bg-gradient-to-b from-transparent via-[#1e1e48]/10 dark:via-white/5 to-transparent"></div>
          <div className="absolute top-1/4 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#1e1e48]/10 dark:via-white/5 to-transparent"></div>
          
          {/* GPU-composited rotating circles — driven by GSAP (transform-only, no layout/paint) */}
          <div className="hero-spin-1 absolute top-[20%] right-[15%] w-[30vh] h-[30vh] rounded-full border border-[#d4af37]/20 dark:border-[#d4af37]/10 scale-150 will-change-transform"></div>
          <div className="hero-spin-2 absolute bottom-[10%] left-[5%] w-[50vh] h-[50vh] rounded-full border border-[#1e1e48]/5 dark:border-white/5 scale-125 will-change-transform"></div>
        </div>

        {/* Brand Color Ambient Glows */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#d4af37]/10 dark:bg-[#d4af37]/10 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#1e1e48]/5 dark:bg-[#1e1e48]/80 blur-[150px] rounded-full -translate-x-1/2 translate-y-1/4"></div>
      </div>

      <div className="hero-content container mx-auto px-6 md:px-12 z-10 relative mt-10 md:mt-0">
        <div className="max-w-5xl">
          {/* Eyebrow & Badge */}
          <div className="hero-fade-up-1 flex flex-wrap items-center gap-4 mb-10">
            <span className="px-5 py-2 rounded-full border border-[#1e1e48]/10 dark:border-[#d4af37]/20 bg-white/60 dark:bg-[#1e1e48]/60 backdrop-blur-md text-xs tracking-widest font-semibold uppercase text-[#1e1e48] dark:text-[#d4af37] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)]">
              <span className="inline-block w-2 h-2 rounded-full bg-[#d4af37] mr-3 animate-pulse" aria-hidden="true"></span>
              {hp.badge || "Status"}
            </span>
            <span className="text-xs md:text-sm tracking-[0.2em] text-[#1e1e48]/75 dark:text-gray-400 font-mono uppercase">
              {hp.eyebrow || "Eyebrow"}
            </span>
          </div>

          {/* Main Kinetic Typography Title */}
          <h1 className="text-[4rem] sm:text-6xl md:text-8xl lg:text-[7.5rem] font-serif text-[#1e1e48] dark:text-gray-100 leading-[1.05] mb-8 tracking-tighter" style={{ fontFeatureSettings: '"kern" 1, "liga" 1' }}>
            <SplitTextTitle
              text={hp.title || "Architecture"}
              className="mr-4 inline-flex"
            />
            <br className="hidden md:block" />
            <span className="relative inline-block group mt-2 md:mt-0">
              <SplitTextTitle
                text={hp.titleHighlight || "Digital Identity."}
                className="inline-flex"
                charClassName="split-char inline-block translate-y-[120%] rotate-3 opacity-0 will-change-transform text-transparent bg-clip-text bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#b38728]"
              />
              <span className="absolute -bottom-4 left-0 w-full h-[2px] bg-gradient-to-r from-[#d4af37] to-transparent scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-1000 ease-out-expo"></span>
            </span>
          </h1>

          {/* Typewriter from previous session */}
          <div className="hero-fade-up-2 mb-8 h-8 md:h-10">
            <HeroTypewriter />
          </div>

          <p className="hero-fade-up-2 text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mb-12 font-light leading-relaxed">
            {hp.description ||
              "Digital Marketer. Vibe Coder. Systems Architect. I build award-winning products through AI orchestration."}
          </p>

          <div className="hero-fade-up-2 flex flex-wrap items-center gap-6">
            <Link
              href={`/${locale}/portfolio`}
              className="group relative inline-flex items-center justify-center px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-medium overflow-hidden transition-transform hover:scale-105 active:scale-95 magnetic-btn"
            >
              <span className="relative z-10 flex items-center font-semibold">
                {hp.viewPortfolio || "View Projects"}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </span>
              {/* Shine effect */}
              <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[waveEffect_1.5s_ease-out_infinite] skew-x-12 z-0"></div>
            </Link>

            <Link
              href={`/${locale}/contact`}
              aria-label={hp.getInTouch || "Contact Me"}
              className="group inline-flex items-center text-slate-900 dark:text-white font-medium hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
            >
              <span className="w-12 h-12 rounded-full border border-gray-200 dark:border-gray-800 flex items-center justify-center mr-4 group-hover:border-amber-500 dark:group-hover:border-amber-400 transition-colors bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                <Play className="w-4 h-4 ml-1" />
              </span>
              <span className="relative overflow-hidden">
                <span className="inline-block transition-transform duration-300 group-hover:-translate-y-full">
                  {hp.getInTouch || "Contact Me"}
                </span>
                <span className="inline-block absolute left-0 top-full transition-transform duration-300 group-hover:-translate-y-full text-amber-600 dark:text-amber-400">
                  {hp.getInTouch || "Contact Me"}
                </span>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
