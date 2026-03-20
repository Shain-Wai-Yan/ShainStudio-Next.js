'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { optimizeCloudinaryUrl } from '@/lib/utils/cloudinary-optimizer';

const BATCH = 4;

interface ProjectGalleryProps {
  images: string[];
  title: string;
  language: 'en' | 'zh';
}

export default function ProjectGallery({ images, title, language }: ProjectGalleryProps) {
  // ── Visible grid state ──────────────────────────────────────────────────────
  const [visibleCount, setVisibleCount] = useState(BATCH);
  const visibleImages = images.slice(0, visibleCount);
  const hasMore = visibleCount < images.length;
  const isExpanded = visibleCount > BATCH;

  // ── Lightbox state ──────────────────────────────────────────────────────────
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const thumbStripRef = useRef<HTMLDivElement>(null);

  const isOpen = selectedIndex !== null;
  const currentImage = isOpen ? images[selectedIndex!] : null;
  const hasPrev = isOpen && images.length > 1;
  const hasNext = isOpen && images.length > 1;

  // ── Navigation helpers ──────────────────────────────────────────────────────
  const openLightbox = useCallback((idx: number) => {
    setSelectedIndex(idx);
    setIsZoomed(false);
  }, []);

  const closeLightbox = useCallback(() => {
    setSelectedIndex(null);
    setIsZoomed(false);
  }, []);

  const goPrev = useCallback(() => {
    setSelectedIndex((i) => (i !== null ? (i - 1 + images.length) % images.length : null));
    setIsZoomed(false);
  }, [images.length]);

  const goNext = useCallback(() => {
    setSelectedIndex((i) => (i !== null ? (i + 1) % images.length : null));
    setIsZoomed(false);
  }, [images.length]);

  // ── Keyboard ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'z' || e.key === 'Z') setIsZoomed((z) => !z);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, closeLightbox, goPrev, goNext]);

  // ── Body scroll lock ────────────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // ── Scroll active thumbnail into view ───────────────────────────────────────
  useEffect(() => {
    if (!isOpen || selectedIndex === null || !thumbStripRef.current) return;
    const strip = thumbStripRef.current;
    const thumb = strip.children[selectedIndex] as HTMLElement;
    if (thumb) {
      thumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [selectedIndex, isOpen]);

  // ── Touch swipe ─────────────────────────────────────────────────────────────
  const handleTouchStart = (e: React.TouchEvent) => setTouchStartX(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) dx < 0 ? goNext() : goPrev();
    setTouchStartX(null);
  };

  if (!images || images.length === 0) return null;

  const imgLabel = (i: number) =>
    `${title} — ${language === 'zh' ? '图片' : 'Image'} ${i + 1} of ${images.length}`;

  return (
    <>
      {/* ── Gallery section ─────────────────────────────────────────────────── */}
      <section className="py-10 bg-[#f8f9fa] dark:bg-[#1a1a1a] border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">

          {/* Header row */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 bg-[#191970] dark:bg-[#ffd700]" aria-hidden="true" />
              <h2 className="text-lg font-bold text-[#191970] dark:text-[#ffd700] tracking-tight">
                {language === 'zh' ? '项目图库' : 'Project Gallery'}
              </h2>
            </div>
            <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 tabular-nums">
              {visibleCount < images.length
                ? `${visibleCount} / ${images.length}`
                : `${images.length} ${language === 'zh' ? '张' : images.length === 1 ? 'image' : 'images'}`}
            </span>
          </div>

          {/* 4-column grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {visibleImages.map((img, idx) => (
              <button
                key={`${img}-${idx}`}
                onClick={() => openLightbox(idx)}
                className="
                  relative aspect-square overflow-hidden group
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-[#191970] dark:focus-visible:ring-[#ffd700]
                  focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#1a1a1a]
                "
                aria-label={imgLabel(idx)}
              >
                <Image
                  src={optimizeCloudinaryUrl(img)}
                  alt={imgLabel(idx)}
                  fill
                  className="object-cover transition-transform duration-400 group-hover:scale-110"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
                {/* Dark overlay on hover */}
                <div className="
                  absolute inset-0
                  bg-[#191970]/0 group-hover:bg-[#191970]/45
                  dark:bg-black/0 dark:group-hover:bg-black/55
                  transition-all duration-300
                  flex items-center justify-center gap-2
                ">
                  <svg className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                  </svg>
                </div>
                {/* Index pill */}
                <span className="
                  absolute bottom-1.5 right-1.5
                  text-[9px] font-bold text-white bg-black/60 px-1.5 py-0.5
                  opacity-0 group-hover:opacity-100 transition-opacity tabular-nums
                ">
                  {idx + 1}
                </span>
              </button>
            ))}
          </div>

          {/* Show more / collapse */}
          {images.length > BATCH && (
            <div className="flex items-center justify-center mt-5 gap-3">
              {hasMore ? (
                <button
                  onClick={() => setVisibleCount((c) => Math.min(c + BATCH, images.length))}
                  className="
                    inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold
                    bg-[#191970] dark:bg-[#a67c00] text-white
                    hover:bg-[#0f0f45] dark:hover:bg-[#d4af37]
                    transition-colors duration-150
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-[#191970]/40
                  "
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
                  {language === 'zh'
                    ? `显示更多 (+${Math.min(BATCH, images.length - visibleCount)})`
                    : `Show ${Math.min(BATCH, images.length - visibleCount)} more`}
                </button>
              ) : null}
              {isExpanded && (
                <button
                  onClick={() => setVisibleCount(BATCH)}
                  className="
                    inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold
                    border border-gray-300 dark:border-gray-600
                    text-gray-600 dark:text-gray-300
                    hover:border-[#191970] dark:hover:border-[#a67c00]
                    hover:text-[#191970] dark:hover:text-[#d4af37]
                    transition-colors duration-150
                    focus:outline-none
                  "
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                  {language === 'zh' ? '收起' : 'Collapse'}
                </button>
              )}
              {/* View all in lightbox shortcut */}
              <button
                onClick={() => openLightbox(0)}
                className="
                  inline-flex items-center gap-1.5 text-xs font-medium
                  text-[#191970] dark:text-[#d4af37]
                  hover:underline transition-colors
                "
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                {language === 'zh' ? '查看全部' : `Browse all ${images.length}`}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Lightbox ─────────────────────────────────────────────────────────── */}
      {isOpen && currentImage && (
        <div
          className="fixed inset-0 z-[60] bg-black/96 flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label={language === 'zh' ? '图片查看器' : 'Image viewer'}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* ── Top bar ── */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/8 flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-white/50 text-xs font-mono tabular-nums">
                {(selectedIndex ?? 0) + 1} / {images.length}
              </span>
              <span className="hidden sm:block text-white/30 text-xs truncate max-w-[300px]">
                {title}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {/* Zoom toggle */}
              <button
                onClick={() => setIsZoomed((z) => !z)}
                title={isZoomed ? (language === 'zh' ? '缩小 (Z)' : 'Zoom out (Z)') : (language === 'zh' ? '放大 (Z)' : 'Zoom in (Z)')}
                className={`
                  w-8 h-8 flex items-center justify-center transition-colors
                  ${isZoomed
                    ? 'text-[#ffd700] bg-[#ffd700]/10'
                    : 'text-white/60 hover:text-white hover:bg-white/10'}
                `}
                aria-label={isZoomed ? 'Zoom out' : 'Zoom in'}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {isZoomed
                    ? <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></>
                    : <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></>
                  }
                </svg>
              </button>

              {/* Download */}
              <a
                href={currentImage}
                download
                target="_blank"
                rel="noopener noreferrer"
                title={language === 'zh' ? '下载图片' : 'Download image'}
                className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Download image"
                onClick={(e) => e.stopPropagation()}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </a>

              {/* Close */}
              <button
                onClick={closeLightbox}
                title={language === 'zh' ? '关闭 (Esc)' : 'Close (Esc)'}
                className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          {/* ── Main image area ── */}
          <div
            className="flex-1 relative flex items-center justify-center overflow-hidden"
            onClick={isZoomed ? undefined : closeLightbox}
          >
            {/* Prev */}
            {hasPrev && (
              <button
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="
                  absolute left-3 sm:left-5 z-10
                  w-10 h-10 flex items-center justify-center
                  bg-black/30 hover:bg-black/60
                  border border-white/10 hover:border-white/30
                  text-white/70 hover:text-white
                  transition-all duration-150
                  focus:outline-none focus-visible:ring-1 focus-visible:ring-white/50
                "
                aria-label="Previous image"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
            )}

            {/* Image */}
            <div
              className={`
                relative transition-all duration-300
                ${isZoomed
                  ? 'w-full h-full cursor-zoom-out'
                  : 'max-w-[90vw] max-h-[calc(100vh-160px)] w-full h-full cursor-zoom-in'}
              `}
              onClick={(e) => { e.stopPropagation(); setIsZoomed((z) => !z); }}
            >
              <Image
                src={optimizeCloudinaryUrl(currentImage)}
                alt={imgLabel(selectedIndex ?? 0)}
                fill
                className={`transition-all duration-300 ${isZoomed ? 'object-contain' : 'object-contain'}`}
                sizes="100vw"
                priority
              />
            </div>

            {/* Next */}
            {hasNext && (
              <button
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="
                  absolute right-3 sm:right-5 z-10
                  w-10 h-10 flex items-center justify-center
                  bg-black/30 hover:bg-black/60
                  border border-white/10 hover:border-white/30
                  text-white/70 hover:text-white
                  transition-all duration-150
                  focus:outline-none focus-visible:ring-1 focus-visible:ring-white/50
                "
                aria-label="Next image"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            )}
          </div>

          {/* ── Thumbnail strip ── */}
          {images.length > 1 && (
            <div className="flex-shrink-0 border-t border-white/8 py-2 px-4">
              <div
                ref={thumbStripRef}
                className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-0.5 justify-start sm:justify-center"
                style={{ scrollbarWidth: 'none' }}
              >
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setSelectedIndex(idx); setIsZoomed(false); }}
                    className={`
                      relative flex-shrink-0 w-12 h-12 overflow-hidden transition-all duration-150
                      focus:outline-none focus-visible:ring-1 focus-visible:ring-white/60
                      ${idx === selectedIndex
                        ? 'ring-2 ring-[#ffd700] opacity-100 scale-110'
                        : 'opacity-35 hover:opacity-65 hover:scale-105'}
                    `}
                    aria-label={imgLabel(idx)}
                    aria-current={idx === selectedIndex}
                  >
                    <Image src={optimizeCloudinaryUrl(img)} alt={imgLabel(idx)} fill className="object-cover" sizes="48px" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Keyboard hint ── */}
          <div className="flex-shrink-0 flex items-center justify-center gap-4 py-1.5 border-t border-white/5">
            {[
              ['←→', language === 'zh' ? '切换' : 'Navigate'],
              ['Z', language === 'zh' ? '缩放' : 'Zoom'],
              ['Esc', language === 'zh' ? '关闭' : 'Close'],
            ].map(([key, label]) => (
              <span key={key} className="hidden sm:flex items-center gap-1 text-[10px] text-white/25">
                <kbd className="px-1.5 py-0.5 bg-white/8 font-mono text-white/40">{key}</kbd>
                {label}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );
}