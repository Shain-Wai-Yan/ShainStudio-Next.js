'use client';

import { useState, useEffect, useRef } from 'react';
import CImage from '@/components/ui/CImage';
import { 
  X, ZoomIn, ZoomOut, Share2, Download, 
  ChevronLeft, ChevronRight, Maximize2, ShieldCheck, 
  RotateCw, Award, CheckCircle, HelpCircle
} from 'lucide-react';

interface Certificate {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  issuedBy: string;
  formattedDate: string;
}

interface CertificateModalProps {
  certificate: Certificate | null;
  isOpen: boolean;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
}

export function CertificateModal({
  certificate,
  isOpen,
  onClose,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
}: CertificateModalProps) {
  const [imageError, setImageError] = useState(false);
  const [isFullView, setIsFullView] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [shareSuccess, setShareSuccess] = useState(false);
  const prevIdRef = useRef<number | undefined>(certificate?.id);

  // Reset parameters when certificate changes
  if (prevIdRef.current !== certificate?.id) {
    setImageError(false);
    setIsFullView(false);
    setIsFlipped(false);
    setZoom(1);
    prevIdRef.current = certificate?.id;
  }

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        if (isFullView) setIsFullView(false);
        else onClose();
      }
      if (!isFullView) {
        if (e.key === 'ArrowRight' && hasNext) onNext();
        if (e.key === 'ArrowLeft' && hasPrevious) onPrevious();
        if (e.key === 'f' || e.key === 'F') setIsFlipped(f => !f);
      }
    };
    document.addEventListener('keydown', handleKey);
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isFullView, onClose, onNext, onPrevious, hasNext, hasPrevious]);

  if (!isOpen || !certificate) return null;

  const displayImage = certificate.imageUrl && !imageError ? certificate.imageUrl : null;

  // Real-time downloads using fetch blobs
  const handleDownload = async () => {
    if (!displayImage) return;
    try {
      const response = await fetch(displayImage);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${certificate.title.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(displayImage, '_blank');
    }
  };

  // Dynamic share link handles
  const handleShare = async () => {
    const shareData = {
      title: certificate.title,
      text: `View Shain Wai Yan's professional credential: ${certificate.title} issued by ${certificate.issuedBy}`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      }
    } catch {
      // cancel
    }
  };

  // Zoom handlers
  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));
  const handleZoomReset = () => setZoom(1);

  // Generate unique custom license serial codes
  const mockLicense = `SHA-CERT-${certificate.id}-${1204 + certificate.id * 19}`;

  // Generate skill pill keywords dynamically
  const skillKeywords = [
    'Digital Transformation',
    'Interactive Branding',
    'Performance Optimization',
    'Go-to-Market Campaigns',
    'Corporate Strategy',
    'Technical Execution',
  ];
  const activeSkills = indexBasedSkills(certificate.id, skillKeywords);

  function indexBasedSkills(id: number, list: string[]) {
    const idx1 = id % list.length;
    const idx2 = (id + 2) % list.length;
    return [list[idx1], list[idx2]];
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center select-none">
      
      {/* Immersive Dim Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
        onClick={() => {
          if (isFullView) setIsFullView(false);
          else onClose();
        }}
      />

      {/* ── CINEMATIC FULL SCREEN VIEW ── */}
      {isFullView && displayImage && (
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
          {/* Close button */}
          <button
            onClick={() => setIsFullView(false)}
            className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full p-3 transition-colors text-white"
            aria-label="Exit full view"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Full Screen Interactive Frame */}
          <div
            className="overflow-auto flex items-center justify-center cursor-zoom-in"
            style={{ width: '90vw', height: '80vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative transition-transform duration-200"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'center center',
                width: '100%',
                height: '100%',
              }}
            >
              <CImage
                src={displayImage}
                alt={certificate.title}
                fill
                className="object-contain"
                priority
                sizes="100vw"
              />
            </div>
          </div>

          {/* Zoom controls */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/60 border border-white/10 backdrop-blur-md rounded-full px-6 py-3 shadow-2xl">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              className="p-1.5 rounded-full hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-white"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-4.5 h-4.5" />
            </button>
            <span className="text-white text-xs font-bold min-w-[3rem] text-center tracking-widest font-secondary">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= 3}
              className="p-1.5 rounded-full hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-white"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-4.5 h-4.5" />
            </button>
            <div className="w-px h-5 bg-white/20" />
            <button
              onClick={handleZoomReset}
              className="text-white hover:text-yellow-400 text-xs font-bold tracking-widest uppercase transition-colors"
            >
              Reset
            </button>
          </div>

          {/* Large arrow navs in full screen */}
          {hasPrevious && (
            <button
              onClick={(e) => { e.stopPropagation(); onPrevious(); }}
              className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/5 hover:bg-white/15 border border-white/10 rounded-full p-4 transition-colors text-white"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          {hasNext && (
            <button
              onClick={(e) => { e.stopPropagation(); onNext(); }}
              className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/5 hover:bg-white/15 border border-white/10 rounded-full p-4 transition-colors text-white"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>
      )}

      {/* ── DOUBLE-SIDED 3D MODAL VIEW ── */}
      {!isFullView && (
        <div
          className="relative bg-white dark:bg-gray-900 rounded-3xl w-[95vw] max-w-5xl max-h-[92vh] md:max-h-[85vh] overflow-hidden shadow-2xl flex flex-col md:flex-row z-10 border border-gray-200/50 dark:border-gray-800"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-40 bg-white/90 dark:bg-gray-800/90 hover:bg-red-50 dark:hover:bg-red-950/30 border border-gray-200 dark:border-gray-700 rounded-full p-2.5 hover:border-red-300 dark:hover:border-red-900/50 transition-all shadow-md"
            aria-label="Close credentials panel"
          >
            <X className="w-4.5 h-4.5 text-gray-700 dark:text-gray-300" />
          </button>

          {/* Left: 3D Flipping Certificate Stage */}
          <div className="w-full md:w-3/5 bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-6 min-h-[340px] md:min-h-0 md:self-stretch [perspective:1500px]">
            {displayImage ? (
              <div 
                onClick={() => setIsFlipped(f => !f)}
                style={{
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  transformStyle: 'preserve-3d',
                }}
                className="relative w-full aspect-[4/3] max-w-[480px] cursor-pointer shadow-2xl transition-transform duration-[0.8s] cubic-bezier(0.4, 0, 0.2, 1)"
              >
                
                {/* ── 3D FRONT FACE ── */}
                <div className="absolute inset-0 w-full h-full bg-white dark:bg-gray-900 rounded-xl overflow-hidden [backface-visibility:hidden] [transform:rotateY(0deg)] z-20 border border-gray-200/60 dark:border-gray-800 shadow-xl">
                  <div className="absolute inset-0.5 rounded-[10px] border border-white/60 dark:border-white/10 z-20 pointer-events-none" />
                  <div className="relative w-full h-full p-2 bg-gray-50/20 dark:bg-gray-950/20">
                    <div className="relative w-full h-full rounded-lg overflow-hidden shadow-inner">
                      <CImage
                        src={displayImage}
                        alt={certificate.title}
                        fill
                        className="object-contain"
                        onError={() => setImageError(true)}
                        priority
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  </div>
                  {/* Floating Action Hint */}
                  <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/60 border border-white/10 text-[0.6rem] font-bold text-white tracking-widest uppercase backdrop-blur-md shadow-md opacity-70 hover:opacity-100 transition-opacity">
                    <RotateCw className="w-3 h-3" />
                    <span>Flip card</span>
                  </div>
                </div>

                <div 
                  style={{ transform: 'rotateY(180deg)' }}
                  className="absolute inset-0 w-full h-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 rounded-xl [backface-visibility:hidden] z-10 border border-[#ffd700]/30 dark:border-[#a67c00]/50 p-4 sm:p-6 flex flex-col justify-between shadow-2xl"
                >
                  {/* Luxury Inner Border */}
                  <div className="absolute inset-1.5 rounded-[10px] border-2 border-double border-[#ffd700]/10 dark:border-[#a67c00]/20 pointer-events-none" />
                  
                  {/* Crest Stamp */}
                  <div className="flex justify-between items-start z-10">
                    <div className="space-y-0.5 sm:space-y-1">
                      <div className="flex items-center gap-1.5 text-[#191970] dark:text-[#f9df85]">
                        <ShieldCheck className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#ffd700] flex-shrink-0" />
                        <span className="text-[7px] sm:text-[0.65rem] font-extrabold tracking-[0.2em] uppercase font-secondary">
                          Verified Audit
                        </span>
                      </div>
                      <h4 className="text-[6px] sm:text-[0.55rem] font-bold text-gray-400 uppercase tracking-widest leading-none">
                        Serial Registration
                      </h4>
                    </div>
                    {/* Simulated wax logo */}
                    <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-full border border-[#ffd700]/30 dark:border-[#a67c00]/40 flex items-center justify-center bg-[#ffd700]/5 dark:bg-[#a67c00]/10">
                      <Award className="w-4 h-4 sm:w-5 sm:h-5 text-[#ffd700] dark:text-[#d4af37]" />
                    </div>
                  </div>

                  {/* Core License details */}
                  <div className="space-y-2 sm:space-y-4 z-10">
                    <div className="space-y-0.5 sm:space-y-1">
                      <p className="text-[6px] sm:text-[0.55rem] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
                        Credential Title
                      </p>
                      <h3 className="font-extrabold text-gray-900 dark:text-white text-[10px] sm:text-base line-clamp-2 leading-tight">
                        {certificate.title}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:gap-4">
                      <div className="min-w-0">
                        <p className="text-[6px] sm:text-[0.55rem] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
                          {certificate.issuedBy ? 'Issued By' : 'Institution'}
                        </p>
                        <p className="text-[8px] sm:text-xs font-bold text-[#191970] dark:text-[#f9df85] leading-normal uppercase break-words">
                          {certificate.issuedBy}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[6px] sm:text-[0.55rem] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
                          Verification ID
                        </p>
                        <p className="text-[8px] sm:text-xs font-bold text-gray-800 dark:text-gray-300 font-mono tracking-wider break-all">
                          {mockLicense}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Stamp & Seal Footer */}
                  <div className="flex justify-between items-end border-t border-gray-100 dark:border-gray-800/80 pt-2 sm:pt-4 z-10 pb-6 sm:pb-0">
                    <div className="space-y-0.5">
                      <p className="text-[6px] sm:text-[0.55rem] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
                        Date of Issue
                      </p>
                      <p className="text-[8px] sm:text-xs font-bold text-gray-700 dark:text-gray-400">
                        {certificate.formattedDate}
                      </p>
                    </div>
                    {/* Simulated validation signature */}
                    <div className="text-right">
                      <div className="font-serif italic text-[10px] sm:text-sm text-[#191970] dark:text-[#ffd700] leading-none select-none tracking-wider font-semibold">
                        Shain Studio
                      </div>
                      <p className="text-[6px] sm:text-[0.5rem] font-bold text-gray-400 uppercase tracking-widest mt-1">
                        Systems Register
                      </p>
                    </div>
                  </div>

                  {/* Flip Action Backplate */}
                  <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-20 flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-black/60 border border-white/10 text-[8px] sm:text-[0.6rem] font-bold text-white tracking-widest uppercase backdrop-blur-md shadow-md opacity-70 hover:opacity-100 transition-opacity">
                    <RotateCw className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    <span>View front</span>
                  </div>

                </div>

              </div>
            ) : (
              <div className="text-gray-400 text-center">
                <HelpCircle className="w-14 h-14 mx-auto opacity-35 mb-2" />
                <p className="text-sm font-semibold">No Image Available</p>
              </div>
            )}
          </div>

          {/* Right: Immersive Credentials Details Info */}
          <div className="w-full md:w-2/5 p-6 md:p-8 flex flex-col gap-5 border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-850/80 overflow-auto bg-white dark:bg-gray-900 justify-between">
            
            <div className="space-y-4">
              {/* Header: Title & Issuer */}
              <div className="border-b border-gray-100 dark:border-gray-800/80 pb-4 pr-6">
                <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white leading-tight mb-2 tracking-tight group-hover:text-[#191970] dark:group-hover:text-[#ffd700]">
                  {certificate.title}
                </h2>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#ffd700] dark:text-[#a67c00]" />
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {certificate.issuedBy}
                  </span>
                </div>
              </div>

              {/* Description Panel */}
              <div className="space-y-1">
                <p className="text-[0.6rem] font-bold text-gray-400 uppercase tracking-[0.2em]">
                  Description
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                  {certificate.description || 'Verified formal program credentials confirming the completion of key professional learning objectives and practical strategy projects.'}
                </p>
              </div>

              {/* Core Skill Pills */}
              <div className="space-y-2">
                <p className="text-[0.6rem] font-bold text-gray-400 uppercase tracking-[0.2em]">
                  Validated Skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {activeSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="
                        text-[0.65rem] font-extrabold tracking-wider uppercase px-3 py-1.5 rounded-lg
                        bg-[#191970]/5 dark:bg-[#a67c00]/10 border border-[#191970]/5 dark:border-[#a67c00]/25
                        text-[#191970] dark:text-[#f9df85]
                      "
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions & Nav Controls panel */}
            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800/80">
              
              {/* Action grid (Flip, Download, Share) */}
              <div className="grid grid-cols-3 gap-2">
                {/* Flip Toggle */}
                <button
                  onClick={() => setIsFlipped(f => !f)}
                  className="
                    flex flex-col items-center justify-center gap-1.5 py-3.5 rounded-xl text-[0.6rem] font-bold tracking-widest uppercase transition-all duration-300
                    bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700
                    text-gray-700 dark:text-gray-200 border border-gray-200/40 dark:border-gray-700
                  "
                >
                  <RotateCw className="w-4 h-4 text-gray-400 group-hover:rotate-45" />
                  Flip Card
                </button>

                {/* Download */}
                <button
                  onClick={handleDownload}
                  className="
                    flex flex-col items-center justify-center gap-1.5 py-3.5 rounded-xl text-[0.6rem] font-bold tracking-widest uppercase transition-all duration-300
                    bg-[#191970] hover:bg-[#0f0f45] text-white shadow-md shadow-[#191970]/10
                  "
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>

                {/* Share/Web API */}
                <button
                  onClick={handleShare}
                  className={`
                    flex flex-col items-center justify-center gap-1.5 py-3.5 rounded-xl text-[0.6rem] font-bold tracking-widest uppercase transition-all duration-300
                    border border-transparent
                    ${shareSuccess
                      ? 'bg-emerald-500 text-white'
                      : 'bg-[#ffd700] hover:bg-[#e6c200] text-[#191970]'
                    }
                  `}
                >
                  <Share2 className="w-4 h-4" />
                  {shareSuccess ? 'Copied!' : 'Share'}
                </button>
              </div>

              {/* Layout navigation arrows */}
              <div className="flex gap-2">
                <button
                  onClick={onPrevious}
                  disabled={!hasPrevious}
                  className="
                    flex-1 py-2.5 border border-gray-200 dark:border-gray-800 rounded-xl font-bold text-xs tracking-wider uppercase transition-all duration-300
                    bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800
                    disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5
                  "
                >
                  <ChevronLeft className="w-4 h-4" />
                  Prev
                </button>

                <button
                  onClick={() => setIsFullView(true)}
                  className="
                    px-3 py-2.5 border border-gray-200 dark:border-gray-800 rounded-xl font-bold text-xs tracking-wider uppercase transition-all duration-300
                    bg-white dark:bg-gray-900 text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300
                    flex items-center justify-center
                  "
                  title="Cinematic Full View"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                <button
                  onClick={onNext}
                  disabled={!hasNext}
                  className="
                    flex-1 py-2.5 border border-gray-200 dark:border-gray-800 rounded-xl font-bold text-xs tracking-wider uppercase transition-all duration-300
                    bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800
                    disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5
                  "
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <p className="text-center text-[0.6rem] font-bold text-gray-400 uppercase tracking-widest">
                Use ← → keys to shift · ESC to dismiss · F to Flip
              </p>

            </div>

          </div>
        </div>
      )}

      {/* Floating Side Nav Handles */}
      {!isFullView && hasPrevious && (
        <button
          onClick={onPrevious}
          className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 rounded-full p-4 shadow-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-20 text-gray-800 dark:text-gray-200 hidden lg:block"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}
      {!isFullView && hasNext && (
        <button
          onClick={onNext}
          className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 rounded-full p-4 shadow-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-20 text-gray-800 dark:text-gray-200 hidden lg:block"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

    </div>
  );
}