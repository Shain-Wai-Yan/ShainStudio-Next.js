'use client';

interface BlogHeroProps {
  title: string;
  subtitle?: string;
  language: 'en' | 'zh';
}

export default function BlogHero({ title, subtitle, language }: BlogHeroProps) {
  return (
    <section className="relative py-14 md:py-20 overflow-hidden bg-[#f8f9fa] dark:bg-[#1e1e1e]">
      {/* Dot pattern background */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23191970' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(25,25,112,0.04)_0%,transparent_70%)]" />

      <div className="relative z-10 text-center max-w-3xl mx-auto px-4 sm:px-6">
        {/* Title — gradient blue→gold, no badge above it */}
        <h1
          className="text-3xl md:text-5xl font-bold mb-3 leading-tight"
          style={{
            background: 'linear-gradient(135deg, #191970, #e6c200)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {title}
        </h1>

        {/* Underline bar */}
        <div className="w-16 h-1 mx-auto mb-5 rounded-full bg-gradient-to-r from-[#191970] to-[#ffd700]" />

        {subtitle && (
          <p className="text-base md:text-lg text-[#666666] dark:text-[#b0b0b0] leading-relaxed max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}