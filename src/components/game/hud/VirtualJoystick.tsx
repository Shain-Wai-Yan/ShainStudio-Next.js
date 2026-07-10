'use client';

import React, { useRef, useState } from 'react';
import { useGameStore } from '../state/gameStore';
import type { GameDict } from '../GameGate';

const R = 40; // px travel radius of the thumb

/**
 * Custom pointer-capture joystick (bottom-left) + shrine Enter button
 * (bottom-right). Screen-up maps to world −Z because the chase camera
 * always faces −Z. Rendered only on coarse-pointer devices.
 */
export default function VirtualJoystick({ t, onInteract }: { t: GameDict; onInteract: () => void }) {
  const baseRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);
  const nearShrineId = useGameStore((s) => s.nearShrineId);
  const transitioning = useGameStore((s) => s.transitioning);

  const track = (e: React.PointerEvent) => {
    const el = baseRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    const len = Math.hypot(dx, dy);
    const k = len > R ? R / len : 1;
    setThumb({ x: dx * k, y: dy * k });
    useGameStore.getState().setInput((dx * k) / R, (dy * k) / R);
  };

  const release = () => {
    setActive(false);
    setThumb({ x: 0, y: 0 });
    useGameStore.getState().setInput(0, 0);
  };

  return (
    <>
      <div
        ref={baseRef}
        role="slider"
        aria-label={t.controlsHintTouch}
        aria-valuenow={0}
        onPointerDown={(e) => {
          baseRef.current?.setPointerCapture(e.pointerId);
          setActive(true);
          track(e);
        }}
        onPointerMove={(e) => {
          if (active) track(e);
        }}
        onPointerUp={release}
        onPointerCancel={release}
        className="absolute bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-6 z-50 h-28 w-28
                   touch-none select-none rounded-full border-2 border-[#d4af37]/50 bg-[#0f0f1e]/40 backdrop-blur-sm"
      >
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-12 w-12 rounded-full
                     border border-[#ffd700]/70 bg-[#ffd700]/25"
          style={{
            transform: `translate(calc(-50% + ${thumb.x}px), calc(-50% + ${thumb.y}px))`,
          }}
        />
      </div>

      {nearShrineId && !transitioning && (
        <button
          type="button"
          onClick={onInteract}
          className="absolute bottom-[calc(2rem+env(safe-area-inset-bottom))] right-8 z-50 flex h-16 w-16
                     items-center justify-center rounded-full border-2 border-[#ffd700]/80 bg-[#191970]/85
                     text-sm font-bold text-[#ffd700] shadow-[0_0_20px_rgba(255,215,0,0.35)] backdrop-blur
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd700]"
        >
          {t.interact}
        </button>
      )}
    </>
  );
}
