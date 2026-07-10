'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useRouter } from 'next/navigation';
import { SHRINES, TIERS, TRANSITION_MS, type ShrineId, type Tier } from './config';
import { useGameStore } from './state/gameStore';
import { useKeyboard } from './player/useKeyboard';
import Player from './player/Player';
import World from './world/World';
import GameHud from './hud/GameHud';
import VirtualJoystick from './hud/VirtualJoystick';
import type { GameDict } from './GameGate';

interface Props {
  locale: string;
  t: GameDict;
  tier: Tier;
  onReady: () => void;
  onSkip: () => void;
  onFail: () => void;
}

/**
 * Canvas root — everything three.js lives in this dynamically loaded chunk.
 */
export default function GameExperience({ locale, t, tier, onReady, onSkip, onFail }: Props) {
  const router = useRouter();
  // this component is loaded with ssr:false, so window exists at first render
  const [isTouch] = useState(() => window.matchMedia('(pointer: coarse)').matches);

  useEffect(() => {
    // module-level store outlives the canvas — clear stale fade/input on re-entry
    useGameStore.getState().reset();
  }, []);

  useKeyboard();

  const basePath = locale === 'zh' ? '/zh' : '';

  const navigate = useCallback(
    (id: ShrineId) => {
      const store = useGameStore.getState();
      if (store.transitioning) return;
      store.startTransition();
      const shrine = SHRINES.find((sh) => sh.id === id)!;
      window.setTimeout(() => router.push(`${basePath}${shrine.path}`), TRANSITION_MS);
    },
    [router, basePath]
  );

  const interact = useCallback(() => {
    const id = useGameStore.getState().nearShrineId;
    if (id) navigate(id);
  }, [navigate]);

  // E enters the nearby shrine (deliberately not Enter — it would collide
  // with pressing focused HUD buttons)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'KeyE') interact();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [interact]);

  // prefetch each shrine's route the first time the player approaches it
  useEffect(() => {
    const prefetched = new Set<ShrineId>();
    return useGameStore.subscribe((s) => {
      const id = s.nearShrineId;
      if (!id || prefetched.has(id)) return;
      prefetched.add(id);
      const shrine = SHRINES.find((sh) => sh.id === id)!;
      router.prefetch(`${basePath}${shrine.path}`);
    });
  }, [router, basePath]);

  const preset = TIERS[tier];

  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={[1, preset.dprMax]}
        shadows={preset.shadows}
        gl={{ powerPreference: 'high-performance', antialias: preset.antialias }}
        camera={{ position: [0, 6.5, 14], fov: 50, near: 0.5, far: 300 }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            onFail(); // fall back to the classic landing, don't persist a skip
          });
          onReady();
        }}
      >
        <World tier={tier} t={t} />
        <Player />
      </Canvas>
      <GameHud t={t} isTouch={isTouch} onSkip={onSkip} onInteract={interact} />
      {isTouch && <VirtualJoystick t={t} onInteract={interact} />}
    </div>
  );
}
