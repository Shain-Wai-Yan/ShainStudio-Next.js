'use client';

import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { Photo } from '@/lib/strapi/photography';

interface PhotoLightboxProps {
  photo: Photo;
  allPhotos: Photo[];
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  onNavigateTo: (photo: Photo) => void;
}

// ─── URL helpers ──────────────────────────────────────────────────────────────

function cloudinary(url: string | null, transform: string): string {
  if (!url) return '';
  if (!url.includes('cloudinary.com')) return url;
  // Don't double-transform
  if (url.includes('/upload/c_') || url.includes('/upload/w_')) return url;
  return url.replace('/upload/', `/upload/${transform}/`);
}

/** Tiny blurred placeholder ~200 bytes — shown instantly */
const thumb = (url: string | null) =>
  cloudinary(url, 'c_scale,w_30,q_10,f_auto,e_blur:500');

/** Medium preview ~20–40 KB — visible within ~200 ms on most connections */
const preview = (url: string | null) =>
  cloudinary(url, 'c_scale,w_400,q_60,f_auto');

/** Full resolution — loads in background while preview is already showing */
const full = (url: string | null) =>
  cloudinary(url, 'c_scale,w_1200,q_90,f_auto');

/** Related thumbnail */
const relThumb = (url: string | null) =>
  cloudinary(url, 'c_scale,w_300,q_70,f_auto');

// ─── Related photos helper ────────────────────────────────────────────────────

function getRelated(photo: Photo, allPhotos: Photo[]): Photo[] {
  const same   = allPhotos.filter(p => p.id !== photo.id && p.category === photo.category);
  const others = allPhotos.filter(p => p.id !== photo.id && p.category !== photo.category);
  return [...same, ...others].slice(0, 6);
}

// ─── Progressive image hook ───────────────────────────────────────────────────
// Stage 0 → show blurred thumb (instant)
// Stage 1 → show medium preview (~200 ms)
// Stage 2 → show full resolution (background load)

type Stage = 0 | 1 | 2;

function useProgressiveImage(photoId: number, imageUrl: string | null) {
  const [stage, setStage] = useState<Stage>(0);
  const [prevId, setPrevId] = useState(photoId);
  const previewRef = useRef<HTMLImageElement | null>(null);
  const fullRef    = useRef<HTMLImageElement | null>(null);

  // Reset stage during render if photoId changes — faster and avoids effect cascading
  if (photoId !== prevId) {
    setPrevId(photoId);
    setStage(0);
  }

  useEffect(() => {
    if (!imageUrl) return;

    // Step 1: load medium preview
    const img1 = new window.Image();
    previewRef.current = img1;
    img1.src = preview(imageUrl);
    img1.onload = () => {
      setStage(1);

      // Step 2: load full res in the background
      const img2 = new window.Image();
      fullRef.current = img2;
      img2.src = full(imageUrl);
      img2.onload = () => setStage(2);
    };

    return () => {
      // Cancel in-flight loads if user navigates away
      if (previewRef.current) previewRef.current.onload = null;
      if (fullRef.current)    fullRef.current.onload    = null;
    };
  }, [photoId, imageUrl]); // re-run when photo changes

  const activeSrc: string =
    stage === 2 ? full(imageUrl) :
    stage === 1 ? preview(imageUrl) :
                  thumb(imageUrl);

  const isSharp = stage === 2;
  const blurClass =
    stage === 0 ? 'blur-xl scale-105' :
    stage === 1 ? 'blur-[1px]' :
                  'blur-0 scale-100';

  return { activeSrc, isSharp, blurClass, stage };
}

// ─── Preload adjacent photos ──────────────────────────────────────────────────

