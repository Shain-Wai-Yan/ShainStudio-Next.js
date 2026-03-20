'use client';

import { useState } from 'react';
import Image from 'next/image';

interface FeaturedVideoProps {
  title: string;
  description: string;
  viewCount: string;
  publishedAt: string;
  thumbnailUrl: string;
  videoId: string;
  tags: string[];
}

export default function FeaturedVideo({
  title,
  description,
  viewCount,
  publishedAt,
  thumbnailUrl,
  videoId,
  tags,
}: FeaturedVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false);

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
    <section className="mb-20">
      {/* Section heading */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex items-center gap-2">
          <span className="block w-1 h-8 rounded-full bg-gold dark:bg-[#d4af37]" />
          <h2
            className="text-3xl md:text-4xl font-black text-midnight dark:text-[#d4af37] tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Featured Work
          </h2>
        </div>
        <div className="flex-1 h-px bg-midnight/10 dark:bg-[#a67c00]/30" />
        <span className="text-xs uppercase tracking-widest text-gold dark:text-[#d4af37] font-semibold">
          Editor&apos;s Pick
        </span>
      </div>

      {/* Card — taller via min-h on the video side */}
      <div className="relative grid md:grid-cols-5 rounded-2xl overflow-hidden shadow-2xl border border-midnight/10 dark:border-[#a67c00]/30 bg-midnight dark:bg-[#1e1e1e] group">

        {/* ── Video player (3 / 5 columns) ──────────────────────────────── */}
        <div className="md:col-span-3 relative bg-black min-h-[320px] md:min-h-[420px]">
          {!isPlaying ? (
            <button
              className="absolute inset-0 w-full h-full cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-gold"
              onClick={() => setIsPlaying(true)}
              aria-label={`Play ${title}`}
              type="button"
            >
              <Image
                src={thumbnailUrl}
                alt={title}
                fill
                className="object-cover brightness-75 group-hover:brightness-90 transition-all duration-500 scale-105 group-hover:scale-100"
                priority
                unoptimized
              />
              {/* Play button */}
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="relative">
                  <span className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
                  <span className="relative flex w-20 h-20 bg-white/90 backdrop-blur-sm rounded-full items-center justify-center shadow-2xl transition-transform duration-300 group-hover:scale-110">
                    <svg
                      className="w-8 h-8 text-midnight ml-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                </span>
              </span>
              {/* Bottom fade */}
              <span className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-midnight/80 to-transparent pointer-events-none" />
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

        {/* ── Info panel (2 / 5 columns) ────────────────────────────────── */}
        {/* 
          FIX: All text colors are now explicit white / white-opacity values.
          The previous version used text-midnight (dark) on a dark bg — invisible.
        */}
        <div className="md:col-span-2 p-7 md:p-10 flex flex-col justify-between bg-gradient-to-br from-[#12123a] to-[#0a0a22] dark:from-[#191970] dark:to-[#0f0f4d]">
          {/* Top */}
          <div>
            <span className="inline-block text-xs uppercase tracking-widest text-gold dark:text-[#d4af37] font-semibold mb-5">
              Latest Release
            </span>
            <h3
              className="text-xl md:text-2xl font-black text-white dark:text-[#e8d9a8] leading-snug mb-5"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {title}
            </h3>
            <p className="text-white/65 dark:text-gray-300 text-sm leading-relaxed mb-6 line-clamp-5">
              {description}
            </p>
          </div>

          {/* Stats */}
          <div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6">
              <span className="flex items-center gap-1.5 text-white/50 text-xs">
                <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fillRule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-white/70 font-medium">{viewCount} views</span>
              </span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span className="flex items-center gap-1.5 text-white/50 text-xs">
                <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-white/70 font-medium">{publishedAt}</span>
              </span>
            </div>

            {/* Tags */}
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-white/10 dark:bg-[#a67c00]/20 hover:bg-gold/20 dark:hover:bg-[#d4af37]/30 border border-white/15 dark:border-[#a67c00]/40 hover:border-gold/40 dark:hover:border-[#d4af37]/60 text-white/70 dark:text-[#d4af37]/80 hover:text-gold dark:hover:text-[#d4af37] text-xs font-medium rounded-full transition-colors cursor-default select-none"
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
