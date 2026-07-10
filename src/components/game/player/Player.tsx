'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import {
  COLLIDERS,
  INTERACT_DISTANCE,
  PLAYER_RADIUS,
  PLAYER_SPEED,
  SHRINES,
  WORLD_RADIUS,
  groundHeight,
} from '../config';
import { useGameStore } from '../state/gameStore';
import { cloakToon, marbleToon } from '../materials';

function resolveCollisions(p: THREE.Vector3): void {
  // two passes so being pushed out of one collider can't leave us inside another
  for (let pass = 0; pass < 2; pass++) {
    for (const c of COLLIDERS) {
      const dx = p.x - c.x;
      const dz = p.z - c.z;
      const min = c.r + PLAYER_RADIUS;
      const d2 = dx * dx + dz * dz;
      if (d2 < min * min) {
        const d = Math.sqrt(d2) || 1e-4;
        p.x = c.x + (dx / d) * min;
        p.z = c.z + (dz / d) * min;
      }
    }
  }
}

/** Shortest-arc, framerate-independent angle smoothing. */
function dampAngle(current: number, target: number, lambda: number, dt: number): number {
  let diff = (target - current) % (Math.PI * 2);
  if (diff > Math.PI) diff -= Math.PI * 2;
  if (diff < -Math.PI) diff += Math.PI * 2;
  return current + diff * (1 - Math.exp(-lambda * dt));
}

// Frame-loop state lives at module level: only one Player ever exists, the
// vectors are allocated once, and mutating them never touches React state
// (which the react-hooks/immutability rule would forbid on useMemo values).
const s = {
  pos: new THREE.Vector3(0, 0, 5),
  dir: new THREE.Vector3(),
  next: new THREE.Vector3(),
  idealCam: new THREE.Vector3(0, 6.5, 14),
  lookTarget: new THREE.Vector3(0, 1.5, 5),
  tmp: new THREE.Vector3(),
  targetYaw: Math.PI, // facing −Z (away from the spawn camera)
  proximityTimer: 0,
  walkPhase: 0,
};

/**
 * The traveler: capsule + hood built from primitives (front is +Z),
 * world-aligned WASD movement, chase camera, shrine proximity detection.
 */
export default function Player() {
  const group = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);

  // back at the spawn plaza on every game (re-)entry
  useEffect(() => {
    s.pos.set(0, 0, 5);
    s.lookTarget.set(0, 1.5, 5);
    s.targetYaw = Math.PI;
    s.proximityTimer = 0;
    s.walkPhase = 0;
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1); // clamp: no teleport after tab-restore
    const store = useGameStore.getState();
    const x = store.transitioning ? 0 : store.input.x;
    const z = store.transitioning ? 0 : store.input.z;
    const moving = x !== 0 || z !== 0;

    if (moving) {
      s.dir.set(x, 0, z).normalize();
      s.next.copy(s.pos).addScaledVector(s.dir, PLAYER_SPEED * dt);
      resolveCollisions(s.next);
      const dist = Math.hypot(s.next.x, s.next.z);
      if (dist > WORLD_RADIUS) {
        s.next.x *= WORLD_RADIUS / dist;
        s.next.z *= WORLD_RADIUS / dist;
      }
      s.pos.x = s.next.x;
      s.pos.z = s.next.z;
      s.targetYaw = Math.atan2(s.dir.x, s.dir.z);
      s.walkPhase += dt * 10;
    }
    s.pos.y = groundHeight(s.pos.x, s.pos.z);

    const g = group.current;
    if (g) {
      g.position.copy(s.pos);
      g.rotation.y = dampAngle(g.rotation.y, s.targetYaw, 10, dt);
    }
    if (body.current) {
      const t = state.clock.elapsedTime;
      // walk bob vs idle breathing
      body.current.position.y = moving
        ? Math.abs(Math.sin(s.walkPhase)) * 0.12
        : Math.sin(t * 2) * 0.03;
      body.current.rotation.x = moving ? 0.08 : 0;
    }

    // chase camera: fixed offset, exponential smoothing (framerate-independent)
    s.idealCam.set(s.pos.x, s.pos.y + 6, s.pos.z + 9);
    state.camera.position.lerp(s.idealCam, 1 - Math.exp(-4 * dt));
    s.lookTarget.lerp(s.tmp.set(s.pos.x, s.pos.y + 1.5, s.pos.z), 1 - Math.exp(-6 * dt));
    state.camera.lookAt(s.lookTarget);

    // shrine proximity at ~5 Hz
    s.proximityTimer += dt;
    if (s.proximityTimer >= 0.2) {
      s.proximityTimer = 0;
      let nearestId: (typeof SHRINES)[number]['id'] | null = null;
      let best = INTERACT_DISTANCE;
      for (const shrine of SHRINES) {
        const d = Math.hypot(s.pos.x - shrine.x, s.pos.z - shrine.z);
        if (d < best) {
          best = d;
          nearestId = shrine.id;
        }
      }
      store.setNearShrine(nearestId);
    }
  });

  return (
    <group ref={group} position={[0, 0, 5]} rotation={[0, Math.PI, 0]}>
      <group ref={body}>
        {/* cloaked body */}
        <mesh material={cloakToon} castShadow position={[0, 0.75, 0]}>
          <capsuleGeometry args={[0.35, 0.7, 4, 12]} />
        </mesh>
        {/* gold belt */}
        <mesh position={[0, 0.72, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.37, 0.045, 8, 20]} />
          <meshStandardMaterial
            color="#d4af37"
            emissive="#ffd700"
            emissiveIntensity={0.6}
            roughness={0.4}
            metalness={0.6}
          />
        </mesh>
        {/* head */}
        <mesh material={marbleToon} castShadow position={[0, 1.62, 0]}>
          <sphereGeometry args={[0.27, 20, 16]} />
        </mesh>
        {/* hood */}
        <mesh material={cloakToon} castShadow position={[0, 1.82, -0.04]}>
          <coneGeometry args={[0.33, 0.5, 12]} />
        </mesh>
        {/* gold clasp marking the front */}
        <mesh position={[0, 1.15, 0.33]}>
          <sphereGeometry args={[0.06, 10, 8]} />
          <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={1.2} />
        </mesh>
      </group>
    </group>
  );
}
