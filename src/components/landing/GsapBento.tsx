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
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Pin horizontal scroll section
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top", // trigger when top of section hits top of viewport
          end: "+=300%", // scroll 3x the height to scrub through horizontal
          pin: true,     // pin the container
          scrub: 1,      // scrub the animation
          anticipatePin: 1,
          // Re-evaluate the horizontal distance (below) on every refresh so the
          // pin engages correctly on mobile, where this lazy-loaded section is
          // measured while the URL bar / layout are still settling.
          invalidateOnRefresh: true,
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

      // Magnetic hover on cards (very Awwwards style) — pointer devices only.
      // On touch, mouse events never fire, so skip the listeners entirely.
      const cleanupFns: (() => void)[] = [];
      const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

      if (supportsHover) {
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
      }

      // This section is lazy-loaded (next/dynamic) and sits below images that
      // may still be settling, so the pin can be measured too early — most
      // visibly on mobile. Re-measure after the first paint so it engages.
      const rafId = requestAnimationFrame(() => ScrollTrigger.refresh());

      return () => {
        cancelAnimationFrame(rafId);
        cleanupFns.forEach((fn) => fn());
      };
      });

      // Without the pinned scrub the horizontal row is unreachable — fall back
      // to native horizontal scrolling under reduced motion.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        const scrollParent = scrollWrapperRef.current?.parentElement;
        if (!scrollParent) return;
        const prev = scrollParent.style.overflowX;
        scrollParent.style.overflowX = "auto";
        return () => {
          scrollParent.style.overflowX = prev;
        };
      });
    },
    { scope: containerRef }
  );

  if (!projects || projects.length === 0) return null;

  return (
    // pt-20 = fixed header height (80px) so the pinned section's content
    // starts below the navbar on mobile; desktop heading is absolutely
    // positioned at top-24 and already clears it.
    <section ref={containerRef} className="h-screen relative z-20 bg-[#fafafa] dark:bg-[#0f0f2a] flex flex-col justify-center overflow-hidden pt-20 md:pt-0">
      <div className="relative shrink-0 px-6 pt-6 md:p-0 md:absolute md:top-24 md:left-12 z-30">
        <h2 className="text-4xl sm:text-5xl md:text-8xl font-serif tracking-tighter" style={{ fontFeatureSettings: '"kern" 1, "liga" 1' }}>
          <span className="text-[#1e1e48] dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-[#bf953f] dark:via-[#fcf6ba] dark:to-[#b38728] drop-shadow-sm pb-2 inline-block">
            The Work I&apos;m Proud Of.
          </span>
        </h2>
        <div className="w-16 md:w-24 h-[1px] bg-[#d4af37] mt-2"></div>
      </div>

      {/* Horizontal scroll wrapper container. Mobile: flex-1 + justify-center
          vertically centers the card row in the space left below the heading;
          desktop keeps the original block flow with mt-32. */}
      <div className="w-full pl-6 md:pl-12 flex-1 md:flex-none flex md:block flex-col justify-center md:mt-32">
        {/* Mobile: fixed compact height so cards stay short landscape tiles
            instead of stretching to their tallest sibling's content. */}
        <div
          ref={scrollWrapperRef}
          className="flex flex-row flex-nowrap gap-4 md:gap-16 w-max items-stretch md:items-center h-[min(340px,55svh)] md:h-[50vh]"
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
                className={`group block relative rounded-3xl md:rounded-[2rem] overflow-hidden bg-white dark:bg-[#1e1e48] border border-[#1e1e48]/5 dark:border-[#d4af37]/10 hover:border-[#d4af37]/50 dark:hover:border-[#d4af37]/60 transition-colors shadow-xl shadow-black/5 dark:shadow-none min-w-[75vw] md:min-w-[400px] max-w-[500px] h-full`}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Background glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/0 to-transparent group-hover:from-[#d4af37]/5 dark:group-hover:from-[#d4af37]/10 transition-all duration-700 pointer-events-none z-0"></div>

                <div className="p-5 md:p-12 h-full flex flex-col justify-between relative z-10 w-full">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-4 md:mb-8">
                      <span className="px-3 py-1 md:px-4 md:py-1.5 bg-[#1e1e48]/5 dark:bg-[#0f0f2a] text-[#1e1e48]/70 dark:text-[#d4af37]/90 rounded-full text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase">
                        {p.tag}
                      </span>
                      {p.award && (
                        <span className="px-3 py-1 md:px-4 md:py-1.5 bg-[#d4af37]/10 dark:bg-[#d4af37]/20 text-[#a67c00] dark:text-[#d4af37] rounded-full text-[10px] md:text-xs font-bold tracking-[0.1em]">
                          {p.award}
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl md:text-5xl font-serif text-[#1e1e48] dark:text-white mb-2 md:mb-6 group-hover:text-[#d4af37] dark:group-hover:text-[#d4af37] transition-colors tracking-tight leading-[1.15] md:leading-[1.1]">
                      {p.title}
                    </h3>
                  </div>

                  <div className="mt-4 md:mt-8 flex flex-col lg:flex-row lg:items-end justify-between gap-3 md:gap-6">
                    <p className="text-[13px] md:text-lg text-[#1e1e48]/70 dark:text-gray-300 max-w-sm leading-snug md:leading-relaxed font-light line-clamp-3 md:line-clamp-none">
                      {p.desc}
                    </p>
                    <div className="w-10 h-10 md:w-16 md:h-16 rounded-full border border-[#1e1e48]/20 dark:border-[#d4af37]/30 flex items-center justify-center shrink-0 group-hover:border-[#d4af37] group-hover:bg-[#d4af37] group-hover:text-white dark:group-hover:text-[#1e1e48] transition-all duration-300 transform group-hover:scale-110 shadow-sm">
                      <ArrowUpRight className="w-4 h-4 md:w-6 md:h-6" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}

          {/* View More Card */}
          <Link
             href={`/${locale}/portfolio`}
             className="group flex flex-col items-center justify-center min-w-[40vw] md:min-w-[300px] h-full rounded-3xl md:rounded-[2rem] border-2 border-dashed border-[#1e1e48]/20 dark:border-[#d4af37]/30 hover:border-[#d4af37] dark:hover:border-[#d4af37] transition-all bg-transparent"
          >
             <span className="text-lg md:text-2xl font-serif text-[#1e1e48] dark:text-[#d4af37] mb-3 md:mb-4 group-hover:scale-110 transition-transform tracking-tight">View All</span>
             <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-[#1e1e48]/20 dark:border-[#d4af37]/30 flex items-center justify-center group-hover:bg-[#d4af37] group-hover:text-white dark:group-hover:text-[#1e1e48] transition-all shadow-sm">
                 <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5" />
             </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
