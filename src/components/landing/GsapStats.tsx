"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsapSetup";

interface StatDef { value: number; suffix: string; label: string; }
interface GsapStatsProps {
  stats: StatDef[];
}

export default function GsapStats({ stats }: GsapStatsProps) {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Under reduced motion no tweens are created — items render visible and
      // the SSR'd final numbers stay as-is.
      mm.add("(prefers-reduced-motion: no-preference)", () => {
      // 1. Entrance animation for the items
      gsap.fromTo(
        ".stat-item",
        { opacity: 0, y: 50, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.15,
          duration: 0.8,
          ease: "back.out(1.2)",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // 2. Animate the numbers counting up using scoped selector
      gsap.utils.toArray<HTMLElement>(".stat-number").forEach((el) => {
        
        gsap.from(el, {
          textContent: 0,
          duration: 2,
          ease: "power2.out",
          snap: { textContent: 1 },
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
          },
          onUpdate: function () {
            // Using a simple textContent update is cleaner than innerHTML for numbers
            el.textContent = Math.ceil(
              Number(this.targets()[0].textContent)
            ).toString();
          },
        });
      });
      });
      return () => mm.revert();
    },
    { scope: containerRef }
  );

  if (!stats || stats.length === 0) return null;

  return (
    <section
      ref={containerRef}
      className="py-16 md:py-24 border-y border-[#1e1e48]/10 dark:border-[#d4af37]/20 bg-[#fafafa] dark:bg-black relative z-20"
    >
      <div className="container mx-auto px-6 md:px-12">
        <div className="mb-12 md:mb-16 flex items-center gap-4">
          <span className="w-8 h-[1px] bg-[#d4af37]"></span>
          <h2 className="text-[#1e1e48]/80 dark:text-[#d4af37] text-sm md:text-base font-bold tracking-widest uppercase">Numbers that speak</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((s: StatDef, i: number) => (
            <div key={i} className="stat-item flex flex-col relative group">
              {/* Subtle hover effect */}
              <div className="absolute inset-0 bg-[#1e1e48]/5 dark:bg-[#d4af37]/5 -m-4 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
              
              <div className="flex items-baseline mb-2">
                <span
                  className="stat-number text-5xl md:text-6xl font-serif font-bold text-[#1e1e48] dark:!text-white tracking-tighter"
                  data-value={s.value}
                >
                  {s.value}
                </span>
                <span className="text-2xl md:text-3xl text-[#d4af37] dark:!text-[#d4af37] font-serif ml-1 drop-shadow-sm">
                  {s.suffix}
                </span>
              </div>
              <p className="text-sm md:text-base text-[#1e1e48]/70 dark:!text-[#d4af37] font-bold tracking-widest uppercase">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
