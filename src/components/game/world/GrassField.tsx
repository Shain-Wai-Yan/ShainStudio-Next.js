'use client';

import React, { useLayoutEffect, useRef } from 'react';
import * as THREE from 'three';
import { mulberry32, onFlatPad, terrainHeight, TIERS, type Tier } from '../config';
import { grassToon, PALETTE } from '../materials';

/**
 * One InstancedMesh of tri-sided cone blades — a whole meadow in a single
 * draw call. Placement is static and seeded, so every visitor sees the
 * same field and nothing updates per frame.
 */
export default function GrassField({ tier }: { tier: Tier }) {
  const count = TIERS[tier].grass;
  const ref = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const rand = mulberry32(999);
    const dummy = new THREE.Object3D();
    const colorA = new THREE.Color(PALETTE.grassA);
    const colorB = new THREE.Color(PALETTE.grassB);
    const c = new THREE.Color();
    let i = 0;
    let guard = 0;
    while (i < count && guard++ < count * 20) {
      const a = rand() * Math.PI * 2;
      const d = Math.sqrt(rand()) * 85; // sqrt → uniform density over the disc
      const x = Math.cos(a) * d;
      const z = Math.sin(a) * d;
      if (onFlatPad(x, z)) continue; // keep the marble pads clean
      dummy.position.set(x, terrainHeight(x, z) + 0.22, z);
      dummy.rotation.set((rand() - 0.5) * 0.3, rand() * Math.PI * 2, (rand() - 0.5) * 0.3);
      dummy.scale.set(1, 0.7 + rand() * 0.9, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, c.copy(colorA).lerp(colorB, rand()));
      i++;
    }
    mesh.count = i;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [count]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} material={grassToon} frustumCulled={false}>
      <coneGeometry args={[0.07, 0.55, 3]} />
    </instancedMesh>
  );
}
