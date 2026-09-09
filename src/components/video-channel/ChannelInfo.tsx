'use client';

import { useState } from 'react';
import Image from 'next/image';

export interface ChannelData {
  title: string;
  description: string;
  subscriberCount: string;
  videoCount: string;
  viewCount?: string;
  customUrl?: string;
  bannerUrl?: string;
  avatarUrl?: string;
}

export interface ChannelInfoProps {
  data?: ChannelData;
  isLoading: boolean;
  channelUrl?: string;
  subscribersLabel?: string;
  videosLabel?: string;
  viewsLabel?: string;
  subscribeLabel?: string;
  verifiedLabel?: string;
  copyLabel?: string;
  copiedLabel?: string;
  readMoreLabel?: string;
  showLessLabel?: string;
}

export default function ChannelInfo({
  data,
  isLoading,
  channelUrl = 'https://www.youtube.com/@shaineditamv',
  subscribersLabel = 'Subscribers',
  videosLabel = 'Videos',
  viewsLabel = 'Total Views',
  subscribeLabel = 'Subscribe',
  verifiedLabel = 'Official Channel',
  copyLabel = 'Copy channel link',
  copiedLabel = 'Copied!',
  readMoreLabel = 'See more',
  showLessLabel = 'Show less',
}: ChannelInfoProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCopy = async () => {
    if (!channelUrl) return;
    try {
      await navigator.clipboard.writeText(channelUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback if clipboard API is restricted
      setCopied(false);
    }
  };

  if (isLoading || !data) {
    return (
      <section
        aria-label="Loading channel information"
        className="relative rounded-3xl overflow-hidden border border-neutral-200/80 dark:border-white/10 bg-white/70 dark:bg-[#12131d]/80 backdrop-blur-xl shadow-xl shadow-black/[0.03] dark:shadow-black/40 mb-12 sm:mb-14 animate-pulse"
      >
        {/* Banner Skeleton */}
        <div className="h-36 sm:h-44 md:h-52 w-full bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 dark:from-neutral-800 dark:via-neutral-850 dark:to-neutral-800" />

        {/* Content Skeleton */}
        <div className="relative px-5 sm:px-7 md:px-8 pb-5 sm:pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 -mt-10 sm:-mt-12 md:-mt-14">
            {/* Avatar placeholder */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl sm:rounded-3xl bg-neutral-300 dark:bg-neutral-700 ring-4 ring-white dark:ring-[#12131d] shadow-2xl shrink-0" />
            {/* Action buttons placeholder */}
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-32 rounded-full bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-800" />
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="h-7 bg-neutral-200 dark:bg-neutral-800 rounded-lg w-1/3" />
            <div className="h-3.5 bg-neutral-200 dark:bg-neutral-800 rounded-full w-1/4" />
            <div className="h-3 bg-neutral-100 dark:bg-neutral-850 rounded-full w-3/4 pt-1" />
            <div className="h-3 bg-neutral-100 dark:bg-neutral-850 rounded-full w-1/2" />
          </div>

          {/* Stats strip skeleton */}
          <div className="pt-4.5 mt-4.5 sm:pt-5 sm:mt-5 border-t border-neutral-200/80 dark:border-white/10 grid grid-cols-3 gap-5 max-w-lg">
            <div className="space-y-2">
              <div className="h-6 bg-neutral-200 dark:bg-neutral-800 rounded-md w-16" />
              <div className="h-3 bg-neutral-100 dark:bg-neutral-850 rounded-sm w-20" />
            </div>
            <div className="space-y-2">
              <div className="h-6 bg-neutral-200 dark:bg-neutral-800 rounded-md w-16" />
              <div className="h-3 bg-neutral-100 dark:bg-neutral-850 rounded-sm w-20" />
            </div>
            <div className="space-y-2">
              <div className="h-6 bg-neutral-200 dark:bg-neutral-800 rounded-md w-16" />
              <div className="h-3 bg-neutral-100 dark:bg-neutral-850 rounded-sm w-20" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Clean and parse description lines
  const rawDescription = data?.description ? data.description.trim() : '';
  const nonBlankLines = rawDescription
    ? rawDescription
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
    : [];

  // Determine if there is actual hidden content that justifies showing a "See more" toggle:
  // - If multi-paragraph (> 2 non-blank lines), lines beyond the second are hidden.
  // - If single paragraph that exceeds 140 chars, it will wrap beyond 2 lines.
  // - If two lines that exceed combined line width (~150 chars).
  // Single short descriptions (like AMV "I do some simple edits.......") have NO hidden content.
  const isMultiParagraph = nonBlankLines.length > 2;
  const isSingleLongParagraph =
    nonBlankLines.length === 1 && nonBlankLines[0].length > 140;
  const isTwoLongLines =
    nonBlankLines.length === 2 &&
    (nonBlankLines[0].length > 90 ||
      nonBlankLines[0].length + nonBlankLines[1].length > 150);

  const hasHiddenContent =
    isMultiParagraph || isSingleLongParagraph || isTwoLongLines;

  // When collapsed, display ONLY what naturally appears in the first 1-2 lines.
  // Do NOT artificially wrap or merge subsequent paragraphs to fit.
  const collapsedDisplay = isMultiParagraph
    ? nonBlankLines[0].length > 90
      ? nonBlankLines[0]
      : `${nonBlankLines[0]}\n${nonBlankLines[1]}`
    : rawDescription;

  const displayDescription = isExpanded ? rawDescription : collapsedDisplay;

  return (
    <section
      aria-label={`${data.title} channel preview`}
      className="group relative rounded-3xl overflow-hidden border border-neutral-200/80 dark:border-white/10 bg-white/80 dark:bg-[#12131d]/90 backdrop-blur-xl shadow-[0_12px_40px_-15px_rgba(25,25,112,0.06)] dark:shadow-[0_25px_60px_-20px_rgba(0,0,0,0.7)] transition-all duration-500 hover:shadow-[0_20px_50px_-15px_rgba(25,25,112,0.12)] dark:hover:shadow-[0_30px_70px_-20px_rgba(0,0,0,0.9)] mb-10 sm:mb-12"
    >
      {/* ── Panoramic Cinematic Header ───────────────────────────────────── */}
      <div className="relative h-36 sm:h-44 md:h-52 w-full overflow-hidden bg-neutral-950">
        {data.bannerUrl ? (
          <Image
            src={data.bannerUrl}
            alt={`${data.title} banner`}
            fill
            className="object-cover object-center transform group-hover:scale-105 transition-transform duration-1000 ease-out brightness-90 contrast-[1.05]"
            priority
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0f0f45] via-[#191970] to-[#2a2a9a] dark:from-[#080911] dark:via-[#131424] dark:to-[#1a1c33]" />
        )}

        {/* Ambient fine-art gradient masks eliminating harsh edges */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/85 via-neutral-950/30 to-black/30 dark:from-[#12131d] dark:via-black/40 dark:to-transparent" />
        <div className="absolute inset-0 bg-radial-at-c from-transparent via-transparent to-black/40 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-5 flex items-center gap-2.5 z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/45 backdrop-blur-md border border-white/20 text-white text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{verifiedLabel}</span>
          </div>
        </div>

        {data.customUrl && (
          <div className="absolute top-3 right-3 sm:top-4 sm:right-5 hidden sm:flex items-center z-10">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/45 backdrop-blur-md border border-white/20 text-white/90 text-xs font-mono tracking-wide shadow-xs">
              <svg className="w-3 h-3 fill-red-500 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              {data.customUrl}
            </span>
          </div>
        )}
      </div>

      {/* ── Main Dossier Body ────────────────────────────────────────────── */}
      <div className="relative px-5 sm:px-7 md:px-8 pb-5 sm:pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-10 sm:-mt-12 md:-mt-14">
          {/* Creator Avatar with double frame & status ring */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl sm:rounded-3xl overflow-hidden ring-4 ring-white dark:ring-[#12131d] shadow-2xl p-0.5 bg-white dark:bg-[#12131d] shrink-0 group-hover:ring-[#d4af37]/40 transition-all duration-500">
            {data.avatarUrl ? (
              <Image
                src={data.avatarUrl}
                alt={data.title}
                fill
                className="object-cover rounded-[18px] sm:rounded-[22px]"
                unoptimized
              />
            ) : (
              <div className="w-full h-full rounded-[18px] sm:rounded-[22px] bg-gradient-to-br from-[#191970] to-[#ffd700] flex items-center justify-center text-white font-serif text-2xl sm:text-3xl font-black">
                {data.title.charAt(0)}
              </div>
            )}

            {/* Pulsing Active Status Dot */}
            <span
              className="absolute bottom-1.5 right-1.5 flex h-3 w-3"
              title="Active Creator"
            >
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 ring-2 ring-white dark:ring-[#12131d]" />
            </span>
          </div>

          {/* Action Button Cluster */}
          <div className="flex items-center gap-2.5 self-start sm:self-end pt-1 sm:pt-0">
            {/* Primary Subscribe CTA */}
            <a
              href={channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group/btn relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0f0f45] text-white hover:bg-[#191970] dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 text-xs sm:text-sm font-semibold tracking-wide shadow-md shadow-[#0f0f45]/20 dark:shadow-white/5 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              aria-label={`${subscribeLabel} to ${data.title} on YouTube`}
            >
              {/* YouTube glyph */}
              <span className="flex items-center justify-center w-4 h-4 text-red-500 transition-transform duration-300 group-hover/btn:scale-110">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </span>
              <span>{subscribeLabel}</span>
              {/* Glide arrow */}
              <svg
                className="w-3 h-3 opacity-70 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            </a>

            {/* Quick Share / Copy Link Button */}
            <button
              onClick={handleCopy}
              type="button"
              className="relative w-10 h-10 rounded-full border border-neutral-200 dark:border-white/15 bg-neutral-50/80 dark:bg-white/5 hover:bg-neutral-100 dark:hover:bg-white/10 flex items-center justify-center transition-all duration-200 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              title={copied ? copiedLabel : copyLabel}
              aria-label={copyLabel}
            >
              {copied ? (
                <svg className="w-3.5 h-3.5 text-emerald-500 animate-scale-in" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                </svg>
              )}

              {/* Tooltip feedback badge */}
              {copied && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-[10px] font-semibold rounded shadow-md whitespace-nowrap pointer-events-none">
                  {copiedLabel}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Channel Details */}
        <div className="mt-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-black text-neutral-950 dark:text-white tracking-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {data.title}
            </h2>
          </div>

          {data.customUrl && (
            <p className="mt-1 text-xs sm:text-sm font-mono text-neutral-500 dark:text-neutral-400">
              {data.customUrl}
            </p>
          )}

          {/* Description - Compact display without forced wrapping */}
          {rawDescription && (
            <div className="mt-2.5 sm:mt-3 max-w-2xl">
              <p
                className={`text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 font-normal leading-relaxed whitespace-pre-line ${
                  !isExpanded && (isSingleLongParagraph || isTwoLongLines)
                    ? 'line-clamp-2'
                    : ''
                }`}
              >
                {displayDescription}
              </p>
              {hasHiddenContent && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-[#191970] dark:text-[#d4af37] hover:underline focus-visible:outline-none transition-colors"
                >
                  <span>{isExpanded ? showLessLabel : readMoreLabel}</span>
                  <svg
                    className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Editorial Typographic Stats Strip ───────────────────────────── */}
        <div className="pt-4.5 mt-4.5 sm:pt-5 sm:mt-5 border-t border-neutral-200/70 dark:border-white/10 grid grid-cols-3 gap-3 sm:gap-8 max-w-lg">
          {/* Subscribers */}
          <div>
            <div
              className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-[#d4af37]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {data.subscriberCount}
            </div>
            <div className="mt-1 text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-neutral-400 dark:text-neutral-500">
              {subscribersLabel}
            </div>
          </div>

          {/* Videos */}
          <div className="border-l border-neutral-200/70 dark:border-white/10 pl-3 sm:pl-8">
            <div
              className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-[#d4af37]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {data.videoCount}
            </div>
            <div className="mt-1 text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-neutral-400 dark:text-neutral-500">
              {videosLabel}
            </div>
          </div>

          {/* Total Views */}
          {data.viewCount && (
            <div className="border-l border-neutral-200/70 dark:border-white/10 pl-3 sm:pl-8">
              <div
                className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-[#d4af37]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {data.viewCount}
              </div>
              <div className="mt-1 text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-neutral-400 dark:text-neutral-500">
                {viewsLabel}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
