'use client';

import React from 'react';
import { RUIN_BLOCKS, RUIN_COLUMNS, terrainHeight } from '../config';
import { marbleToon } from '../materials';
import GreekColumn from './GreekColumn';

/** Seed-scattered broken columns and tumbled marble blocks between the shrines. */
export default function Ruins() {
  return (
    <group>
      {RUIN_COLUMNS.map((c, i) => (
        <GreekColumn
          key={`col-${i}`}
          position={[c.x, terrainHeight(c.x, c.z) - 0.05, c.z]}
          rotY={c.rotY}
          tilt={c.tilt}
          broken={c.broken}
          height={c.height}
        />
      ))}
      {RUIN_BLOCKS.map((b, i) => (
        <mesh
          key={`block-${i}`}
          material={marbleToon}
          castShadow
          receiveShadow
          position={[b.x, terrainHeight(b.x, b.z) + b.sy * 0.28, b.z]}
          rotation={[0, b.rotY, b.rotZ]}
          scale={[b.sx, b.sy, b.sz]}
        >
          <boxGeometry args={[1, 1, 1]} />
        </mesh>
      ))}
    </group>
  );
}
