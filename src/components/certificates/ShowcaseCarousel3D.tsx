'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import CImage from '@/components/ui/CImage';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

interface CarouselCertificate {
  id: number;
  title: string;
  issuedBy: string;
  imageUrl: string;
}

interface ShowcaseCarousel3DProps {
  certificates: CarouselCertificate[];
  onCertificateClick: (id: number) => void;
}

export function ShowcaseCarousel3D({
  certificates,
  onCertificateClick,
}: ShowcaseCarousel3DProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const touchStartX = useRef(0);
  const dragThreshold = 40;

  const [windowWidth, setWindowWidth] = useState(1024);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNext = useCallback(() => {
    setActiveIndex((p) => (p + 1) % certificates.length);
  }, [certificates.length]);

  const handlePrev = useCallback(() => {
    setActiveIndex((p) => (p - 1 + certificates.length) % certificates.length);
  }, [certificates.length]);

  // Unified swipe/drag handlers (mouse + touch)
  const handleMouseDown = (e: React.MouseEvent) => { setIsDragging(true); startX.current = e.clientX; };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const diff = e.clientX - startX.current;
    if (Math.abs(diff) > dragThreshold) {
      if (diff > 0) {
        handlePrev();
      } else {
        handleNext();
      }
      setIsDragging(false);
    }
  };
  const handleMouseUp = () => setIsDragging(false);
  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartX.current) return;
    const diff = e.touches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > dragThreshold) {
      if (diff > 0) {
        handlePrev();
      } else {
        handleNext();
      }
      touchStartX.current = 0;
    }
  };
  const handleTouchEnd = () => { touchStartX.current = 0; };

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'ArrowRight') handleNext(); if (e.key === 'ArrowLeft') handlePrev(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [handleNext, handlePrev]);

  const isMobile = windowWidth < 640;

  // Desktop 3D sizes
  const desktopSizes = useMemo(() => {
    const isTablet = windowWidth >= 640 && windowWidth < 1024;
    return {
      spacing:     isTablet ? 150 : 250,
      cardWidth:   isTablet ? '310px' : '390px',
      depthOffset: -180,
      scaleOffset: 0.84,
      rotationY:   25,
    };
  }, [windowWidth]);

  const sharedNavButtons = (
    <div className="flex items-center justify-center gap-5 pt-6">
      <button onClick={handlePrev} aria-label="Previous"
        className="p-2.5 sm:p-3 rounded-full border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 hover:bg-white dark:hover:bg-gray-900 shadow-md hover:shadow-lg hover:border-[#ffd700]/40 transition-all duration-300 text-gray-600 dark:text-gray-300 active:scale-95">
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      <div className="flex items-center gap-1.5 max-w-[180px] overflow-x-auto py-1 no-scrollbar">
        {certificates.map((_, idx) => (
          <button key={idx} onClick={() => setActiveIndex(idx)} aria-label={`Go to slide ${idx + 1}`}
            className={`h-1.5 rounded-full transition-all duration-500 flex-shrink-0 ${
              activeIndex === idx ? 'w-5 bg-[#191970] dark:bg-[#ffd700]' : 'w-1.5 bg-gray-200 dark:bg-gray-700'
            }`}
          />
        ))}
      </div>

      <button onClick={handleNext} aria-label="Next"
        className="p-2.5 sm:p-3 rounded-full border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 hover:bg-white dark:hover:bg-gray-900 shadow-md hover:shadow-lg hover:border-[#ffd700]/40 transition-all duration-300 text-gray-600 dark:text-gray-300 active:scale-95">
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    </div>
  );

  /* ═══════════════════════════════════════════════════════════════════════════
   * MOBILE VIEW  (< 640px)
   * ─────────────────────────────────────────────────────────────────────────
   * Full-width single-card swiper — no 3D transforms at all on mobile.
   * Reason: 3D depth carousels have no horizontal room on phone screens and
   * Safari WebKit handles 3D + filter inside overflow:hidden unpredictably.
   * ═══════════════════════════════════════════════════════════════════════════ */
  if (isMobile) {
    const cert = certificates[activeIndex];
    if (!cert) return null;
    return (
      <div
        className="relative w-full py-8 select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Peek indicators — previous/next card ghosted at edges */}
        <div className="relative flex items-center px-6 gap-3">
          {/* Previous ghost peek */}
          {certificates.length > 1 && (
            <div className="flex-shrink-0 w-10 opacity-30 pointer-events-none">
              <div className="aspect-[4/3] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                <div className="relative w-full h-full">
                  <CImage
                    src={certificates[(activeIndex - 1 + certificates.length) % certificates.length].imageUrl}
                    alt=""
                    fill
                    className="object-contain p-1"
                    sizes="40px"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Active card — full width */}
          <div
            onClick={() => onCertificateClick(cert.id)}
            className="flex-1 rounded-2xl overflow-hidden cursor-pointer border-2 border-[#ffd700]/60 dark:border-[#a67c00]/70 bg-white dark:bg-gray-900 shadow-[0_12px_40px_rgba(25,25,112,0.12)] dark:shadow-[0_16px_50px_rgba(255,215,0,0.15)] transition-transform duration-300 active:scale-[0.98]"
          >
            {/* Certificate image */}
            <div className="relative w-full bg-gray-50 dark:bg-gray-950" style={{ paddingBottom: '66.66%' }}>
              <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(0,0,0,0.03)_1px,_transparent_1px)] dark:bg-[radial-gradient(circle,_rgba(255,255,255,0.02)_1px,_transparent_1px)] bg-[length:10px_10px]" />
              <div className="absolute inset-0">
                <CImage
                  src={cert.imageUrl}
                  alt={cert.title}
                  fill
                  className="object-contain p-3"
                  sizes="(max-width: 640px) calc(100vw - 80px)"
                  priority
                />
              </div>
            </div>

            {/* Info footer */}
            <div className="flex items-center gap-3 px-4 py-3 border-t border-gray-100 dark:border-gray-800">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#191970]/8 dark:bg-[#ffd700]/8 border border-[#191970]/10 dark:border-[#ffd700]/15 flex items-center justify-center">
                <span className="text-[0.55rem] font-extrabold text-[#191970] dark:text-[#ffd700]">
                  {cert.issuedBy.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-900 dark:text-white leading-snug line-clamp-2">
                  {cert.title}
                </p>
                <p className="text-[0.6rem] font-semibold text-gray-400 dark:text-gray-500 tracking-wide uppercase truncate mt-0.5">
                  {cert.issuedBy}
                </p>
              </div>
              <div className="flex-shrink-0 flex items-center gap-1 text-[#191970] dark:text-[#ffd700]">
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="text-[0.6rem] font-extrabold tracking-widest uppercase">View</span>
              </div>
            </div>
          </div>

          {/* Next ghost peek */}
          {certificates.length > 1 && (
            <div className="flex-shrink-0 w-10 opacity-30 pointer-events-none">
              <div className="aspect-[4/3] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                <div className="relative w-full h-full">
                  <CImage
                    src={certificates[(activeIndex + 1) % certificates.length].imageUrl}
                    alt=""
                    fill
                    className="object-contain p-1"
                    sizes="40px"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Swipe hint text */}
        <p className="text-center text-[0.6rem] font-semibold text-gray-400 dark:text-gray-600 tracking-widest uppercase mt-4 mb-1">
          Swipe to browse
        </p>

        {sharedNavButtons}
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════════════════
   * DESKTOP / TABLET VIEW  (≥ 640px)
   * ─────────────────────────────────────────────────────────────────────────
   * Full 3D perspective carousel with Safari webkit fixes:
   *  • No overflow:hidden on any ancestor of 3D-transformed elements
   *  • perspective set via inline style (WebkitPerspective + perspective)
   *  • transform-style via inline style (WebkitTransformStyle + transformStyle)
   *  • Blur REMOVED — opacity alone signals depth (blur breaks Safari in 3D)
   * ═══════════════════════════════════════════════════════════════════════════ */
  return (
    <div
      className="relative w-full py-14 select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 3D stage — perspective via inline style only (Tailwind class won't add -webkit- prefix) */}
      <div
        className="relative w-full max-w-5xl mx-auto h-[360px] md:h-[440px] flex items-center justify-center"
        style={{
          perspective: '1200px',
          WebkitPerspective: '1200px',
        }}
      >
        {/* Ambient glow */}
        <div className="absolute w-[280px] h-[280px] rounded-full bg-gradient-to-tr from-[#191970]/15 via-[#ffd700]/8 to-transparent blur-3xl pointer-events-none z-0 animate-pulse" />

        {certificates.map((cert, index) => {
          const len = certificates.length;
          let offset = index - activeIndex;
          if (offset < -len / 2) offset += len;
          if (offset > len / 2) offset -= len;

          const isActive  = offset === 0;
          const isVisible = Math.abs(offset) <= 2;
          if (!isVisible) return null;

          const rotateY    = offset * -desktopSizes.rotationY;
          const translateZ = Math.abs(offset) * desktopSizes.depthOffset;
          const translateX = offset * desktopSizes.spacing;
          const opacity    = Math.max(0.15, 1 - Math.abs(offset) * 0.40);
          const scale      = isActive ? 1 : desktopSizes.scaleOffset;
          const zIndex     = 100 - Math.abs(offset);

          // Single transform string applied to both standard & -webkit- keys
          const transformStr = `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`;

          return (
            <div
              key={cert.id}
              onClick={() => {
                if (isActive) {
                  onCertificateClick(cert.id);
                } else {
                  setActiveIndex(index);
                }
              }}
              style={{
                transform:              transformStr,
                WebkitTransform:        transformStr,
                transformStyle:         'preserve-3d',
                WebkitTransformStyle:   'preserve-3d',
                // No blur — Safari renders filter inside 3D context unreliably.
                // Opacity handles the depth/distance cue instead.
                opacity,
                zIndex,
                transition: [
                  'transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)',
                  '-webkit-transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)',
                  'opacity 0.6s ease',
                ].join(', '),
                width: desktopSizes.cardWidth,
              }}
              className={`
                absolute aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer
                bg-white/95 dark:bg-gray-900/90
                border-2 border-double
                ${isActive
                  ? 'border-[#ffd700] dark:border-[#a67c00] shadow-[0_20px_50px_rgba(25,25,112,0.14)] dark:shadow-[0_25px_60px_rgba(255,215,0,0.22)]'
                  : 'border-gray-200/50 dark:border-gray-800/80 shadow-[0_8px_30px_rgba(0,0,0,0.04)]'
                }
                group
              `}
            >
              {/* Inner light rim */}
              <div className="absolute inset-0.5 rounded-[14px] border border-white/60 dark:border-white/10 z-20 pointer-events-none" />

              <div className="relative w-full h-full p-2.5 bg-gray-50/10 dark:bg-gray-950/10">
                <div className="relative w-full h-full rounded-xl overflow-hidden bg-gray-50/50 dark:bg-gray-950/60 shadow-inner border border-gray-100/50 dark:border-gray-800/60">
                  <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(0,0,0,0.03)_1px,_transparent_1px)] dark:bg-[radial-gradient(circle,_rgba(255,255,255,0.02)_1px,_transparent_1px)] bg-[length:12px_12px] pointer-events-none" />
                  <CImage
                    src={cert.imageUrl}
                    alt={cert.title}
                    fill
                    className="object-contain p-2 transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    sizes="(max-width: 1024px) 310px, 390px"
                    priority={isActive}
                  />
                  {/* Shimmer */}
                  <div className="absolute inset-0 z-10 bg-gradient-to-tr from-transparent via-white/20 dark:via-white/5 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out pointer-events-none" />
                </div>
              </div>

              {/* Info plaque — solid bg (no backdrop-blur inside 3D, Safari glitches) */}
              <div className={`
                absolute inset-x-2 bottom-2 z-20 rounded-xl border overflow-hidden p-2.5 sm:p-3 shadow-lg
                bg-white/96 dark:bg-gray-950/96 border-gray-100 dark:border-gray-800/80
                translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100
                ${isActive ? '!translate-y-0 !opacity-100' : ''}
                transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
              `}>
                <h3 className="font-bold text-gray-900 dark:text-white text-xs md:text-sm line-clamp-1 group-hover:text-[#191970] dark:group-hover:text-[#ffd700] transition-colors leading-snug">
                  {cert.title}
                </h3>
                <div className="flex justify-between items-center text-[0.6rem] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">
                  <span className="truncate max-w-[70%]">{cert.issuedBy}</span>
                  {isActive && (
                    <div className="flex items-center gap-0.5 text-[#191970] dark:text-[#ffd700] flex-shrink-0">
                      <Maximize2 className="w-3 h-3" />
                      <span>VIEW</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {sharedNavButtons}
    </div>
  );
}
