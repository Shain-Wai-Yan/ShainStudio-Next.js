"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsapSetup";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface ProjectDef { tag: string; award?: string; title: string; desc: string; href: string; }
interface GsapBentoProps {
  projects: ProjectDef[];
  locale: string;
}

export default function GsapBento({ projects, locale }: GsapBentoProps) {
  const containerRef = useRef<HTMLElement>(null);
  const scrollWrapperRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLAnchorElement | null)[]>([]);

  useGSAP(
    () => {
      // Pin horizontal scroll section
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top", // trigger when top of section hits top of viewport
          end: "+=300%", // scroll 3x the height to scrub through horizontal
          pin: true,     // pin the container
          scrub: 1,      // scrub the animation
          anticipatePin: 1,
        },
      });

      // Move the wrapper to the left horizontally based on its total width
      tl.to(scrollWrapperRef.current, {
        x: () => {
          // calculate how much to translate horizontally
          const wrapperWidth = scrollWrapperRef.current?.scrollWidth || 0;
          const containerWidth = window.innerWidth;
          // stop when the right edge of the wrapper hits the right edge of the screen
          return -(wrapperWidth - containerWidth + 64); // 64 is padding
        },
        ease: "none",
      });

      // Magnetic hover on cards (very Awwwards style)
      const cleanupFns: (() => void)[] = [];

      cardsRef.current.forEach((card) => {
        if (!card) return;

        const xTo = gsap.quickTo(card, "x", { duration: 0.8, ease: "power3.out" });
        const yTo = gsap.quickTo(card, "y", { duration: 0.8, ease: "power3.out" });

        const handleMouseMove = (e: MouseEvent) => {
          const rect = card.getBoundingClientRect();
          const relX = e.clientX - rect.left;
          const relY = e.clientY - rect.top;

          const xPos = (relX / rect.width - 0.5) * 30; // max move 30px
          const yPos = (relY / rect.height - 0.5) * 30;

          xTo(xPos);
          yTo(yPos);
        };

        const handleMouseLeave = () => {
          xTo(0);
          yTo(0);
        };

        card.addEventListener("mousemove", handleMouseMove);
        card.addEventListener("mouseleave", handleMouseLeave);

        cleanupFns.push(() => {
          card.removeEventListener("mousemove", handleMouseMove);
          card.removeEventListener("mouseleave", handleMouseLeave);
        });
      });

      return () => {
        cleanupFns.forEach((fn) => fn());
      };
    },
    { scope: containerRef }
  );

  if (!projects || projects.length === 0) return null;

  return (
    <section ref={containerRef} className="h-screen relative z-20 bg-[#fafafa] dark:bg-[#0f0f2a] flex flex-col justify-center overflow-hidden">
      <div className="absolute top-12 md:top-24 left-6 md:left-12 z-30">
        <h2 className="text-5xl md:text-8xl font-serif tracking-tighter" style={{ fontFeatureSettings: '"kern" 1, "liga" 1' }}>
          <span className="text-[#1e1e48] dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-[#bf953f] dark:via-[#fcf6ba] dark:to-[#b38728] drop-shadow-sm pb-2 inline-block">
            The Work I&apos;m Proud Of.
          </span>
        </h2>
        <div className="w-24 h-[1px] bg-[#d4af37] mt-2"></div>
      </div>

      {/* Horizontal scroll wrapper container */}
      <div className="mt-32 w-full pl-6 md:pl-12">
        <div 
          ref={scrollWrapperRef}
          className="flex flex-row flex-nowrap gap-8 md:gap-16 w-max items-center h-[50vh]"
        >
          {projects.map((p: ProjectDef, i: number) => {
            const isExternal = p.href.startsWith('http');
            const targetHref = isExternal ? p.href : `/${locale}${p.href}`;
            
            return (
              <Link
                key={i}
                href={targetHref}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                ref={(el) => {
                  cardsRef.current[i] = el;
                }}
                className={`group block relative rounded-[2rem] overflow-hidden bg-white dark:bg-[#1e1e48] border border-[#1e1e48]/5 dark:border-[#d4af37]/10 hover:border-[#d4af37]/50 dark:hover:border-[#d4af37]/60 transition-colors shadow-xl shadow-black/5 dark:shadow-none min-w-[80vw] md:min-w-[400px] max-w-[500px] h-full`}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Background glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/0 to-transparent group-hover:from-[#d4af37]/5 dark:group-hover:from-[#d4af37]/10 transition-all duration-700 pointer-events-none z-0"></div>

                <div className="p-8 md:p-12 h-full flex flex-col justify-between relative z-10 w-full">
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-8">
                      <span className="px-4 py-1.5 bg-[#1e1e48]/5 dark:bg-[#0f0f2a] text-[#1e1e48]/70 dark:text-[#d4af37]/90 rounded-full text-xs font-bold tracking-[0.2em] uppercase">
                        {p.tag}
                      </span>
                      {p.award && (
                        <span className="px-4 py-1.5 bg-[#d4af37]/10 dark:bg-[#d4af37]/20 text-[#a67c00] dark:text-[#d4af37] rounded-full text-xs font-bold tracking-[0.1em]">
                          {p.award}
                        </span>
                      )}
                    </div>
                    <h3 className="text-4xl md:text-5xl lg:text-5xl font-serif text-[#1e1e48] dark:text-white mb-6 group-hover:text-[#d4af37] dark:group-hover:text-[#d4af37] transition-colors tracking-tight leading-[1.1]">
                      {p.title}
                    </h3>
                  </div>

                  <div className="mt-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <p className="text-base md:text-lg text-[#1e1e48]/70 dark:text-gray-300 max-w-sm leading-relaxed font-light">
                      {p.desc}
                    </p>
                    <div className="w-16 h-16 rounded-full border border-[#1e1e48]/20 dark:border-[#d4af37]/30 flex items-center justify-center shrink-0 group-hover:border-[#d4af37] group-hover:bg-[#d4af37] group-hover:text-white dark:group-hover:text-[#1e1e48] transition-all duration-300 transform group-hover:scale-110 shadow-sm">
                      <ArrowUpRight className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
          
          {/* View More Card */}
          <Link
             href={`/${locale}/portfolio`}
             className="group flex flex-col items-center justify-center min-w-[30vw] md:min-w-[300px] h-full rounded-[2rem] border-2 border-dashed border-[#1e1e48]/20 dark:border-[#d4af37]/30 hover:border-[#d4af37] dark:hover:border-[#d4af37] transition-all bg-transparent"
          >
             <span className="text-2xl font-serif text-[#1e1e48] dark:text-[#d4af37] mb-4 group-hover:scale-110 transition-transform tracking-tight">View All</span>
             <div className="w-12 h-12 rounded-full border border-[#1e1e48]/20 dark:border-[#d4af37]/30 flex items-center justify-center group-hover:bg-[#d4af37] group-hover:text-white dark:group-hover:text-[#1e1e48] transition-all shadow-sm">
                 <ArrowUpRight className="w-5 h-5" />
             </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
