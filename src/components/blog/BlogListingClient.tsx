'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { BlogPost } from '@/lib/strapi/blogs';
import BlogGrid from './BlogGrid';

// ── debounce helper (avoids importing from utils) ──────────────────────────────
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

interface BlogListingClientProps {
  allBlogs: BlogPost[];
  categories: string[];
  tags: string[];
  language: 'en' | 'zh';
  error: string | null;
  labels: {
    searchPlaceholder: string;
    allCategories: string;
    allTags: string;
    tags: string;
    showing: string;
    post: string;
    posts: string;
    of: string;
    clearAll: string;
    noMatchingPosts: string;
    noBlogPosts: string;
    prev: string;
    next: string;
    failedToLoad: string;
  };
}

export default function BlogListingClient({ allBlogs, categories, tags, language, error, labels }: BlogListingClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Derive state from URL (Single Source of Truth)
  const urlSearch = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('category') || '';
  const selectedTag = searchParams.get('tag') || '';
  const currentPage = Number(searchParams.get('page')) || 1;

  // Local state only for input typing to prevent lag, and mobile filter toggle
  const [searchInput, setSearchInput] = useState(urlSearch);
  const [showFilters, setShowFilters] = useState(false);

  // Sync back local search input if URL changes externally (e.g. Back button)
  useEffect(() => {
    setSearchInput(urlSearch);
  }, [urlSearch]);

  const postsPerPage = 12;

  // Sync URL function
  const updateUrl = useCallback((newSearch: string, newCat: string, newTag: string, newPage: number) => {
    const params = new URLSearchParams();
    if (newSearch) params.set('q', newSearch);
    if (newCat) params.set('category', newCat);
    if (newTag) params.set('tag', newTag);
    if (newPage > 1) params.set('page', newPage.toString());
    
    const qs = params.toString();
    const nextUrl = `${pathname}${qs ? `?${qs}` : ''}`;
    if (nextUrl !== window.location.pathname + window.location.search) {
      router.replace(nextUrl, { scroll: false });
    }
  }, [pathname, router]);

  // Debounce before updating URL
  const debouncedSearch = useDebounce(searchInput, 280);

  useEffect(() => {
    if (debouncedSearch !== urlSearch) {
      updateUrl(debouncedSearch, selectedCategory, selectedTag, 1);
    }
  }, [debouncedSearch, urlSearch, selectedCategory, selectedTag, updateUrl]);

  const handleSearchChange = (value: string) => {
    setSearchInput(value); // Only updates local state. useEffect debounces it to the URL.
  };

  const handleCategoryChange = (value: string) => {
    updateUrl(urlSearch, value, selectedTag, 1);
  };

  const handleTagChange = (value: string) => {
    const newTag = selectedTag === value ? '' : value;
    updateUrl(urlSearch, selectedCategory, newTag, 1);
  };

  const scrollRafRef = useRef<number | null>(null);

  const handlePageChange = (page: number) => {
    updateUrl(urlSearch, selectedCategory, selectedTag, page);
    if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
    scrollRafRef.current = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  const clearAll = () => { 
    setSearchInput(''); // Clear local
    updateUrl('', '', '', 1); // Clear URL
  };

  // ── Filter logic ─────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = allBlogs;

    // Use urlSearch as truth
    if (urlSearch.trim()) {
      const q = urlSearch.toLowerCase().trim();
      result = result.filter(
        (b) =>
          b.Title.toLowerCase().includes(q) ||
          (b.Description ?? '').toLowerCase().includes(q) ||
          (b.Content ?? '').toLowerCase().includes(q) ||
          (b.Tags ?? []).some((t) => t.toLowerCase().includes(q)) ||
          (b.Category ?? '').toLowerCase().includes(q)
      );
    }

    if (selectedCategory) {
      const cat = selectedCategory.toLowerCase().trim();
      result = result.filter((b) => (b.Category ?? '').toLowerCase().trim() === cat);
    }

    if (selectedTag) {
      const tag = selectedTag.toLowerCase().trim();
      result = result.filter((b) => (b.Tags ?? []).some((t) => t.toLowerCase().trim() === tag));
    }

    return result;
  }, [allBlogs, urlSearch, selectedCategory, selectedTag]);

  // We handle clearing via the clearAll function defined above.
  const hasFilters = urlSearch || selectedCategory || selectedTag;

  const totalPages = Math.max(1, Math.ceil(filtered.length / postsPerPage));
  const currentPageClamped = Math.min(Math.max(1, currentPage), totalPages);

  const getPaginationItems = (currentPage: number, totalPages: number) => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const paginationItems = getPaginationItems(currentPageClamped, totalPages);

  if (error) {
    return (
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12 bg-[#f8f9fa] dark:bg-[#1e1e1e] rounded-sm">
          <p className="text-[#dc3545] dark:text-[#ff6b6b]">{labels.failedToLoad}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 md:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Controls bar ── */}
        <div className="flex gap-3 items-center mb-3">
          {/* Search input */}
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={labels.searchPlaceholder}
              className="w-full pl-10 pr-10 py-2.5 text-sm bg-white dark:bg-[#1e1e1e] text-[#333] dark:text-[#e0e0e0] placeholder-[#999] border-0 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#191970]/20 transition-all"
              style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}
            />
            {searchInput && (
              <button onClick={() => handleSearchChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#191970] transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>

          {/* Category select — matches vanilla .filter-select */}
          {categories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="py-2.5 px-3 text-sm bg-white dark:bg-[#1e1e1e] text-[#333] dark:text-[#e0e0e0] border-0 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#191970]/20 cursor-pointer transition-all min-w-[140px]"
              style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}
            >
              <option value="">{labels.allCategories}</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}

          {/* Tag select */}
          {tags.length > 0 && (
            <select
              value={selectedTag}
              onChange={(e) => handleTagChange(e.target.value)}
              className="py-2.5 px-3 text-sm bg-white dark:bg-[#1e1e1e] text-[#333] dark:text-[#e0e0e0] border-0 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#191970]/20 cursor-pointer transition-all min-w-[120px] hidden md:block"
              style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}
            >
              <option value="">{labels.allTags}</option>
              {tags.map((tag) => (
                <option key={tag} value={tag}>#{tag}</option>
              ))}
            </select>
          )}

          {/* Filter toggle for tag pills on mobile */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-sm bg-white dark:bg-[#1e1e1e] text-[#191970] dark:text-[#ffd700] transition-all hover:-translate-y-0.5 hover:bg-[#191970] hover:text-white"
            style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}
            aria-label="Toggle filters"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
        </div>

        {/* ── Expandable tag pills panel ── */}
        {showFilters && tags.length > 0 && (
          <div className="mb-4 p-4 bg-[#f8f9fa] dark:bg-[#1e1e1e] rounded-sm" style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}>
            <p className="text-[10px] font-semibold text-[#666] uppercase tracking-widest mb-2">
              {labels.tags}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagChange(tag)}
                  className="px-2.5 py-1 text-[11px] rounded-full transition-all"
                  style={{
                    background: selectedTag === tag ? '#191970' : 'rgba(25,25,112,0.07)',
                    color: selectedTag === tag ? '#fff' : '#191970',
                  }}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Active filter chips + result count ── */}
        <div className="flex items-center justify-between flex-wrap gap-2 mb-6">
          <p className="text-xs text-[#666] dark:text-[#b0b0b0]">
            {language === 'zh'
              ? `${labels.showing} ${filtered.length} ${labels.posts}`
              : `${labels.showing} ${filtered.length} ${filtered.length === 1 ? labels.post : labels.posts}${allBlogs.length !== filtered.length ? ` ${labels.of} ${allBlogs.length}` : ''}`}
          </p>

          {hasFilters && (
            <div className="flex items-center gap-2 flex-wrap">
              {selectedCategory && (
                <span className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full" style={{ background: '#191970', color: '#fff' }}>
                  {selectedCategory}
                  <button onClick={() => handleCategoryChange('')} className="ml-1 hover:opacity-70">×</button>
                </span>
              )}
              {selectedTag && (
                <span className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full" style={{ background: '#191970', color: '#fff' }}>
                  #{selectedTag}
                  <button onClick={() => handleTagChange(selectedTag)} className="ml-1 hover:opacity-70">×</button>
                </span>
              )}
              <button onClick={clearAll} className="text-xs text-[#191970] dark:text-[#ffd700] hover:underline">
                {labels.clearAll}
              </button>
            </div>
          )}
        </div>

        {/* ── Grid ── */}
        <BlogGrid
          blogs={filtered.slice((currentPageClamped - 1) * postsPerPage, currentPageClamped * postsPerPage)}
          language={language}
          isEmpty={filtered.length === 0}
          emptyMessage={
            hasFilters ? labels.noMatchingPosts : labels.noBlogPosts
          }
        />

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center md:justify-start items-center gap-1 md:gap-2">
            {currentPageClamped > 1 && (
              <button
                onClick={() => handlePageChange(Math.max(1, currentPageClamped - 1))}
                className="px-2 h-10 flex items-center justify-center text-[#666] dark:text-[#b0b0b0] hover:text-[#191970] dark:hover:text-white transition-all text-xs font-bold tracking-wider"
                aria-label="Previous page"
              >
                {labels.prev}
              </button>
            )}
            
            {paginationItems.map((item, idx) => (
              item === '...' ? (
                <span key={`ellipsis-${idx}`} className="px-1 text-[#666] dark:text-[#b0b0b0]">
                  ...
                </span>
              ) : (
                <button
                  key={`page-${item}`}
                  onClick={() => handlePageChange(item as number)}
                  className={`w-10 h-10 flex items-center justify-center rounded-sm transition-all text-sm font-medium ${
                    currentPageClamped === item
                      ? 'bg-[#191970] text-white dark:bg-white dark:text-[#121212]'
                      : 'bg-transparent text-[#666] dark:text-[#b0b0b0] hover:text-[#191970] dark:hover:text-white'
                  }`}
                >
                  {item}
                </button>
              )
            ))}

            {currentPageClamped < totalPages && (
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPageClamped + 1))}
                className="px-2 h-10 flex items-center justify-center text-[#666] dark:text-[#b0b0b0] hover:text-[#191970] dark:hover:text-white transition-all text-xs font-bold tracking-wider"
                aria-label="Next page"
              >
                {labels.next}
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}