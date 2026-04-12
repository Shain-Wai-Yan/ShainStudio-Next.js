'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  FaBullhorn, FaHashtag, FaPalette, FaBrain, FaChartLine, FaRss, FaArrowRight
} from 'react-icons/fa';

gsap.registerPlugin(ScrollTrigger);

const services = [
  { num: '01', icon: FaBullhorn,  title: 'Marketing Strategy',   portfolioSlug: 'marketing-plans'    },
  { num: '02', icon: FaHashtag,   title: 'Digital Marketing',    portfolioSlug: 'marketing-in-motion' },
  { num: '03', icon: FaPalette,   title: 'Brand & Content',      portfolioSlug: 'business-plans'      },
  { num: '04', icon: FaBrain,     title: 'AI Marketing',         portfolioSlug: 'marketing-in-motion' },
  { num: '05', icon: FaChartLine, title: 'Analytics & Insights', portfolioSlug: 'marketing-in-motion' },
  { num: '06', icon: FaRss,       title: 'Web & Tech',           portfolioSlug: 'coding-projects'     },
];

const TICKER_ITEMS = [
  'Marketing Strategy', 'Digital Marketing', 'Brand Identity',
  'AI-Powered Campaigns', 'Analytics', 'Web & Tech', 'Content Strategy',
  'GO-TO-MARKET', 'SEO & SEM', 'Prompt Engineering',
];

import type { Dictionary } from '@/lib/getDictionary';

interface WhatIDoSectionProps {
  t: Dictionary;
  basePath: string;
}

