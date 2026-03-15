'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

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
  const [zoom, setZoom] = useState(1);
  const [shareSuccess, setShareSuccess] = useState(false);

  useEffect(() => {
    setImageError(false);
    setIsFullView(false);
    setZoom(1);
  }, [certificate?.id]);

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

  // Download — fetch the image and trigger a real download
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
      // Fallback: open in new tab
      window.open(displayImage, '_blank');
    }
  };

  // Share — use Web Share API if available, fallback to copy link
  const handleShare = async () => {
    const shareData = {
      title: certificate.title,
      text: `Check out my certificate: ${certificate.title} — issued by ${certificate.issuedBy}`,
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
      // user cancelled
    }
  };

  // Full view zoom handlers
  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));
  const handleZoomReset = () => setZoom(1);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-sm"
        onClick={() => {
          if (isFullView) setIsFullView(false);
          else onClose();
        }}
      />

      {/* ── FULL VIEW MODE ── */}
      {isFullView && displayImage && (
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
          {/* Close full view */}
          <button
            onClick={() => setIsFullView(false)}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 rounded-full p-2.5 transition-colors"
            aria-label="Exit full view"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Certificate image — fits viewport, zoom scales from fitted size */}
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
    <Image
      src={displayImage}
      alt={certificate.title}
      fill
      className="object-contain"
      unoptimized
      priority
    />
  </div>
</div>

          {/* Zoom controls */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/60 backdrop-blur-md rounded-full px-5 py-2.5 shadow-xl">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              className="p-1.5 rounded-full hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-white"
              aria-label="Zoom out"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
            <span className="text-white text-sm font-semibold min-w-[3rem] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= 3}
              className="p-1.5 rounded-full hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-white"
              aria-label="Zoom in"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="w-px h-5 bg-white/30" />
            <button
              onClick={handleZoomReset}
              className="text-white text-xs font-medium hover:text-yellow-300 transition-colors px-1"
            >
              Reset
            </button>
          </div>

          {/* Nav arrows in full view */}
          {hasPrevious && (
            <button
              onClick={(e) => { e.stopPropagation(); onPrevious(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {hasNext && (
            <button
              onClick={(e) => { e.stopPropagation(); onNext(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* ── NORMAL MODAL VIEW ── */}
      {!isFullView && (
        <>
          <div
            className="relative bg-white dark:bg-gray-900 rounded-2xl w-[95vw] max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col md:flex-row z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-2 hover:bg-red-50 hover:border-red-300 transition-all shadow-md"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Left — Image: fills container, auto-fits regardless of portrait/landscape */}
<div className="w-full md:w-3/5 bg-gray-50 dark:bg-gray-800 flex items-center justify-center p-4 md:p-6 min-h-[300px] md:min-h-0 md:self-stretch">
  {displayImage ? (
    <div className="relative w-full h-full min-h-[300px] md:min-h-[500px]">
      <Image
        src={displayImage}
        alt={certificate.title}
        fill
        className="object-contain"
        onError={() => setImageError(true)}
        priority
        unoptimized
      />
    </div>
  ) : (
                <div className="text-gray-400 text-center">
                  <svg className="w-16 h-16 mx-auto mb-2 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm">Image not available</p>
                </div>
              )}
            </div>

            {/* Right — Info */}
            <div className="w-full md:w-2/5 p-6 md:p-8 flex flex-col gap-4 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 overflow-auto bg-white dark:bg-gray-900">

              {/* Title */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4 pr-8">
                <h2 className="text-2xl md:text-3xl font-bold text-[#191970] dark:text-[#a67c00] mb-2 leading-tight">
                  {certificate.title}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
                  {certificate.issuedBy}
                </p>
              </div>

              {/* Date */}
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Date</p>
                <p className="text-base font-semibold text-gray-700 dark:text-gray-300">{certificate.formattedDate}</p>
              </div>

              {/* Description */}
              <div className="flex-1">
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Description</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {certificate.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-3 gap-2">
                {/* Download */}
                <button
                  onClick={handleDownload}
                  className="flex flex-col items-center justify-center gap-1.5 px-2 py-3 bg-[#191970] hover:bg-[#0f0f45] text-white rounded-lg font-semibold transition-colors text-xs"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Download
                </button>

                {/* Share */}
                <button
                  onClick={handleShare}
                  className={`flex flex-col items-center justify-center gap-1.5 px-2 py-3 rounded-lg font-semibold transition-colors text-xs ${
                    shareSuccess
                      ? 'bg-green-500 text-white'
                      : 'bg-[#ffd700] hover:bg-[#e6c200] text-[#191970]'
                  }`}
                >
                  {shareSuccess ? (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                      </svg>
                      Share
                    </>
                  )}
                </button>

                {/* Full View */}
                <button
                  onClick={() => setIsFullView(true)}
                  disabled={!displayImage}
                  className="flex flex-col items-center justify-center gap-1.5 px-2 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-semibold transition-colors text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  Full View
                </button>
              </div>

              {/* Navigation */}
              <div className="flex gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={onPrevious}
                  disabled={!hasPrevious}
                  className="flex-1 px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-gray-700 dark:text-gray-300 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                <button
                  onClick={onNext}
                  disabled={!hasNext}
                  className="flex-1 px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-gray-700 dark:text-gray-300 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  Next
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <p className="text-center text-xs text-gray-400">
                Use ← → arrow keys to navigate · ESC to close
              </p>
            </div>
          </div>

          {/* Side nav arrows */}
          {hasPrevious && (
            <button
              onClick={onPrevious}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-full p-3 hover:bg-gray-100 shadow-xl transition-colors z-20"
            >
              <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {hasNext && (
            <button
              onClick={onNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-full p-3 hover:bg-gray-100 shadow-xl transition-colors z-20"
            >
              <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </>
      )}
    </div>
  );
}