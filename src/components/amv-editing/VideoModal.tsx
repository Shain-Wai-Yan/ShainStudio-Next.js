'use client';

import { useEffect, useCallback } from 'react';

interface Video {
  id: string;
  title: string;
  description: string;
  videoId: string;
  viewCount: string;
  publishedAt: string;
  duration?: string;
  tags?: string[];
}

interface VideoModalProps {
  isOpen: boolean;
  video: Video;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  currentIndex?: number;
  totalVideos?: number;
}

export default function VideoModal({
  isOpen,
  video,
  onClose,
  onNext,
  onPrev,
  currentIndex,
  totalVideos,
}: VideoModalProps) {
  // ── Keyboard navigation ─────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && onNext) onNext();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
    },
    [isOpen, onClose, onNext, onPrev]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // ── Safari fix ────────────────────────────────────────────────────────────
  // The modal only mounts the iframe AFTER the user clicks a thumbnail card,
  // so the iframe insertion itself is driven by a user gesture. Safari allows
  // autoplay=1 in this case. playsinline=1 prevents Safari from going
  // full-screen automatically on mobile.
  // ─────────────────────────────────────────────────────────────────────────
  const embedUrl = `https://www.youtube.com/embed/${video.videoId}?rel=0&showinfo=0&autoplay=1&modestbranding=1&color=white&playsinline=1`;
  const youtubeUrl = `https://www.youtube.com/watch?v=${video.videoId}`;

  const handleShare = async () => {
    const shareData = { title: video.title, url: youtubeUrl };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled — ignore
      }
    } else {
      try {
        await navigator.clipboard.writeText(youtubeUrl);
      } catch {
        // clipboard unavailable — silently ignore
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={video.title}
    >
      <div
        className="relative bg-[#0a0a1a] rounded-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Top bar ───────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 shrink-0">
          {currentIndex !== undefined && totalVideos !== undefined && (
            <span className="text-xs text-white/40 font-medium tabular-nums">
              {currentIndex + 1} / {totalVideos}
            </span>
          )}

          <div className="flex items-center gap-1 ml-auto">
            {/* Share */}
            <button
              onClick={handleShare}
              title="Share or copy link"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white/55 hover:text-white hover:bg-white/10 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx={18} cy={5} r={3} />
                <circle cx={6} cy={12} r={3} />
                <circle cx={18} cy={19} r={3} />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              Share
            </button>

            {/* Open on YouTube */}
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Watch on YouTube"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white/55 hover:text-white hover:bg-white/10 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              YouTube
            </a>

            {/* Close */}
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors ml-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Scrollable body ───────────────────────────────────────────── */}
        <div className="overflow-y-auto flex-1">
          {/* iframe — key prop forces remount when switching videos */}
          <div className="relative w-full bg-black aspect-video">
            <iframe
              key={video.videoId}
              src={embedUrl}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>

          {/* Info */}
          <div className="p-6 md:p-8">
            <h2
              className="text-xl md:text-2xl font-black text-white mb-3 leading-snug"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {video.title}
            </h2>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-5">
              <span className="flex items-center gap-1.5 text-xs text-white/50">
                <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                <span className="text-white/70">{video.viewCount} views</span>
              </span>
              {video.duration && (
                <>
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <span className="text-xs text-white/50">{video.duration}</span>
                </>
              )}
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span className="text-xs text-white/50">{video.publishedAt}</span>
            </div>

            {video.description && (
              <p className="text-white/55 text-sm leading-relaxed mb-6 max-w-3xl">
                {video.description}
              </p>
            )}

            {video.tags && video.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {video.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-white/8 border border-white/12 text-white/50 text-xs font-medium rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Bottom navigation bar ─────────────────────────────────────── */}
        {(onPrev || onNext) && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-black/30 shrink-0">
            <button
              onClick={onPrev}
              disabled={!onPrev}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Previous
            </button>

            <div className="hidden sm:flex items-center gap-1.5 text-white/25 text-xs">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px]">←</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px]">→</kbd>
              <span className="ml-0.5">navigate</span>
              <span className="mx-1.5">·</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px]">Esc</kbd>
              <span className="ml-0.5">close</span>
            </div>

            <button
              onClick={onNext}
              disabled={!onNext}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}