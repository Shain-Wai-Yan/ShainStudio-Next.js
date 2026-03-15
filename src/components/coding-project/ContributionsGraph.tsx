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

const DAYS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function ContributionsGraph({
  totalContributions,
  contributions,
  isLoading,
}: ContributionsGraphProps) {
  // Build a 52-week grid aligned to Sunday–Saturday
  const { weeks, monthLabels } = useMemo(() => {
    if (!contributions.length) return { weeks: [], monthLabels: [] };

    // Pad the front so the first day lands on its correct weekday column
    const firstDate = new Date(contributions[0].date);
    const startDow = firstDate.getDay(); // 0=Sun
    const padded: (ContributionDay | null)[] = [
      ...Array(startDow).fill(null),
      ...contributions,
    ];

    // Fill to complete last week
    while (padded.length % 7 !== 0) padded.push(null);

    const wks: (ContributionDay | null)[][] = [];
    for (let i = 0; i < padded.length; i += 7) {
      wks.push(padded.slice(i, i + 7));
    }

    // Month labels: find the week index where each month first appears
    const seen = new Set<number>();
    const labels: { weekIdx: number; label: string }[] = [];
    wks.forEach((week, wi) => {
      const first = week.find(d => d !== null);
      if (first) {
        const m = new Date(first.date).getMonth();
        if (!seen.has(m)) {
          seen.add(m);
          labels.push({ weekIdx: wi, label: MONTHS[m] });
        }
      }
    });

    return { weeks: wks, monthLabels: labels };
  }, [contributions]);

  if (isLoading) {
    return (
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-5" style={{ color: '#191970' }}>Contributions</h2>
        <div className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-48 mb-5"/>
          <div className="h-28 bg-gray-200 rounded-lg"/>
        </div>
      </section>
    );
  }

  if (!contributions || contributions.length === 0) return null;

  const numWeeks = weeks.length;

  return (
    <section className="mb-12">
      {/* Header */}
      <div className="flex items-baseline justify-between mb-5">
        <h2 className="text-xl font-bold" style={{ color: '#191970' }}>Contributions</h2>
        <span className="text-sm text-gray-500">
          <strong className="font-semibold" style={{ color: '#191970' }}>{totalContributions.toLocaleString()}</strong>
          {' '}contributions in the last year
        </span>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
        {/* ── Graph area: day labels + grid ── */}
        <div className="flex gap-2">

          {/* Day-of-week labels */}
          <div
            className="flex flex-col justify-between text-right flex-shrink-0"
            style={{ paddingTop: 20, paddingBottom: 2 }}
          >
            {DAYS.map((d, i) => (
              <span key={i} className="text-gray-400 leading-none" style={{ fontSize: 10, height: 0 }}>
                {d}
              </span>
            ))}
          </div>

          {/* Month labels + cell grid */}
          <div className="flex-1 min-w-0">
            {/* Month labels row */}
            <div
              className="flex mb-1"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${numWeeks}, 1fr)`,
              }}
            >
              {weeks.map((_, wi) => {
                const lbl = monthLabels.find(m => m.weekIdx === wi);
                return (
                  <span
                    key={wi}
                    className="text-gray-400 truncate"
                    style={{ fontSize: 10 }}
                  >
                    {lbl ? lbl.label : ''}
                  </span>
                );
              })}
            </div>

            {/* Cell grid — uses CSS grid so it fills 100% width */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${numWeeks}, 1fr)`,
                gridTemplateRows: 'repeat(7, 1fr)',
                gridAutoFlow: 'column',
                gap: 2,
                aspectRatio: `${numWeeks} / 7`,
              }}
            >
              {weeks.map((week, wi) =>
                week.map((day, di) => {
                  if (!day) {
                    return (
                      <div
                        key={`${wi}-${di}`}
                        className="rounded-sm"
                        style={{ backgroundColor: 'transparent' }}
                      />
                    );
                  }
                  const formattedDate = new Date(day.date).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  });
                  return (
                    <div
                      key={`${wi}-${di}`}
                      className="rounded-sm cursor-default transition-opacity hover:opacity-75"
                      style={{ backgroundColor: day.color || '#ebedf0' }}
                      title={`${formattedDate}: ${day.count} contribution${day.count !== 1 ? 's' : ''}`}
                    />
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ── Legend ── */}
        <div className="flex items-center justify-end gap-2 mt-3">
          <span className="text-gray-400" style={{ fontSize: 11 }}>Less</span>
          {['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127'].map(color => (
            <div
              key={color}
              className="rounded-sm"
              style={{ width: 11, height: 11, backgroundColor: color, flexShrink: 0 }}
            />
          ))}
          <span className="text-gray-400" style={{ fontSize: 11 }}>More</span>
        </div>
      </div>
    </section>
  );
}