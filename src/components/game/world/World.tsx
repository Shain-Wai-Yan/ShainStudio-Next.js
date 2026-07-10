'use client';

import React from 'react';
import { SHRINES, STATUES, TIERS, type Tier } from '../config';
import { PALETTE } from '../materials';
import type { GameDict } from '../GameGate';
import NightSky from './NightSky';
import Terrain from './Terrain';
import GrassField from './GrassField';
import ShrineTemple from './ShrineTemple';
import Ruins from './Ruins';
import Statue from './Statue';

export default function World({ tier, t }: { tier: Tier; t: GameDict }) {
  const preset = TIERS[tier];
  return (
    <>
      <fog attach="fog" args={[PALETTE.sky, 40, 120]} />
      <ambientLight intensity={0.65} color={PALETTE.nightFill} />
      {/* moonlight */}
      <directionalLight
        position={[30, 40, 15]}
        intensity={1.2}
        color={PALETTE.moonlight}
        castShadow={preset.shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-48}
        shadow-camera-right={48}
        shadow-camera-top={48}
        shadow-camera-bottom={-48}
        shadow-camera-near={5}
        shadow-camera-far={130}
      />
      <NightSky tier={tier} />
      <Terrain />
      <GrassField tier={tier} />
      {SHRINES.map((s) => (
        <ShrineTemple key={s.id} shrine={s} label={t.shrines[s.id]} tier={tier} />
      ))}
      <Ruins />
      {STATUES.map((def, i) => (
        <Statue key={i} def={def} />
      ))}
    </>
  );
}
