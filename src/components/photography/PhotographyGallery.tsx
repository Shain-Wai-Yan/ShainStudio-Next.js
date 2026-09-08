'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Photo, PhotoCollection, PhotoFeedPage } from '@/lib/strapi/photography';
import { MasonryGrid } from './MasonryGrid';

const PhotoLightbox = dynamic(() => import('./PhotoLightbox').then((module) => module.PhotoLightbox), { ssr: false });
const PAGE_SIZE = 24;
const SEED_KEY = 'shain-photography-seed';

type Connection = { saveData?: boolean; effectiveType?: string };
type NetworkMode = 'manual' | 'near' | 'prefetch';

function networkMode(): NetworkMode {
  const connection = (navigator as Navigator & { connection?: Connection }).connection;
  if (connection?.saveData || connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g') return 'manual';
  if (connection?.effectiveType === '3g') return 'near';
  return 'prefetch';
}

function photoKey(photo: Photo): string {
  return photo.documentId ?? String(photo.id);
}

function appendUnique(current: Photo[], incoming: Photo[]): Photo[] {
  const existing = new Set(current.map(photoKey));
  return [...current, ...incoming.filter((photo) => !existing.has(photoKey(photo)))];
}

function GallerySkeleton() {
  const heights = [260, 190, 330, 230, 300, 210, 280, 350, 220, 310, 200, 270];
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-3" aria-label="Loading photography">
      {heights.map((height, index) => <div key={index} className="mb-3 break-inside-avoid rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" style={{ height }} />)}
    </div>
  );
}

