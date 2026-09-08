'use client';

import { CodingProjectCard } from './CodingProjectCard';
import type { CodingProject } from '@/lib/strapi/coding-projects';

interface CodingProjectGridProps {
  projects: CodingProject[];
  isLoading: boolean;
  error: string | null;
  locale: 'en' | 'zh';
  onRetry: () => void;
  viewDetailsLabel: string;
  labels: {
    loading: string;
    error: string;
    retry: string;
    noProjects: string;
    noProjectsHint: string;
  };
}

export function CodingProjectGrid({
  projects,
  isLoading,
  error,
  locale,
  onRetry,
  viewDetailsLabel,
  labels,
}: CodingProjectGridProps) {
  // ── Error state ──
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center border border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 rounded-xl">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center mb-4 text-red-600 dark:text-red-400">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">{labels.error}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md">{error}</p>
        <button
          onClick={onRetry}
          className="px-6 py-2 bg-[#191970] dark:bg-[#d4af37] text-white dark:text-[#121212] text-sm font-semibold rounded-full hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#191970]"
        >
          {labels.retry}
        </button>
      </div>
    );
  }

  // ── Empty state (no results) ──
  if (!isLoading && projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-[#1a1a1a]/50">
        <div className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-700">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-1">{labels.noProjects}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">{labels.noProjectsHint}</p>
      </div>
    );
  }

  // ── Grid layout ──
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
      {projects.map((project, index) => (
        <CodingProjectCard
          key={project.id}
          project={project}
          locale={locale}
          viewDetailsLabel={viewDetailsLabel}
          // One likely LCP image gets preload bandwidth; the rest lazy-load.
          priority={index === 0}
        />
      ))}

      {/* Loading overlay/skeletons while actively fetching or paginating */}
      {isLoading && projects.length === 0 && (
        Array.from({ length: 8 }).map((_, i) => (
          <div key={`skeleton-${i}`} className="flex flex-col h-[320px] rounded-xl bg-gray-100 dark:bg-gray-800/50 animate-pulse border border-gray-200 dark:border-gray-800">
            <div className="h-[140px] bg-gray-200 dark:bg-gray-700/50 rounded-t-xl" />
            <div className="p-4 flex-1">
              <div className="w-16 h-3 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
              <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="w-3/4 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
              <div className="w-full h-12 bg-gray-200 dark:bg-gray-700/30 rounded" />
            </div>
          </div>
        ))
      )}
    </div>
  );
}
