'use client';

import CImage from '@/components/ui/CImage';
import { useState, useRef } from 'react';
import { ZoomIn, ShieldCheck } from 'lucide-react';

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
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const displayImage = imageUrl && !imageError ? imageUrl : null;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setCoords({ x, y });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCoords({ x: 0, y: 0 });
  };

  const rotateX = coords.y * -10;
  const rotateY = coords.x * 10;
  const shineX = (coords.x + 0.5) * 100;
  const shineY = (coords.y + 0.5) * 100;

  // Issuer initials for fallback badge
  const initials = issuedBy
    ? issuedBy.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : '??';

  return (
    <article
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      aria-label={`${title} — issued by ${issuedBy}`}
      style={{
        transform: isHovered
          ? `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
        transition: isHovered
          ? 'transform 0.05s linear'
          : 'transform 0.7s cubic-bezier(0.25, 0.8, 0.25, 1)',
      }}
      className="
        group relative flex flex-col cursor-pointer select-none rounded-2xl overflow-hidden
        bg-white dark:bg-gray-900
        border border-gray-100 dark:border-gray-800
        shadow-[0_2px_16px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]
        hover:border-[#ffd700]/40 dark:hover:border-[#a67c00]/50
        hover:shadow-[0_8px_40px_rgba(25,25,112,0.10)] dark:hover:shadow-[0_12px_40px_rgba(166,124,0,0.12)]
        transition-[border-color,box-shadow] duration-400
      "
    >
      {/* ── Certificate Document Viewer ─────────────────────── */}
      {/*
        Using object-contain so landscape certificates are NEVER cropped.
        A subtle dot-grid background fills the space around the certificate.
      */}
      <div className="relative w-full bg-gray-50 dark:bg-gray-950 overflow-hidden"
        style={{ paddingBottom: '62%' /* ~landscape 16:10 ratio */ }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(0,0,0,0.04)_1px,_transparent_1px)] dark:bg-[radial-gradient(circle,_rgba(255,255,255,0.03)_1px,_transparent_1px)] bg-[length:16px_16px]" />

        {displayImage ? (
          <>
            <CImage
              src={displayImage}
              alt={title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
              className="object-contain p-3 transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              onError={() => setImageError(true)}
            />

            {/* Gold shimmer sweep on hover */}
            <div className="absolute inset-0 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-600 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 dark:via-[#ffd700]/8 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-900 ease-in-out" />
            </div>
          </>
        ) : (
          /* Fallback: no image — show a styled placeholder */
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-900 dark:to-gray-950">
            <div className="w-16 h-16 rounded-2xl bg-[#191970]/8 dark:bg-[#ffd700]/8 border border-[#191970]/10 dark:border-[#ffd700]/15 flex items-center justify-center">
              <span className="text-xl font-extrabold text-[#191970] dark:text-[#ffd700] tracking-tight">{initials}</span>
            </div>
            <p className="text-[0.65rem] font-bold text-gray-400 dark:text-gray-600 tracking-widest uppercase">No Preview</p>
          </div>
        )}

        {/* Dynamic cursor spotlight */}
        <div
          style={{
            background: isHovered
              ? `radial-gradient(circle 100px at ${shineX}% ${shineY}%, rgba(255,215,0,0.10), transparent)`
              : 'none',
          }}
          className="absolute inset-0 z-20 pointer-events-none"
        />

        {/* Zoom indicator — appears on hover */}
        <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/90 dark:bg-gray-950/90 border border-gray-100 dark:border-gray-800 shadow-md opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400 ease-out pointer-events-none">
          <ZoomIn className="w-3.5 h-3.5 text-[#191970] dark:text-[#ffd700]" />
          <span className="text-[0.6rem] font-extrabold tracking-widest text-[#191970] dark:text-[#ffd700] uppercase">View</span>
        </div>
      </div>

      {/* ── Persistent Info Footer ──────────────────────────── */}
      {/*
        Always visible — no more invisible-until-hover info.
        Subtle divider line separates doc from footer.
      */}
      <div className="flex items-center gap-3 px-4 py-3.5 border-t border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900">

        {/* Issuer initials badge */}
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-[#191970]/8 to-[#191970]/4 dark:from-[#ffd700]/10 dark:to-[#ffd700]/5 border border-[#191970]/8 dark:border-[#ffd700]/15 flex items-center justify-center">
          <span className="text-[0.6rem] font-extrabold text-[#191970] dark:text-[#ffd700] tracking-tight">{initials}</span>
        </div>

        {/* Title + issuer text */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-bold text-gray-900 dark:text-white leading-snug group-hover:text-[#191970] dark:group-hover:text-[#ffd700] transition-colors duration-300">
            {title}
          </h3>
          <p className="text-[0.6rem] font-semibold text-gray-400 dark:text-gray-500 tracking-wide uppercase truncate mt-0.5">
            {issuedBy}
          </p>
        </div>

        {/* Verified shield — always visible */}
        <ShieldCheck className="flex-shrink-0 w-4 h-4 text-[#ffd700]/60 dark:text-[#a67c00]/70 group-hover:text-[#ffd700] dark:group-hover:text-[#d4af37] transition-colors duration-300" />
      </div>
    </article>
  );
}