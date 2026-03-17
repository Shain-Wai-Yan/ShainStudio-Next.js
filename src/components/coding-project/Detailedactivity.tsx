'use client';

import { useState } from 'react';

interface RepoContribution {
  repository: { name: string; url: string };
  contributions: { totalCount: number };
}

interface DetailedActivityData {
  commitContributionsByRepository: RepoContribution[];
  pullRequestContributionsByRepository: RepoContribution[];
  issueContributionsByRepository: RepoContribution[];
}

interface DetailedActivityProps {
  data: DetailedActivityData | null;
  isLoading: boolean;
}

// ── Icons ────────────────────────────────────────────────────────────────────

function CommitIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
      <circle cx="12" cy="12" r="3"/>
      <line x1="3" y1="12" x2="9" y2="12"/>
      <line x1="15" y1="12" x2="21" y2="12"/>
    </svg>
  );
}

function PullRequestIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
      <circle cx="18" cy="18" r="3"/>
      <circle cx="6" cy="6" r="3"/>
      <path d="M6 21V9a9 9 0 0 0 9 9"/>
    </svg>
  );
}

function IssueIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );
}

// ── Bar chart for a single repo ───────────────────────────────────────────────

function RepoBar({
  name, url, count, max, color,
}: {
  name: string; url: string; count: number; max: number; color: string;
}) {
  const pct = max > 0 ? Math.max(4, (count / max) * 100) : 4;
  return (
    <div className="flex items-center gap-3 group">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs font-mono truncate w-44 hover:underline flex-shrink-0
          text-[#191970] dark:text-[#d4af37]"
        title={name}
      >
        {name}
      </a>
      <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-semibold w-8 text-right flex-shrink-0" style={{ color }}>
        {count}
      </span>
    </div>
  );
}

// ── Tab panel ────────────────────────────────────────────────────────────────

function ActivityPanel({
  items, color, emptyText,
}: {
  items: RepoContribution[];
  color: string;
  emptyText: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center">{emptyText}</p>;
  }

  const max   = Math.max(...items.map(i => i.contributions.totalCount));
  const total = items.reduce((s, i) => s + i.contributions.totalCount, 0);

  return (
    <div className="space-y-3">
      {/* Summary pill */}
      <div className="flex items-center gap-2 mb-4">
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full text-white"
          style={{ backgroundColor: color }}
        >
          {total} total
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          across {items.length} {items.length === 1 ? 'repository' : 'repositories'}
        </span>
      </div>

      {items.map((item, i) => (
        <RepoBar
          key={`${item.repository.url}-${i}`}
          name={item.repository.name}
          url={item.repository.url}
          count={item.contributions.totalCount}
          max={max}
          color={color}
        />
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function DetailedActivity({ data, isLoading }: DetailedActivityProps) {
  const [activeTab, setActiveTab] = useState<'commits' | 'prs' | 'issues'>('commits');

  if (isLoading) {
    return (
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-5 text-[#191970] dark:text-[#d4af37]">
          Contribution Activity
        </h2>
        <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700 rounded-xl p-6 animate-pulse space-y-4">
          <div className="flex gap-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-8 w-28 bg-gray-200 dark:bg-gray-700 rounded-lg"/>
            ))}
          </div>
          {[1,2,3,4,5].map(i => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-36"/>
              <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full"/>
              <div className="h-3 w-6 bg-gray-200 dark:bg-gray-700 rounded"/>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!data) return null;

  const commits = data.commitContributionsByRepository ?? [];
  const prs     = data.pullRequestContributionsByRepository ?? [];
  const issues  = data.issueContributionsByRepository ?? [];

  if (commits.length === 0 && prs.length === 0 && issues.length === 0) return null;

  const tabs: { id: typeof activeTab; label: string; icon: React.ReactNode; items: RepoContribution[]; color: string }[] = [
    { id: 'commits', label: 'Commits',      icon: <CommitIcon />,      items: commits, color: '#2ea44f' },
    { id: 'prs',     label: 'Pull Requests', icon: <PullRequestIcon/>, items: prs,     color: '#6f42c1' },
    { id: 'issues',  label: 'Issues',        icon: <IssueIcon />,      items: issues,  color: '#e36209' },
  ];

  const active = tabs.find(t => t.id === activeTab)!;

  return (
    <section className="mb-12">
      <h2 className="text-xl font-bold mb-5 text-[#191970] dark:text-[#d4af37]">
        Contribution Activity
      </h2>

      <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#252525]">
          {tabs.map(tab => {
            const count    = tab.items.reduce((s, i) => s + i.contributions.totalCount, 0);
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 -mb-px
                  ${isActive
                    ? 'border-current bg-white dark:bg-[#1e1e1e]'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2a2a2a]'
                  }`}
                style={isActive ? { color: tab.color, borderColor: tab.color } : {}}
              >
                <span style={isActive ? { color: tab.color } : { color: '#9ca3af' }}>
                  {tab.icon}
                </span>
                <span className="hidden sm:inline">{tab.label}</span>
                {count > 0 && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                      isActive
                        ? 'text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                    style={isActive ? { backgroundColor: tab.color } : {}}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Panel */}
        <div className="p-6">
          <ActivityPanel
            items={active.items}
            color={active.color}
            emptyText={`No ${active.label.toLowerCase()} activity in the past year.`}
          />
        </div>
      </div>
    </section>
  );
}