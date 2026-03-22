'use client';

import { useMemo } from 'react';

interface ContributionDay {
  date: string;
  count: number;
  color: string;
}

interface ContributionsGraphProps {
  totalContributions: number;
  contributions: ContributionDay[];
  isLoading: boolean;
}

const DAYS   = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

import { useParams } from 'next/navigation';
import { getDictionarySync } from '@/lib/getDictionary';

export function ContributionsGraph({ totalContributions, contributions, isLoading }: ContributionsGraphProps) {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const t = getDictionarySync(locale).codingProjects;
  const { weeks, monthLabels } = useMemo(() => {
    if (!contributions.length) return { weeks: [], monthLabels: [] };

    const firstDate = new Date(contributions[0].date);
    const startDow  = firstDate.getDay();
    const padded: (ContributionDay | null)[] = [
      ...Array(startDow).fill(null),
      ...contributions,
    ];
    while (padded.length % 7 !== 0) padded.push(null);

    const wks: (ContributionDay | null)[][] = [];
    for (let i = 0; i < padded.length; i += 7) wks.push(padded.slice(i, i + 7));

    const seen = new Set<number>();
    const labels: { weekIdx: number; label: string }[] = [];
    wks.forEach((week, wi) => {
      const first = week.find(d => d !== null);
      if (first) {
        const m = new Date(first.date).getMonth();
        if (!seen.has(m)) { seen.add(m); labels.push({ weekIdx: wi, label: MONTHS[m] }); }
      }
    });

    return { weeks: wks, monthLabels: labels };
  }, [contributions]);

  if (isLoading) {
    return (
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-5 text-[#191970] dark:text-[#d4af37]">{t.contributions}</h2>
        <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700 rounded-xl p-5 animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-5" />
          <div className="h-28 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
      </section>
    );
  }

  if (!contributions || contributions.length === 0) return null;

  const numWeeks = weeks.length;

  return (
    <section className="mb-12">
      <div className="flex items-baseline justify-between mb-5">
        <h2 className="text-xl font-bold text-[#191970] dark:text-[#d4af37]">{t.contributions}</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400" dangerouslySetInnerHTML={{ __html: t.contributionsYear.replace('{count}', `<strong class="font-semibold text-[#191970] dark:text-[#d4af37]">${totalContributions.toLocaleString()}</strong>`) }} />
      </div>

      <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-5">
        <div className="flex gap-2">
          {/* Day labels */}
          <div className="flex flex-col justify-between text-right flex-shrink-0" style={{ paddingTop: 20, paddingBottom: 2 }}>
            {DAYS.map((d, i) => (
              <span key={i} className="text-gray-400 dark:text-gray-600 leading-none" style={{ fontSize: 10, height: 0 }}>
                {d}
              </span>
            ))}
          </div>

          {/* Month labels + grid */}
          <div className="flex-1 min-w-0">
            <div className="flex mb-1" style={{ display: 'grid', gridTemplateColumns: `repeat(${numWeeks}, 1fr)` }}>
              {weeks.map((_, wi) => {
                const lbl = monthLabels.find(m => m.weekIdx === wi);
                return (
                  <span key={wi} className="text-gray-400 dark:text-gray-500 truncate" style={{ fontSize: 10 }}>
                    {lbl ? lbl.label : ''}
                  </span>
                );
              })}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${numWeeks}, 1fr)`,
              gridTemplateRows: 'repeat(7, 1fr)',
              gridAutoFlow: 'column',
              gap: 2,
              aspectRatio: `${numWeeks} / 7`,
            }}>
              {weeks.map((week, wi) =>
                week.map((day, di) => {
                  if (!day) {
                    return <div key={`${wi}-${di}`} className="rounded-sm" style={{ backgroundColor: 'transparent' }} />;
                  }
                  const formattedDate = new Date(day.date).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  });
                  return (
                    <div
                      key={`${wi}-${di}`}
                      className="rounded-sm cursor-default hover:opacity-75 transition-opacity"
                      style={{ backgroundColor: day.color || '#ebedf0' }}
                      title={`${formattedDate}: ${day.count} ${day.count !== 1 ? t.contributionsPlural : t.contribution}`}
                    />
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-3">
          <span className="text-gray-400 dark:text-gray-500" style={{ fontSize: 11 }}>{t.less}</span>
          {['#ebedf0','#c6e48b','#7bc96f','#239a3b','#196127'].map(color => (
            <div key={color} className="rounded-sm flex-shrink-0" style={{ width: 11, height: 11, backgroundColor: color }} />
          ))}
          <span className="text-gray-400 dark:text-gray-500" style={{ fontSize: 11 }}>{t.more}</span>
        </div>
      </div>
    </section>
  );
}