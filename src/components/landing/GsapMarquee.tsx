"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsapSetup";

interface GsapMarqueeProps {
  items: string[];
}

export default function GsapMarquee({ items }: GsapMarqueeProps) {
  const containerRef = useRef<HTMLElement>(null);
  const marqueeInnerRef = useRef<HTMLDivElement>(null);
  // Separate ref for the rotatable band — apply transform only to this div
  // so the section itself is not repainted (fixes "non-composited animations").
  const bandRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // 1. Entrance animation — rotate the BAND div (transform-only, GPU-composited)
      gsap.fromTo(
        bandRef.current,
        { opacity: 0, rotate: 2 },
        {
          opacity: 1,
          rotate: -2,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 90%",
            end: "top 60%",
            scrub: 1,
          },
        }
      );

      // 2. Parallax on scroll
      gsap.to(marqueeInnerRef.current, {
        xPercent: -20,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.5,
        },
      });
    },
    { scope: containerRef }
  );

  const displayItems = items && items.length > 0 ? items : ["Vibe Coding", "Digital Strategy"];

  return (
    <section 
      ref={containerRef} 
      className="py-12 md:py-24 bg-transparent overflow-hidden"
      aria-label="Skills Marquee"
    >
      {/* bandRef receives the rotation — this div is the compositor layer, not the section */}
      <div
        ref={bandRef}
        className="relative -mx-4 pb-4 md:mx-0 w-[110%] -left-[5%] bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#b38728] text-[#1e1e48] border-y-2 border-[#1e1e48] dark:border-[#d4af37] shadow-2xl z-20 will-change-transform"
        style={{ opacity: 0 }}
      >
        <div 
          ref={marqueeInnerRef}
          className="flex whitespace-nowrap overflow-hidden py-4 md:py-6"
        >
          <div className="animate-[marqueeScroll_30s_linear_infinite] flex items-center min-w-max">
            {[...displayItems, ...displayItems, ...displayItems].map(
              (item, idx) => (
                <div key={idx} className="flex items-center mx-6 md:mx-10">
                  <span className="text-3xl md:text-5xl lg:text-7xl font-serif font-black uppercase tracking-tighter mix-blend-color-burn opacity-90 drop-shadow-sm">
                    {item}
                  </span>
                  <span className="mx-6 md:mx-10 text-2xl md:text-4xl text-[#1e1e48]/50">
                    ✦
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