export function PhotographyGallery({ language }: { language: 'en' | 'zh' }) {
  const [seed, setSeed] = useState<number | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [collections, setCollections] = useState<PhotoCollection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [buffered, setBuffered] = useState<PhotoFeedPage | null>(null);
  const [lightboxPhoto, setLightboxPhoto] = useState<Photo | null>(null);
  const [isToolbarOpen, setIsToolbarOpen] = useState(true);
  const prefetchRef = useRef<HTMLDivElement>(null);
  const appendRef = useRef<HTMLDivElement>(null);
  const nextAbortRef = useRef<AbortController | null>(null);
  const nextInFlightRef = useRef(false);
  const requestKeyRef = useRef('');
  const activeTriggerRef = useRef<HTMLButtonElement | null>(null);

  const labels = language === 'zh'
    ? { search: '搜索标题、地点、分类或标签…', all: '探索全部', loading: '正在加载照片…', more: '加载更多', retry: '重试', empty: '没有找到照片。', results: '张照片', collections: '作品集', hide: '收起筛选', show: '筛选' }
    : { search: 'Search titles, places, collections, or tags…', all: 'Explore all', loading: 'Loading photography…', more: 'Load more', retry: 'Try again', empty: 'No photos found.', results: 'photos', collections: 'Collections', hide: 'Hide toolbar', show: 'Filters' };

  useEffect(() => {
    const stored = sessionStorage.getItem(SEED_KEY);
    const nextSeed = stored == null ? crypto.getRandomValues(new Uint32Array(1))[0] % 64 : Number(stored) % 64;
    sessionStorage.setItem(SEED_KEY, String(nextSeed));
    const query = new URLSearchParams(window.location.search);
    setSelectedCollection(query.get('collection') ?? '');
    setSearch((query.get('q') ?? '').slice(0, 80));
    setSeed(nextSeed);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/photography/collections?language=${language}`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Collections unavailable')))
      .then((data) => setCollections(Array.isArray(data.collections) ? data.collections : []))
      .catch((reason) => { if (reason instanceof Error && reason.name !== 'AbortError') console.warn(reason.message); });
    return () => controller.abort();
  }, [language]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(search.trim().length >= 2 ? search.trim() : ''), 300);
    return () => window.clearTimeout(timeout);
  }, [search]);

  const requestPage = useCallback(async (targetPage: number, signal: AbortSignal): Promise<PhotoFeedPage> => {
    const params = new URLSearchParams({ page: String(targetPage), pageSize: String(PAGE_SIZE), seed: String(seed ?? 0), language });
    if (selectedCollection) params.set('collection', selectedCollection);
    if (debouncedSearch) params.set('search', debouncedSearch);
    const response = await fetch(`/api/photography?${params}`, { signal });
    if (!response.ok) throw new Error('Photography is temporarily unavailable.');
    return await response.json() as PhotoFeedPage;
  }, [debouncedSearch, language, seed, selectedCollection]);

  useEffect(() => {
    if (seed == null) return;
    const controller = new AbortController();
    nextAbortRef.current?.abort();
    setBuffered(null);
    setLoading(true);
    setError('');
    setPhotos([]);
    setPage(0);
    requestKeyRef.current = `${seed}:${language}:${selectedCollection}:${debouncedSearch}`;
    requestPage(1, controller.signal)
      .then((data) => {
        setPhotos(data.photos);
        setPage(data.page);
        setPageCount(data.pageCount);
        setTotal(data.total);
      })
      .catch((reason) => { if (reason instanceof Error && reason.name !== 'AbortError') setError(reason.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [debouncedSearch, language, requestPage, seed, selectedCollection]);

  useEffect(() => {
    if (seed == null) return;
    const params = new URLSearchParams();
    if (selectedCollection) params.set('collection', selectedCollection);
    if (search.trim()) params.set('q', search.trim().slice(0, 80));
    const next = `${window.location.pathname}${params.size ? `?${params}` : ''}`;
    window.history.replaceState(window.history.state, '', next);
  }, [search, seed, selectedCollection]);

  const hasMore = page > 0 && page < pageCount;

  const prefetchNext = useCallback(async () => {
    if (!hasMore || nextInFlightRef.current || buffered || document.visibilityState !== 'visible' || networkMode() !== 'prefetch') return;
    const targetPage = page + 1;
    const key = requestKeyRef.current;
    const controller = new AbortController();
    nextAbortRef.current = controller;
    nextInFlightRef.current = true;
    setLoadingMore(true);
    try {
      const data = await requestPage(targetPage, controller.signal);
      if (key === requestKeyRef.current && data.page === targetPage) setBuffered(data);
    } catch (reason) {
      if (reason instanceof Error && reason.name !== 'AbortError') console.warn(reason.message);
    } finally {
      nextInFlightRef.current = false;
      if (!controller.signal.aborted) setLoadingMore(false);
    }
  }, [buffered, hasMore, page, requestPage]);

  const appendNext = useCallback(async (manual = false) => {
    if (!hasMore || nextInFlightRef.current || (!manual && networkMode() === 'manual')) return;
    const targetPage = page + 1;
    if (buffered?.page === targetPage) {
      setPhotos((current) => appendUnique(current, buffered.photos));
      setPage(buffered.page);
      setPageCount(buffered.pageCount);
      setTotal(buffered.total);
      setBuffered(null);
      return;
    }
    const key = requestKeyRef.current;
    const controller = new AbortController();
    nextAbortRef.current = controller;
    nextInFlightRef.current = true;
    setLoadingMore(true);
    try {
      const data = await requestPage(targetPage, controller.signal);
      if (key !== requestKeyRef.current) return;
      setPhotos((current) => appendUnique(current, data.photos));
      setPage(data.page);
      setPageCount(data.pageCount);
      setTotal(data.total);
    } catch (reason) {
      if (reason instanceof Error && reason.name !== 'AbortError') setError(reason.message);
    } finally {
      nextInFlightRef.current = false;
      if (!controller.signal.aborted) setLoadingMore(false);
    }
  }, [buffered, hasMore, page, requestPage]);

  useEffect(() => {
    const target = prefetchRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) void prefetchNext(); }, { rootMargin: '0px 0px 800px 0px' });
    observer.observe(target);
    return () => observer.disconnect();
  }, [prefetchNext]);

  useEffect(() => {
    const target = appendRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) void appendNext(false); }, { rootMargin: '0px 0px 200px 0px' });
    observer.observe(target);
    return () => observer.disconnect();
  }, [appendNext]);

  useEffect(() => () => nextAbortRef.current?.abort(), []);

  const lightboxIndex = lightboxPhoto ? photos.findIndex((photo) => photoKey(photo) === photoKey(lightboxPhoto)) : -1;
  const openPhoto = useCallback((photo: Photo) => {
    activeTriggerRef.current = document.activeElement instanceof HTMLButtonElement ? document.activeElement : null;
    setLightboxPhoto(photo);
  }, []);
  const closePhoto = useCallback(() => {
    setLightboxPhoto(null);
    requestAnimationFrame(() => activeTriggerRef.current?.focus());
  }, []);
  const currentCollection = useMemo(() => collections.find((collection) => collection.slug === selectedCollection), [collections, selectedCollection]);

  const renderCollectionPills = () => (
    <>
      <button
        type="button"
        onClick={() => setSelectedCollection('')}
        aria-pressed={!selectedCollection}
        className={`inline-flex items-center gap-1.5 shrink-0 rounded-full px-3 sm:px-3.5 py-1 sm:py-1.5 text-xs sm:text-[13px] font-medium transition-all ${
          !selectedCollection
            ? 'bg-[#191970] text-white shadow-xs dark:bg-[#ffd700] dark:text-[#191970]'
            : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200/80 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        <span>{labels.all}</span>
        {!selectedCollection && total > 0 && (
          <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px] sm:text-[11px] font-semibold dark:bg-black/15">
            {total}
          </span>
        )}
      </button>
      {collections.map((collection) => {
        const isActive = selectedCollection === collection.slug;
        return (
          <button
            key={collection.slug}
            type="button"
            onClick={() => setSelectedCollection(collection.slug)}
            aria-pressed={isActive}
            className={`inline-flex items-center gap-1.5 shrink-0 rounded-full px-3 sm:px-3.5 py-1 sm:py-1.5 text-xs sm:text-[13px] font-medium transition-all ${
              isActive
                ? 'bg-[#191970] text-white shadow-xs dark:bg-[#ffd700] dark:text-[#191970]'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200/80 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <span>{collection.name}</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] sm:text-[11px] font-medium ${
                isActive
                  ? 'bg-white/20 dark:bg-black/15'
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              {collection.count}
            </span>
          </button>
        );
      })}
    </>
  );

  return (
    <section className="w-full" aria-labelledby="photography-collections">
      {/* ── Collapsible Gallery Toolbar ── */}
      {!isToolbarOpen ? (
        <div className="sticky top-[80px] sm:top-[86px] z-20 mb-3 flex items-center justify-end">
          <button
            type="button"
            onClick={() => setIsToolbarOpen(true)}
            aria-label={labels.show}
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-200/80 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 shadow-xs backdrop-blur-md transition-all hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[#191970] dark:hover:text-[#ffd700]"
          >
            <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>{currentCollection ? currentCollection.name : labels.show}</span>
            <span className="opacity-60">· {total}</span>
            <svg className="h-3 w-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="sticky top-[80px] sm:top-[86px] z-20 mb-4 -mx-2 px-2 sm:-mx-3 sm:px-3 py-1.5 sm:py-2 bg-gray-50/95 dark:bg-gray-950/95 backdrop-blur-md border-b border-gray-200/60 dark:border-gray-800/60 transition-colors">
          {/* Mobile & Tablet Layout (2 Lines) */}
          <div className="lg:hidden space-y-1.5">
            {/* Line 1: Search + Count + Low-key Hide Button */}
            <div className="flex items-center gap-2">
              <label className="relative flex-1 block">
                <span className="sr-only">{labels.search}</span>
                <svg
                  className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  value={search}
                  maxLength={80}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={labels.search}
                  className="h-8 w-full rounded-full border border-gray-200/90 bg-white pl-8 pr-7 text-xs text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-[#191970] focus:ring-2 focus:ring-[#191970]/15 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 dark:focus:border-[#ffd700] dark:focus:ring-[#ffd700]/20"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    aria-label="Clear search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-gray-400 hover:text-gray-700 dark:hover:text-white"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </label>

              <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap shrink-0">
                {loading ? '…' : `${total}`}
              </span>

              <button
                type="button"
                onClick={() => setIsToolbarOpen(false)}
                aria-label={labels.hide}
                title={labels.hide}
                className="h-7 w-7 shrink-0 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-gray-800 transition-colors"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                </svg>
              </button>
            </div>

            {/* Line 2: Category Quick Press (Horizontally Scrollable across all columns) */}
            <div
              className="flex items-center gap-1.5 overflow-x-auto py-0.5 min-w-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              role="list"
              aria-label={labels.collections}
            >
              {renderCollectionPills()}
            </div>
          </div>

          {/* Desktop Layout (1 Line - spanning all columns) */}
          <div className="hidden lg:flex lg:items-center lg:justify-between lg:gap-3 min-w-0">
            {/* Collection Pills (Spanning full left space across all columns) */}
            <div
              className="flex items-center gap-2 overflow-x-auto py-0.5 flex-1 min-w-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              role="list"
              aria-label={labels.collections}
            >
              {renderCollectionPills()}
            </div>

            {/* Right side: Compact Search + Low-key Hide Button */}
            <div className="flex items-center gap-2 shrink-0">
              <label className="relative block w-32 xl:w-40 focus-within:w-48 xl:focus-within:w-56 transition-all duration-200">
                <span className="sr-only">{labels.search}</span>
                <svg
                  className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  value={search}
                  maxLength={80}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={language === 'zh' ? '搜索…' : 'Search…'}
                  className="h-8 sm:h-8.5 w-full rounded-full border border-gray-200/90 bg-white pl-8 pr-7 text-xs sm:text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-[#191970] focus:ring-2 focus:ring-[#191970]/15 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 dark:focus:border-[#ffd700] dark:focus:ring-[#ffd700]/20"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    aria-label="Clear search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-gray-400 hover:text-gray-700 dark:hover:text-white"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </label>

              <button
                type="button"
                onClick={() => setIsToolbarOpen(false)}
                aria-label={labels.hide}
                title={labels.hide}
                className="h-7 w-7 shrink-0 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-gray-800 transition-colors"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? <GallerySkeleton /> : error && photos.length === 0 ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900/50 dark:bg-red-950/20"><p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p><button type="button" onClick={() => window.location.reload()} className="rounded-full bg-[#191970] px-5 py-2 text-sm font-semibold text-white">{labels.retry}</button></div>
      ) : photos.length === 0 ? <p className="py-24 text-center text-gray-500">{labels.empty}</p> : (
        <>
          <MasonryGrid photos={photos} onPhotoClick={openPhoto} />
          <div ref={prefetchRef} className="h-px" aria-hidden="true" />
          <div ref={appendRef} className="h-px" aria-hidden="true" />
          <div className="flex min-h-24 items-center justify-center py-6">
            {hasMore ? <button type="button" disabled={loadingMore} onClick={() => void appendNext(true)} className="rounded-full border border-[#191970]/30 bg-white px-6 py-2.5 text-sm font-semibold text-[#191970] transition hover:bg-[#191970] hover:text-white disabled:opacity-50 dark:border-[#ffd700]/40 dark:bg-gray-900 dark:text-[#ffd700] dark:hover:bg-[#ffd700] dark:hover:text-[#191970]">{loadingMore ? labels.loading : labels.more}</button> : <p className="text-xs text-gray-400">{total} {labels.results}</p>}
          </div>
        </>
      )}

      {lightboxPhoto && <PhotoLightbox language={language} photo={lightboxPhoto} allPhotos={photos} onClose={closePhoto} onPrevious={() => lightboxIndex > 0 && setLightboxPhoto(photos[lightboxIndex - 1])} onNext={() => lightboxIndex < photos.length - 1 && setLightboxPhoto(photos[lightboxIndex + 1])} hasPrevious={lightboxIndex > 0} hasNext={lightboxIndex < photos.length - 1} onNavigateTo={setLightboxPhoto} />}
    </section>
  );
}
