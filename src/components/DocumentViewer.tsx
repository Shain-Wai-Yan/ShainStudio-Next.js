'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { getFilenameFromUrl, transformCloudinaryPdfUrl } from '@/lib/pdf-utils';

interface PdfComponentsType {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Document: React.ComponentType<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Page: React.ComponentType<any>;
}

interface DocumentViewerProps {
  isOpen: boolean;
  documentUrl: string;
  title: string;
  onClose: () => void;
}

export function DocumentViewer({
  isOpen,
  documentUrl,
  title,
  onClose,
}: DocumentViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [PdfComponents, setPdfComponents] = useState<PdfComponentsType | null>(null);
  const [pageWidth, setPageWidth] = useState(800);
  const [zoom, setZoom] = useState(1);
  const [isPortrait, setIsPortrait] = useState(true);
  const [dualPage, setDualPage] = useState(false);
  const [fitMode, setFitMode] = useState<'width' | 'height'>('width');
  const [inputPage, setInputPage] = useState('');
  const [showPageInput, setShowPageInput] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [pageRendering, setPageRendering] = useState(false);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const pageInputRef = useRef<HTMLInputElement>(null);

  const pdfUrl = documentUrl ? transformCloudinaryPdfUrl(documentUrl) : '';

  // Load react-pdf
  useEffect(() => {
    import('react-pdf').then((mod) => {
      mod.pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${mod.pdfjs.version}/build/pdf.worker.min.mjs`;
      setPdfComponents({ Document: mod.Document, Page: mod.Page });
    });
  }, []);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Fullscreen support
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && viewerRef.current) {
      viewerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // Calculate page width
  const recalcWidth = useCallback(() => {
    if (!containerRef.current) return;
    const sidebarW = showThumbnails ? 160 : 0;
    const containerW = containerRef.current.clientWidth - sidebarW - 32;
    const containerH = containerRef.current.clientHeight - 32;

    if (fitMode === 'width') {
      const cols = dualPage ? 2 : 1;
      const gap = dualPage ? 8 : 0;
      setPageWidth(Math.floor((containerW - gap) / cols) * zoom);
    } else {
      const ratio = isPortrait ? 1.414 : 0.707;
      setPageWidth(Math.floor(containerH / ratio) * zoom);
    }
  }, [dualPage, zoom, fitMode, isPortrait, showThumbnails]);

  useEffect(() => {
    if (!isOpen) return;
    recalcWidth();
    const observer = new ResizeObserver(recalcWidth);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isOpen, recalcWidth, PdfComponents]);

  // Auto dual page on wide screens
  useEffect(() => {
    if (!isOpen) return;
    const check = () => {
      if (isPortrait && window.innerWidth >= 1200) {
        setDualPage(true);
      } else {
        setDualPage(false);
      }
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [isOpen, isPortrait]);

  // Reset on new document
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
      setTotalPages(0);
      setIsLoading(true);
      setError(null);
      setZoom(1);
      setRotation(0);
      setShowThumbnails(false);
    }
  }, [isOpen, documentUrl]);

  // Reset rotation on page change
  useEffect(() => {
    setRotation(0);
  }, [currentPage]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (showPageInput) return;
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          setCurrentPage(p => Math.min(totalPages, p + (dualPage ? 2 : 1)));
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          setCurrentPage(p => Math.max(1, p - (dualPage ? 2 : 1)));
          break;
        case 'Escape':
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            onClose();
          }
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 't':
        case 'T':
          setShowThumbnails(s => !s);
          break;
        case 'r':
        case 'R':
          setRotation(r => (r + 90) % 360);
          break;
        case '+':
        case '=':
          setZoom(z => Math.min(3, parseFloat((z + 0.25).toFixed(2))));
          break;
        case '-':
          setZoom(z => Math.max(0.25, parseFloat((z - 0.25).toFixed(2))));
          break;
        case '0':
          setZoom(1);
          break;
        case 'Home':
          e.preventDefault();
          setCurrentPage(1);
          break;
        case 'End':
          e.preventDefault();
          setCurrentPage(totalPages);
          break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, totalPages, dualPage, onClose, showPageInput]);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setTotalPages(numPages);
    setCurrentPage(1);
    setIsLoading(false);
    setError(null);
  }, []);

  const onDocumentLoadError = useCallback((err: Error) => {
    console.error('[DocumentViewer] PDF load error:', err);
    setError('Failed to load PDF. You can download it instead.');
    setIsLoading(false);
  }, []);

  const onPageLoadSuccess = useCallback((page: { height: number; width: number }) => {
    const portrait = page.height > page.width;
    setIsPortrait(portrait);
    setPageRendering(false);
  }, []);

  const onPageRenderSuccess = useCallback(() => {
    setPageRendering(false);
  }, []);

  const handleDownload = () => {
    if (!pdfUrl) return;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = getFilenameFromUrl(documentUrl);
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePageInputSubmit = () => {
    const num = parseInt(inputPage);
    if (!isNaN(num) && num >= 1 && num <= totalPages) {
      setCurrentPage(num);
    }
    setShowPageInput(false);
    setInputPage('');
  };

  const goNext = () => {
    setPageRendering(true);
    setCurrentPage(p => Math.min(totalPages, p + (dualPage ? 2 : 1)));
  };

  const goPrev = () => {
    setPageRendering(true);
    setCurrentPage(p => Math.max(1, p - (dualPage ? 2 : 1)));
  };

  const goToPage = (page: number) => {
    setPageRendering(true);
    setCurrentPage(page);
  };

  const secondPage = dualPage && currentPage + 1 <= totalPages ? currentPage + 1 : null;
  const progress = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;

  if (!isOpen) return null;


  return (
    <div ref={viewerRef} className="fixed inset-0 z-[9999] flex flex-col bg-[#1a1a2e] dark:bg-[#0f0f0f]">

      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#191970] dark:bg-[#0a0a1a] flex-shrink-0 gap-2 border-b border-[#a67c00]/30">

        {/* Left: thumbnail toggle + title */}
        <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
          <button
            onClick={() => setShowThumbnails(s => !s)}
            className={`p-1.5 rounded-lg transition-colors text-xs font-bold flex-shrink-0 ${
              showThumbnails
                ? 'bg-[#d4af37] dark:bg-[#d4af37] text-[#191970] dark:text-[#191970]'
                : 'bg-[#0f0f4d] dark:bg-[#2a2a3a] text-white dark:text-gray-200 hover:bg-[#191970] dark:hover:bg-[#3a3a4a]'
            }`}
            title="Toggle thumbnails (T)"
          >
            ☰
          </button>
          <h2 className="text-xs font-bold text-white dark:text-gray-200 truncate max-w-[180px] hidden md:block">
            {title}
          </h2>
        </div>

        {/* Center: controls */}
        <div className="flex items-center gap-1 flex-1 justify-center flex-wrap">

          {/* Zoom */}
          <div className="flex items-center gap-0.5 bg-[#0f0f4d] dark:bg-[#2a2a3a] rounded-lg px-2 py-1">
            <button
              onClick={() => setZoom(z => Math.max(0.25, parseFloat((z - 0.25).toFixed(2))))}
              className="text-white dark:text-gray-300 hover:text-[#d4af37] dark:hover:text-[#d4af37] font-bold w-5 h-5 flex items-center justify-center text-base"
              title="Zoom out (−)"
            >−</button>
            <button
              onClick={() => setZoom(1)}
              className="text-[#d4af37] dark:text-[#d4af37] text-xs font-bold w-10 text-center hover:text-white dark:hover:text-white transition-colors"
              title="Reset zoom (0)"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={() => setZoom(z => Math.min(3, parseFloat((z + 0.25).toFixed(2))))}
              className="text-white dark:text-gray-300 hover:text-[#d4af37] dark:hover:text-[#d4af37] font-bold w-5 h-5 flex items-center justify-center text-base"
              title="Zoom in (+)"
            >+</button>
          </div>

          {/* Zoom presets — desktop only */}
          <div className="hidden lg:flex items-center gap-0.5 bg-[#0f0f4d] dark:bg-[#2a2a3a] rounded-lg px-1 py-1">
            {[0.5, 0.75, 1, 1.5, 2].map(z => (
              <button
                key={z}
                onClick={() => setZoom(z)}
                className={`text-xs px-1.5 py-0.5 rounded transition-colors ${
                  zoom === z
                    ? 'bg-[#d4af37] dark:bg-[#d4af37] text-[#191970] dark:text-[#191970] font-bold'
                    : 'text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-200'
                }`}
              >
                {z * 100}%
              </button>
            ))}
          </div>

          {/* Fit toggle */}
          <button
            onClick={() => setFitMode(f => f === 'width' ? 'height' : 'width')}
            className="bg-[#0f0f4d] dark:bg-[#2a2a3a] hover:bg-[#191970] dark:hover:bg-[#3a3a4a] text-white dark:text-gray-200 text-xs font-semibold px-2 py-1.5 rounded-lg border border-white/20 dark:border-white/10 transition-colors"
            title="Toggle fit width / fit height"
          >
            {fitMode === 'width' ? '↔ W' : '↕ H'}
          </button>

          {/* Dual page — portrait only */}
          {isPortrait && (
            <button
              onClick={() => setDualPage(d => !d)}
              className={`text-xs font-semibold px-2 py-1.5 rounded-lg border transition-colors ${
                dualPage
                  ? 'bg-[#d4af37] dark:bg-[#d4af37] text-[#191970] dark:text-[#191970] border-[#d4af37] dark:border-[#d4af37]'
                  : 'bg-[#0f0f4d] dark:bg-[#2a2a3a] text-white dark:text-gray-200 border-white/20 dark:border-white/10 hover:bg-[#191970] dark:hover:bg-[#3a3a4a]'
              }`}
              title="Toggle dual page"
            >
              {dualPage ? '▣▣' : '▢'}
            </button>
          )}

          {/* ── Rotate button — mobile only ── */}
          <button
            onClick={() => setRotation(r => (r + 90) % 360)}
            className="flex sm:hidden items-center gap-1 text-xs font-semibold px-2 py-1.5 rounded-lg border transition-colors bg-[#0f0f4d] dark:bg-[#2a2a3a] text-white dark:text-gray-300 border-white/20 dark:border-white/10 hover:bg-[#191970] dark:hover:bg-[#3a3a4a]"
            title="Rotate page (R)"
          >
            ↻ {rotation > 0 ? `${rotation}°` : 'Rotate'}
          </button>

        </div>

        {/* Right: fullscreen + download + close */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={toggleFullscreen}
            className="text-white dark:text-gray-300 hover:text-[#d4af37] dark:hover:text-[#d4af37] p-1.5 rounded-lg bg-[#0f0f4d] dark:bg-[#2a2a3a] hover:bg-[#191970] dark:hover:bg-[#3a3a4a] transition-colors text-xs hidden sm:flex items-center gap-1"
            title="Fullscreen (F)"
          >
            ⛶ <span className="hidden md:inline">{isFullscreen ? 'Exit' : 'Full'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="px-2 py-1.5 bg-[#d4af37] dark:bg-[#a67c00] text-[#191970] dark:text-[#0f0f45] rounded-lg font-bold hover:bg-[#e8d9a8] dark:hover:bg-[#c9a236] transition-colors text-xs hidden sm:flex items-center gap-1"
          >
            ↓ <span className="hidden md:inline">Download</span>
          </button>
          <button
            onClick={onClose}
            className="text-white dark:text-gray-300 hover:text-red-400 dark:hover:text-red-400 text-lg font-bold w-7 h-7 flex items-center justify-center transition-colors rounded-lg hover:bg-red-900/30 dark:hover:bg-red-900/50"
            title="Close (Esc)"
          >
            ✕
          </button>
        </div>
      </div>

      {/* ── Progress Bar ── */}
      {totalPages > 0 && (
        <div className="h-0.5 bg-[#0f0f4d] dark:bg-[#2a2a3a] flex-shrink-0">
          <div
            className="h-full bg-[#d4af37] dark:bg-[#a67c00] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* ── Main Content: Sidebar + PDF ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Thumbnail Sidebar */}
        {showThumbnails && PdfComponents && totalPages > 0 && (
          <div className="w-36 flex-shrink-0 bg-[#111130] dark:bg-[#1a1a2a] overflow-y-auto flex flex-col gap-2 py-2 px-1 border-r border-white/10 dark:border-white/5">
            <PdfComponents.Document file={pdfUrl} loading="">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`relative w-full rounded overflow-hidden border-2 transition-all flex-shrink-0 mb-1 ${
                    pageNum === currentPage || pageNum === secondPage
                      ? 'border-[#d4af37] dark:border-[#a67c00] shadow-lg shadow-[#d4af37]/20 dark:shadow-[#a67c00]/20'
                      : 'border-transparent hover:border-white/40 dark:hover:border-white/20'
                  }`}
                  title={`Page ${pageNum}`}
                >
                  <PdfComponents.Page
                    pageNumber={pageNum}
                    width={112}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-0.5">
                    {pageNum}
                  </div>
                </button>
              ))}
            </PdfComponents.Document>
          </div>
        )}

        {/* PDF Viewer Area */}
        <div
          ref={containerRef}
          className="flex-1 overflow-auto bg-gray-700 dark:bg-[#2a2a2a] flex flex-col items-center justify-start py-4 px-2 min-h-0 min-w-0"
        >
          {/* Error */}
          {error && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <div className="text-5xl">📄</div>
              <p className="text-red-400 font-semibold text-lg">{error}</p>
              <button
                onClick={handleDownload}
                className="px-6 py-2 bg-[#d4af37] dark:bg-[#a67c00] text-[#191970] dark:text-[#0f0f45] rounded-lg font-bold hover:bg-[#e8d9a8] dark:hover:bg-[#c9a236] transition-colors"
              >
                ↓ Download PDF Instead
              </button>
            </div>
          )}

          {/* Initializing */}
          {!error && !PdfComponents && (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400" />
              <p className="text-gray-300 text-sm">Initializing viewer...</p>
            </div>
          )}

          {/* Loading */}
          {!error && PdfComponents && isLoading && (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400" />
              <p className="text-gray-300 text-sm">Loading document...</p>
            </div>
          )}

          {/* PDF Pages */}
          {!error && PdfComponents && (
            <PdfComponents.Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading=""
            >
              <div className={`flex gap-3 items-start justify-center transition-opacity duration-150 ${
                pageRendering ? 'opacity-60' : 'opacity-100'
              }`}>
                {/* Page 1 */}
                <div className="shadow-2xl bg-white">
                  <PdfComponents.Page
                    pageNumber={currentPage}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    width={pageWidth}
                    rotate={rotation}
                    onLoadSuccess={currentPage === 1 ? onPageLoadSuccess : undefined}
                    onRenderSuccess={onPageRenderSuccess}
                  />
                </div>

                {/* Page 2 — dual mode only */}
                {dualPage && secondPage && (
                  <div className="shadow-2xl bg-white">
                    <PdfComponents.Page
                      pageNumber={secondPage}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      width={pageWidth}
                      rotate={rotation}
                      onRenderSuccess={onPageRenderSuccess}
                    />
                  </div>
                )}
              </div>
            </PdfComponents.Document>
          )}
        </div>
      </div>

      {/* ── Bottom Nav Bar ── */}
<div className="flex items-center justify-between gap-2 px-3 py-2 bg-[#191970] dark:bg-[#0a0a1a] border-t border-[#a67c00]/30 flex-shrink-0">

  {/* Prev */}
  <button
    onClick={goPrev}
    disabled={currentPage <= 1}
    className="px-3 py-1.5 bg-white dark:bg-[#2a2a3a] text-[#191970] dark:text-gray-200 rounded-lg font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-[#3a3a4a] transition-colors text-sm flex-shrink-0"
  >
    ← Prev
  </button>

  {/* Page indicator */}
  <div className="flex items-center gap-2">
    {showPageInput ? (
      <div className="flex items-center gap-1">
        <input
          ref={pageInputRef}
          type="number"
          min={1}
          max={totalPages}
          value={inputPage}
          onChange={e => setInputPage(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') handlePageInputSubmit();
            if (e.key === 'Escape') { setShowPageInput(false); setInputPage(''); }
          }}
          onBlur={handlePageInputSubmit}
          autoFocus
          className="w-14 text-center text-sm font-bold rounded px-2 py-1 text-[#191970] dark:text-[#191970] border-2 border-yellow-400 outline-none"
          placeholder={String(currentPage)}
        />
        <span className="text-white dark:text-gray-300 text-sm">/ {totalPages}</span>
      </div>
    ) : (
      <div className="flex flex-col items-center gap-0.5">
        <button
          onClick={() => { setShowPageInput(true); setInputPage(String(currentPage)); }}
          className="text-white dark:text-gray-300 text-sm font-semibold hover:text-yellow-400 dark:hover:text-[#d4af37] transition-colors whitespace-nowrap"
          title="Click to jump to page"
        >
          {dualPage && secondPage
            ? `${currentPage}–${secondPage} / ${totalPages}`
            : `${currentPage} / ${totalPages || '—'}`
          }
        </button>
        {totalPages > 0 && (
          <div className="w-24 h-0.5 bg-white/20 dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-400 dark:bg-[#d4af37] rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    )}
  </div>

  {/* Right: mobile download + next */}
  <div className="flex items-center gap-1.5 flex-shrink-0">
    <button
      onClick={handleDownload}
      className="px-2 py-1.5 bg-yellow-400 dark:bg-[#a67c00] text-[#191970] dark:text-[#0f0f45] rounded-lg font-bold hover:bg-yellow-300 dark:hover:bg-[#c9a236] transition-colors text-xs sm:hidden"
    >
      ↓
    </button>
    <button
      onClick={goNext}
      disabled={currentPage >= totalPages}
      className="px-3 py-1.5 bg-white dark:bg-[#2a2a3a] text-[#191970] dark:text-gray-200 rounded-lg font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-[#3a3a4a] transition-colors text-sm"
    >
      Next →
    </button>
  </div>
</div>

{/* ── Keyboard Hints ── */}
<div className="hidden sm:block bg-[#0f0f4d] dark:bg-[#0a0a1a] text-center py-0.5 flex-shrink-0 border-t border-[#a67c00]/20">
  <p className="text-gray-500 dark:text-gray-600 text-[10px]">
    ←→ navigate &nbsp;·&nbsp; +/− zoom &nbsp;·&nbsp; 0 reset &nbsp;·&nbsp; R rotate &nbsp;·&nbsp; T thumbnails &nbsp;·&nbsp; F fullscreen &nbsp;·&nbsp; Home/End first/last &nbsp;·&nbsp; Esc close
  </p>
</div>

    </div>
  );
}