function preloadAdjacent(photos: Photo[], currentId: number) {
  const idx = photos.findIndex(p => p.id === currentId);
  const toPreload = [
    photos[idx - 1],
    photos[idx + 1],
  ].filter(Boolean);

  toPreload.forEach(p => {
    if (!p.image) return;
    const img = new window.Image();
    img.src = preview(p.image); // preload medium preview of neighbours
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PhotoLightbox({
  photo,
  allPhotos,
  onClose,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  onNavigateTo,
}: PhotoLightboxProps) {
  const [isVisible, setIsVisible] = useState(false);

  const { activeSrc, blurClass, stage } = useProgressiveImage(photo.id, photo.image);

  const relatedPhotos = useMemo(() => getRelated(photo, allPhotos), [photo, allPhotos]);

  // Fade in on mount
  useEffect(() => {
    const id = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Preload neighbours so they feel instant when navigating
  useEffect(() => {
    preloadAdjacent(allPhotos, photo.id);
  }, [photo.id, allPhotos]);

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Keyboard
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape')                     onClose();
    else if (e.key === 'ArrowLeft' && hasPrevious) onPrevious();
    else if (e.key === 'ArrowRight' && hasNext)    onNext();
  }, [onClose, onPrevious, onNext, hasPrevious, hasNext]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // ── Shared image element ──────────────────────────────────────────────────
  const imageEl = (maxHeightClass: string) => (
    <div className={`relative flex items-center justify-center w-full h-full ${maxHeightClass}`}>
      {activeSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          // We use a plain <img> here (not next/image) because:
          // 1. We're swapping src progressively and need full control
          // 2. The lightbox is full-viewport so next/image's size optimisation
          //    doesn't add value — we already serve optimised Cloudinary URLs
          src={activeSrc}
          alt={photo.title}
          className={`max-w-full max-h-full object-contain rounded-xl shadow-2xl transition-all duration-500 ${blurClass}`}
          draggable={false}
        />
      )}

      {/* Loading ring — only shown while still on thumb (stage 0) */}
      {stage === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-[#ffd700] animate-spin" />
        </div>
      )}

      {/* Subtle "HD" indicator when full res finishes loading */}
      {stage === 2 && (
        <span className="absolute top-2 left-2 text-[9px] px-1.5 py-0.5 rounded bg-black/40 text-white/40 pointer-events-none select-none">
          HD
        </span>
      )}
    </div>
  );

  // ── Info panel (shared) ───────────────────────────────────────────────────
  const infoPanel = (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h2 className="text-white font-semibold text-base leading-tight truncate">
          {photo.title}
        </h2>
        {photo.location && (
          <p className="text-white/50 text-sm mt-1 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 shrink-0 text-[#ffd700]/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {photo.location}
          </p>
        )}
        {photo.tags && photo.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {photo.tags.map((tag, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/8 text-white/50 border border-white/10">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
      {photo.category && (
        <span className="shrink-0 text-xs px-2.5 py-1 rounded-full bg-[#191970]/60 text-[#ffd700] border border-[#ffd700]/20 font-medium">
          {photo.category}
        </span>
      )}
    </div>
  );

  return (
    <div
      className={`fixed inset-0 z-[9999] flex transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      role="dialog"
      aria-modal="true"
      aria-label={`Photo: ${photo.title}`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/95 backdrop-blur-sm" onClick={onClose} />

      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all duration-200 hover:scale-110 border border-white/10"
        aria-label="Close"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* ── DESKTOP: sidebar + main ──────────────────────────────────────── */}
      <div className="relative z-10 hidden lg:flex w-full h-full">

        {/* Related sidebar */}
        <div className="w-64 xl:w-72 h-full flex flex-col border-r border-white/8 bg-black/40 shrink-0">
          <div className="px-4 pt-5 pb-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Related</p>
            {photo.category && (
              <p className="text-xs text-[#ffd700]/70 mt-0.5 font-medium">{photo.category}</p>
            )}
          </div>
          <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-2">
            {relatedPhotos.length > 0 ? relatedPhotos.map((rel) => (
              <button
                key={rel.id}
                onClick={() => onNavigateTo(rel)}
                className={`w-full text-left rounded-lg overflow-hidden group relative transition-all duration-200 border ${
                  rel.id === photo.id
                    ? 'border-[#ffd700]/60 ring-1 ring-[#ffd700]/30'
                    : 'border-white/5 hover:border-white/20'
                }`}
              >
                <div className="relative aspect-[4/3] bg-white/5">
                  {rel.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={relThumb(rel.image)}
                      alt={rel.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  )}
                  <div className="absolute inset-0 bg-[#191970]/0 group-hover:bg-[#191970]/25 transition-colors duration-200" />
                </div>
                <div className="px-2.5 py-2 bg-black/60">
                  <p className="text-white text-xs font-medium line-clamp-1">{rel.title}</p>
                  {rel.location && (
                    <p className="text-white/40 text-[10px] mt-0.5 line-clamp-1">{rel.location}</p>
                  )}
                </div>
              </button>
            )) : (
              <p className="text-white/20 text-xs text-center py-8">No related photos</p>
            )}
          </div>
        </div>

        {/* Main area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Prev */}
          {hasPrevious && (
            <button
              onClick={onPrevious}
              className="absolute left-[264px] xl:left-[288px] top-1/2 -translate-y-1/2 ml-3 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-[#191970]/80 text-white flex items-center justify-center transition-all duration-200 hover:scale-110 border border-white/10"
              aria-label="Previous photo"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {/* Next */}
          {hasNext && (
            <button
              onClick={onNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-[#191970]/80 text-white flex items-center justify-center transition-all duration-200 hover:scale-110 border border-white/10"
              aria-label="Next photo"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Image */}
          <div className="flex-1 flex items-center justify-center px-16 py-6 min-h-0">
            {imageEl('max-h-[calc(100vh-180px)]')}
          </div>

          {/* Info bar */}
          <div className="px-6 pb-5 pt-3 border-t border-white/8 bg-black/30">
            <div className="max-w-3xl">
              {infoPanel}
              <p className="text-white/20 text-xs mt-3">← → to navigate · Esc to close</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE: full screen + bottom strip ──────────────────────────── */}
      <div className="relative z-10 flex lg:hidden flex-col w-full h-full">
        {/* Prev / Next */}
        {hasPrevious && (
          <button
            onClick={onPrevious}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center border border-white/10"
            aria-label="Previous"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        {hasNext && (
          <button
            onClick={onNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center border border-white/10"
            aria-label="Next"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Image */}
        <div className="flex-1 flex items-center justify-center px-4 pt-12 pb-2 min-h-0">
          {imageEl('max-h-[52vh]')}
        </div>

        {/* Info */}
        <div className="px-4 py-2">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-white font-semibold text-sm truncate">{photo.title}</h2>
            {photo.category && (
              <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-[#191970]/70 text-[#ffd700] border border-[#ffd700]/20">
                {photo.category}
              </span>
            )}
          </div>
          {photo.location && (
            <p className="text-white/40 text-xs mt-0.5 flex items-center gap-1">
              <svg className="w-3 h-3 shrink-0 text-[#ffd700]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {photo.location}
            </p>
          )}
        </div>

        {/* Related strip */}
        {relatedPhotos.length > 0 && (
          <div className="border-t border-white/8 bg-black/50">
            <p className="px-3 pt-2 pb-1 text-[9px] font-semibold uppercase tracking-widest text-white/25">
              Related {photo.category && `· ${photo.category}`}
            </p>
            <div
              className="flex gap-2 px-3 pb-3 overflow-x-auto"
              style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
            >
              {relatedPhotos.map((rel) => (
                <button
                  key={rel.id}
                  onClick={() => onNavigateTo(rel)}
                  className={`shrink-0 w-20 rounded-lg overflow-hidden border transition-all duration-200 ${
                    rel.id === photo.id ? 'border-[#ffd700]/60' : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <div className="relative aspect-[4/3] bg-white/5">
                    {rel.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={relThumb(rel.image)}
                        alt={rel.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    )}
                  </div>
                  <p className="text-white/50 text-[9px] px-1.5 py-1 line-clamp-1">{rel.title}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}