'use client';

import { useState, useEffect, useRef } from 'react';
import CImage from '@/components/ui/CImage';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ArtNavigationPiece, ArtPiece } from '@/lib/strapi/art';

interface PencilArtDetailViewProps {
  piece: ArtPiece;
  prevPiece?: ArtNavigationPiece | null;
  nextPiece?: ArtNavigationPiece | null;
  locale: string;
  translations?: {
    eyebrow?: string;
    aboutPiece?: string;
    dateCreated?: string;
    medium?: string;
    defaultMedium?: string;
    viewOriginal?: string;
    copyLink?: string;
    copied?: string;
    close?: string;
    backToGallery?: string;
    dimensions?: string;
    featuredBadge?: string;
  };
}

export function PencilArtDetailView({
  piece,
  prevPiece,
  nextPiece,
  locale,
  translations,
}: PencilArtDetailViewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const router = useRouter();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Gesture tracking states and refs
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isSwiping = useRef<boolean>(false);
  const wasSwiping = useRef<boolean>(false);
  const [dragOffset, setDragOffset] = useState<number>(0);

  const t = {
    eyebrow: translations?.eyebrow ?? (locale === 'zh' ? '原创手绘作品' : 'ORIGINAL ARTWORK'),
    aboutPiece: translations?.aboutPiece ?? (locale === 'zh' ? '作品详情' : 'ABOUT THE PIECE'),
    dateCreated: translations?.dateCreated ?? (locale === 'zh' ? '创作时间' : 'Created'),
    medium: translations?.medium ?? (locale === 'zh' ? '媒介质地' : 'Medium'),
    defaultMedium:
      translations?.defaultMedium ?? (locale === 'zh' ? '档案级棉浆纸 / 石墨铅笔' : 'Graphite on archival cotton paper'),
    viewOriginal: translations?.viewOriginal ?? (locale === 'zh' ? '查看高精大图' : 'Inspect Zoom'),
    copyLink: translations?.copyLink ?? (locale === 'zh' ? '分享作品' : 'Share Artwork'),
    copied: translations?.copied ?? (locale === 'zh' ? '链接已复制！' : 'Link Copied!'),
    close: translations?.close ?? (locale === 'zh' ? '关闭' : 'Close'),
    backToGallery: translations?.backToGallery ?? (locale === 'zh' ? '返回画廊' : 'Back to Gallery'),
    featuredBadge: translations?.featuredBadge ?? (locale === 'zh' ? '精选佳作' : 'Featured Piece'),
  };

  const basePath = locale === 'en' ? '' : `/${locale}`;

  const formattedDate = piece.dateCreated
    ? new Date(piece.dateCreated).toLocaleDateString(
        locale === 'zh' ? 'zh-CN' : 'en-US',
        { year: 'numeric', month: 'long', day: 'numeric' }
      )
    : null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Prefetch previous and next art pages for instant transitions
  useEffect(() => {
    if (prevPiece) {
      router.prefetch(`${basePath}/hobbies/pencil-art/${prevPiece.slug}`);
    }
    if (nextPiece) {
      router.prefetch(`${basePath}/hobbies/pencil-art/${nextPiece.slug}`);
    }
  }, [prevPiece, nextPiece, basePath, router]);

  // Keyboard navigation: left and right arrows navigate between artworks
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        e.preventDefault();
        setIsFullscreen(false);
        return;
      }
      const target = e.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(target.tagName))
      ) {
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) {
        return;
      }

      if (e.key === 'ArrowLeft' && prevPiece) {
        e.preventDefault();
        router.push(`${basePath}/hobbies/pencil-art/${prevPiece.slug}`);
      } else if (e.key === 'ArrowRight' && nextPiece) {
        e.preventDefault();
        router.push(`${basePath}/hobbies/pencil-art/${nextPiece.slug}`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevPiece, nextPiece, basePath, router, isFullscreen]);

  // Horizontal trackpad / wheel scroll support
  useEffect(() => {
    let wheelTimeout: NodeJS.Timeout | null = null;
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > 35 && Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        if (wheelTimeout) return;
        if (e.deltaX > 0 && nextPiece) {
          router.push(`${basePath}/hobbies/pencil-art/${nextPiece.slug}`);
        } else if (e.deltaX < 0 && prevPiece) {
          router.push(`${basePath}/hobbies/pencil-art/${prevPiece.slug}`);
        }
        wheelTimeout = setTimeout(() => {
          wheelTimeout = null;
        }, 350);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => {
      window.removeEventListener('wheel', handleWheel);
      if (wheelTimeout) clearTimeout(wheelTimeout);
    };
  }, [nextPiece, prevPiece, basePath, router]);

  useEffect(() => {
    if (!isFullscreen) return;

    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusable.length === 0) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', trapFocus);
    return () => {
      document.removeEventListener('keydown', trapFocus);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [isFullscreen]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwiping.current = false;
    wasSwiping.current = false;
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - touchStartX.current;
    const diffY = currentY - touchStartY.current;

    // Detect if horizontal gesture is dominant
    if (Math.abs(diffX) > 10 && Math.abs(diffX) > Math.abs(diffY)) {
      isSwiping.current = true;
      wasSwiping.current = true;
      // Real-time elastic drag feedback capped at 80px
      const dampened = Math.sign(diffX) * Math.min(Math.abs(diffX) * 0.4, 80);
      setDragOffset(dampened);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) {
      setDragOffset(0);
      return;
    }
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchEndX - touchStartX.current;

    if (isSwiping.current && Math.abs(diffX) > 30) {
      wasSwiping.current = true;
      if (diffX < 0 && nextPiece) {
        // Swiped left -> navigate to next artwork
        router.push(`${basePath}/hobbies/pencil-art/${nextPiece.slug}`);
      } else if (diffX > 0 && prevPiece) {
        // Swiped right -> navigate to previous artwork
        router.push(`${basePath}/hobbies/pencil-art/${prevPiece.slug}`);
      }
      setTimeout(() => {
        wasSwiping.current = false;
      }, 350);
    } else {
      setTimeout(() => {
        wasSwiping.current = false;
      }, 100);
    }

    touchStartX.current = null;
    touchStartY.current = null;
    isSwiping.current = false;
    setDragOffset(0);
  };

  return (
    <div
      className="w-full py-4 sm:py-6 select-none touch-pan-y"
      style={{ touchAction: 'pan-y' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top minimal back & share action strip */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-200/70 dark:border-white/10">
        <Link
          href={`${basePath}/hobbies/pencil-art`}
          className="inline-flex items-center space-x-2 text-xs font-mono uppercase tracking-[0.2em] text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <span>&larr;</span>
          <span>{t.backToGallery}</span>
        </Link>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/5 text-xs font-mono text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
            <span>{isCopied ? t.copied : t.copyLink}</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout: Left = Drawing in small frame, Right = Text & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* LEFT COLUMN: Drawing Showcase in white museum frame */}
        <div className="lg:col-span-7 flex flex-col items-center w-full">
          <div
            style={{
              transform: dragOffset ? `translateX(${dragOffset}px)` : undefined,
              transition: dragOffset ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
            className="w-full max-w-xl flex items-center justify-center"
          >
            {/* Museum Frame & Fine-Art Drawing (Crisp white in all modes) */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                if (wasSwiping.current || isSwiping.current) {
                  wasSwiping.current = false;
                  return;
                }
                setIsFullscreen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsFullscreen(true);
                }
              }}
              className="group relative cursor-zoom-in p-3 sm:p-5 md:p-6 bg-white rounded-sm shadow-[0_20px_50px_-15px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] ring-1 ring-black/5 dark:ring-white/20 transition-all duration-300 hover:shadow-2xl w-full flex items-center justify-center"
            >
              <div className="relative overflow-hidden bg-white w-full flex items-center justify-center">
                <CImage
                  src={piece.image}
                  alt={piece.altText || piece.title}
                  width={piece.width || 1200}
                  height={piece.height || 1500}
                  sizes="(max-width: 1024px) 90vw, 800px"
                  priority
                  className="w-full h-auto max-h-[75vh] object-contain transition-transform duration-500 group-hover:scale-[1.01]"
                />
              </div>
              {/* Hover zoom badge */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="px-3 py-1.5 rounded-full bg-black/80 text-white text-[10px] font-mono tracking-widest uppercase backdrop-blur-sm shadow-md">
                  {t.viewOriginal} &oplus;
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Clean Details & Mini-Text with Big Capital Letter */}
        <div className="lg:col-span-5 flex flex-col space-y-5">
          <div>
            <div className="flex items-center space-x-2 text-[10px] font-mono tracking-[0.25em] uppercase text-amber-600 dark:text-amber-400 mb-2">
              <span>{t.aboutPiece}</span>
              {piece.isFeatured && (
                <span className="px-2 py-0.5 rounded bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/30 text-[9px]">
                  {t.featuredBadge}
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif text-[#191970] dark:text-white leading-tight tracking-tight">
              {piece.title}
            </h1>
          </div>

          {/* Metadata: Smaller fonts, only Created and Medium */}
          <div className="grid grid-cols-2 gap-4 py-3 border-y border-neutral-200/70 dark:border-white/10">
            {formattedDate && (
              <div>
                <span className="block text-[9px] font-mono uppercase tracking-widest text-neutral-400 mb-0.5">
                  {t.dateCreated}
                </span>
                <span className="text-[11px] text-neutral-700 dark:text-neutral-300 font-medium">
                  {formattedDate}
                </span>
              </div>
            )}
            <div>
              <span className="block text-[9px] font-mono uppercase tracking-widest text-neutral-400 mb-0.5">
                {t.medium}
              </span>
              <span className="text-[11px] text-neutral-700 dark:text-neutral-300 font-medium">
                {t.defaultMedium}
              </span>
            </div>
          </div>

          {/* Description: Mini-text with preserved big capital drop cap, no extra border lines */}
          {piece.description ? (
            <div
              className="text-xs sm:text-[13px] leading-[1.85] text-neutral-600 dark:text-neutral-300 tracking-[0.01em] [&>p]:mb-3.5 [&>p:last-child]:mb-0 [&>p:first-of-type]:first-letter:float-left [&>p:first-of-type]:first-letter:text-4xl [&>p:first-of-type]:first-letter:font-serif [&>p:first-of-type]:first-letter:leading-none [&>p:first-of-type]:first-letter:mr-2.5 [&>p:first-of-type]:first-letter:text-[#191970] dark:[&>p:first-of-type]:first-letter:text-amber-300 [&>p:first-of-type]:first-letter:font-semibold"
              dangerouslySetInnerHTML={{ __html: piece.description }}
            />
          ) : (
            <p className="text-xs sm:text-[13px] leading-[1.85] text-neutral-500 dark:text-neutral-400 italic">
              Original pencil sketch and study exploring classical form and fine graphite nuances.
            </p>
          )}

          {/* Prev / Next piece navigation (Desktop Only, cleanly hidden on mobile for pure gesture experience) */}
          {(prevPiece || nextPiece) && (
            <div className="hidden sm:flex pt-6 border-t border-neutral-200/70 dark:border-white/10 items-center justify-between text-xs font-mono">
              {prevPiece ? (
                <Link
                  href={`${basePath}/hobbies/pencil-art/${prevPiece.slug}`}
                  className="group inline-flex items-center space-x-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                  <span className="transition-transform group-hover:-translate-x-1">&larr;</span>
                  <span className="truncate max-w-[140px] sm:max-w-[180px]">{prevPiece.title}</span>
                </Link>
              ) : (
                <span />
              )}
              {nextPiece ? (
                <Link
                  href={`${basePath}/hobbies/pencil-art/${nextPiece.slug}`}
                  className="group inline-flex items-center space-x-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors ml-auto"
                >
                  <span className="truncate max-w-[140px] sm:max-w-[180px]">{nextPiece.title}</span>
                  <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
                </Link>
              ) : (
                <span />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Magnified Lightbox with Touch/Keyboard Navigation (Zero Arrow Clutter) */}
      {isFullscreen && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="art-lightbox-title"
          tabIndex={-1}
          className="fixed inset-0 z-[1200] bg-black/95 flex items-center justify-center p-3 sm:p-6 cursor-zoom-out animate-in fade-in select-none touch-pan-y"
          style={{ touchAction: 'pan-y' }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={(event) => {
            if (event.target !== event.currentTarget) return;
            if (wasSwiping.current || isSwiping.current) {
              wasSwiping.current = false;
              return;
            }
            setIsFullscreen(false);
          }}
        >
          <h2 id="art-lightbox-title" className="sr-only">{piece.title}</h2>
          {/* Close Button */}
          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => setIsFullscreen(false)}
            aria-label={t.close}
            className="absolute top-6 right-6 z-30 px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 text-white font-mono text-xs tracking-widest uppercase transition-colors cursor-pointer"
          >
            {t.close} &times;
          </button>

          {/* Lightbox Image Container with drag preview */}
          <div
            style={{
              transform: dragOffset ? `translateX(${dragOffset}px)` : undefined,
              transition: dragOffset ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
            className="relative w-full h-full max-w-[96vw] max-h-[95vh] flex items-center justify-center"
          >
            <CImage
              src={piece.image}
              alt={piece.altText || piece.title}
              width={piece.width || 1600}
              height={piece.height || 2000}
              sizes="100vw"
              priority
              className="w-full h-full max-w-[96vw] max-h-[95vh] object-contain rounded-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}
