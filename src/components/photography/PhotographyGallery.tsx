'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Photo } from '@/lib/strapi/photography';
import { MasonryGrid } from './MasonryGrid';
import { PhotoLightbox } from './PhotoLightbox';

interface PhotographyGalleryProps {
  initialPhotos: Photo[];
  language: 'en' | 'zh';
  initialPageCount?: number;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const PAGE_SIZE = 16; // slightly larger batch for smoother infinite scroll

export function PhotographyGallery({ initialPhotos, language, initialPageCount = 1 }: PhotographyGalleryProps) {
  // Photos arrive already shuffled from the server (unique per visitor, baked into
  // the SSR HTML), so we render them as-is — no client reshuffle, no reflow.
  const [photos, setPhotos]           = useState<Photo[]>(initialPhotos);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [displayedCount, setDisplayedCount]     = useState(PAGE_SIZE);
  const [lightboxPhoto, setLightboxPhoto]       = useState<Photo | null>(null);
  const [isLoadingMore, setIsLoadingMore]       = useState(false);
  const [currentPage, setCurrentPage]           = useState(1);
  const [hasMorePages, setHasMorePages]         = useState(initialPageCount > 1);
  const [isFetchingPage, setIsFetchingPage]     = useState(false);

  const searchRef   = useRef<HTMLInputElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null); // bottom sentinel for IntersectionObserver

  // Re-sync if the server delivers a fresh set (e.g. locale change / revalidation).
  // On first mount the values are identical, so React bails out — no reflow.
  useEffect(() => {
    setPhotos(initialPhotos);
    setCurrentPage(1);
    setDisplayedCount(PAGE_SIZE);
    setHasMorePages(initialPageCount > 1);
  }, [initialPhotos, initialPageCount]);

