'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { CodingProjectControls } from './CodingProjectControls';
import { CodingProjectGrid } from './CodingProjectGrid';
import { Breadcrumb } from '@/components/Breadcrumb';
import type { CodingProject, FilterOptions } from '@/lib/strapi/coding-projects';
import { filterProjects, extractFilterOptions } from '@/lib/strapi/coding-projects';

interface BreadcrumbItem {
  label: string;
  href: string;
}

export interface CodingProjectArchiveClientProps {
  locale?: 'en' | 'zh';
  breadcrumbItems: BreadcrumbItem[];
  labels: {
    heroTitle: string;
    heroDescription: string;
    searchPlaceholder: string;
    allCategories: string;
    allTools: string;
    allTags: string;
    allTypes: string;
    refresh: string;
    showing: string;
    of: string;
    projects: string;
    viewDetails: string;
    loadMore: string;
    loadingText: string;
    errorText: string;
    retryText: string;
    noProjects: string;
    noProjectsHint: string;
  };
  initialProjects?: CodingProject[];
}

const PAGE_SIZE = 9;

export function CodingProjectArchiveClient({
  locale = 'en',
  breadcrumbItems,
  labels,
  initialProjects = [],
}: CodingProjectArchiveClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ─── Data state ───────────────────────────────────────────────────────────
  const [allProjects, setAllProjects] = useState<CodingProject[]>(initialProjects);
  const [isLoading, setIsLoading] = useState(initialProjects.length === 0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);

  // ─── Filter state (from URL) ──────────────────────────────────────────────
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [filters, setFilters] = useState({
    category: searchParams.get('category') ?? '',
    tools: searchParams.get('tools') ?? '',
    tag: searchParams.get('tag') ?? '',
    type: searchParams.get('type') ?? '',
  });

  // ─── UI State ──────────────────────────────────────────────────────────────
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // ─── Derived data ─────────────────────────────────────────────────────────
  const filterOptions: FilterOptions = useMemo(
    () => extractFilterOptions(allProjects),
    [allProjects],
  );

  const filteredProjects = useMemo(() => {
    const filtered = filterProjects(allProjects, search, filters);
    // Sort Newest First automatically
    return [...filtered].sort((a, b) => {
        return new Date(b.projectDate).getTime() - new Date(a.projectDate).getTime();
    });
  }, [allProjects, search, filters]);

  const visibleProjects = filteredProjects.slice(0, displayCount);
  const hasMore = displayCount < filteredProjects.length;

  // ─── Load data ────────────────────────────────────────────────────────────
  const loadProjects = useCallback(async (isInitial = false) => {
    if (isInitial) setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/coding-projects?pageSize=100');
      const json = await res.json();
      if (json.error) {
        setError(json.error);
      } else {
        setAllProjects(json.data ?? []);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      if (isInitial) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialProjects.length === 0) {
      loadProjects(true);
    }
  }, [loadProjects, initialProjects]);

  // ─── Refresh ──────────────────────────────────────────────────────────────
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadProjects(false);
    setSearch('');
    setFilters({ category: '', tools: '', tag: '', type: '' });
    setDisplayCount(PAGE_SIZE);
    setIsRefreshing(false);
  }, [loadProjects]);

  // ─── URL sync (debounced) ─────────────────────────────────────────────────
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const syncUrl = useCallback(
    (newSearch: string, newFilters: typeof filters) => {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const params = new URLSearchParams();
        if (newSearch) params.set('search', newSearch);
        if (newFilters.category) params.set('category', newFilters.category);
        if (newFilters.tools) params.set('tools', newFilters.tools);
        if (newFilters.tag) params.set('tag', newFilters.tag);
        if (newFilters.type) params.set('type', newFilters.type);
        const qs = params.toString();
        router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
      }, 300);
    },
    [router, pathname],
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value);
      setDisplayCount(PAGE_SIZE);
      syncUrl(value, filters);
    },
    [filters, syncUrl],
  );

  const handleFilterChange = useCallback(
    (key: keyof typeof filters, value: string) => {
      const next = { ...filters, [key]: value };
      setFilters(next);
      setDisplayCount(PAGE_SIZE);
      syncUrl(search, next);
    },
    [filters, search, syncUrl],
  );

  const handleLoadMore = () => setDisplayCount((c) => c + PAGE_SIZE);

  // ─── Accessibility live region ────────────────────────────────────────────
  const liveMessage =
    !isLoading && !error
      ? `${labels.showing} ${visibleProjects.length} ${labels.of} ${filteredProjects.length} ${labels.projects}`
      : '';

  return (
    <>
      <div className="sr-only" aria-live="polite" role="status">
        {liveMessage}
      </div>

      {/* Hero Header for Archive */}
      <section className="bg-white dark:bg-[#121212] py-12 md:py-24 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-col items-start gap-4">
            <Breadcrumb items={breadcrumbItems} />
          </div>
          
          <div className="mt-4 md:mt-8 max-w-3xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 md:mb-6 tracking-tight text-[#191970] dark:text-[#d4af37]">
              {labels.heroTitle}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed font-light">
              {labels.heroDescription}
            </p>
          </div>
        </div>
      </section>

      {/* Sticky controls */}
      <CodingProjectControls
        search={search}
        filters={filters}
        filterOptions={filterOptions}
        onSearchChange={handleSearchChange}
        onFilterChange={handleFilterChange}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        labels={{
          searchPlaceholder: labels.searchPlaceholder,
          allCategories: labels.allCategories,
          allTools: labels.allTools,
          allTags: labels.allTags,
          allTypes: labels.allTypes,
          refresh: labels.refresh,
        }}
      />

      {/* Main Grid Content */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16 min-h-[50vh]">
        {!isLoading && !error && (
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100 dark:border-gray-800">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {labels.showing}{' '}
              <span className="font-bold text-gray-900 dark:text-[#e0e0e0]">
                {visibleProjects.length}
              </span>{' '}
              {labels.of}{' '}
              <span className="font-bold text-gray-900 dark:text-[#e0e0e0]">
                {filteredProjects.length}
              </span>{' '}
              {labels.projects}
            </p>
          </div>
        )}

        <CodingProjectGrid
          projects={visibleProjects}
          isLoading={isLoading}
          error={error}
          locale={locale}
          onRetry={loadProjects}
          viewDetailsLabel={labels.viewDetails}
          labels={{
            loading: labels.loadingText,
            error: labels.errorText,
            retry: labels.retryText,
            noProjects: labels.noProjects,
            noProjectsHint: labels.noProjectsHint,
          }}
        />

        {/* Load more */}
        {hasMore && !isLoading && !error && (
          <div className="flex flex-col items-center mt-16 gap-3">
            <button
              onClick={handleLoadMore}
              className="
                px-8 py-3.5 font-bold text-sm tracking-wide rounded-full
                bg-[#191970] dark:bg-[#d4af37] text-white dark:text-[#121212]
                hover:opacity-90 shadow-lg shadow-[#191970]/20 dark:shadow-[#d4af37]/20
                hover:shadow-xl hover:-translate-y-0.5
                transition-all duration-300
                focus:outline-none focus:ring-2 focus:ring-[#191970]/40 dark:focus:ring-[#d4af37]/40 focus:ring-offset-2 dark:focus:ring-offset-[#121212]
              "
            >
              {labels.loadMore}
            </button>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
              {visibleProjects.length} {labels.of} {filteredProjects.length}
            </p>
          </div>
        )}
      </main>

      {/* Scroll to top */}
      <button
        onClick={scrollToTop}
        aria-label="Scroll to top"
        className={`
          fixed bottom-6 right-6 z-50 rounded-full
          w-12 h-12 flex items-center justify-center
          bg-[#191970] dark:bg-[#d4af37] text-white dark:text-[#121212]
          shadow-lg hover:shadow-xl hover:-translate-y-1
          transition-all duration-300
          focus:outline-none focus:ring-2 focus:ring-[#191970]/40 focus:ring-offset-2
          ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}
        `}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M18 15l-6-6-6 6" />
        </svg>
      </button>
    </>
  );
}
