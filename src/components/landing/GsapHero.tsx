"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsapSetup";
import { Play, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import HeroTypewriter from "../HeroTypewriter";
import CImage from "@/components/ui/CImage";
import StatueHoverReveal from "./StatueHoverReveal";

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
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Entrance timeline — built paused; fromTo applies the hidden "from"
      // states immediately, then we play once the statue image has painted
      // (or after a bounded fallback) so the reveal never animates over a
      // still-decoding image.
      const tl = gsap.timeline({ paused: true });

      // 1. Reveal margins, grid lines, and tags
      tl.fromTo(
        [".hero-fade-up-1", ".hero-grid-line"],
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 1.1, ease: "power4.out", stagger: 0.1 }
      );

      // 2. Staggered reveal of the three sliced panels of the statue collage
      tl.fromTo(
        ".hero-statue-slice-left",
        { y: 60, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: "power3.out" },
        "-=0.6"
      );
      tl.fromTo(
        ".hero-statue-slice-center",
        { y: 80, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: "power3.out" },
        "-=1.0"
      );
      tl.fromTo(
        ".hero-statue-slice-right",
        { y: 70, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: "power3.out" },
        "-=1.0"
      );

      // 3. Staggered fade in of main text blocks
      tl.fromTo(
        ".hero-fade-up-2",
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, stagger: 0.12, duration: 0.9, ease: "power2.out" },
        "-=0.8"
      );

      // Floating animations: staggered bobs for the three collage panels to create an organic sliced wave.
      // Created paused: they animate the same `y` the entrance timeline owns, so they
      // only start once the entrance completes. Collected so they can also be paused
      // whenever the hero scrolls out of view instead of running forever.
      const floatTweens = [
        gsap.to(".hero-statue-slice-left", {
          y: -10,
          duration: 4.8,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          paused: true,
        }),
        gsap.to(".hero-statue-slice-center", {
          y: 12,
          duration: 5.2,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          paused: true,
        }),
        gsap.to(".hero-statue-slice-right", {
          y: -6,
          duration: 4.5,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          paused: true,
        }),
        // Float the abstract circular background sun disks
        gsap.to(".hero-collage-sun", {
          y: -12,
          x: 8,
          duration: 8,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          paused: true,
        }),
        gsap.to(".hero-collage-moon", {
          y: 10,
          x: -6,
          duration: 10,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          paused: true,
        }),
      ];

      let floatsEnabled = false;
      const heroInView = ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => {
          if (!floatsEnabled) return;
          floatTweens.forEach((t) => (self.isActive ? t.play() : t.pause()));
        },
      });

      tl.eventCallback("onComplete", () => {
        floatsEnabled = true;
        if (heroInView.isActive) floatTweens.forEach((t) => t.play());
      });

      // Scroll parallax timeline
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
          yPercent: 15,
          scale: 1.02,
          ease: "none",
        })
        .to(
          ".hero-content-split",
          {
            yPercent: -12,
            opacity: 0.15,
            ease: "power1.inOut",
          },
          "<"
        );

      // Play the entrance once fonts + the statue image are ready, racing a
      // bounded fallback so a slow network can never hold the reveal hostage.
      let cancelled = false;
      const statueImg =
        containerRef.current?.querySelector<HTMLImageElement>(
          ".hero-statue-slice-center img"
        );
      const imageReady =
        statueImg && !statueImg.complete
          ? statueImg.decode().catch(() => {})
          : Promise.resolve();
      const ready = Promise.all([document.fonts.ready, imageReady]);
      const fallback = new Promise((resolve) => setTimeout(resolve, 800));

      Promise.race([ready, fallback]).then(() => {
        if (!cancelled) tl.play();
      });

      return () => {
        cancelled = true;
      };
      });
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="relative min-h-[95vh] md:min-h-screen flex items-center pt-28 pb-16 overflow-hidden bg-white dark:bg-[#121212] selection:bg-[#ffd700]/30 selection:text-[#191970] dark:selection:text-white"
    >
      {/* Parallax Background Layer with Architectural Lines */}
      <div className="hero-bg-layer absolute inset-0 -z-10 bg-white dark:bg-[#121212] pointer-events-none overflow-hidden">
        {/* Fine Art Grain / Noise Overlay */}
        <div className="absolute inset-0 bg-noise opacity-[0.03] dark:opacity-[0.05] mix-blend-overlay"></div>
        
        {/* Luxury Museum Grid Lines */}
        <div className="absolute inset-0 z-0">
          <div className="hero-grid-line absolute left-[8%] top-0 w-[1px] h-full bg-gray-100 dark:bg-white/5 opacity-60"></div>
          <div className="hero-grid-line absolute right-[8%] top-0 w-[1px] h-full bg-gray-100 dark:bg-white/5 opacity-60"></div>
          <div className="hero-grid-line absolute top-[18%] left-0 w-full h-[1px] bg-gray-100 dark:bg-white/5 opacity-40"></div>
          <div className="hero-grid-line absolute bottom-[18%] left-0 w-full h-[1px] bg-gray-100 dark:bg-white/5 opacity-40"></div>
        </div>

        {/* Brand Ambient Color Glows (Midnight Blue & Gold) — radial-gradients
            instead of blur-[120px]+ filters, which cause severe paint cost (see GsapCta) */}
        <div
          className="absolute top-0 right-0 w-[900px] h-[900px] rounded-full translate-x-1/4 -translate-y-1/4 dark:hidden"
          style={{ background: "radial-gradient(circle, rgba(255, 215, 0, 0.05) 0%, rgba(255, 215, 0, 0) 60%)" }}
        ></div>
        <div
          className="absolute top-0 right-0 w-[900px] h-[900px] rounded-full translate-x-1/4 -translate-y-1/4 hidden dark:block"
          style={{ background: "radial-gradient(circle, rgba(212, 175, 55, 0.04) 0%, rgba(212, 175, 55, 0) 60%)" }}
        ></div>
        <div
          className="absolute bottom-0 left-0 w-[800px] h-[800px] rounded-full -translate-x-1/2 translate-y-1/4 dark:hidden"
          style={{ background: "radial-gradient(circle, rgba(25, 25, 112, 0.05) 0%, rgba(25, 25, 112, 0) 60%)" }}
        ></div>
        <div
          className="absolute bottom-0 left-0 w-[800px] h-[800px] rounded-full -translate-x-1/2 translate-y-1/4 hidden dark:block"
          style={{ background: "radial-gradient(circle, rgba(25, 25, 112, 0.10) 0%, rgba(25, 25, 112, 0) 60%)" }}
        ></div>
      </div>

      {/* Viewport Frame Grid Lines (Modeled directly after Open Design) */}
      <div className="hidden xl:block absolute left-[3.8rem] top-0 w-[1px] h-full bg-[#191970]/10 dark:bg-[#d4af37]/10 z-20 pointer-events-none" />
      <div className="hidden xl:block absolute right-[3.8rem] top-0 w-[1px] h-full bg-[#191970]/10 dark:bg-[#d4af37]/10 z-20 pointer-events-none" />
      <div className="hidden xl:block absolute top-24 left-[3.8rem] right-[3.8rem] h-[1px] bg-[#191970]/10 dark:bg-[#d4af37]/10 z-20 pointer-events-none" />
      <div className="hidden xl:block absolute bottom-12 left-[3.8rem] right-[3.8rem] h-[1px] bg-[#191970]/10 dark:bg-[#d4af37]/10 z-20 pointer-events-none" />

      {/* LEFT Sidebar: text lives inside the strip between page edge and border line */}
      <div className="hidden xl:flex absolute left-0 top-0 bottom-0 w-[3.8rem] items-center justify-center pointer-events-none z-20 select-none">
        <span
          className="text-[9px] tracking-[0.3em] font-mono text-[#191970]/50 dark:text-[#d4af37]/60 uppercase whitespace-nowrap"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          Systems • Marketing • AI Architecture
        </span>
      </div>

      {/* RIGHT Sidebar: text lives inside the strip between border line and page edge */}
      <div className="hidden xl:flex absolute right-0 top-0 bottom-0 w-[3.8rem] items-center justify-center pointer-events-none z-20 select-none">
        <span
          className="text-[9px] tracking-[0.3em] font-mono text-[#191970]/50 dark:text-[#d4af37]/60 uppercase whitespace-nowrap"
          style={{ writingMode: "vertical-rl" }}
        >
          Shain Studio • Vol. 02 // Issue N° 2026
        </span>
      </div>

      <div className="hero-content-split container mx-auto px-6 md:px-[6%] z-10 relative mt-4 lg:mt-0">

        {/* Mobile-only badge row — appears ABOVE the image */}
        <div className="hero-fade-up-1 flex lg:hidden items-center gap-1.5 mb-4 whitespace-nowrap">
          <span className="w-1 h-1 rounded-full bg-[#191970] dark:bg-[#ffd700] animate-pulse flex-shrink-0"></span>
          <span className="text-[7px] tracking-[0.15em] font-bold text-[#191970] dark:text-[#ffd700] uppercase font-mono">
            {hp.badge || "Available for Collaboration"}
          </span>
          <span className="text-[7px] text-gray-300 dark:text-gray-700 flex-shrink-0">|</span>
          <span className="text-[7px] tracking-[0.15em] text-gray-400 dark:text-gray-400 font-mono uppercase">
            {hp.eyebrow || "Shain Wai Yan"}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Premium Quotation Editorial Typography */}
          {/* Left Column: text — appears SECOND on mobile, FIRST on desktop */}
          <div className="lg:col-span-7 flex flex-col justify-center order-last lg:order-first">
            
            {/* Header Micro-label block — hidden on mobile (shown above image instead) */}
            <div className="hero-fade-up-1 hidden lg:flex items-center gap-3 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[#191970] dark:bg-[#ffd700] animate-pulse"></span>
              <span className="text-[10px] tracking-[0.25em] font-bold text-[#191970] dark:text-[#ffd700] uppercase font-mono">
                {hp.badge || "Collaborators"}
              </span>
              <span className="text-gray-200 dark:text-gray-700">|</span>
              <span className="text-[10px] tracking-[0.25em] text-gray-400 dark:text-gray-400 font-mono uppercase">
                {hp.eyebrow || "Issue N° 06"}
              </span>
            </div>

            {/* Giant Quotation Hook with absolute luxury gold-gradient highlighted title */}
            <h1 className="hero-fade-up-2 text-[2.2rem] sm:text-[2.8rem] md:text-5xl lg:text-[4.3rem] font-serif text-[#191970] dark:text-gray-100 leading-[1.1] mb-6 tracking-tight" style={{ fontFeatureSettings: '"kern" 1, "liga" 1' }}>
              “{hp.title || "Architecting"}{" "}
              <span className="relative inline-block group select-none py-1.5">
                {/* Gold gradient text highlight */}
                <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#a67c00] via-[#ffd700] to-[#704700] dark:from-[#bf953f] dark:via-[#fcf6ba] dark:to-[#b38728] pr-2 drop-shadow-[0_2px_10px_rgba(212,175,55,0.15)] animate-gold-shimmer">
                  {hp.titleHighlight || "Digital Identities."}
                </span>

                {/* Elegant architectural blueprint crosshairs / ticks */}
                <span className="absolute -top-0.5 -left-2 w-2 h-2 border-t border-l border-[#d4af37]/60 dark:border-[#ffd700]/70 pointer-events-none" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 border-t border-r border-[#d4af37]/60 dark:border-[#ffd700]/70 pointer-events-none" />
                <span className="absolute -bottom-0.5 -left-2 w-2 h-2 border-b border-l border-[#d4af37]/60 dark:border-[#ffd700]/70 pointer-events-none" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 border-b border-r border-[#d4af37]/60 dark:border-[#ffd700]/70 pointer-events-none" />
                
                {/* Architectural compass/coordinate tick lines */}
                <span className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-8 h-[1px] bg-[#d4af37] dark:bg-[#ffd700] opacity-80" />
                <span className="absolute left-1/2 -bottom-3 -translate-x-1/2 w-[1px] h-2 bg-[#d4af37] dark:bg-[#ffd700] opacity-80" />

                {/* Fine geometric rule underline */}
                <span className="absolute -bottom-2 left-0 w-full h-[1px] bg-gradient-to-r from-[#d4af37] via-[#ffd700] to-transparent scale-x-100 origin-left" />
              </span>”
            </h1>

            {/* Typewriter text wrapper */}
            <div className="hero-fade-up-2 mb-8 h-8 md:h-10 text-gray-500 dark:text-[#d4af37] font-semibold tracking-wider text-xs sm:text-sm uppercase font-mono">
              <HeroTypewriter />
            </div>

            <p className="hero-fade-up-2 text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mb-8 font-light leading-relaxed">
              {hp.description ||
                "Standing on the shoulders of teams shipping digital marketing systems. I translate complex AI capabilities into visceral, premium brand realities."}
            </p>

            {/* Actions Panel */}
            <div className="hero-fade-up-2 flex flex-wrap items-center gap-6">
              <Link
                href={`/${locale}/portfolio`}
                className="group relative inline-flex items-center justify-center px-8 py-4 bg-[#191970] dark:bg-white text-white dark:text-[#121212] rounded-full font-medium overflow-hidden transition-transform hover:scale-105 active:scale-95 shadow-md z-10"
              >
                <span className="relative z-10 flex items-center font-bold text-xs tracking-widest uppercase">
                  {hp.viewPortfolio || "View Projects"}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-[waveEffect_1.5s_ease-out_infinite] skew-x-12 z-0"></div>
              </Link>

              <Link
                href={`/${locale}/contact`}
                aria-label={hp.getInTouch || "Contact"}
                className="group inline-flex items-center text-[#191970] dark:text-white font-medium hover:text-[#ffd700] dark:hover:text-[#ffd700] transition-colors"
              >
                <span className="w-11 h-11 rounded-full border border-gray-200 dark:border-gray-800 flex items-center justify-center mr-3 bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm group-hover:border-[#191970] dark:group-hover:border-[#ffd700] transition-colors">
                  <Play className="w-3.5 h-3.5 ml-0.5 fill-[#191970] dark:fill-white group-hover:fill-[#191970] dark:group-hover:fill-[#ffd700] transition-colors border-none" />
                </span>
                <span className="text-xs font-bold tracking-widest uppercase relative overflow-hidden h-4 block">
                  <span className="inline-block transition-transform duration-300 group-hover:-translate-y-full">
                    {hp.getInTouch || "Get In Touch"}
                  </span>
                  <span className="inline-block absolute left-0 top-full transition-transform duration-300 group-hover:-translate-y-full text-[#191970] dark:text-[#ffd700]">
                    {hp.getInTouch || "Get In Touch"}
                  </span>
                </span>
              </Link>
            </div>

            {/* Profile Citation Badge */}
            <div className="hero-fade-up-2 flex items-center gap-4 mt-12 pt-6 border-t border-gray-100 dark:border-gray-800/70">
              <div className="w-11 h-11 rounded-full bg-[#191970] dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center text-white font-bold font-serif shadow-sm text-sm">
                S
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-[#191970] dark:text-white leading-none">
                  Shain Wai Yan
                </h4>
                <p className="text-[10px] sm:text-[11px] font-semibold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">
                  Systems Architect & Digital Strategist
                </p>
              </div>
            </div>

          </div>

          {/* Right Column: image — appears FIRST on mobile, LAST on desktop */}
          <div className="lg:col-span-5 flex items-center justify-center lg:justify-end relative order-first lg:order-last">
            <div className="w-full max-w-[390px] sm:max-w-[430px] aspect-[4/5] relative rounded-2xl p-6 overflow-hidden bg-gray-50/80 dark:bg-gray-900/30 border border-gray-200/60 dark:border-gray-800/80 shadow-[0_16px_40px_rgba(25,25,112,0.04)] dark:shadow-2xl flex items-center justify-center group/collage">
              
              {/* Grid dot pattern behind collage */}
              <div className="absolute inset-0 bg-[radial-gradient(circle,_#e5e7eb_1px,_transparent_1px)] bg-[length:16px_16px] dark:bg-[radial-gradient(circle,_#1c1c3a_1px,_transparent_1px)] opacity-60 z-0 pointer-events-none" />

              {/* 1. Brand Sun Disk (Midnight Blue in Light, Glowing Gold in Dark) */}
              <div className="hero-collage-sun absolute w-48 h-48 rounded-full bg-[#191970] dark:bg-gradient-to-tr dark:from-[#bf953f] dark:to-[#b38728] top-[15%] left-[8%] z-10 pointer-events-none shadow-sm mix-blend-multiply dark:mix-blend-normal opacity-[0.85] dark:opacity-90" />

              {/* 2. Brand Accent Circle (Gold in Light, Midnight Blue in Dark) */}
              <div className="hero-collage-moon absolute w-36 h-36 rounded-full bg-[#ffd700]/90 dark:bg-[#191970]/30 bottom-[18%] right-[5%] z-10 pointer-events-none shadow-inner" />

              {/* 3. Floating Architectural wireframe box */}
              <div className="absolute w-20 h-20 border border-gray-300 dark:border-[#a67c00]/30 top-[40%] right-[10%] rotate-12 z-10 pointer-events-none" />

              {/* 4. Brand SVGs Leaf Branch overlay (Midnight Blue in Light, Gold in Dark) */}
              <div className="absolute top-[8%] right-[15%] w-24 h-32 z-25 pointer-events-none rotate-[25deg] opacity-75 dark:opacity-60">
                <svg viewBox="0 0 100 120" className="w-full h-full fill-none stroke-[#191970] dark:stroke-[#ffd700] stroke-[1.5]" strokeLinecap="round">
                  <path d="M50,110 C50,70 60,30 80,10" />
                  <path d="M52,90 C62,85 70,80 75,70" />
                  <path d="M50,70 C38,62 30,55 25,42" />
                  <path d="M55,50 C68,45 74,38 78,25" />
                  <path d="M48,32 C35,25 28,18 22,5" />
                  {/* Leaf shapes */}
                  <path d="M75,70 Q82,65 80,55 Q72,62 75,70 Z" fill="#191970" className="dark:fill-[#ffd700]" />
                  <path d="M25,42 Q18,35 22,25 Q30,32 25,42 Z" fill="#191970" className="dark:fill-[#ffd700]" />
                  <path d="M78,25 Q85,18 82,8 Q74,15 78,25 Z" fill="#191970" className="dark:fill-[#ffd700]" />
                  <path d="M22,5 Q15,0 20,-8 Q26,-3 22,5 Z" fill="#191970" className="dark:fill-[#ffd700]" />
                </svg>
              </div>

              {/* 5. Sliced Statue Centerpiece - Staggered slices floating independently */}
              <div className="relative w-[280px] h-[340px] z-20 flex items-center justify-center scale-105">
                
                {/* ─── LIGHT MODE STATUE SLICES (Transparent BG Statue) ─── */}
                <div className="block dark:hidden absolute inset-0 w-full h-full">
                  {/* LEFT SLICE */}
                  <div className="hero-statue-slice-left absolute inset-0 w-full h-full select-none will-change-transform" style={{ clipPath: "polygon(0 0, 36% 0, 36% 100%, 0 100%)" }}>
                    <CImage
                      src="/images/hero-statue-clean.webp"
                      alt="Left slice of Classical Statue artwork"
                      fill
                      className="object-contain mix-blend-multiply"
                      sizes="280px"
                      preload
                    />
                  </div>

                  {/* CENTER SLICE */}
                  <div className="hero-statue-slice-center absolute inset-0 w-full h-full select-none translate-y-3 will-change-transform" style={{ clipPath: "polygon(36% 0, 68% 0, 68% 100%, 36% 100%)" }}>
                    <CImage
                      src="/images/hero-statue-clean.webp"
                      alt="Center slice of Classical Statue artwork"
                      fill
                      className="object-contain mix-blend-multiply"
                      sizes="280px"
                      preload
                    />
                  </div>

                  {/* RIGHT SLICE */}
                  <div className="hero-statue-slice-right absolute inset-0 w-full h-full select-none -translate-y-1.5 will-change-transform" style={{ clipPath: "polygon(68% 0, 100% 0, 100% 100%, 68% 100%)" }}>
                    <CImage
                      src="/images/hero-statue-clean.webp"
                      alt="Right slice of Classical Statue artwork"
                      fill
                      className="object-contain mix-blend-multiply"
                      sizes="280px"
                      preload
                    />
                  </div>
                </div>

                {/* ─── DARK MODE STATUE SLICES (Dark BG Statue for Perfect Contrast) ─── */}
                <div className="hidden dark:block absolute inset-0 w-full h-full">
                  {/* LEFT SLICE */}
                  <div className="hero-statue-slice-left absolute inset-0 w-full h-full select-none will-change-transform" style={{ clipPath: "polygon(0 0, 36% 0, 36% 100%, 0 100%)" }}>
                    <CImage
                      src="/images/hero-statue.webp"
                      alt="Left slice of Classical Statue artwork"
                      fill
                      className="object-contain mix-blend-screen"
                      sizes="280px"
                      loading="eager"
                    />
                  </div>

                  {/* CENTER SLICE */}
                  <div className="hero-statue-slice-center absolute inset-0 w-full h-full select-none translate-y-3 will-change-transform" style={{ clipPath: "polygon(36% 0, 68% 0, 68% 100%, 36% 100%)" }}>
                    <CImage
                      src="/images/hero-statue.webp"
                      alt="Center slice of Classical Statue artwork"
                      fill
                      className="object-contain mix-blend-screen"
                      sizes="280px"
                      loading="eager"
                    />
                  </div>

                  {/* RIGHT SLICE */}
                  <div className="hero-statue-slice-right absolute inset-0 w-full h-full select-none -translate-y-1.5 will-change-transform" style={{ clipPath: "polygon(68% 0, 100% 0, 100% 100%, 68% 100%)" }}>
                    <CImage
                      src="/images/hero-statue.webp"
                      alt="Right slice of Classical Statue artwork"
                      fill
                      className="object-contain mix-blend-screen"
                      sizes="280px"
                      loading="eager"
                    />
                  </div>
                </div>

              </div>

              {/* Cursor-driven liquid portal — reveals the opposite theme's statue */}
              <StatueHoverReveal />

              {/* Architectural ticks on corners */}
              <div className="absolute top-3 left-3 w-4 h-[1px] bg-gray-300 dark:bg-gray-700"></div>
              <div className="absolute top-3 left-3 w-[1px] h-4 bg-gray-300 dark:bg-gray-700"></div>
              <div className="absolute bottom-3 right-3 w-4 h-[1px] bg-gray-300 dark:bg-gray-700"></div>
              <div className="absolute bottom-3 right-3 w-[1px] h-4 bg-gray-300 dark:bg-gray-700"></div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
