'use client';

import { useEffect, useRef, useState } from 'react';

interface Language {
  name: string;
  color: string;
  size: number;
  percentage: string;
}

interface ProgrammingLanguagesProps {
  languages: Language[];
  isLoading: boolean;
}

function pct(lang: Language): number {
  return parseFloat(lang.percentage) || 0;
}

import { useParams } from 'next/navigation';
import { getDictionarySync } from '@/lib/getDictionary';

export function ProgrammingLanguages({ languages, isLoading }: ProgrammingLanguagesProps) {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const t = getDictionarySync(locale).codingProjects;
  const canvasRef               = useRef<HTMLCanvasElement>(null);
  const chartRef                = useRef<any>(null);
  const [active, setActive]     = useState(0);
  const [libReady, setLibReady] = useState(false);

  useEffect(() => {
    if ((window as any).Chart) { setLibReady(true); return; }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
    s.onload = () => setLibReady(true);
    document.head.appendChild(s);
  }, []);

  useEffect(() => {
    if (!libReady || !canvasRef.current || !languages.length) return;
    const Chart = (window as any).Chart;
    if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }

    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    chartRef.current = new Chart(canvasRef.current, {
      type: 'doughnut',
      data: {
        labels: languages.map(l => l.name),
        datasets: [{
          data: languages.map(l => Math.max(pct(l), 0.2)),
          backgroundColor: languages.map(l => l.color || '#888'),
          borderWidth: 2,
          borderColor: isDark ? '#1e1e1e' : '#ffffff',
          hoverBorderWidth: 0,
          hoverOffset: 6,
        }],
      },
      options: {
        responsive: false,
        cutout: '68%',
        animation: { duration: 700, easing: 'easeInOutQuart' },
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        onHover: (_: any, els: any[]) => {
          if (els.length) setActive(els[0].index);
        },
      },
    });

    return () => { chartRef.current?.destroy(); chartRef.current = null; };
  }, [libReady, languages]);

  if (isLoading) {
    return (
      <section className="mb-12">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-[#191970] dark:text-[#d4af37]">{t.languages}</h2>
        </div>
        <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700 rounded-xl p-6 animate-pulse">
          <div className="flex items-center gap-8">
            <div className="w-40 h-40 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
            <div className="flex-1 space-y-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-gray-200 dark:bg-gray-700" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-10" />
                </div>
              ))}
            </div>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-5" />
        </div>
      </section>
    );
  }

  if (!languages || languages.length === 0) return null;

  const activeLang = languages[active] ?? languages[0];

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-[#191970] dark:text-[#d4af37]">Programming Languages</h2>
        <span className="text-sm text-gray-400 dark:text-gray-500">{t.languageCount.replace('{count}', String(languages.length))}</span>
      </div>

      <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700 rounded-xl p-5 sm:p-6">
        <div className="flex items-center gap-6 sm:gap-10 flex-wrap">

          {/* Donut */}
          <div className="relative flex-shrink-0" style={{ width: 160, height: 160 }}>
            <canvas ref={canvasRef} width={160} height={160} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-[#191970] dark:text-[#d4af37]">
                {parseFloat(activeLang.percentage).toFixed(1)}%
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 max-w-[80px] text-center leading-tight truncate">
                {activeLang.name}
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 min-w-[200px] space-y-0.5">
            {languages.map((lang, i) => (
              <button
                key={`${lang.name}-${i}`}
                onMouseEnter={() => setActive(i)}
                onClick={() => setActive(i)}
                className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-left transition-colors
                  ${active === i
                    ? 'bg-gray-50 dark:bg-[#2a2a2a]'
                    : 'hover:bg-gray-50 dark:hover:bg-[#2a2a2a]'
                  }`}
              >
                <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: lang.color || '#888' }} />
                <span className="flex-1 text-sm sm:text-base text-gray-700 dark:text-gray-300 truncate">
                  {lang.name}
                </span>
                <span
                  className="text-sm sm:text-base font-semibold tabular-nums transition-colors"
                  style={{ color: active === i ? (lang.color || '#191970') : '#9ca3af' }}
                >
                  {parseFloat(lang.percentage).toFixed(1)}%
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Stacked bar */}
        <div className="mt-5 h-2 rounded-full overflow-hidden flex" style={{ gap: 1 }}>
          {languages.map((lang, i) => {
            const p = pct(lang);
            if (p < 0.1) return null;
            return (
              <div
                key={`bar-${lang.name}-${i}`}
                className="h-full transition-all"
                style={{ flex: p, backgroundColor: lang.color || '#888' }}
                title={`${lang.name}: ${lang.percentage}%`}
                onMouseEnter={() => setActive(i)}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}