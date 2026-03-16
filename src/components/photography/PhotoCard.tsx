'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Photo } from '@/lib/strapi/photography';

interface PhotoCardProps {
  photo: Photo;
  onClick: () => void;
  priority?: boolean;
}

function buildSrc(url: string | null, width: number): string {
  if (!url) return '';
  if (
    url.includes('cloudinary.com') &&
    !url.includes('/upload/c_') &&
    !url.includes('/upload/w_')
  ) {
    return url.replace('/upload/', `/upload/c_scale,w_${width},q_auto,f_auto/`);
  }
  return url;
}

function buildBlurSrc(url: string | null): string | undefined {
  if (!url?.includes('cloudinary.com')) return undefined;
  if (url.includes('/upload/c_') || url.includes('/upload/w_')) return undefined;
  return url.replace('/upload/', '/upload/c_scale,w_20,q_10,f_auto,e_blur:400/');
}

export function PhotoCard({ photo, onClick, priority = false }: PhotoCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const src     = useMemo(() => buildSrc(photo.image, 600), [photo.image]);
  const blurSrc = useMemo(() => buildBlurSrc(photo.image), [photo.image]);

  // ── Error / no image ────────────────────────────────────────────────────────
  if (!photo.image || hasError) {
    return (
      <div
        // break-inside-avoid: critical for CSS columns — prevents this card
        // from being split across two columns
        className="break-inside-avoid mb-3 rounded-xl overflow-hidden cursor-pointer bg-gray-100 dark:bg-gray-800 border border-dashed border-gray-200 dark:border-gray-700 h-44 flex items-center justify-center group hover:border-[#191970]/30 dark:hover:border-[#ffd700]/30 transition-all duration-300"
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
        aria-label={`View photo: ${photo.title}`}
      >
        <div className="text-center px-4">
          <svg className="w-7 h-7 mx-auto mb-2 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-2">{photo.title}</p>
        </div>
      </div>
    );
  }

  // ── Normal card ─────────────────────────────────────────────────────────────
  return (
    <div
      className={[
        // break-inside-avoid is THE key CSS columns property.
        // Without it the browser can slice a card in half across columns.
        'break-inside-avoid',
        // mb-3 = vertical spacing between cards stacked in the same column
        'mb-3',
        // Visual
        'relative rounded-xl overflow-hidden cursor-pointer group',
        'bg-gray-100 dark:bg-gray-800',
      ].join(' ')}
      style={{ boxShadow: '0 1px 8px rgba(25,25,112,0.07)' }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
      aria-label={`View photo: ${photo.title}`}
    >
      <Image
        src={src}
        alt={photo.title}
        width={600}
        height={400}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
        // w-full h-auto: image fills the column width at its natural aspect ratio.
        // This is what gives the browser real varying heights to balance columns with.
        className={`w-full h-auto block transition-all duration-500 group-hover:scale-[1.04] ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        loading={priority ? 'eager' : 'lazy'}
        priority={priority}
        decoding={priority ? 'sync' : 'async'}
        {...(blurSrc
          ? { placeholder: 'blur' as const, blurDataURL: blurSrc }
          : {}
        )}
        onLoad={() => setIsLoaded(true)}
        onError={() => { setHasError(true); setIsLoaded(true); }}
      />

      {/* Hover gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#191970]/88 via-[#191970]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Info slides up on hover */}
      <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
        <h3 className="text-white font-semibold text-sm leading-snug line-clamp-1">
          {photo.title}
        </h3>
        {photo.location && (
          <p className="text-white/75 text-xs mt-0.5 flex items-center gap-1 line-clamp-1">
            <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {photo.location}
          </p>
        )}
        {photo.tags && photo.tags.length > 0 && (
          <div className="flex gap-1 mt-1.5 flex-wrap">
            {photo.tags.slice(0, 2).map((tag, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-[#ffd700]/20 text-[#ffd700] border border-[#ffd700]/20">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Category badge */}
      {photo.category && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/60 text-white/90 backdrop-blur-sm">
            {photo.category}
          </span>
        </div>
      )}
    </div>
  );
}