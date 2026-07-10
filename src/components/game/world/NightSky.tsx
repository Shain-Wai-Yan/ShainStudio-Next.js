'use client';

import React from 'react';
import { Stars } from '@react-three/drei';
import { TIERS, type Tier } from '../config';
import { PALETTE } from '../materials';

export default function NightSky({ tier }: { tier: Tier }) {
  return (
    <>
      <color attach="background" args={[PALETTE.sky]} />
      <Stars radius={130} depth={50} count={TIERS[tier].stars} factor={4} saturation={0} fade speed={0.6} />
      {/* moon + soft halo — fog disabled so it stays crisp at distance */}
      <group position={[60, 45, -80]}>
        <mesh>
          <sphereGeometry args={[4, 24, 16]} />
          <meshBasicMaterial color="#e8ecff" fog={false} />
        </mesh>
        <mesh>
          <sphereGeometry args={[5.2, 24, 16]} />
          <meshBasicMaterial color={PALETTE.moonlight} transparent opacity={0.18} fog={false} />
        </mesh>
      </group>
    </>
  );
}
