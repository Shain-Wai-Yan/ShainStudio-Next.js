'use client';

interface AMVHeaderProps {
  title: string;
  description: string;
  totalVideos?: number;
}

export default function AMVHeader({ title, description, totalVideos }: AMVHeaderProps) {
  return (
    <section className="relative text-center py-16 md:py-24 px-4 overflow-hidden">
      {/* Decorative accents */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full border border-midnight/10" />
        <div className="absolute top-20 right-16 w-16 h-16 rounded-full border border-gold/20" />
        <div className="absolute bottom-4 left-1/4 w-2 h-2 rounded-full bg-gold/40" />
        <div className="absolute bottom-8 right-1/3 w-1.5 h-1.5 rounded-full bg-midnight/30" />
      </div>

      {/* Eyebrow label */}
      <div className="inline-flex items-center gap-2 mb-6">
        <span className="block w-8 h-px bg-gold" />
        <span className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
          Portfolio
        </span>
        <span className="block w-8 h-px bg-gold" />
      </div>

      <h1
        className="text-5xl md:text-7xl font-black text-midnight mb-5 leading-none tracking-tight"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        {title}
      </h1>

      <p className="text-base md:text-lg text-gray-500 max-w-xl mx-auto mb-8 leading-relaxed">
        {description}
      </p>

      {totalVideos !== undefined && totalVideos > 0 && (
        <div className="inline-flex items-center gap-3 bg-midnight/5 border border-midnight/10 rounded-full px-5 py-2.5">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-midnight">{totalVideos} Videos</span>
          </span>
          <span className="w-px h-4 bg-midnight/20" />
          <span className="text-sm text-gray-500">Shain Studio AMV</span>
        </div>
      )}
    </section>
  );
}