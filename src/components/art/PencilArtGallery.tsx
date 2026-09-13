'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import CImage from '@/components/ui/CImage';
import Link from 'next/link';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { ArtGalleryBackground } from './ArtGalleryBackground';
import type { ArtGalleryPiece } from '@/lib/strapi/art';

interface PencilArtGalleryProps {
  arts: ArtGalleryPiece[];
  locale: string;
  translations?: {
    empty?: string;
    [key: string]: unknown;
  };
}

export function PencilArtGallery({
  arts,
  locale,
  translations,
}: PencilArtGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isSwiping = useRef<boolean>(false);
  const wasSwiping = useRef<boolean>(false);
  const [dragOffset, setDragOffset] = useState<number>(0);

  const t = {
    empty: (translations?.empty as string) ?? (locale === 'zh' ? '当前暂无作品展示。' : 'No artwork found.'),
  };

  const total = arts.length;
  const currentPiece = arts[currentIndex];
  const basePath = locale === 'en' ? '' : `/${locale}`;

  const goToPrevious = useCallback(() => {
    if (total === 0) return;
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : total - 1));
  }, [total]);

  const goToNext = useCallback(() => {
    if (total === 0) return;
    setCurrentIndex((prev) => (prev < total - 1 ? prev + 1 : 0));
  }, [total]);

  // Keyboard navigation for pagination
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(target.tagName))
      ) {
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrevious, goToNext]);

  // Horizontal trackpad / wheel scroll support
  useEffect(() => {
    let wheelTimeout: NodeJS.Timeout | null = null;
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > 35 && Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        if (wheelTimeout) return;
        if (e.deltaX > 0) {
          goToNext();
        } else {
          goToPrevious();
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
  }, [goToNext, goToPrevious]);

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

    // Detect if the user is moving horizontally
    if (Math.abs(diffX) > 10 && Math.abs(diffX) > Math.abs(diffY)) {
      isSwiping.current = true;
      wasSwiping.current = true;
      // Real-time elastic feedback capped at 80px
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
      if (diffX < 0) {
        // Swiped left (finger moved right-to-left) -> go to next artwork
        goToNext();
      } else {
        // Swiped right (finger moved left-to-right) -> go to previous artwork
        goToPrevious();
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

  if (total === 0 || !currentPiece) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-center p-8">
        <p className="text-sm font-mono text-neutral-400 tracking-wider">
          {t.empty}
        </p>
      </div>
    );
  }

  return (
    <div
      className="relative w-full min-h-[75vh] flex flex-col justify-between select-none touch-pan-y"
      style={{ touchAction: 'pan-y' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Unhide Sidebar Button (Desktop Only, Visible when Sidebar is Hidden) */}
      <button
        type="button"
        onClick={() => setIsSidebarOpen(true)}
        className={`hidden lg:flex absolute left-0 top-1 z-20 items-center space-x-2 px-3 py-1.5 rounded-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border border-neutral-300 dark:border-white/20 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-400 dark:hover:border-white/40 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500 group ${
          isSidebarOpen
            ? 'opacity-0 pointer-events-none -translate-x-4'
            : 'opacity-100 pointer-events-auto translate-x-0'
        }`}
        aria-label="Show sketchbook sidebar"
        title={locale === 'zh' ? '展开画册目录' : 'Show sketchbook sidebar'}
      >
        <PanelLeftOpen className="w-4 h-4 text-neutral-500 group-hover:text-neutral-900 dark:text-neutral-400 dark:group-hover:text-amber-400 transition-colors" />
        <span className="text-xs font-medium tracking-wide">
          {locale === 'zh' ? '画册' : 'Sketchbook'}
        </span>
      </button>

      {/* Main Exhibition Layout: Desktop Two-Column Composition with Smooth Re-alignment */}
      <div
        className={`relative flex-1 flex flex-col lg:flex-row items-center justify-start w-full transition-all duration-500 ease-in-out ${
          isSidebarOpen ? 'gap-8 lg:gap-12 xl:gap-20' : 'gap-0'
        }`}
      >
        {/* Left Bar (Desktop Only): Slim, Elegant Rail with Visible Dividing Line & Smooth Collapse */}
        <aside
          className={`relative hidden lg:flex flex-col justify-start flex-shrink-0 self-stretch select-none transition-all duration-500 ease-in-out ${
            isSidebarOpen
              ? 'w-48 lg:w-52 xl:w-56 pt-6 pb-6 pr-6 lg:pr-8 border-r border-neutral-300 dark:border-white/20 opacity-100'
              : 'w-0 pt-6 pb-6 pr-0 border-r-0 border-transparent opacity-0 overflow-hidden pointer-events-none'
          }`}
          aria-hidden={!isSidebarOpen}
        >
          {/* Hide Sidebar Button (Positioned close to the dividing line) */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="absolute top-7 right-2 lg:right-2.5 p-1.5 rounded-md text-neutral-400 hover:text-neutral-900 dark:text-neutral-500 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500 z-10"
            aria-label="Hide sidebar"
            title={locale === 'zh' ? '收起画册' : 'Hide sidebar'}
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>

          {/* Inner fixed-width container preventing text reflow during slide collapse */}
          <div className="w-40 lg:w-44 xl:w-48 flex flex-col space-y-6">
            {/* Sketchbook Title in Curvy Signature Font (Stacked: Shain's on top, Sketch Book underneath) */}
            <div className="font-signature text-3xl sm:text-[2rem] lg:text-[2.25rem] text-neutral-900 dark:text-neutral-100 font-normal leading-[1.12] tracking-normal select-text pr-7">
              <span className="block">Shain&apos;s</span>
              <span className="block">Sketch Book</span>
            </div>

            {/* Minimalist Drawing List - Zero Lines, Pure Typography */}
            <ul className="space-y-2.5">
              {arts.map((piece, index) => {
                const isActive = index === currentIndex;
                return (
                  <li key={piece.slug || piece.id}>
                    <button
                      type="button"
                      onClick={() => setCurrentIndex(index)}
                      className={`group w-full text-left flex items-baseline space-x-2.5 transition-colors duration-200 outline-none cursor-pointer ${
                        isActive
                          ? 'text-neutral-900 dark:text-white font-medium'
                          : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                      }`}
                    >
                      <span
                        className={`text-xs font-mono transition-colors ${
                          isActive
                            ? 'text-neutral-900 dark:text-amber-400 font-bold'
                            : 'opacity-40 group-hover:opacity-80'
                        }`}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="text-xs sm:text-[13px] tracking-wide truncate max-w-[155px] xl:max-w-[175px] font-sans">
                        {piece.title}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        {/* Center Artwork Column & Centered Toolbar (Re-aligns to true center when sidebar is hidden) */}
        <div
          className={`relative flex-1 flex flex-col items-center justify-center p-2 sm:p-4 w-full overflow-hidden transition-all duration-500 ease-in-out ${
            isSidebarOpen ? 'lg:-translate-x-8 xl:-translate-x-14' : 'translate-x-0'
          }`}
        >
          {/* Background Pattern: Organic Flowing Curves & Contours — Strictly scoped to Gallery area (NOT sidebar) */}
          <ArtGalleryBackground />

          <div
            style={{
              transform: dragOffset ? `translateX(${dragOffset}px)` : undefined,
              transition: dragOffset ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
            className="relative z-10 w-full flex flex-col items-center"
          >
            <Link
              href={`${basePath}/hobbies/pencil-art/${currentPiece.slug}`}
              onClick={(e) => {
                if (wasSwiping.current || isSwiping.current) {
                  e.preventDefault();
                  e.stopPropagation();
                  wasSwiping.current = false;
                }
              }}
              className="group relative cursor-pointer outline-none transition-transform duration-500 ease-out hover:scale-[1.012] focus-visible:ring-2 focus-visible:ring-amber-500/60 rounded-sm block"
              aria-label={currentPiece.title}
            >
              {/* Museum Frame & Fine-Art Matting (Crisp white box in all modes) */}
              <div className="relative p-2.5 sm:p-5 md:p-6 bg-white rounded-sm shadow-[0_20px_50px_-15px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] ring-1 ring-black/5 dark:ring-white/20 transition-shadow duration-500 group-hover:shadow-[0_30px_70px_-15px_rgba(0,0,0,0.25)] dark:group-hover:shadow-[0_35px_80px_-15px_rgba(0,0,0,0.95)]">
                <div className="relative overflow-hidden bg-white ring-1 ring-neutral-200/50">
                  <div className="relative max-h-[62vh] sm:max-h-[66vh] md:max-h-[70vh] w-auto flex items-center justify-center">
                    <CImage
                      src={currentPiece.image}
                      alt={currentPiece.altText || currentPiece.title}
                      width={currentPiece.width || 1200}
                      height={currentPiece.height || 1500}
                      sizes="(max-width: 768px) 90vw, (max-width: 1200px) 70vw, 1200px"
                      priority
                      className="max-h-[62vh] sm:max-h-[66vh] md:max-h-[70vh] w-auto object-contain transition-opacity duration-700 ease-out"
                    />
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Mobile Clean Counter: Pure Gesture Experience without Buttons */}
          <div className="relative z-10 lg:hidden flex items-center justify-center pt-4 pb-1 select-none">
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-neutral-100 dark:bg-white/5 border border-neutral-200/60 dark:border-white/10 text-[11px] font-mono tracking-widest text-neutral-500 dark:text-neutral-400">
              <span className="font-semibold text-neutral-900 dark:text-amber-400">
                {String(currentIndex + 1).padStart(2, '0')}
              </span>
              <span className="opacity-40">/</span>
              <span>{String(total).padStart(2, '0')}</span>
            </div>
          </div>

          {/* Desktop Bottom Toolbar: Centered Directly in the Middle of the Artwork */}
          <nav
            aria-label="Artwork gallery pagination"
            className="relative z-10 hidden lg:flex w-full items-center justify-center pt-6 pb-2"
          >
            <div className="flex items-center space-x-2 sm:space-x-3 text-neutral-400 dark:text-neutral-500 select-none">
              {/* Left Arrow Button */}
              <button
                type="button"
                onClick={goToPrevious}
                aria-label="Previous artwork"
                className="p-2 text-base sm:text-lg hover:text-neutral-900 dark:hover:text-white transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500"
              >
                <span className="font-mono leading-none">&lt;</span>
              </button>

              {/* Vertical Ticks & Active Number Display */}
              <div className="flex items-center space-x-1.5 sm:space-x-2 px-1">
                {arts.map((piece, index) => {
                  const isActive = index === currentIndex;
                  return (
                    <button
                      key={piece.slug || piece.id}
                      type="button"
                      onClick={() => setCurrentIndex(index)}
                      aria-label={`Go to artwork ${index + 1}`}
                      aria-current={isActive ? 'true' : undefined}
                      className={`group relative flex items-center justify-center transition-all duration-200 cursor-pointer focus-visible:outline-none ${
                        isActive
                          ? 'px-1 text-xs sm:text-sm font-mono font-semibold text-neutral-900 dark:text-amber-400 scale-110'
                          : 'text-xs sm:text-sm font-mono text-neutral-300 dark:text-neutral-600 hover:text-neutral-600 dark:hover:text-neutral-300'
                      }`}
                    >
                      {isActive ? (
                        <span>{index + 1}</span>
                      ) : (
                        <span className="inline-block transition-transform duration-200 group-hover:scale-y-125">|</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Right Arrow Button */}
              <button
                type="button"
                onClick={goToNext}
                aria-label="Next artwork"
                className="p-2 text-base sm:text-lg hover:text-neutral-900 dark:hover:text-white transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500"
              >
                <span className="font-mono leading-none">&gt;</span>
              </button>
            </div>
          </nav>
        </div>
      </div>

    </div>
  );
}
