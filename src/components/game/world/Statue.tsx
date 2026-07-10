'use client';

import React from 'react';
import { terrainHeight, type StatueDef } from '../config';
import { goldEmissive, marbleToon } from '../materials';

/**
 * Abstract marble figure echoing the site's neoclassical statue imagery —
 * pedestal, capsule torso, tilted head, gold laurel. Original forms only.
 */
export default function Statue({ def }: { def: StatueDef }) {
  return (
    <group position={[def.x, terrainHeight(def.x, def.z), def.z]} rotation={[0, def.rotY, 0]}>
      {/* pedestal */}
      <mesh material={marbleToon} castShadow receiveShadow position={[0, 0.5, 0]}>
        <boxGeometry args={[1.6, 1.0, 1.6]} />
      </mesh>
      {/* torso */}
      <mesh material={marbleToon} castShadow position={[0, 1.78, 0]}>
        <capsuleGeometry args={[0.34, 0.65, 4, 12]} />
      </mesh>
      {/* arms folded slightly outward */}
      <mesh material={marbleToon} castShadow position={[-0.44, 1.8, 0.05]} rotation={[0, 0, 0.5]}>
        <capsuleGeometry args={[0.09, 0.5, 4, 8]} />
      </mesh>
      <mesh material={marbleToon} castShadow position={[0.44, 1.8, 0.05]} rotation={[0, 0, -0.5]}>
        <capsuleGeometry args={[0.09, 0.5, 4, 8]} />
      </mesh>
      {/* head, gently bowed */}
      <mesh material={marbleToon} castShadow position={[0, 2.5, 0.04]} rotation={[0.14, 0, 0]}>
        <sphereGeometry args={[0.26, 20, 16]} />
      </mesh>
      {/* gold laurel */}
      <mesh material={goldEmissive} position={[0, 2.6, 0.02]} rotation={[1.2, 0, 0]}>
        <torusGeometry args={[0.3, 0.04, 8, 24]} />
      </mesh>
    </group>
  );
}
