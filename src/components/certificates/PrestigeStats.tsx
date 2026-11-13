'use client';

import { useEffect, useRef } from 'react';
import { Award, Building, Layers } from 'lucide-react';
import { gsap } from '@/lib/gsapSetup';

interface PrestigeStatsProps {
  certificatesCount: number;
  uniqueIssuersCount: number;
  categoriesCount: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dictionary: any;
}

export function PrestigeStats({
  certificatesCount,
  uniqueIssuersCount,
  categoriesCount,
  dictionary,
}: PrestigeStatsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // GSAP subtle hover/entrance animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.stat-box-reveal',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 1, stagger: 0.1, ease: 'power2.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const t = dictionary.certificate.stats;

  const statItems = [
    {
      id: 'total',
      label: t.total,
      value: certificatesCount,
      suffix: '',
      fig: 'FIG. 02',
      unit: dictionary.certificate.controls.units,
      icon: Award,
    },
    {
      id: 'issuers',
      label: t.issuers,
      value: uniqueIssuersCount,
      suffix: '',
      fig: 'FIG. 03',
      unit: dictionary.certificate.controls.organizations,
      icon: Building,
    },
    {
      id: 'skills',
      label: t.skills,
      value: categoriesCount,
      suffix: '',
      fig: 'FIG. 05',
      unit: dictionary.certificate.controls.years,
      icon: Layers,
    },
  ];

  return (
    <div 
      ref={containerRef}
      className="relative py-12 md:py-16 bg-white dark:bg-gray-950 overflow-hidden select-none"
    >
      {/* Blueprint Grid Lines matching Hero */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-stone-200 dark:bg-stone-900 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-[1px] bg-stone-200 dark:bg-stone-900 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-3 border border-stone-200 dark:border-stone-900 divide-x divide-y lg:divide-y-0 divide-stone-200 dark:divide-stone-900 bg-stone-50/20 dark:bg-stone-900/5">
          {statItems.map((item, index) => {
            const IconComponent = item.icon;
            // Handle divide positioning borders on standard 2x2 grid for mobile
            const borderTopClass = index > 0 ? 'border-t border-stone-200 dark:border-stone-900 sm:border-t-0' : '';
            const borderLeftClass = index > 0 ? 'sm:border-l border-stone-200 dark:border-stone-900' : '';

            return (
              <div
                key={item.id}
                className={`
                  group relative p-3 sm:p-6 md:p-8 flex flex-col justify-between min-h-36 sm:min-h-0 sm:aspect-[1.5/1] lg:aspect-[1.3/1]
                  bg-white/60 dark:bg-stone-950/20 backdrop-blur-md
                  hover:bg-white dark:hover:bg-stone-950/60
                  transition-all duration-500 ease-out stat-box-reveal
                  ${borderTopClass} ${borderLeftClass}
                `}
              >
                {/* Tech coordinates details in corners */}
                <div className="flex justify-between items-start">
                  <span className="text-[9px] font-mono tracking-widest text-[#e05b3e] uppercase font-bold">
                    {item.fig}
                  </span>
                  <span className="text-[8px] font-mono tracking-widest text-stone-400 dark:text-stone-600">
                    {item.unit}
                  </span>
                </div>

                {/* Stat value in massive high-contrast serif italic */}
                <div className="my-3 flex items-baseline gap-1">
                  <h3 className="text-4xl sm:text-5xl md:text-6xl font-serif italic font-normal text-stone-900 dark:text-stone-100 leading-none tracking-tight transition-transform duration-500 group-hover:scale-105 origin-left">
                    {item.value}
                  </h3>
                  {item.suffix && (
                    <span className="text-lg sm:text-xl md:text-2xl font-serif font-light text-[#e05b3e] dark:text-[#e05b3e]">
                      {item.suffix}
                    </span>
                  )}
                </div>

                {/* Footer metadata description details */}
                <div className="flex justify-between items-center gap-4">
                  <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-[0.2em] font-sans line-clamp-1">
                    {item.label}
                  </span>
                  
                  {/* Subtle terracotta pulsing micro-indicator */}
                  <div className="w-5 h-5 rounded-full border border-stone-200 dark:border-stone-800/80 flex items-center justify-center bg-stone-50 dark:bg-stone-950 group-hover:border-[#e05b3e]/30 group-hover:bg-[#e05b3e]/5 transition-all duration-500 flex-shrink-0">
                    <IconComponent className="w-2.5 h-2.5 text-stone-400 dark:text-stone-600 group-hover:text-[#e05b3e] transition-colors duration-500" />
                  </div>
                </div>

                {/* Decorative Crosshair Grid Accents on Hover */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-transparent group-hover:border-[#e05b3e]/60 transition-all duration-300" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-transparent group-hover:border-[#e05b3e]/60 transition-all duration-300" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-transparent group-hover:border-[#e05b3e]/60 transition-all duration-300" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-transparent group-hover:border-[#e05b3e]/60 transition-all duration-300" />

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
