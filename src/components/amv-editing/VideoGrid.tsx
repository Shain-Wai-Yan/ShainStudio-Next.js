'use client';

import Image from 'next/image';
import { useState, useMemo } from 'react';
import VideoModal from './VideoModal';

interface Video {
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

interface VideoGridProps {
  videos: Video[];
  isLoading: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export default function VideoGrid({
  videos,
  isLoading,
  onLoadMore,
  hasMore = false,
}: VideoGridProps) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');

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
      <section className="mb-20">
        {/* Heading row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <span className="block w-1 h-8 rounded-full bg-midnight dark:bg-[#d4af37]" />
            <h2
              className="text-3xl md:text-4xl font-black text-midnight dark:text-[#d4af37] tracking-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Video Gallery
            </h2>
          </div>
          <div className="flex-1 h-px bg-midnight/10 dark:bg-[#a67c00]/30 hidden sm:block" />

          {/* Search */}
          {videos.length > 0 && (
            <div className="relative">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-[#666666] pointer-events-none"
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
                placeholder="Search videos…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2.5 text-sm border border-midnight/15 dark:border-[#a67c00]/30 rounded-full focus:outline-none focus:ring-2 focus:ring-midnight/30 dark:focus:ring-[#a67c00]/40 focus:border-midnight/40 dark:focus:border-[#a67c00]/60 bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-gray-100 w-52 transition-all"
              />
            </div>
          )}
        </div>

        {/* Video count */}
        {!isLoading && videos.length > 0 && (
          <p className="text-sm text-gray-400 dark:text-[#999999] mb-6">
            {search
              ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${search}"`
              : `${videos.length} video${videos.length !== 1 ? 's' : ''}`}
          </p>
        )}

        {/* Loading skeletons */}
        {isLoading && videos.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-midnight/8 dark:border-[#a67c00]/30 bg-gray-50 dark:bg-[#2a2a2a]">
                <div className="aspect-video bg-gray-200 dark:bg-[#3a3a3a] animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-[#3a3a3a] rounded-full animate-pulse w-3/4" />
                  <div className="h-3 bg-gray-100 dark:bg-[#2a2a2a] rounded-full animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-midnight/15 dark:border-[#a67c00]/30 rounded-2xl bg-gray-50/50 dark:bg-[#1a1a1a]/50">
            {search ? (
              <>
                <p className="text-3xl mb-3">🎬</p>
                <p className="text-gray-500 dark:text-[#b0b0b0] font-medium">No videos match &ldquo;{search}&rdquo;</p>
                <button
                  onClick={() => setSearch('')}
                  className="mt-3 text-sm text-midnight dark:text-[#d4af37] underline underline-offset-4 hover:text-midnight/70 dark:hover:text-[#a67c00]"
                >
                  Clear search
                </button>
              </>
            ) : (
              <p className="text-gray-500 dark:text-[#b0b0b0]">No videos found.</p>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((video, i) => (
                <button
                  key={video.id}
                  className="group text-left cursor-pointer bg-white dark:bg-[#1e1e1e] rounded-xl overflow-hidden shadow-sm hover:shadow-xl border border-midnight/10 dark:border-[#a67c00]/30 transition-all duration-300 hover:-translate-y-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-midnight/40 dark:focus-visible:ring-[#a67c00]/40"
                  onClick={() => handleVideoClick(video)}
                  aria-label={`Play ${video.title}`}
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  {/* Thumbnail */}
                  <div className="relative overflow-hidden bg-black aspect-video">
                    <Image
                      src={video.thumbnailUrl}
                      alt={video.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500 brightness-90 group-hover:brightness-100"
                      loading="lazy"
                      unoptimized
                    />
                    {/* Duration Badge */}
                    <div className="absolute bottom-2.5 right-2.5 bg-black/80 dark:bg-[#191970]/90 text-white dark:text-[#d4af37] px-2 py-0.5 rounded text-[11px] font-bold tracking-wide">
                      {video.duration}
                    </div>
                    {/* Play Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/30">
                      <div className="w-14 h-14 bg-white/90 dark:bg-[#d4af37]/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform duration-200">
                        <svg
                          className="w-6 h-6 text-midnight dark:text-[#191970] ml-0.5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Video Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-midnight dark:text-[#d4af37] text-sm leading-snug line-clamp-2 mb-1.5 group-hover:text-midnight/70 dark:group-hover:text-[#a67c00] transition-colors">
                      {video.title}
                    </h3>
                    <p className="text-xs text-gray-400 dark:text-[#999999]">
                      {video.viewCount} views · {video.publishedAt}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={onLoadMore}
                  disabled={isLoading}
                  className="px-8 py-3 bg-midnight dark:bg-[#a67c00] text-white dark:text-[#0f0f45] rounded-full font-semibold hover:bg-midnight/80 dark:hover:bg-[#c9a236] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? 'Loading…' : 'Load More Videos'}
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
        />
      )}
    </>
  );
}
