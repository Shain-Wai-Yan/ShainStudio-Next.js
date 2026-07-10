'use client';

import React, { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Dictionary } from '@/lib/getDictionary';
import { SKIP_STORAGE_KEY, type Tier } from './config';
import LoadingPoster from './hud/LoadingPoster';

export type GameDict = Dictionary['game'];

// Next 16: ssr:false is only legal inside a client component — this file is
// that wrapper. The three.js chunk is fetched only after the gate checks pass.
const GameExperience = dynamic(() => import('./GameExperience'), {
  ssr: false,
  loading: () => null,
});

type Phase = 'ssr' | 'skipped' | 'loading' | 'playing' | 'unsupported';

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

export default function GameGate({ locale, t }: { locale: string; t: GameDict }) {
  // 'ssr' renders null on the server and first client paint, so the server
  // HTML stays byte-identical to the classic landing page (SEO untouched).
  const [phase, setPhase] = useState<Phase>('ssr');
  const [tier, setTier] = useState<Tier>('high');

  useEffect(() => {
    // decide one frame after hydration (async keeps the effect render-clean)
    const id = requestAnimationFrame(() => {
      if (localStorage.getItem(SKIP_STORAGE_KEY) === 'skip') return setPhase('skipped');
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches)
        return setPhase('unsupported');
      if (!hasWebGL()) return setPhase('unsupported');
      const coarse = window.matchMedia('(pointer: coarse)').matches;
      setTier(coarse || navigator.hardwareConcurrency <= 4 ? 'low' : 'high');
      setPhase('loading');
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const active = phase === 'loading' || phase === 'playing';

  // Lock page scroll while the overlay is up
  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [active]);

  const skip = useCallback(() => {
    localStorage.setItem(SKIP_STORAGE_KEY, 'skip');
    setPhase('skipped');
  }, []);

  // Device can't sustain the game (e.g. WebGL context lost): fall back to the
  // classic landing without persisting a skip preference. Guarded so the
  // context-lost event R3F fires while tearing down after a skip can't
  // clobber the 'skipped' phase (which shows the re-entry pill).
  const fail = useCallback(
    () => setPhase((p) => (p === 'loading' || p === 'playing' ? 'unsupported' : p)),
    []
  );

  // Escape always bails out, even while the chunk is still downloading
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') skip();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, skip]);

  if (phase === 'ssr' || phase === 'unsupported') return null;

  if (phase === 'skipped') {
    return (
      <button
        type="button"
        onClick={() => {
          localStorage.removeItem(SKIP_STORAGE_KEY);
          setPhase('loading');
        }}
        className="fixed bottom-6 left-6 z-[900] rounded-full border border-[#d4af37]/70
                   bg-[#0f0f1e]/90 px-4 py-2 text-sm text-[#ffd700] shadow-lg backdrop-blur
                   transition-transform hover:scale-105 focus:outline-none
                   focus-visible:ring-2 focus-visible:ring-[#ffd700]"
      >
        ✦ {t.enter}
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[10000] bg-[#0b0b22] animate-[gameFadeIn_0.2s_ease-out]"
      role="application"
      aria-label={t.title}
    >
      <GameExperience
        locale={locale}
        t={t}
        tier={tier}
        onReady={() => setPhase('playing')}
        onSkip={skip}
        onFail={fail}
      />
      {phase === 'loading' && <LoadingPoster t={t} onSkip={skip} />}
    </div>
  );
}
