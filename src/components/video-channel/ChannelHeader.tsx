'use client';

export interface ChannelHeaderProps {
  title: string;
  description: string;
  totalVideos?: number;
  eyebrow?: string;
  badgeChannelName?: string;
  videosLabel?: string;
}

export default function ChannelHeader({
  title,
  description,
  totalVideos,
  eyebrow = 'Beyond Work',
  badgeChannelName = 'Shain Studio AMV',
  videosLabel = 'Videos',
}: ChannelHeaderProps) {
  return (
    <section className="relative text-center py-16 md:py-24 px-4 overflow-hidden">
      {/* Decorative accents */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full border border-midnight/10 dark:border-[#d4af37]/20" />
        <div className="absolute top-20 right-16 w-16 h-16 rounded-full border border-gold/20 dark:border-[#a67c00]/30" />
        <div className="absolute bottom-4 left-1/4 w-2 h-2 rounded-full bg-gold/40 dark:bg-[#d4af37]/60" />
        <div className="absolute bottom-8 right-1/3 w-1.5 h-1.5 rounded-full bg-midnight/30 dark:bg-[#a67c00]/40" />
      </div>

      {/* Eyebrow label */}
      <div className="inline-flex items-center gap-2 mb-6">
        <span className="block w-8 h-px bg-gold dark:bg-[#d4af37]" />
        <span className="text-xs uppercase tracking-[0.25em] text-gold dark:text-[#d4af37] font-semibold">
          {eyebrow}
        </span>
        <span className="block w-8 h-px bg-gold dark:bg-[#d4af37]" />
      </div>

      <h1
        className="text-5xl md:text-7xl font-black text-midnight dark:text-[#d4af37] mb-5 leading-none tracking-tight"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        {title}
      </h1>

      <p className="text-base md:text-lg text-gray-500 dark:text-[#b0b0b0] max-w-xl mx-auto mb-8 leading-relaxed">
        {description}
      </p>

      {totalVideos !== undefined && totalVideos > 0 && (
        <div className="inline-flex items-center gap-3 bg-midnight/5 dark:bg-[#a67c00]/10 border border-midnight/10 dark:border-[#a67c00]/30 rounded-full px-5 py-2.5">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 dark:bg-[#4ade80] animate-pulse" />
            <span className="text-sm font-medium text-midnight dark:text-[#d4af37]">{totalVideos} {videosLabel}</span>
          </span>
          <span className="w-px h-4 bg-midnight/20 dark:bg-[#a67c00]/40" />
          <span className="text-sm text-gray-500 dark:text-[#999999]">{badgeChannelName}</span>
        </div>
      )}
    </section>
  );
}
