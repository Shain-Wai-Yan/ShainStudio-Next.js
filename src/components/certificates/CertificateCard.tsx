'use client';

import Image from 'next/image';
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
        relative w-full h-full cursor-pointer overflow-hidden
        bg-white dark:bg-gray-900
        shadow-md
        border-2 border-transparent
        transition-all duration-500
        hover:-translate-y-3 hover:scale-[1.02] hover:[rotateX(5deg)] hover:shadow-2xl
        hover:[border-image:linear-gradient(135deg,#ffd700,#191970,#ffd700)_1]
        group
        [transform-style:preserve-3d] [perspective:1000px]
        [-webkit-tap-highlight-color:transparent]
      "
      style={{ borderRadius: '0.375rem' }}
    >
      {/* Gold gradient border on hover via pseudo — done with a wrapper div */}
      <div className="absolute -inset-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 rounded-[6px]"
        style={{ background: 'linear-gradient(135deg, #ffd700 0%, #191970 50%, #ffd700 100%)' }}
      />

      {/* Image */}
      <div className="relative w-full h-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
        {displayImage ? (
          <Image
            src={displayImage}
            alt={title}
            fill
            sizes="(max-width: 768px) 288px, 320px"
            className="object-cover transition-all duration-500 group-hover:scale-[1.08] group-hover:brightness-[1.05] group-hover:saturate-[1.2]"
            onError={() => setImageError(true)}
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700">
            <svg className="w-12 h-12 text-gray-500 opacity-50" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      {/* Hover overlay — gradient fades to transparent at top, certificate stays visible */}
      <div
        className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out backdrop-blur-[10px] p-3 md:p-4"
        style={{
          background: 'linear-gradient(to top, rgba(25,25,112,0.95) 0%, rgba(25,25,112,0.80) 50%, transparent 100%)',
        }}
      >
        {/* Dark mode overlay */}
        <div
          className="absolute inset-0 opacity-0 dark:opacity-100 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, rgba(166,124,0,0.95) 0%, rgba(166,124,0,0.80) 50%, transparent 100%)',
          }}
        />

        <div className="relative z-10">
          {/* Title — gold/accent color, wraps fully */}
          <h3 className="font-semibold text-[#ffe347] dark:text-white text-sm leading-snug mb-1">
            {title}
          </h3>

          {/* Issuer — white, slightly muted */}
          <p className="text-white/90 text-xs font-normal mb-1.5">
            {issuedBy}
          </p>

          {/* Click hint — gold italic */}
          <p className="text-[#ffd700] dark:text-[#191970] text-[0.7rem] italic opacity-90">
            Click to view details
          </p>
        </div>
      </div>
    </div>
  );
}