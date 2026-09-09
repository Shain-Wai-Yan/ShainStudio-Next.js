'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export interface PursuitItem {
  number: string;
  title: string;
  category: string;
  description: string;
  href: string;
  accent: string;
  badge: string;
  previewImage: string;
  previewLabel: string;
}

interface HobbiesPursuitListProps {
  pursuits: PursuitItem[];
  exploreLabel: string;
  sectionLabel: string;
}

export default function HobbiesPursuitList({
  pursuits,
  exploreLabel,
  sectionLabel,
}: HobbiesPursuitListProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // References for direct GPU transforms without React re-renders
  const cardRef = useRef<HTMLDivElement>(null);
  const targetPos = useRef({ x: -1000, y: -1000 });
  const currentPos = useRef({ x: -1000, y: -1000 });
  const isInitialized = useRef(false);

  // Global mouse tracking so coordinates are always precise anywhere on the viewport
  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      targetPos.current = { x: e.clientX, y: e.clientY };
      if (!isInitialized.current) {
        currentPos.current = { x: e.clientX, y: e.clientY };
        isInitialized.current = true;
      }
    };

    window.addEventListener('mousemove', handleWindowMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleWindowMouseMove);
  }, []);

  // Animate only while a desktop pointer is actively previewing a pursuit.
  // This avoids keeping an rAF loop alive on touch devices or while idle.
  useEffect(() => {
    if (activeIndex === null) return;

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!finePointer.matches || reducedMotion.matches) return;

    let rafId: number;

    const tick = () => {
      // 0.18 lerp factor for instant, natural cursor following
      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * 0.18;
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * 0.18;

      // Dynamic tilt based on horizontal velocity
      const deltaX = targetPos.current.x - currentPos.current.x;
      const tilt = Math.max(-5, Math.min(5, deltaX * 0.35));

      if (cardRef.current) {
        cardRef.current.style.transform = `translate3d(${currentPos.current.x}px, ${currentPos.current.y}px, 0) translate(-50%, -50%) rotate(${tilt}deg)`;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [activeIndex]);

  return (
    <section className="relative border-t border-neutral-200 dark:border-neutral-800">
      <div className="mx-auto max-w-7xl px-6 py-6 sm:px-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-neutral-400 dark:text-neutral-500">
          {sectionLabel}
        </p>
      </div>

      {/* Floating Popup Preview Card — Strictly Desktop (hover: hover & pointer: fine) */}
      <div
        ref={cardRef}
        className={`pointer-events-none fixed top-0 left-0 z-50 hidden [@media(hover:hover)_and_(pointer:fine)]:md:block transition-opacity duration-200 ease-out ${
          activeIndex !== null ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        style={{
          transform: 'translate3d(-1000px, -1000px, 0) translate(-50%, -50%)',
          willChange: 'transform',
        }}
        aria-hidden="true"
      >
        <div className="relative w-80 sm:w-96 aspect-[16/10] overflow-hidden rounded-2xl border border-white/30 dark:border-white/20 bg-neutral-900 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)]">
          {/* Pre-mount all preview images for zero-delay instant switching */}
          {pursuits.map((item, idx) => {
            const isActive = activeIndex === idx;
            return (
              <div
                key={item.href}
                className={`absolute inset-0 transition-opacity duration-300 ${
                  isActive ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <Image
                  src={item.previewImage}
                  alt={item.title}
                  fill
                  sizes="384px"
                  className="object-cover"
                  priority
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                <div className="absolute bottom-3.5 left-4 right-4 flex items-center justify-between">
                  <span className="text-xs font-semibold text-white drop-shadow-md">
                    {item.title}
                  </span>
                  <span className="rounded-full bg-white/25 px-2.5 py-0.5 text-[10px] font-medium text-white shadow-xs backdrop-blur-xs">
                    {item.previewLabel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Horizontal Pursuit Rows */}
      <div>
        {pursuits.map((item, index) => (
          <Link
            key={item.href}
            href={item.href}
            onMouseEnter={(e) => {
              targetPos.current = { x: e.clientX, y: e.clientY };
              if (!isInitialized.current) {
                currentPos.current = { x: e.clientX, y: e.clientY };
                isInitialized.current = true;
              }
              setActiveIndex(index);
            }}
            onMouseLeave={() => {
              setActiveIndex(null);
            }}
            className="group relative block border-t border-neutral-200 transition-colors duration-300 hover:bg-neutral-50/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#191970] dark:border-neutral-800 dark:hover:bg-neutral-900/40 dark:focus-visible:ring-[#ffd700]"
          >
            {/* Left animated accent bar */}
            <div
              className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${item.accent} transition-all duration-300 group-hover:w-2`}
            />

            <article className="mx-auto grid max-w-7xl gap-4 px-6 py-10 sm:px-10 md:grid-cols-[5rem_1.4fr_2fr_auto] md:items-center md:py-14">
              {/* Index number */}
              <span className="font-mono text-sm font-semibold text-neutral-400 dark:text-neutral-500">
                {item.number}
              </span>

              {/* Title and Category */}
              <div>
                <h2
                  className="font-serif text-3xl font-bold tracking-tight text-neutral-950 transition-transform duration-300 group-hover:translate-x-2 sm:text-4xl md:text-5xl dark:text-white"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {item.title}
                </h2>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500">
                    {item.category}
                  </span>
                  <span className="text-neutral-300 dark:text-neutral-700">·</span>
                  <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    {item.badge}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="max-w-xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                {item.description}
              </p>

              {/* Arrow Button */}
              <div className="flex justify-end">
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-neutral-300 text-lg font-bold transition-all duration-300 group-hover:rotate-[-25deg] group-hover:border-neutral-950 group-hover:bg-neutral-950 group-hover:text-white dark:border-neutral-700 dark:group-hover:border-white dark:group-hover:bg-white dark:group-hover:text-neutral-950"
                  aria-label={`${exploreLabel} ${item.title}`}
                >
                  ↗
                </span>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}
