'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { terrainHeight } from '../config';
import { getToonGradient, PALETTE } from '../materials';

/**
 * 200×200 plane displaced by the shared terrainHeight() function, with
 * vertex colors lerped by height plus sine-mask moss patches.
 */
export default function Terrain() {
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(200, 200, 96, 96);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const colors = new Float32Array(pos.count * 3);
    const low = new THREE.Color(PALETTE.terrainLow);
    const high = new THREE.Color(PALETTE.terrainHigh);
    const moss = new THREE.Color(PALETTE.moss);
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const h = terrainHeight(x, z);
      pos.setY(i, h);
      c.copy(low).lerp(high, THREE.MathUtils.clamp((h + 2.5) / 6, 0, 1));
      const mossMask = Math.max(0, Math.sin(x * 0.13 + 2.1) * Math.cos(z * 0.11 - 0.7)) * 0.45;
      c.lerp(moss, mossMask);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshToonMaterial vertexColors gradientMap={getToonGradient()} />
    </mesh>
  );
}
