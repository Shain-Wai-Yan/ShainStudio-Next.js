/**
 * Shared toon materials for the whole world. One 3-step gradient map
 * (NearestFilter = hard cel bands) gives everything the BotW-style look;
 * module-level singletons keep shader programs and GPU memory shared.
 *
 * This module imports three.js — only ever import it from inside the
 * dynamically loaded game chunk, never from GameGate.
 */
import * as THREE from 'three';

export const PALETTE = {
  sky: '#0b0b22',
  marble: '#c9cbe0',
  marbleShaded: '#8a8fb8',
  terrainBase: '#22335c',
  terrainLow: '#1c2b4a',
  terrainHigh: '#2e4470',
  moss: '#3a5a40',
  gold: '#ffd700',
  goldDim: '#d4af37',
  moonlight: '#aab6ff',
  nightFill: '#4a5a9a',
  cloak: '#191970',
  grassA: '#274a45',
  grassB: '#3f6b52',
} as const;

let gradient: THREE.DataTexture | null = null;

export function getToonGradient(steps = 3): THREE.DataTexture {
  if (gradient) return gradient;
  const data = new Uint8Array(steps);
  for (let i = 0; i < steps; i++) data[i] = Math.round((i / (steps - 1)) * 255);
  gradient = new THREE.DataTexture(data, steps, 1, THREE.RedFormat);
  gradient.minFilter = THREE.NearestFilter; // NearestFilter creates the cel bands
  gradient.magFilter = THREE.NearestFilter;
  gradient.needsUpdate = true;
  return gradient;
}

function toon(color: string, extra?: Partial<THREE.MeshToonMaterialParameters>) {
  return new THREE.MeshToonMaterial({ color, gradientMap: getToonGradient(), ...extra });
}

export const marbleToon = toon(PALETTE.marble);
export const cloakToon = toon(PALETTE.cloak);
export const grassToon = toon('#ffffff'); // white base × per-instance colors

export const goldEmissive = new THREE.MeshStandardMaterial({
  color: PALETTE.goldDim,
  emissive: PALETTE.gold,
  emissiveIntensity: 2.2,
  roughness: 0.35,
  metalness: 0.6,
});
