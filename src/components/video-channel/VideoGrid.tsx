'use client';

import Image from 'next/image';
import { useState, useMemo } from 'react';
import VideoModal from './VideoModal';

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: string;
  viewCount: string;
  publishedAt: string;
  videoId: string;
  channel: string;
  tags?: string[];
}

export interface VideoGridProps {
  videos: Video[];
  isLoading: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  title?: string;
  searchPlaceholder?: string;
  locale?: 'en' | 'zh';
}

export default function VideoGrid({
  videos,
  isLoading,
  onLoadMore,
  hasMore = false,
  title = 'Video Gallery',
  searchPlaceholder = 'Search videos…',
  locale = 'en',
}: VideoGridProps) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  const labels = locale === 'zh'
    ? {
        result: '条结果：',
        video: '个视频',
        noMatch: '没有符合条件的视频',
        clear: '清除搜索',
        empty: '暂无视频。',
        loading: '加载中…',
        loadMore: '加载更多视频',
        views: '次播放',
      }
    : {
        result: 'result',
        video: 'video',
        noMatch: 'No videos match',
        clear: 'Clear search',
        empty: 'No videos found.',
        loading: 'Loading…',
        loadMore: 'Load More Videos',
        views: 'views',
      };

  const filtered = useMemo(() => {
    if (!search.trim()) return videos;
    const q = search.toLowerCase();
    return videos.filter(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q)
    );
  }, [videos, search]);

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  const handleNext = () => {
    if (!selectedVideo) return;
    const idx = filtered.findIndex((v) => v.id === selectedVideo.id);
    if (idx < filtered.length - 1) {
      setSelectedVideo(filtered[idx + 1]);
    }
  };

  const handlePrev = () => {
    if (!selectedVideo) return;
    const idx = filtered.findIndex((v) => v.id === selectedVideo.id);
    if (idx > 0) {
      setSelectedVideo(filtered[idx - 1]);
    }
  };

  const currentIndex = selectedVideo
    ? filtered.findIndex((v) => v.id === selectedVideo.id)
    : -1;

  return (
    <>
      <section className="mb-14 sm:mb-16">
        {/* Compact Heading & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <span className="block w-1 h-6 rounded-full bg-[#191970] dark:bg-[#d4af37]" />
            <h2
              className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-[#d4af37] tracking-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {title}
            </h2>
            {!isLoading && videos.length > 0 && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-white/10 text-neutral-600 dark:text-neutral-400 border border-neutral-200/80 dark:border-white/10">
                {search
                  ? `${filtered.length} / ${videos.length}`
                  : `${videos.length} ${locale === 'zh' ? labels.video : `${labels.video}${videos.length !== 1 ? 's' : ''}`}`}
              </span>
            )}
          </div>

          {/* Compact Search Input */}
          {videos.length > 0 && (
            <div className="relative w-full sm:w-60">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 pointer-events-none"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <circle cx={11} cy={11} r={8} />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm border border-neutral-200 dark:border-white/10 rounded-full focus:outline-none focus:ring-2 focus:ring-[#191970]/30 dark:focus:ring-[#d4af37]/40 bg-white dark:bg-[#151622] text-neutral-900 dark:text-neutral-100 transition-all placeholder:text-neutral-400 dark:placeholder:text-neutral-500 shadow-xs"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-xs p-0.5"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          )}
        </div>

        {/* Loading skeletons (4-column compact density) */}
        {isLoading && videos.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4.5">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden border border-neutral-200/80 dark:border-white/10 bg-white/70 dark:bg-[#12131d]/70 animate-pulse"
              >
                <div className="aspect-video bg-neutral-200 dark:bg-neutral-800" />
                <div className="p-3 sm:p-3.5 space-y-2">
                  <div className="h-3.5 bg-neutral-200 dark:bg-neutral-800 rounded-sm w-4/5" />
                  <div className="h-3.5 bg-neutral-200 dark:bg-neutral-800 rounded-sm w-3/5" />
                  <div className="h-2.5 bg-neutral-100 dark:bg-neutral-850 rounded-sm w-1/2 pt-1" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-neutral-200 dark:border-white/10 rounded-2xl bg-neutral-50/50 dark:bg-[#12131d]/40">
            {search ? (
              <>
                <p className="text-2xl mb-2">🎬</p>
                <p className="text-neutral-600 dark:text-neutral-300 text-sm font-medium">
                  {labels.noMatch} &ldquo;{search}&rdquo;
                </p>
                <button
                  onClick={() => setSearch('')}
                  className="mt-3 text-xs font-semibold text-[#191970] dark:text-[#d4af37] underline underline-offset-4 hover:opacity-80"
                >
                  {labels.clear}
                </button>
              </>
            ) : (
              <p className="text-neutral-500 dark:text-neutral-400 text-sm">{labels.empty}</p>
            )}
          </div>
        ) : (
          <>
            {/* ── Compact 4-Column Video Grid ───────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4.5">
              {filtered.map((video, i) => (
                <button
                  key={video.id}
                  className="group relative text-left cursor-pointer flex flex-col rounded-2xl overflow-hidden bg-white/80 dark:bg-[#12131d]/90 backdrop-blur-sm border border-neutral-200/80 dark:border-white/10 hover:border-neutral-300 dark:hover:border-white/20 shadow-xs hover:shadow-lg hover:shadow-black/[0.04] dark:hover:shadow-black/50 transition-all duration-300 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  onClick={() => handleVideoClick(video)}
                  aria-label={`Play ${video.title}`}
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  {/* Compact Thumbnail Container */}
                  <div className="relative overflow-hidden bg-neutral-900 aspect-video w-full shrink-0">
                    <Image
                      src={video.thumbnailUrl}
                      alt={video.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out brightness-95 group-hover:brightness-100"
                      loading="lazy"
                      unoptimized
                    />

                    {/* Subtle vignette gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity pointer-events-none" />

                    {/* Compact Duration Badge */}
                    <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-white text-[10px] font-mono font-medium tracking-tight border border-white/15 shadow-xs">
                      {video.duration}
                    </div>

                    {/* Compact Play Hover Icon */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 bg-black/20 backdrop-blur-[1px]">
                      <div className="w-9 h-9 rounded-full bg-white/95 dark:bg-[#d4af37] text-neutral-950 dark:text-[#0f0f45] flex items-center justify-center shadow-lg transform scale-80 group-hover:scale-100 transition-transform duration-200">
                        <svg
                          className="w-3.5 h-3.5 fill-current ml-0.5"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Compact Info Section */}
                  <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between gap-1.5">
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs sm:text-sm leading-snug line-clamp-2 group-hover:text-[#191970] dark:group-hover:text-[#d4af37] transition-colors">
                      {video.title}
                    </h3>
                    <div className="flex items-center text-[11px] text-neutral-500 dark:text-neutral-400 font-medium gap-1.5 mt-auto pt-1">
                      <span>{video.viewCount} {labels.views}</span>
                      <span className="text-neutral-300 dark:text-neutral-700">·</span>
                      <span className="truncate">{video.publishedAt}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={onLoadMore}
                  disabled={isLoading}
                  className="px-7 py-2.5 bg-[#191970] dark:bg-[#a67c00] text-white dark:text-[#0f0f45] text-sm rounded-full font-semibold hover:bg-[#191970]/85 dark:hover:bg-[#c9a236] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                >
                  {isLoading ? labels.loading : labels.loadMore}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Video Modal */}
      {selectedVideo && (
        <VideoModal
          isOpen={isModalOpen}
          video={selectedVideo}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedVideo(null);
          }}
          onNext={currentIndex < filtered.length - 1 ? handleNext : undefined}
          onPrev={currentIndex > 0 ? handlePrev : undefined}
          currentIndex={currentIndex}
          totalVideos={filtered.length}
          locale={locale}
        />
      )}
    </>
  );
}
