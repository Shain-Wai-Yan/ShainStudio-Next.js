'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { optimizeCloudinaryUrl } from '@/lib/utils/cloudinary-optimizer';
import { MarketingHero } from './MarketingHero';
import { MarketingControls } from './MarketingControls';
import { MarketingProjectGrid } from './MarketingProjectGrid';
import { MarketingProjectCard } from './MarketingProjectCard';
import { Breadcrumb } from '@/components/Breadcrumb';
import type { MarketingProject, FilterOptions } from '@/lib/strapi/marketing-in-motion';
import { filterProjects, extractFilterOptions, formatProjectDate } from '@/lib/strapi/marketing-in-motion';

interface BreadcrumbItem {
  label: string;
  href: string;
}

export interface MarketingInMotionClientProps {
  locale?: 'en' | 'zh';
  breadcrumbItems: BreadcrumbItem[];
  labels: {
    heroTitle: string;
    heroDescription: string;
    featuredTitle: string;
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
  initialProjects?: MarketingProject[];
}

type SortOption = 'date-desc' | 'date-asc' | 'title-asc' | 'title-desc';
type ViewMode = 'grid' | 'list';

const PAGE_SIZE = 12;

export function MarketingInMotionClient({
  locale = 'en',
  breadcrumbItems,
  labels,
  initialProjects = [],
}: MarketingInMotionClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ─── Data state ───────────────────────────────────────────────────────────
  const [allProjects, setAllProjects] = useState<MarketingProject[]>(initialProjects);
  const [isLoading, setIsLoading] = useState(initialProjects.length === 0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);

  // ─── UI state ─────────────────────────────────────────────────────────────
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showScrollTop, setShowScrollTop] = useState(false);

  // ─── Filter state (from URL) ──────────────────────────────────────────────
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [filters, setFilters] = useState({
    category: searchParams.get('category') ?? '',
    tools: searchParams.get('tools') ?? '',
    tag: searchParams.get('tag') ?? '',
    type: searchParams.get('type') ?? '',
  });

