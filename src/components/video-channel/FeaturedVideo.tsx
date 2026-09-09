'use client';

import { useState } from 'react';
import Image from 'next/image';

export interface FeaturedVideoProps {
  title: string;
  description: string;
  viewCount: string;
  publishedAt: string;
  thumbnailUrl: string;
  videoId: string;
  tags: string[];
  sectionTitle?: string;
  badgeLabel?: string;
  releaseLabel?: string;
  viewsLabel?: string;
}

export default function FeaturedVideo({
  title,
  description,
  viewCount,
  publishedAt,
  thumbnailUrl,
  videoId,
  tags,
  sectionTitle = 'Featured Work',
  badgeLabel = "Editor's Pick",
  releaseLabel = 'Latest Release',
  viewsLabel = 'views',
}: FeaturedVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [failedHd, setFailedHd] = useState(false);
  const [prevVideoId, setPrevVideoId] = useState(videoId);

  if (prevVideoId !== videoId) {
    setPrevVideoId(videoId);
    setFailedHd(false);
  }

  // Attempt uncompressed 16:9 HD maxresdefault thumbnail first, fall back to thumbnailUrl if not available
  const defaultThumbnail = videoId
    ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
    : thumbnailUrl;
  const displayThumbnail = failedHd ? thumbnailUrl : defaultThumbnail;

  // ── Safari fix ────────────────────────────────────────────────────────────
  // YouTube's embed with autoplay=1 triggers a bot-check in Safari because
  // Safari blocks autoplay in cross-origin iframes unless the user explicitly
  // interacts with the page first. The thumbnail+play-button approach below
  // only swaps in the iframe AFTER the user clicks, which counts as a direct
  // user gesture — this satisfies Safari's autoplay policy safely.
  //
  // We still pass autoplay=1 in the src so playback starts immediately after
  // the iframe is inserted (the click IS the gesture).
  // ─────────────────────────────────────────────────────────────────────────
  const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0&autoplay=1&modestbranding=1&color=white&playsinline=1`;

  return (
    <section className="mb-12 sm:mb-14 w-full max-w-full overflow-hidden">
      {/* Section heading */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex items-center gap-2">
          <span className="block w-1 h-6 rounded-full bg-gold dark:bg-[#d4af37]" />
          <h2
            className="text-2xl sm:text-3xl font-black text-midnight dark:text-[#d4af37] tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {sectionTitle}
          </h2>
        </div>
        <div className="flex-1 h-px bg-midnight/10 dark:bg-[#a67c00]/30" />
        <span className="text-[11px] sm:text-xs uppercase tracking-widest text-gold dark:text-[#d4af37] font-semibold">
          {badgeLabel}
        </span>
      </div>

      {/* Featured Video Card */}
      <div className="relative grid lg:grid-cols-12 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-neutral-200/80 dark:border-white/10 bg-[#0f0f35] dark:bg-[#12131d] group w-full min-w-0">

        {/* ── Video player (7 / 12 columns on lg, strictly 16:9 aspect-video) ── */}
        <div className="lg:col-span-7 relative bg-black aspect-video w-full min-w-0 overflow-hidden flex items-center justify-center">
          {!isPlaying ? (
            <button
              className="absolute inset-0 w-full h-full cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-gold bg-neutral-950 flex items-center justify-center"
              onClick={() => setIsPlaying(true)}
              aria-label={`Play ${title}`}
              type="button"
            >
              {/* Subtle ambient blur behind thumbnail to smoothly fill any letterbox gap */}
              <div className="absolute inset-0 overflow-hidden opacity-35 dark:opacity-25 pointer-events-none">
                <Image
                  src={displayThumbnail}
                  alt=""
                  fill
                  className="object-cover blur-2xl scale-110"
                  unoptimized
                  aria-hidden="true"
                />
              </div>

              {/* True, fully visible uncropped and non-stretched thumbnail */}
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src={displayThumbnail}
                  alt={title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-contain transition-transform duration-500 ease-out group-hover:scale-[1.01]"
                  priority
                  unoptimized
                  onError={() => setFailedHd(true)}
                />
              </div>

              {/* Clean, centered play button */}
              <span className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <span className="relative">
                  <span className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
                  <span className="relative flex w-14 h-14 sm:w-16 sm:h-16 bg-white/95 dark:bg-[#d4af37] text-midnight dark:text-[#0f0f45] backdrop-blur-sm rounded-full items-center justify-center shadow-2xl transition-transform duration-300 group-hover:scale-110">
                    <svg
                      className="w-6 h-6 ml-0.5 fill-current"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                </span>
              </span>
            </button>
          ) : (
            <iframe
              key={videoId}
              src={embedUrl}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          )}
        </div>

        {/* ── Info panel (5 / 12 columns on desktop) ── */}
        <div className="lg:col-span-5 p-5 sm:p-6 lg:p-7 flex flex-col justify-between bg-gradient-to-br from-[#12123a] to-[#0a0a22] dark:from-[#151622] dark:to-[#0d0e17] min-w-0 w-full overflow-hidden">
          {/* Top Info */}
          <div className="min-w-0">
            <span className="inline-block text-[11px] uppercase tracking-widest text-gold dark:text-[#d4af37] font-semibold mb-2">
              {releaseLabel}
            </span>
            <h3
              className="text-lg sm:text-xl md:text-2xl font-black text-white dark:text-[#e8d9a8] leading-snug mb-3 line-clamp-2 break-words [overflow-wrap:anywhere]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {title}
            </h3>
            <p className="text-white/70 dark:text-gray-300 text-xs sm:text-sm leading-relaxed mb-4 line-clamp-4 break-words [overflow-wrap:anywhere] break-all">
              {description}
            </p>
          </div>

          {/* Bottom Stats & Tags */}
          <div className="pt-3 border-t border-white/10 dark:border-white/5 min-w-0">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 min-w-0">
              <span className="flex items-center gap-1.5 text-white/60 text-xs shrink-0">
                <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fillRule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-white/80 font-medium">{viewCount} {viewsLabel}</span>
              </span>
              <span className="w-1 h-1 rounded-full bg-white/20 shrink-0" />
              <span className="flex items-center gap-1.5 text-white/60 text-xs shrink-0">
                <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-white/80 font-medium">{publishedAt}</span>
              </span>
            </div>

            {/* Tags */}
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 min-w-0">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 bg-white/10 dark:bg-[#a67c00]/20 hover:bg-gold/20 dark:hover:bg-[#d4af37]/30 border border-white/15 dark:border-[#a67c00]/40 text-white/80 dark:text-[#d4af37]/90 text-[11px] font-medium rounded-full transition-colors cursor-default select-none max-w-full truncate"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
