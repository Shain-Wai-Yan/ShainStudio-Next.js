'use client';

import { MarketingProjectCard } from './MarketingProjectCard';
import type { MarketingProject } from '@/lib/strapi/marketing-in-motion';

interface MarketingProjectGridProps {
  projects: MarketingProject[];
  isLoading?: boolean;
  error?: string | null;
  locale?: 'en' | 'zh';
  onRetry?: () => void;
  viewDetailsLabel?: string;
  labels?: {
    loading?: string;
    error?: string;
    retry?: string;
    noProjects?: string;
    noProjectsHint?: string;
    viewAll?: string;
  };
}

const defaultLabels = {
  loading: 'Loading marketing projects...',
  error: 'Failed to load projects',
  retry: 'Try Again',
  noProjects: 'No projects found',
  noProjectsHint: 'Try adjusting your search or filter criteria.',
  viewAll: 'View All Projects',
};

export function MarketingProjectGrid({
  projects,
  isLoading,
  error,
  locale = 'en',
  onRetry,
  viewDetailsLabel = 'View Details',
  labels = {},
}: MarketingProjectGridProps) {
  const l = { ...defaultLabels, ...labels };

  // ─── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-100 dark:bg-gray-800 border border-gray-100 dark:border-gray-800"
        aria-live="polite"
        aria-busy="true"
        role="status"
        aria-label={l.loading}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  // ─── Error ──────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div
        className="flex flex-col items-center justify-center py-20 text-center gap-4"
        role="alert"
      >
        <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 flex items-center justify-center border border-red-200 dark:border-red-800">
          <svg
            className="w-7 h-7 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <p className="text-base font-semibold text-gray-800 dark:text-[#e0e0e0]">{l.error}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="
              px-5 py-2 font-semibold text-sm
              bg-[#191970] dark:bg-[#a67c00] text-white
              hover:bg-[#0f0f45] dark:hover:bg-[#d4af37]
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-[#191970]/40
            "
          >
            {l.retry}
          </button>
        )}
      </div>
    );
  }

  // ─── Empty ──────────────────────────────────────────────────────────────────
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
        <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700">
          <svg
            className="w-7 h-7 text-gray-400 dark:text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-base font-semibold text-gray-800 dark:text-[#e0e0e0]">{l.noProjects}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{l.noProjectsHint}</p>
      </div>
    );
  }

  // ─── Grid ───────────────────────────────────────────────────────────────────
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      aria-live="polite"
    >
      {projects.map((project) => (
        <MarketingProjectCard
          key={project.id}
          project={project}
          locale={locale}
          viewDetailsLabel={viewDetailsLabel}
        />
      ))}
    </div>
  );
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div
      className="
        overflow-hidden
        bg-white dark:bg-[#1e1e1e]
        animate-pulse
      "
      aria-hidden="true"
    >
      <div className="aspect-video bg-gray-200 dark:bg-gray-700" />
      <div className="p-4 flex flex-col gap-2.5">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 w-1/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 w-3/4" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 w-full" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 w-5/6" />
        <div className="flex gap-1.5 mt-1">
          <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    </div>
  );
}