  // ─── Scroll-to-top button ─────────────────────────────────────────────────
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
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.projectDate).getTime() - new Date(a.projectDate).getTime();
        case 'date-asc':
          return new Date(a.projectDate).getTime() - new Date(b.projectDate).getTime();
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });
  }, [allProjects, search, filters, sortBy]);

  const featuredProjects = useMemo(
    () => allProjects.filter((p) => p.isFeatured),
    [allProjects],
  );

  const visibleProjects = filteredProjects.slice(0, displayCount);
  const hasMore = displayCount < filteredProjects.length;

  // ─── Load data ────────────────────────────────────────────────────────────
  const loadProjects = useCallback(async (isInitial = false) => {
    if (isInitial) setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/marketing-in-motion?pageSize=100');
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
    // Only fetch client-side on initial load if SSR didn't pass anything
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
      {/* Live region */}
      <div className="sr-only" aria-live="polite" role="status">
        {liveMessage}
      </div>

      {/* Hero */}
      <MarketingHero title={labels.heroTitle} description={labels.heroDescription} />

      {/* Sticky controls */}
      <MarketingControls
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

      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Featured Projects */}
        {!isLoading && !error && featuredProjects.length > 0 && (
          <section aria-labelledby="featured-heading" className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-5 w-1 bg-[#ffd700]" aria-hidden="true" />
              <h2
                id="featured-heading"
                className="text-lg font-bold text-gray-900 dark:text-[#d4af37] uppercase tracking-wide"
              >
                {labels.featuredTitle}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredProjects.map((project) => (
                <MarketingProjectCard
                  key={project.id}
                  project={project}
                  locale={locale}
                  isFeatured
                  viewDetailsLabel={labels.viewDetails}
                />
              ))}
            </div>
          </section>
        )}

        {/* Stats + Sort + View toggle bar */}
        {!isLoading && !error && (
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100 dark:border-gray-800">
            {/* Count */}
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {labels.showing}{' '}
              <span className="font-semibold text-gray-700 dark:text-[#e0e0e0]">
                {visibleProjects.length}
              </span>{' '}
              {labels.of}{' '}
              <span className="font-semibold text-gray-700 dark:text-[#e0e0e0]">
                {filteredProjects.length}
              </span>{' '}
              {labels.projects}
            </p>

            <div className="flex items-center gap-2">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value as SortOption); setDisplayCount(PAGE_SIZE); }}
                className="
                  h-8 px-2 text-xs font-medium
                  border border-gray-200 dark:border-gray-700
                  bg-white dark:bg-[#1e1e1e]
                  text-gray-700 dark:text-[#e0e0e0]
                  focus:outline-none focus:border-[#191970] dark:focus:border-[#a67c00]
                  transition-colors
                "
                aria-label="Sort projects"
              >
                <option value="date-desc">Newest first</option>
                <option value="date-asc">Oldest first</option>
                <option value="title-asc">Title A–Z</option>
                <option value="title-desc">Title Z–A</option>
              </select>

              {/* View mode toggle */}
              <div className="flex border border-gray-200 dark:border-gray-700 overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                  aria-pressed={viewMode === 'grid'}
                  className={`
                    w-8 h-8 flex items-center justify-center transition-colors
                    ${viewMode === 'grid'
                      ? 'bg-[#191970] dark:bg-[#a67c00] text-white'
                      : 'bg-white dark:bg-[#1e1e1e] text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }
                  `}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                  aria-pressed={viewMode === 'list'}
                  className={`
                    w-8 h-8 flex items-center justify-center transition-colors border-l border-gray-200 dark:border-gray-700
                    ${viewMode === 'list'
                      ? 'bg-[#191970] dark:bg-[#a67c00] text-white'
                      : 'bg-white dark:bg-[#1e1e1e] text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }
                  `}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* All projects grid */}
        <section aria-labelledby="projects-heading">
          <h2 id="projects-heading" className="sr-only">
            All marketing projects
          </h2>

          {viewMode === 'grid' ? (
            <MarketingProjectGrid
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
          ) : (
            /* List view */
            <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800 border border-gray-100 dark:border-gray-800">
              {visibleProjects.map((project) => (
                <ListRow
                  key={project.id}
                  project={project}
                  locale={locale}
                  viewDetailsLabel={labels.viewDetails}
                />
              ))}
            </div>
          )}
        </section>

        {/* Load more */}
        {hasMore && !isLoading && !error && (
          <div className="flex flex-col items-center mt-12 gap-2">
            <button
              onClick={handleLoadMore}
              className="
                px-8 py-2.5 font-semibold text-sm
                bg-[#191970] dark:bg-[#a67c00] text-white
                hover:bg-[#0f0f45] dark:hover:bg-[#d4af37]
                shadow-sm hover:shadow-md
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-[#191970]/40 dark:focus:ring-[#a67c00]/40
              "
            >
              {labels.loadMore}
            </button>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {visibleProjects.length} of {filteredProjects.length} shown
            </p>
          </div>
        )}
      </main>

      {/* Scroll to top */}
      <button
        onClick={scrollToTop}
        aria-label="Scroll to top"
        className={`
          fixed bottom-6 right-6 z-50
          w-10 h-10 flex items-center justify-center
          bg-[#191970] dark:bg-[#a67c00] text-white
          shadow-lg hover:shadow-xl
          hover:bg-[#0f0f45] dark:hover:bg-[#d4af37]
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-[#191970]/40
          ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
        `}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M18 15l-6-6-6 6" />
        </svg>
      </button>
    </>
  );
}

// ─── List Row (for list view mode) ───────────────────────────────────────────

function ListRow({
  project,
  locale,
  viewDetailsLabel,
}: {
  project: MarketingProject;
  locale: 'en' | 'zh';
  viewDetailsLabel: string;
}) {
  const href =
    locale === 'zh'
      ? `/zh/portfolio/marketing-in-motion/${project.slug}`
      : `/portfolio/marketing-in-motion/${project.slug}`;

  return (
    <Link
      href={href}
      className="
        group flex items-center gap-4 p-4
        bg-white dark:bg-[#1e1e1e]
        hover:bg-gray-50 dark:hover:bg-[#252525]
        transition-colors duration-150
        focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#191970]
      "
    >
      {/* Thumbnail */}
      <div className="relative w-24 h-16 flex-shrink-0 overflow-hidden bg-gray-100 dark:bg-gray-800">
        <Image
          src={optimizeCloudinaryUrl(project.coverImage)}
          alt={project.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="96px"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[#191970] dark:text-[#d4af37]">
            {project.category}
          </span>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">·</span>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">
            {project.readingTime}
          </span>
        </div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-[#e0e0e0] group-hover:text-[#191970] dark:group-hover:text-[#d4af37] transition-colors line-clamp-1">
          {project.title}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
          {project.summary}
        </p>
        {project.toolsUsed.length > 0 && (
          <div className="flex gap-1 mt-1.5">
            {project.toolsUsed.slice(0, 3).map((t) => (
              <span key={t} className="text-[10px] px-1.5 py-0.5 bg-[#191970]/8 dark:bg-[#a67c00]/12 text-[#191970] dark:text-[#d4af37]">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <span className="flex-shrink-0 text-xs font-semibold text-[#191970] dark:text-[#d4af37] flex items-center gap-1 group-hover:gap-2 transition-all">
        {viewDetailsLabel}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </span>
    </Link>
  );
}