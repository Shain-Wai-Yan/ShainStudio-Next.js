'use client';

import Image from 'next/image';

interface ChannelData {
  title: string;
  description: string;
  subscriberCount: string;
  videoCount: string;
  bannerUrl?: string;
  avatarUrl?: string;
}

interface ChannelInfoProps {
  data?: ChannelData;
  isLoading: boolean;
}

export default function ChannelInfo({ data, isLoading }: ChannelInfoProps) {
  if (isLoading || !data) {
    return (
      <section className="rounded-2xl overflow-hidden shadow-lg border border-midnight/10 mb-14 animate-pulse">
        <div className="h-44 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
        <div className="p-6 md:p-8 flex gap-5">
          <div className="w-24 h-24 rounded-full bg-gray-200 flex-shrink-0 -mt-12 ring-4 ring-white" />
          <div className="flex-1 pt-2 space-y-3">
            <div className="h-5 bg-gray-200 rounded-full w-1/3" />
            <div className="h-4 bg-gray-100 rounded-full w-1/4" />
            <div className="h-4 bg-gray-100 rounded-full w-2/3" />
            <div className="h-4 bg-gray-100 rounded-full w-1/2" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl overflow-hidden shadow-lg border border-midnight/10 mb-14 group">
      {/* Banner */}
      <div className="relative h-44 md:h-52 w-full bg-gradient-to-br from-midnight via-midnight/90 to-indigo-900">
        {data.bannerUrl && (
          <Image
            src={data.bannerUrl}
            alt="Channel Banner"
            fill
            className="object-cover opacity-80"
          />
        )}
        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      {/* Profile row */}
      <div className="relative px-6 md:px-8 pb-6 md:pb-8">
        {/* Avatar — overlaps banner */}
        {data.avatarUrl && (
          <div className="absolute -top-12 left-6 md:left-8">
            <div className="relative w-24 h-24 ring-4 ring-white rounded-full shadow-xl overflow-hidden">
              <Image
                src={data.avatarUrl}
                alt={data.title}
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}

        {/* Text content — offset to clear avatar */}
        <div className={data.avatarUrl ? 'pt-16' : 'pt-4'}>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <h2
                className="text-2xl md:text-3xl font-black text-midnight mb-1 tracking-tight"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {data.title}
              </h2>

              {/* Stats chips */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-midnight/70 bg-midnight/8 px-3 py-1 rounded-full border border-midnight/10">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 14.094A5.973 5.973 0 004 17v1H1v-1a3 3 0 013.75-2.906z" />
                  </svg>
                  {data.subscriberCount} subscribers
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-midnight/70 bg-midnight/8 px-3 py-1 rounded-full border border-midnight/10">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                  {data.videoCount} videos
                </span>
              </div>

              <p className="text-gray-600 text-sm leading-relaxed max-w-2xl">
                {data.description}
              </p>
            </div>

            {/* YouTube link button */}
            <a
              href="https://www.youtube.com/@ShainStudioAMV"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF0000] text-white text-sm font-semibold rounded-full hover:bg-[#cc0000] transition-colors shadow-md shrink-0 self-start"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              Subscribe
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}