"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface HomePageSchema {
  ctaTitle?: string;
  ctaHighlight?: string;
  ctaSub?: string;
  ctaButton?: string;
  ctaSecondary?: string;
}

interface GsapCtaProps {
  hp: HomePageSchema;
  locale: string;
}

export default function GsapCta({ hp, locale }: GsapCtaProps) {
  const containerRef = useRef<HTMLElement>(null);
  const bigTextRef = useRef<HTMLHeadingElement>(null);
  const solidTextRef = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      // Pin the CTA section and animate its content
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 60%",
          end: "top 10%",
          scrub: 1.5,
        },
      });

      tl.to(".cta-split-char", {
        yPercent: 0,
        y: 0,
        rotate: 0,
        opacity: 1,
        stagger: 0.1,
        ease: "power2.out",
      }).fromTo(
        ".cta-fade-up",
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.2, ease: "power2.out" },
        "-=0.5"
      );

      // High-Performance Hollow to Solid Text Effect using Clip-Path overlay
      if (solidTextRef.current) {
        gsap.fromTo(
          solidTextRef.current,
          { clipPath: "inset(0% 100% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 75%",
              end: "center center",
              scrub: 0.5,
            },
          }
        );
      }
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="py-32 md:py-48 relative bg-[#1e1e48] dark:bg-[#07071a] text-white overflow-hidden flex flex-col justify-center min-h-[90vh]"
      style={{ transform: "translateZ(0)" }}
    >
      {/* High Performance background glow (Replaced blur-[200px] which causes severe Safari rendering bugs/lag) */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] rounded-full pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, rgba(212, 175, 55, 0) 50%)' }}
      ></div>
      {/* Optimized noise (Removed mix-blend-overlay to prevent sub-pixel repainting) */}
      <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none z-0"></div>

      <div className="container mx-auto px-6 md:px-12 relative z-10 w-full">
        <div className="text-left md:text-center w-full mb-16">
          <span className="cta-fade-up block text-transparent bg-clip-text bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#b38728] tracking-[0.3em] font-mono text-sm md:text-base uppercase mb-8 font-bold">
            IT STARTS HERE
          </span>

          {/* High Performance Awwwards Standard Outline Fill Text */}
          <div className="relative inline-block text-left md:text-center mx-auto">
            {/* Base hollow outline text */}
            <h2 
              ref={bigTextRef}
              className="text-[3.5rem] sm:text-[6rem] md:text-[8rem] lg:text-[12rem] leading-[1] font-serif tracking-tighter uppercase relative z-0"
              style={{
                WebkitTextStroke: "1px rgba(212, 175, 55, 0.4)",
                color: "transparent",
              }}
            >
              {hp.ctaTitle || "Let's"} <br />
              {hp.ctaHighlight || "Work."}
            </h2>

            {/* Solid fill overlay masked via clip-path */}
            <h2 
              ref={solidTextRef}
              className="absolute top-0 left-0 w-full text-[3.5rem] sm:text-[6rem] md:text-[8rem] lg:text-[12rem] leading-[1] font-serif tracking-tighter uppercase z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#b38728] select-none pointer-events-none"
              style={{
                clipPath: "inset(0% 100% 0% 0%)",
                margin: 0
              }}
              aria-hidden="true"
            >
              {hp.ctaTitle || "Let's"} <br />
              {hp.ctaHighlight || "Work."}
            </h2>
          </div>
        </div>

        <div className="cta-fade-up flex flex-col lg:flex-row items-center justify-between border-t border-white/10 pt-12 gap-12 mt-12 md:mt-24">
          <p className="text-lg md:text-2xl text-[#f8f9fa]/70 dark:text-gray-400 max-w-2xl font-light leading-relaxed text-center lg:text-left">
            {hp.ctaSub ||
              "Whether you need a marketing strategy, a coded system, or both — I bridge the gap between vision and execution."}
          </p>

          <div className="flex shrink-0 w-full sm:w-auto justify-center">
            <Link
              href={`/${locale}/contact`}
              className="group relative inline-flex items-center justify-center pl-10 pr-4 py-4 bg-transparent border border-[#d4af37]/40 text-[#d4af37] hover:text-[#1e1e48] rounded-full font-bold overflow-hidden transition-all duration-700 w-full sm:w-auto hover:shadow-[0_0_30px_rgba(212,175,55,0.2)] hover:scale-[1.02]"
            >
              {/* Premium Gold Gradient sliding fill */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#b38728] translate-y-[100%] rounded-full group-hover:translate-y-0 transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] z-0"></div>
              
              <span className="relative z-10 flex items-center text-lg tracking-wide uppercase">
                {hp.ctaButton || "Get In Touch"}
                <div className="ml-6 w-12 h-12 rounded-full border border-[#d4af37]/30 group-hover:border-[#1e1e48]/20 flex items-center justify-center transition-all duration-500 transform group-hover:-rotate-45 bg-white/5 group-hover:bg-[#1e1e48]/10 text-[#d4af37] group-hover:text-[#1e1e48] shadow-sm">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
