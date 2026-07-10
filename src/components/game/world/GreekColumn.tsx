'use client';

import React from 'react';
import { marbleToon } from '../materials';

interface Props {
  position: [number, number, number];
  rotY?: number;
  tilt?: number;
  /** broken → shaft stump of `height`, no capital */
  broken?: boolean;
  height?: number;
}

/**
 * Doric-ish column from primitives: plinth → tapered shaft → capital + abacus.
 * Full column is ~4.9 units tall above its base.
 */
export default function GreekColumn({
  position,
  rotY = 0,
  tilt = 0,
  broken = false,
  height = 4.2,
}: Props) {
  const h = broken ? height : 4.2;
  return (
    <group position={position} rotation={[0, rotY, tilt]}>
      <mesh material={marbleToon} castShadow receiveShadow position={[0, 0.15, 0]}>
        <boxGeometry args={[1.15, 0.3, 1.15]} />
      </mesh>
      <mesh material={marbleToon} castShadow position={[0, 0.3 + h / 2, 0]}>
        <cylinderGeometry args={[0.35, 0.45, h, 12]} />
      </mesh>
      {!broken && (
        <>
          <mesh material={marbleToon} castShadow position={[0, 0.3 + h + 0.125, 0]}>
            <cylinderGeometry args={[0.55, 0.4, 0.25, 12]} />
          </mesh>
          <mesh material={marbleToon} castShadow position={[0, 0.3 + h + 0.34, 0]}>
            <boxGeometry args={[1.1, 0.18, 1.1]} />
          </mesh>
        </>
      )}
    </group>
  );
}
