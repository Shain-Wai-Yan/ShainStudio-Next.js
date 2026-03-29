'use client';

import { useRef, useCallback, useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { optimizeCloudinaryUrl } from '@/lib/utils/cloudinary-optimizer';
import type { CodingProject } from '@/lib/strapi/coding-projects';

const CARD_W = 220;
const GAP = 14;
const PAGE_COLS = 4;
const GOLD_GRADIENT = "linear-gradient(90deg, #191970, #d4af37 60%, #191970)";

export interface ShelfLabels {
  eyebrow: string;
  title: string;
  viewAll: string;
  viewProject: string;
  featured: string;
  moreRight: string;
  scrollLeft: string;
  explore: string;
  githubLabel: string;
  demoLabel: string;
  sectionDivider: string;
}

interface CodingProjectShelfProps {
  projects: CodingProject[];
  locale: "en" | "zh";
  labels: ShelfLabels;
  maxVisible?: number;
}

function getCategoryIcon(category: string) {
  const cat = category.toLowerCase();
  
  // Database / Backend
  if (cat.includes('backend') || cat.includes('api') || cat.includes('database') || cat.includes('server')) {
    return (
      <svg className="w-8 h-8 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
    );
  }
  
  // Frontend / UI
  if (cat.includes('frontend') || cat.includes('web') || cat.includes('ui')) {
    return (
      <svg className="w-8 h-8 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    );
  }
  
  // Mobile
  if (cat.includes('mobile') || cat.includes('ios') || cat.includes('android') || cat.includes('app')) {
    return (
      <svg className="w-8 h-8 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    );
  }
  
  // Data / AI
  if (cat.includes('data') || cat.includes('machine learning') || cat.includes('ai')) {
    return (
      <svg className="w-8 h-8 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    );
  }
  
  // Fallback -> Code Brackets
  return (
    <svg className="w-8 h-8 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  );
}

export function CodingProjectShelf({
  projects,
  locale,
  labels,
  maxVisible,
}: CodingProjectShelfProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  // scrollRatio: 0–1, drives the kinetic rail thumb position
  const [scrollRatio, setScrollRatio] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  // kinetic pulse: fires once on mobile to hint swipeability
  const [pulse, setPulse] = useState(false);

  const startX = useRef(0);
  const scrollLeftRef = useRef(0);

  const sorted = useMemo(() => {
    const capped = maxVisible ? projects.slice(0, maxVisible) : projects;
    return [...capped].sort((a, b) => 
      Number(b.isFeatured) - Number(a.isFeatured)
    );
  }, [projects, maxVisible]);


  const updateState = useCallback(() => {
    const t = trackRef.current;
    if (!t) return;
    const sl = t.scrollLeft;
    const maxSl = t.scrollWidth - t.clientWidth;
    setCanPrev(sl > 8);
    setCanNext(sl < maxSl - 8);
    // Clamp ratio to [0, 1] for the kinetic rail thumb
    setScrollRatio(maxSl > 0 ? Math.min(1, Math.max(0, sl / maxSl)) : 0);
  }, []);

  useEffect(() => {
    updateState();
    const t = trackRef.current;
    if (t) {
      t.addEventListener('scroll', updateState, { passive: true });
      // Recalc on resize (orientation change on mobile)
      const ro = new ResizeObserver(updateState);
      ro.observe(t);
      return () => {
        t.removeEventListener('scroll', updateState);
        ro.disconnect();
      };
    }
  }, [updateState]);

  // Mobile kinetic pulse: after 600ms signal swipeability once
  useEffect(() => {
    const isMobile = window.matchMedia('(pointer: coarse)').matches;
    if (!isMobile || sorted.length <= 4) return;
    const timer = setTimeout(() => {
      setPulse(true);
      // Reset after one cycle (animation-duration: 900ms)
      setTimeout(() => setPulse(false), 900);
    }, 600);
    return () => clearTimeout(timer);
  }, [sorted.length]);

  const scrollPage = useCallback((dir: 1 | -1) => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    trackRef.current?.scrollBy({
      left: dir * (CARD_W + GAP) * PAGE_COLS,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, []);

  const basePath = locale === "zh" ? "/zh" : "";

  // Drag to scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startX.current = e.pageX - (trackRef.current?.offsetLeft || 0);
    scrollLeftRef.current = trackRef.current?.scrollLeft || 0;
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    if (!trackRef.current) return;
    const x = e.pageX - trackRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5; // velocity multiplier 1.5
    trackRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      scrollPage(-1);
    } else if (e.key === 'ArrowRight') {
      scrollPage(1);
    }
  };

  return (
    <section aria-label="Coding projects shelf" className="py-7 transform-gpu">
      {/* Header Row */}
      <div className="flex flex-row flex-wrap items-end justify-between mb-4 gap-4 px-1">
        <div>
          <div className="text-[11px] font-bold tracking-widest uppercase text-gray-500 mb-1">
            {labels.eyebrow}
          </div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-black text-[#191970] dark:text-[#d4af37]">
              {labels.title}
            </h2>
            {/* Project count pill — clean, no scroll text */}
            <div className="text-xs text-gray-500 font-medium bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
              {sorted.length}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Controls */}
          <div className="flex gap-1.5 mr-2">
            <button
              onClick={() => scrollPage(-1)}
              disabled={!canPrev}
              className={`w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-600 transition-opacity ${!canPrev ? 'opacity-25 cursor-default' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              aria-label="Previous page"
            >
              <svg className="w-4 h-4 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scrollPage(1)}
              disabled={!canNext}
              className={`w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-600 transition-opacity ${!canNext ? 'opacity-25 cursor-default' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              aria-label="Next page"
            >
              <svg className="w-4 h-4 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <Link
            href={`${basePath}/portfolio/coding-projects/archive`}
            className="text-xs font-semibold px-4 pl-5 h-8 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700 rounded-full flex items-center gap-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
          >
            {labels.viewAll}
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Scroll outer with fade overlays */}
      <div className="relative w-[calc(100%+32px)] -ml-4 mb-4">
        {/* Left fade */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white via-white/90 to-transparent dark:from-[#121212] dark:via-[#121212]/90 dark:to-transparent pointer-events-none z-30 transition-opacity duration-250"
          style={{ opacity: canPrev ? 1 : 0 }} 
        />
        
        {/* Right fade */}
        <div 
          className="absolute right-0 top-0 bottom-0 w-[72px] bg-gradient-to-l from-white via-white/90 to-transparent dark:from-[#121212] dark:via-[#121212]/90 dark:to-transparent pointer-events-none z-30 transition-opacity duration-250"
          style={{ opacity: canNext ? 1 : 0 }} 
        />

        {/* Track with drag-scroll */}
        <div
          role="list"
          ref={trackRef}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          aria-label="Scroll to browse projects"
          className={`px-4 py-4 grid grid-rows-2 grid-flow-col gap-4 md:gap-5 overflow-x-auto overflow-y-hidden select-none outline-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={{ gridAutoColumns: `${CARD_W}px` }}
        >
          {sorted.map((project, idx) => {
            const isFeatured = project.isFeatured;
            let finalImageStr = project.coverImage;
            if (finalImageStr && !finalImageStr.includes('placeholder')) {
              try {
                finalImageStr = optimizeCloudinaryUrl(finalImageStr);
              } catch {}
            }
            const hasImage = finalImageStr && !finalImageStr.includes('placeholder');

            // Limit tools down to 3
            const visibleTools = project.toolsUsed.slice(0, 3);
            const extraTools = project.toolsUsed.length - 3;

            return (
              <article 
                role="listitem" 
                key={project.id}
                className="relative flex flex-col rounded-xl overflow-hidden bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-800 transition-shadow hover:shadow-lg h-full"
                style={{
                  borderColor: isFeatured ? "rgba(212,175,55,0.5)" : undefined,
                  boxShadow: isFeatured ? "0 4px 14px 0 rgba(0,0,0,0.05)" : undefined,
                }}
              >
                {/* Featured Stripe */}
                {isFeatured && (
                  <div style={{ height: 2, background: GOLD_GRADIENT, flexShrink: 0 }} />
                )}

                {/* Stretched Link layer - Absolute positioning hack */}
                <Link 
                  href={`${basePath}/portfolio/coding-projects/${project.slug}`} 
                  className="absolute inset-0 z-10" 
                  aria-label={`View ${project.title}`}
                  draggable={false}
                />

                {/* Cover Image */}
                <div className="relative h-[110px] w-full shrink-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                  {hasImage ? (
                    <Image
                      src={finalImageStr}
                      alt={project.title}
                      fill
                      sizes="(max-width: 640px) 200px, 220px"
                      className="object-cover"
                      priority={idx === 0}
                      draggable={false}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full w-full text-gray-500">
                       {getCategoryIcon(project.category)}
                    </div>
                  )}
                  
                  {/* Category Type Badge */}
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded text-white text-[9px] uppercase tracking-[0.08em] font-semibold">
                    {project.type}
                  </div>
                  
                  {/* Featured Badge Overlay */}
                  {isFeatured && (
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-[#d4af37]/90 backdrop-blur-sm rounded text-white text-[9px] uppercase tracking-[0.08em] font-bold shadow-sm">
                      {labels.featured}
                    </div>
                  )}
                </div>

                {/* Body Content */}
                <div className="flex flex-col flex-1 p-3 lg:p-4 pointer-events-none">
                  <div className={`text-[10px] uppercase tracking-wider font-bold mb-2 truncate ${isFeatured ? 'text-[#a67c00] dark:text-[#d4af37]' : 'text-[#191970] dark:text-[#d4af37]'}`}>
                    {project.category}
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 leading-snug line-clamp-3" title={project.title}>
                    {project.title}
                  </h3>
                  
                  <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
                    {visibleTools.map((tool, i) => (
                      <span key={i} className="text-[10px] font-medium px-2 py-1 rounded bg-gray-100/80 dark:bg-white/5 border border-gray-200/50 dark:border-white/10 text-gray-700 dark:text-gray-300">
                        {tool}
                      </span>
                    ))}
                    {extraTools > 0 && (
                      <span className="text-[10px] font-medium px-2 py-1 rounded bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-gray-400">
                        +{extraTools}
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Buttons (Interactive on top of stretched link) */}
                <div className="relative z-20 flex flex-row justify-between items-center p-3 border-t border-gray-100 dark:border-gray-800 mt-auto bg-white/50 dark:bg-[#1e1e1e]/50 backdrop-blur-sm">
                  <div className="flex items-center text-[#191970] dark:text-[#d4af37] text-xs font-semibold pointer-events-none" aria-hidden="true">
                    {labels.viewProject}
                    <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                  <div className="flex gap-1.5">
                    {project.githubUrl && (
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300" aria-label={labels.githubLabel}>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                      </a>
                    )}
                    {project.liveDemoUrl && (
                      <a href={project.liveDemoUrl} target="_blank" rel="noopener noreferrer" className="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300" aria-label={labels.demoLabel}>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                      </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* ─── Kinetic Scroll Rail ──────────────────────────────────────────────
           A continuous 2px track with a smooth animated thumb. The thumb
           position maps 1:1 to horizontal scroll progress (0 → 100%).
           On mobile, a one-shot CSS pulse fires after mount to communicate
           scrollability without any text. Zero layout impact.
      ─────────────────────────────────────────────────────────────────── */}
      {sorted.length > 0 && (
        <>
          {/* Inline keyframes injected once — avoids a global CSS file dep */}
          <style>{`
            @keyframes kineticPulse {
              0%   { transform: scaleX(1);   opacity: 1; }
              35%  { transform: scaleX(1.18); opacity: 0.9; }
              65%  { transform: scaleX(0.88); opacity: 0.8; }
              100% { transform: scaleX(1);   opacity: 1; }
            }
            .kinetic-pulse {
              animation: kineticPulse 900ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
            }
          `}</style>

          <div
            role="progressbar"
            aria-label="Scroll position"
            aria-valuenow={Math.round(scrollRatio * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            className="relative mx-auto mb-6 mt-1"
            style={{ width: 'min(180px, 40%)', height: '2px' }}
          >
            {/* Track rail */}
            <div className="absolute inset-0 rounded-full bg-gray-200 dark:bg-gray-800" />

            {/* Animated thumb — width = 30% of rail, travels the remaining 70% */}
            <div
              className={`absolute top-0 bottom-0 rounded-full${
                pulse ? ' kinetic-pulse' : ''
              }`}
              style={{
                width: '30%',
                // thumb center travels from 0% → 70% of the track width
                left: `${scrollRatio * 70}%`,
                background:
                  scrollRatio > 0.05 && scrollRatio < 0.95
                    ? 'linear-gradient(90deg, #191970, #d4af37)'
                    : scrollRatio <= 0.05
                    ? '#d1d5db'
                    : '#d4af37',
                transition: 'left 120ms linear, background 400ms ease',
                // Subtle glow only when mid-scroll
                boxShadow:
                  scrollRatio > 0.05 && scrollRatio < 0.95
                    ? '0 0 6px 1px rgba(212,175,55,0.35)'
                    : 'none',
              }}
            />
          </div>
        </>
      )}

      {/* Section divider */}
      <div className="flex items-center mt-6">
        <div className="h-px bg-gray-200 dark:bg-gray-800 flex-1" />
        <span className="px-4 text-[10px] uppercase tracking-widest font-bold text-gray-400 dark:text-gray-500">
          {labels.sectionDivider}
        </span>
        <div className="h-px bg-gray-200 dark:bg-gray-800 flex-1" />
      </div>

    </section>
  );
}