  // Categories + their counts, computed in a single pass (was O(categories × photos)).
  const { categories, categoryCounts } = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of photos) {
      if (p.category) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    }
    return { categories: Array.from(counts.keys()).sort(), categoryCounts: counts };
  }, [photos]);

  const filteredPhotos = useMemo(() => {
    return photos.filter((photo) => {
      if (selectedCategory && photo.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          photo.title.toLowerCase().includes(q) ||
          photo.location.toLowerCase().includes(q) ||
          (photo.tags ?? []).some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [photos, selectedCategory, searchQuery]);

  const displayedPhotos = useMemo(
    () => filteredPhotos.slice(0, displayedCount),
    [filteredPhotos, displayedCount]
  );

  const hasMore = displayedCount < filteredPhotos.length;

  // ── Infinite scroll via IntersectionObserver ──────────────────────────────
  const loadMore = useCallback(async () => {
    if (isLoadingMore || isFetchingPage) return;
    
    if (hasMore) {
      setIsLoadingMore(true);
      // Small timeout gives the browser a frame to paint existing cards first
      setTimeout(() => {
        setDisplayedCount((prev) => Math.min(prev + PAGE_SIZE, filteredPhotos.length));
        setIsLoadingMore(false);
      }, 150);
    } else if (hasMorePages) {
      setIsFetchingPage(true);
      const nextPage = currentPage + 1;
      
      try {
        const res = await fetch(`/api/photography?page=${nextPage}&pageSize=100&language=${language}`);
        const data = await res.json();
        
        if (data.photos && Array.isArray(data.photos) && data.photos.length > 0) {
          const newPhotos = shuffleArray<Photo>(data.photos);
          setPhotos((prev) => [...prev, ...newPhotos]);
          setCurrentPage(nextPage);
          if (nextPage >= data.pageCount) {
            setHasMorePages(false);
          }
          setDisplayedCount((prev) => prev + PAGE_SIZE);
        } else {
          setHasMorePages(false);
        }
      } catch (error) {
        console.error("Failed to load more photos", error);
      } finally {
        setIsFetchingPage(false);
      }
    }
  }, [hasMore, hasMorePages, isLoadingMore, isFetchingPage, filteredPhotos.length, currentPage, language]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      {
        // Start loading 400px before the sentinel enters the viewport
        // so photos appear before the user reaches the bottom
        rootMargin: '0px 0px 400px 0px',
        threshold: 0,
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  // Reset displayed count when filter/search changes
  useEffect(() => {
    setDisplayedCount(PAGE_SIZE);
  }, [selectedCategory, searchQuery]);

  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory(null);
    searchRef.current?.focus();
  }, []);

  const handlePhotoClick  = useCallback((photo: Photo) => setLightboxPhoto(photo), []);
  const handleNavigateTo  = useCallback((photo: Photo) => setLightboxPhoto(photo), []);

  const handlePrevPhoto = useCallback(() => {
    if (!lightboxPhoto) return;
    const i = filteredPhotos.findIndex((p) => p.id === lightboxPhoto.id);
    if (i > 0) setLightboxPhoto(filteredPhotos[i - 1]);
  }, [lightboxPhoto, filteredPhotos]);

  const handleNextPhoto = useCallback(() => {
    if (!lightboxPhoto) return;
    const i = filteredPhotos.findIndex((p) => p.id === lightboxPhoto.id);
    if (i < filteredPhotos.length - 1) setLightboxPhoto(filteredPhotos[i + 1]);
  }, [lightboxPhoto, filteredPhotos]);

  const lightboxIndex = lightboxPhoto
    ? filteredPhotos.findIndex((p) => p.id === lightboxPhoto.id)
    : -1;

  const t = language === 'zh'
    ? { placeholder: '按标题或位置搜索...', all: '所有照片', reset: '重置', noPhotos: '未找到匹配的照片。' }
    : { placeholder: 'Search by title or location...', all: 'All', reset: 'Reset', noPhotos: 'No photos match your search.' };

  const activeFilters = searchQuery || selectedCategory;

  return (
    <div className="w-full">

      {/* ── Search + filter bar ─────────────────────────────────────────── */}
      <div className="mb-6 space-y-3">

        {/* Search */}
        <div className="relative group">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#191970] dark:group-focus-within:text-[#ffd700] transition-colors pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={searchRef}
            type="text"
            placeholder={t.placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#191970]/30 dark:focus:ring-[#ffd700]/30 focus:border-[#191970]/50 dark:focus:border-[#ffd700]/50 transition-all"
            aria-label="Search photos"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
              selectedCategory === null
                ? 'bg-[#191970] text-white border-[#191970] dark:bg-[#ffd700] dark:text-[#191970] dark:border-[#ffd700] shadow-sm'
                : 'bg-transparent text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-[#191970]/40 dark:hover:border-[#ffd700]/40 hover:text-[#191970] dark:hover:text-[#ffd700]'
            }`}
          >
            {t.all}
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${selectedCategory === null ? 'bg-white/20 dark:bg-[#191970]/20' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
              {photos.length}
            </span>
          </button>

          {categories.map((cat) => {
            const count = categoryCounts.get(cat) ?? 0;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                  selectedCategory === cat
                    ? 'bg-[#191970] text-white border-[#191970] dark:bg-[#ffd700] dark:text-[#191970] dark:border-[#ffd700] shadow-sm'
                    : 'bg-transparent text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-[#191970]/40 dark:hover:border-[#ffd700]/40 hover:text-[#191970] dark:hover:text-[#ffd700]'
                }`}
              >
                {cat}
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${selectedCategory === cat ? 'bg-white/20 dark:bg-[#191970]/20' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}

          {activeFilters && (
            <button
              onClick={handleResetFilters}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-600 transition-all duration-200"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {t.reset}
            </button>
          )}
        </div>

        {/* Results count */}
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {activeFilters
            ? `${filteredPhotos.length} of ${photos.length} photos`
            : `${photos.length} photos`}
        </p>
      </div>

      {/* ── Gallery ─────────────────────────────────────────────────────── */}
      {displayedPhotos.length > 0 ? (
        <>
          <MasonryGrid photos={displayedPhotos} onPhotoClick={handlePhotoClick} />

          {/* Invisible sentinel — IntersectionObserver watches this */}
          <div ref={sentinelRef} className="w-full h-px" aria-hidden="true" />

          {/* Subtle loading indicator while next batch is appended */}
          {(isLoadingMore || isFetchingPage) && (
            <div className="flex justify-center py-8">
              <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-sm">
                <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600 border-t-[#191970] dark:border-t-[#ffd700] animate-spin" />
                Loading more photos…
              </div>
            </div>
          )}

          {/* End-of-gallery message */}
          {!hasMore && !hasMorePages && filteredPhotos.length > PAGE_SIZE && (
            <p className="text-center text-xs text-gray-300 dark:text-gray-600 py-6">
              All {filteredPhotos.length} photos loaded
            </p>
          )}
        </>
      ) : (
        initialPhotos.length > 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#191970]/5 dark:bg-[#ffd700]/5 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-[#191970]/30 dark:text-[#ffd700]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">{t.noPhotos}</p>
            <button onClick={handleResetFilters} className="mt-4 text-sm text-[#191970] dark:text-[#ffd700] hover:underline font-medium">
              {t.reset} filters
            </button>
          </div>
        )
      )}

      {/* ── Lightbox ─────────────────────────────────────────────────────── */}
      {lightboxPhoto && (
        <PhotoLightbox
          photo={lightboxPhoto}
          allPhotos={filteredPhotos}
          onClose={() => setLightboxPhoto(null)}
          onPrevious={handlePrevPhoto}
          onNext={handleNextPhoto}
          hasPrevious={lightboxIndex > 0}
          hasNext={lightboxIndex < filteredPhotos.length - 1}
          onNavigateTo={handleNavigateTo}
        />
      )}
    </div>
  );
}