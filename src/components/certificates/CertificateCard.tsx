'use client';

import CImage from '@/components/ui/CImage';
import { useState } from 'react';

interface CertificateCardProps {
  title: string;
  issuedBy: string;
  imageUrl: string;
  onClick: () => void;
}

export function CertificateCard({
  title,
  issuedBy,
  imageUrl,
  onClick,
}: CertificateCardProps) {
  const [imageError, setImageError] = useState(false);
  const displayImage = imageUrl && !imageError ? imageUrl : null;

  return (
    <div
      onClick={onClick}
      className="
        relative w-full h-full cursor-pointer overflow-hidden rounded-[16px]
        bg-white/80 dark:bg-gray-900/60 backdrop-blur-md
        shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)]
        border border-gray-200/50 dark:border-gray-700/50
        transition-all duration-700 ease-out
        hover:-translate-y-4 hover:scale-[1.04] hover:shadow-2xl hover:shadow-[#1A3A2A]/15 dark:hover:shadow-[#a67c00]/20
        group
        [transform-style:preserve-3d] [perspective:1200px]
        [-webkit-tap-highlight-color:transparent]
      "
    >
      {/* Premium Inner Ambient Glow */}
      <div className="absolute inset-0 rounded-[16px] border border-white/60 dark:border-white/10 z-20 pointer-events-none" />
      
      {/* Animated Foil Sweep on Hover */}
      <div className="absolute inset-0 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 overflow-hidden rounded-[16px]">
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/50 dark:via-[#ffd700]/15 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
      </div>

      {/* Image Container with Elegant Matting */}
      <div className="relative w-full h-full bg-gray-50/30 dark:bg-gray-950/30 p-[8px]">
        <div className="relative w-full h-full overflow-hidden rounded-[10px] shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_2px_10px_rgba(0,0,0,0.4)]">
          {displayImage ? (
            <CImage
              src={displayImage}
              alt={title}
              fill
              sizes="(max-width: 768px) 288px, 320px"
              className="object-cover transition-transform duration-1000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.12]"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
              <svg className="w-12 h-12 text-gray-400 dark:text-gray-600 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Hover Information Overlay - Refined Glassmorphic Card */}
      <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] p-[8px] z-30">
         <div className="w-full rounded-[10px] overflow-hidden backdrop-blur-xl bg-white/85 dark:bg-gray-950/85 border border-white/60 dark:border-gray-700/50 p-4 shadow-xl transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-75 ease-[cubic-bezier(0.23,1,0.32,1)]">
          <h3 className="font-semibold text-[#1A3A2A] dark:text-[#ffd700] text-sm leading-snug mb-1 line-clamp-2">
            {title}
          </h3>
          <p className="text-[#1A3A2A]/70 dark:text-gray-300 text-[0.7rem] font-medium mb-3 tracking-widest uppercase">
            {issuedBy}
          </p>
          <div className="flex items-center gap-3">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-[#1A3A2A]/30 dark:from-[#ffd700]/30 to-transparent" />
            <p className="text-[#1A3A2A]/60 dark:text-[#ffd700]/70 text-[0.6rem] font-bold tracking-[0.2em]">
              VIEW
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}