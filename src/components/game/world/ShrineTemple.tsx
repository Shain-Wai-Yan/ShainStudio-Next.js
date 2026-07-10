'use client';

import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html, Sparkles } from '@react-three/drei';
import {
  PAD_HEIGHT,
  shrineColumnOffsets,
  TIERS,
  type ShrineDef,
  type Tier,
} from '../config';
import { marbleToon, PALETTE } from '../materials';
import { useGameStore } from '../state/gameStore';
import GreekColumn from './GreekColumn';

const COLUMN_OFFSETS = shrineColumnOffsets();

// shared scratch vectors for the label-visibility check (used within one frame only)
const toShrine = new THREE.Vector3();
const camDir = new THREE.Vector3();

/**
 * One glowing shrine = one site route. Marble pad + colonnade + pediment,
 * floating gold emblem that brightens as the player approaches and flares
 * during the travel transition.
 */
export default function ShrineTemple({
  shrine,
  label,
  tier,
}: {
  shrine: ShrineDef;
  label: string;
  tier: Tier;
}) {
  const emblem = useRef<THREE.Mesh>(null);
  const light = useRef<THREE.PointLight>(null);
  const labelTimer = useRef(0);
  const near = useGameStore((s) => s.nearShrineId === shrine.id);
  // drei <Html> mirrors labels of anchors behind the camera into the viewport,
  // so we only mount the label when the shrine is in front and reasonably close
  const [labelVisible, setLabelVisible] = useState(false);

  useFrame((state, delta) => {
    const m = emblem.current;
    if (!m) return;
    m.rotation.y += delta * 0.8;
    m.position.y = 2.7 + Math.sin(state.clock.elapsedTime * 1.5 + shrine.angle) * 0.15;

    const store = useGameStore.getState();
    const flare = store.transitioning && store.nearShrineId === shrine.id;
    const targetGlow = flare ? 9 : near ? 4.2 : 2.2;
    const mat = m.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity += (targetGlow - mat.emissiveIntensity) * Math.min(1, delta * 6);
    if (light.current) light.current.intensity = mat.emissiveIntensity * 1.5;

    labelTimer.current += delta;
    if (labelTimer.current >= 0.25) {
      labelTimer.current = 0;
      toShrine.set(shrine.x, 3, shrine.z).sub(state.camera.position);
      const dist = toShrine.length();
      state.camera.getWorldDirection(camDir);
      const visible = dist < 70 && toShrine.dot(camDir) / dist > 0.25;
      if (visible !== labelVisible) setLabelVisible(visible);
    }
  });

  return (
    <group position={[shrine.x, 0, shrine.z]}>
      {/* stepped marble pad */}
      <mesh material={marbleToon} receiveShadow position={[0, 0.125, 0]}>
        <cylinderGeometry args={[6.6, 6.9, 0.25, 24]} />
      </mesh>
      <mesh material={marbleToon} receiveShadow position={[0, 0.375, 0]}>
        <cylinderGeometry args={[6.15, 6.4, 0.25, 24]} />
      </mesh>
      <mesh material={marbleToon} receiveShadow position={[0, 0.65, 0]}>
        <cylinderGeometry args={[5.7, 5.95, 0.3, 24]} />
      </mesh>

      {/* everything standing on the pad */}
      <group position={[0, PAD_HEIGHT, 0]}>
        {COLUMN_OFFSETS.map((c, i) => {
          const stump = shrine.broken && i % 2 === 1;
          return (
            <GreekColumn
              key={i}
              position={[c.dx, 0, c.dz]}
              rotY={-c.angle}
              broken={stump}
              height={stump ? 1.2 + ((i * 0.7) % 1.4) : 4.2}
              tilt={stump ? 0.06 : 0}
            />
          );
        })}

        {!shrine.broken && (
          <>
            {/* ring beam across the column tops */}
            <mesh material={marbleToon} castShadow position={[0, 5.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[4.2, 0.16, 8, 32]} />
            </mesh>
            {/* pediment: 4-sided cone reads as a pyramid roof at night */}
            <mesh material={marbleToon} castShadow position={[0, 6.0, 0]} rotation={[0, Math.PI / 4, 0]}>
              <coneGeometry args={[6.0, 1.6, 4]} />
            </mesh>
          </>
        )}

        {/* emblem plinth */}
        <mesh material={marbleToon} castShadow position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.55, 0.7, 1.0, 12]} />
        </mesh>

        {/* floating gold emblem — its own material so each shrine flares alone */}
        <mesh ref={emblem} position={[0, 2.7, 0]}>
          <icosahedronGeometry args={[0.55, 0]} />
          <meshStandardMaterial
            color={PALETTE.goldDim}
            emissive={PALETTE.gold}
            emissiveIntensity={2.2}
            roughness={0.35}
            metalness={0.6}
          />
        </mesh>

        <pointLight ref={light} position={[0, 3, 0]} color={PALETTE.gold} intensity={3.3} distance={16} decay={2} />
        <Sparkles count={TIERS[tier].sparkles} position={[0, 2.5, 0]} scale={[9, 4, 9]} color={PALETTE.gold} size={3} speed={0.4} />

        {/* localized name — DOM label so the site's fonts (incl. CJK) come free */}
        {labelVisible && (
        <Html
          center
          position={[0, shrine.broken ? 4.6 : 7.6, 0]}
          distanceFactor={18}
          zIndexRange={[40, 0]}
          style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}
        >
          <span
            className={`rounded-full border px-4 py-1.5 font-serif text-sm backdrop-blur-sm transition-colors duration-300
              ${near ? 'border-[#ffd700] bg-[#191970]/85 text-[#ffd700]' : 'border-[#d4af37]/40 bg-[#0f0f1e]/70 text-[#e8e3c8]'}`}
          >
            {label}
          </span>
        </Html>
        )}
      </group>
    </group>
  );
}