export default function WhatIDoSection({ t, basePath }: WhatIDoSectionProps) {
  const containerRef = useRef<HTMLSelectElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Reveal the header
      if (headerRef.current) {
        gsap.from(headerRef.current.children, {
          y: 40,
          opacity: 0,
          duration: 1,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headerRef.current,
            start: 'top 85%',
          }
        });
      }

      // 2. Parallax scale reveal for the rows
      rowsRef.current.forEach((row) => {
        if (!row) return;
        
        // Initial state before scroll
        gsap.set(row.querySelector('.row-content'), { y: 30, opacity: 0 });
        gsap.set(row, { opacity: 0 });

        ScrollTrigger.create({
          trigger: row,
          start: 'top 90%',
          onEnter: () => {
            gsap.to(row, { opacity: 1, duration: 0.2 });
            gsap.to(row.querySelector('.row-content'), {
              y: 0,
              opacity: 1,
              duration: 1.2,
              ease: 'expo.out',
            });
          }
        });
      });
    }, containerRef);

    return () => ctx.revert(); // Cleanup GSAP
  }, []);

  return (
    <section 
      ref={containerRef}
      className="relative overflow-hidden" 
      style={{ background: 'var(--background)' }}
    >
      {/* ── Top ticker banner ── */}
      <div
        className="relative w-full overflow-hidden py-3 sm:py-4 flex items-center"
        style={{ background: 'var(--primary-dark)', borderTop: '1px solid rgba(255,215,0,0.2)', borderBottom: '1px solid rgba(255,215,0,0.2)' }}
      >
        <div
          className="flex items-center gap-0 whitespace-nowrap"
          style={{ animation: 'tickerScroll 24s linear infinite' }}
          aria-hidden="true"
        >
        {([...(t.whatIDo?.tickerItems || TICKER_ITEMS), ...(t.whatIDo?.tickerItems || TICKER_ITEMS)] as string[]).map((item, i) => (
            <span key={i} className="inline-flex items-center gap-4 sm:gap-6 px-4 sm:px-6">
              <span
                className="text-[11px] sm:text-xs font-black tracking-[0.18em] uppercase"
                style={{ color: i % 3 === 1 ? '#ffd700' : 'rgba(255,255,255,0.55)' }}
              >
                {item}
              </span>
              <span className="text-[#ffd700] opacity-40 text-[8px]">◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Header ── */}
      <div className="container mx-auto px-6 sm:px-10 lg:px-16 pt-16 sm:pt-20 pb-10 sm:pb-12">
        <div ref={headerRef} className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <span
              className="text-[10px] font-black tracking-[0.3em] uppercase block mb-3"
              style={{ color: 'var(--accent)' }}
            >
              {t.whatIDo?.eyebrow || 'What I Do'}
            </span>
            <div className="overflow-hidden">
              <h2
                className="text-4xl sm:text-5xl lg:text-[4.5rem] font-black tracking-tight leading-none"
                style={{ color: 'var(--primary-dark)' }}
              >
                {t.whatIDo?.titleLine1 || 'Services'}
                {' '}
                <span style={{
                  background: 'linear-gradient(90deg, var(--primary) 0%, var(--accent) 80%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  {t.whatIDo?.titleLine2 || '& Craft.'}
                </span>
              </h2>
            </div>
          </div>
          <div>
            <Link
              href={`${basePath}/portfolio`}
              className="inline-flex items-center gap-2 text-xs font-black tracking-[0.15em] uppercase transition-all duration-300 hover:gap-4 self-start sm:self-auto"
              style={{ color: 'var(--primary)' }}
            >
              {t.whatIDo?.viewAll || 'All Work'} <FaArrowRight size={10} />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stacked service rows ── */}
      <div className="w-full">
        {services.map(({ num, icon: Icon, title, portfolioSlug }, idx) => {
          const displayTitle = t.whatIDo?.items?.[idx]?.title || title;
          return (
          <Link
            key={num}
            href={`${basePath}/portfolio/${portfolioSlug}`}
            aria-label={displayTitle}
            ref={(el) => { rowsRef.current[idx] = el; }}
            className="group relative flex items-center w-full overflow-hidden transition-colors duration-500 cursor-pointer"
            style={{
              borderTop: `1px solid ${idx === 0 ? 'rgba(25,25,112,0.15)' : 'rgba(25,25,112,0.1)'}`,
              minHeight: '80px',
            }}
          >
            {/* Full-row fill on hover */}
            <div
              className="absolute inset-0 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] z-0"
              style={{ background: 'var(--primary-dark)' }}
            />

            {/* Gold shimmer on hover fill */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 delay-150 pointer-events-none z-0"
              style={{ background: 'linear-gradient(105deg, transparent 30%, rgba(255,215,0,0.06) 60%, transparent 80%)' }}
            />

            {/* Ambient ghost icon */}
            <div
              className="absolute right-[12%] sm:right-[15%] top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-[0.05] transition-all duration-700 pointer-events-none scale-75 group-hover:scale-100 z-0"
              aria-hidden="true"
            >
              <Icon size={140} color="white" />
            </div>

            {/* Row content */}
            <div className="row-content relative z-10 flex items-center w-full px-6 sm:px-10 lg:px-16 py-5 sm:py-6 gap-5 sm:gap-8 transition-colors duration-500">

              {/* Number */}
              <span
                className="text-xs sm:text-sm font-black tabular-nums tracking-wider flex-shrink-0 transition-colors duration-500 group-hover:text-white/40"
                style={{ color: 'rgba(25,25,112,0.3)', width: '2.2rem' }}
              >
                {num}
              </span>

              {/* Thin separator line */}
              <div
                className="h-px w-6 sm:w-10 flex-shrink-0 transition-colors duration-500 group-hover:bg-white/20"
                style={{ background: 'rgba(25,25,112,0.15)' }}
              />

              {/* Service title — text-color drops from explicit style to use CSS inheritance */}
              <span
                className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black tracking-tight leading-none flex-1 transition-colors duration-500 text-[var(--primary-dark)] group-hover:text-white"
              >
                {displayTitle}
              </span>

              {/* Right: Icon + Arrow */}
              <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0 ml-auto">
                {/* Icon pill */}
                <div
                  className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-500 group-hover:scale-110"
                  style={{
                    background: 'rgba(25,25,112,0.07)',
                    color: 'var(--primary)',
                  }}
                >
                  <span
                    className="transition-all duration-500 group-hover:[filter:invert(1)_brightness(10)]"
                    style={{ display: 'flex' }}
                  >
                    <Icon size={16} />
                  </span>
                </div>

                {/* Arrow — appears on hover */}
                <div
                  className="w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
                  style={{ background: '#ffd700' }}
                >
                  <FaArrowRight size={12} color="#0f0f45" />
                </div>
              </div>
            </div>

            {/* Bottom border (last row only shows full border at bottom) */}
            {idx === services.length - 1 && (
              <div
                className="absolute bottom-0 left-0 right-0 h-px transition-colors duration-500 group-hover:bg-transparent"
                style={{ background: 'rgba(25,25,112,0.1)' }}
              />
            )}
          </Link>
          );
        })}
      </div>
    </section>
  );
}
