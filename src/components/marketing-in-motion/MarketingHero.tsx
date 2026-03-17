'use client';

interface MarketingHeroProps {
  title: string;
  description: string;
}

export function MarketingHero({ title, description }: MarketingHeroProps) {
  return (
    <section
      className="
        relative overflow-hidden
        bg-gradient-to-br from-[#f8fafc] to-white
        dark:from-[#121212] dark:to-[#1a1a1a]
        min-h-[40vh] flex items-center justify-center
        px-4 sm:px-6
        pt-[calc(70px+4rem)] pb-16
      "
      aria-labelledby="marketing-hero-heading"
    >
      {/* Radial blobs */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-[10%] bottom-[15%] w-96 h-96 rounded-full bg-[#191970]/5 dark:bg-[#a67c00]/10 blur-3xl" />
        <div className="absolute right-[10%] top-[15%] w-96 h-96 rounded-full bg-[#ffd700]/10 dark:bg-[#191970]/10 blur-3xl" />
      </div>

      {/* Subtle grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(rgba(25,25,112,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(25,25,112,0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
        aria-hidden="true"
      />

      {/* Left accent bar */}
      <div
        className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 w-1 h-24 bg-gradient-to-b from-transparent via-[#191970] to-transparent dark:via-[#ffd700] opacity-40"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Eyebrow label */}
        <div className="inline-flex items-center gap-2 mb-4">
          <span className="h-px w-8 bg-[#191970] dark:bg-[#ffd700] opacity-60" />
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#191970] dark:text-[#ffd700] opacity-80">
            Portfolio
          </span>
          <span className="h-px w-8 bg-[#191970] dark:bg-[#ffd700] opacity-60" />
        </div>

        <h1
          id="marketing-hero-heading"
          className="
            font-bold text-balance leading-tight mb-5
            text-2xl sm:text-3xl md:text-4xl
            text-[#191970] dark:text-[#e0e0e0]
          "
        >
          {title}
        </h1>
        <p
          className="
            text-base sm:text-lg leading-relaxed
            text-[#666666] dark:text-[#b0b0b0]
            max-w-2xl mx-auto
          "
        >
          {description}
        </p>
      </div>
    </section>
  );
}