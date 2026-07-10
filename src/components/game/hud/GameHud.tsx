'use client';

import React, { useEffect, useState } from 'react';
import { useGameStore } from '../state/gameStore';
import type { GameDict } from '../GameGate';

interface Props {
  t: GameDict;
  isTouch: boolean;
  onSkip: () => void;
  onInteract: () => void;
}

/**
 * DOM layer over the canvas: wordmark, skip, controls hint, shrine prompt,
 * and the gold travel fade. Subscribes only to the cheap store slices —
 * never to the per-frame input vector.
 */
export default function GameHud({ t, isTouch, onSkip, onInteract }: Props) {
  const nearShrineId = useGameStore((s) => s.nearShrineId);
  const transitioning = useGameStore((s) => s.transitioning);
  const hasMoved = useGameStore((s) => s.hasMoved);
  const [hintTimedOut, setHintTimedOut] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setHintTimedOut(true), 8000);
    return () => window.clearTimeout(id);
  }, []);

  const showHint = !hasMoved && !hintTimedOut && !transitioning;
  const shrineName = nearShrineId ? t.shrines[nearShrineId] : null;

  return (
    <div className="pointer-events-none absolute inset-0 z-50">
      <p className="absolute left-5 top-5 font-serif text-lg font-bold text-[#ffd700]/90 drop-shadow-[0_0_12px_rgba(255,215,0,0.3)]">
        Shain Studio
      </p>

      <button
        type="button"
        onClick={onSkip}
        className="pointer-events-auto absolute right-5 top-5 rounded-full border border-[#d4af37]/60
                   bg-[#0f0f1e]/70 px-5 py-2 text-sm text-[#ffd700] backdrop-blur transition-colors
                   hover:bg-[#ffd700]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd700]"
      >
        {t.skip}
      </button>

      <p
        aria-hidden={!showHint}
        className={`absolute bottom-[calc(2rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2
                    whitespace-nowrap rounded-full bg-[#0f0f1e]/70 px-5 py-2 text-xs text-slate-300
                    backdrop-blur transition-opacity duration-700 ${showHint ? 'opacity-100' : 'opacity-0'}`}
      >
        {isTouch ? t.controlsHintTouch : t.controlsHint}
      </p>

      {shrineName && !transitioning && (
        <button
          type="button"
          onClick={onInteract}
          className="pointer-events-auto absolute bottom-[calc(6.5rem+env(safe-area-inset-bottom))] left-1/2
                     flex -translate-x-1/2 flex-col items-center gap-1 rounded-2xl border border-[#ffd700]/50
                     bg-[#0f0f1e]/80 px-6 py-3 backdrop-blur focus:outline-none focus-visible:ring-2
                     focus-visible:ring-[#ffd700]"
        >
          <span className="whitespace-nowrap font-serif text-base text-[#ffd700]">{shrineName}</span>
          <span className="text-xs text-slate-300">{isTouch ? t.interact : t.interactKey}</span>
        </button>
      )}

      {transitioning && (
        <div
          aria-hidden
          className="absolute inset-0 z-[60] animate-[goldFade_0.7s_ease-in_forwards] opacity-0
                     bg-[radial-gradient(circle,rgba(255,215,0,0.85)_0%,rgba(11,11,34,1)_70%)]"
        />
      )}
    </div>
  );
}
