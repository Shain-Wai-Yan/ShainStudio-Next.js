'use client';

import React from 'react';
import type { GameDict } from '../GameGate';

/**
 * Pure-CSS poster shown while the three.js chunk downloads.
 * No images — paints on the first frame after mount, and always
 * offers an escape hatch before the game has even loaded.
 */
export default function LoadingPoster({ t, onSkip }: { t: GameDict; onSkip: () => void }) {
  return (
    <div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center overflow-hidden
                 bg-gradient-to-b from-[#0b0b22] via-[#12123a] to-[#0b0b22] text-center"
    >
      {/* faint gold halo behind the title */}
      <div
        aria-hidden
        className="pointer-events-none absolute h-[60vmin] w-[60vmin] rounded-full
                   bg-[radial-gradient(circle,rgba(255,215,0,0.12)_0%,transparent_65%)]"
      />

      <p className="mb-3 text-xs uppercase tracking-[0.4em] text-[#d4af37]">Shain Studio</p>
      <h1 className="font-serif text-4xl font-bold text-[#ffd700] drop-shadow-[0_0_24px_rgba(255,215,0,0.35)] sm:text-6xl">
        {t.title}
      </h1>
      <p className="mt-5 text-sm text-slate-300 sm:text-base" role="status">
        {t.loading}
      </p>
      <p className="mt-1 text-xs text-slate-500">{t.loadingHint}</p>

      {/* shimmer bar */}
      <div className="mt-8 h-1 w-48 overflow-hidden rounded-full bg-[#191970]">
        <div className="h-full w-1/3 animate-pulse rounded-full bg-gradient-to-r from-transparent via-[#ffd700] to-transparent" />
      </div>

      <button
        type="button"
        onClick={onSkip}
        className="mt-10 rounded-full border border-[#d4af37]/60 px-6 py-2 text-sm text-[#ffd700]
                   transition-colors hover:bg-[#ffd700]/10 focus:outline-none focus-visible:ring-2
                   focus-visible:ring-[#ffd700]"
      >
        {t.skip}
      </button>
    </div>
  );
}
