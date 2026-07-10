/**
 * World layout, terrain math, and collision data for "Shain's Realm".
 *
 * Deliberately free of three.js imports so anything (including the tiny
 * GameGate in the main bundle) can import constants without pulling
 * the 3D engine into the page chunk.
 */

/* ── Tuning constants ─────────────────────────────────────────── */

export const WORLD_RADIUS = 90; // player cannot walk past this circle
export const SHRINE_RING_RADIUS = 32; // shrines sit on this ring around spawn
export const PLAYER_RADIUS = 0.5;
export const PLAYER_SPEED = 6; // m/s
export const INTERACT_DISTANCE = 6; // proximity that arms a shrine (just outside the colonnade)
export const TRANSITION_MS = 700; // gold fade before router.push
export const SKIP_STORAGE_KEY = 'shain-game';

export type Tier = 'low' | 'high';

export const TIERS = {
  low: { grass: 800, stars: 1200, sparkles: 30, shadows: false, antialias: false, dprMax: 1.5 },
  high: { grass: 3000, stars: 3000, sparkles: 60, shadows: true, antialias: true, dprMax: 2 },
} as const;

/* ── Shrines: each one is a real site route ───────────────────── */

export type ShrineId = 'about' | 'portfolio' | 'certificate' | 'blog' | 'contact';

export interface ShrineDef {
  id: ShrineId;
  path: string;
  /** degrees on the ring; 270° is straight ahead of the spawn camera (−Z) */
  angle: number;
  broken: boolean;
  x: number;
  z: number;
}

const SHRINE_SEED: Array<Omit<ShrineDef, 'x' | 'z'>> = [
  { id: 'about', path: '/about', angle: 270, broken: false },
  { id: 'portfolio', path: '/portfolio', angle: 342, broken: false },
  { id: 'certificate', path: '/certificate', angle: 54, broken: true },
  { id: 'blog', path: '/blog', angle: 126, broken: false },
  { id: 'contact', path: '/contact', angle: 198, broken: true },
];

export const SHRINES: ShrineDef[] = SHRINE_SEED.map((s) => {
  const rad = (s.angle * Math.PI) / 180;
  return {
    ...s,
    x: Math.cos(rad) * SHRINE_RING_RADIUS,
    z: Math.sin(rad) * SHRINE_RING_RADIUS,
  };
});

/* ── Terrain ──────────────────────────────────────────────────── */

/** Central plaza + one flat pad per shrine; terrain height fades to 0 inside. */
const FLAT_SPOTS: Array<{ x: number; z: number; r: number }> = [
  { x: 0, z: 0, r: 14 },
  ...SHRINES.map((s) => ({ x: s.x, z: s.z, r: 9 })),
];

function smoothstep(x: number, min: number, max: number): number {
  const t = Math.min(1, Math.max(0, (x - min) / (max - min)));
  return t * t * (3 - 2 * t);
}

/**
 * Pure height function shared by terrain mesh, player, grass and ruins —
 * everything samples the same ground with zero raycasting.
 * Layered sines stand in for noise; smoothstep flattens the pads.
 */
export function terrainHeight(x: number, z: number): number {
  let h =
    Math.sin(x * 0.08) * Math.cos(z * 0.07) * 1.6 +
    Math.sin(x * 0.021 + 5) * Math.cos(z * 0.033 + 1) * 3.2;
  for (const p of FLAT_SPOTS) {
    const d = Math.hypot(x - p.x, z - p.z);
    h *= smoothstep(d, p.r * 0.6, p.r * 1.4);
  }
  return h;
}

export const PAD_HEIGHT = 0.8; // raised marble platform under each shrine

/**
 * Walkable ground = terrain plus a smooth ramp up onto each shrine's
 * marble pad, so the player climbs the steps instead of clipping through.
 */
export function groundHeight(x: number, z: number): number {
  let h = terrainHeight(x, z);
  for (const s of SHRINES) {
    const d = Math.hypot(x - s.x, z - s.z);
    if (d < 7.6) {
      const lift = PAD_HEIGHT * smoothstep(7.6 - d, 0.2, 1.6);
      h = Math.max(h, lift);
    }
  }
  return h;
}

/* ── Seeded PRNG so the world is identical for every visitor ──── */

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ── Static world population (ruins, statues, colliders) ──────── */

export interface Collider {
  x: number;
  z: number;
  r: number;
}

export interface RuinColumnDef {
  x: number;
  z: number;
  rotY: number;
  /** false = lone standing column, true = broken stump */
  broken: boolean;
  height: number;
  tilt: number;
}

export interface RuinBlockDef {
  x: number;
  z: number;
  rotY: number;
  rotZ: number;
  sx: number;
  sy: number;
  sz: number;
}

export interface StatueDef {
  x: number;
  z: number;
  rotY: number;
}

export const SHRINE_COLUMN_RADIUS = 4.2;
export const SHRINE_COLUMN_COUNT = 6;

/** Positions of the 6 columns around one shrine centre (local offsets). */
export function shrineColumnOffsets(): Array<{ dx: number; dz: number; angle: number }> {
  const out = [];
  for (let i = 0; i < SHRINE_COLUMN_COUNT; i++) {
    const angle = (i / SHRINE_COLUMN_COUNT) * Math.PI * 2 + Math.PI / SHRINE_COLUMN_COUNT;
    out.push({
      dx: Math.cos(angle) * SHRINE_COLUMN_RADIUS,
      dz: Math.sin(angle) * SHRINE_COLUMN_RADIUS,
      angle,
    });
  }
  return out;
}

function buildWorld() {
  const rand = mulberry32(20260710);
  const colliders: Collider[] = [];
  const ruinColumns: RuinColumnDef[] = [];
  const ruinBlocks: RuinBlockDef[] = [];
  const statues: StatueDef[] = [];

  // Shrine colonnades + emblem plinths
  for (const s of SHRINES) {
    for (const c of shrineColumnOffsets()) {
      colliders.push({ x: s.x + c.dx, z: s.z + c.dz, r: 0.65 });
    }
    colliders.push({ x: s.x, z: s.z, r: 1.3 }); // emblem plinth
  }

  // Statues guarding the plaza, facing its centre
  const statueAngles = [30, 150, 210, 330];
  for (const deg of statueAngles) {
    const rad = (deg * Math.PI) / 180;
    const x = Math.cos(rad) * 10.5;
    const z = Math.sin(rad) * 10.5;
    statues.push({ x, z, rotY: Math.atan2(-x, -z) });
    colliders.push({ x, z, r: 1.0 });
  }

  const nearShrine = (x: number, z: number, margin: number) =>
    SHRINES.some((s) => Math.hypot(x - s.x, z - s.z) < margin);

  // Scattered broken / lone columns between the shrines
  let placed = 0;
  while (placed < 25) {
    const a = rand() * Math.PI * 2;
    const d = 13 + rand() * 68; // between plaza edge and world edge
    const x = Math.cos(a) * d;
    const z = Math.sin(a) * d;
    if (nearShrine(x, z, 10)) continue;
    ruinColumns.push({
      x,
      z,
      rotY: rand() * Math.PI * 2,
      broken: rand() > 0.25,
      height: 1 + rand() * 1.8,
      tilt: (rand() - 0.5) * 0.25,
    });
    colliders.push({ x, z, r: 0.6 });
    placed++;
  }

  // Tumbled marble blocks
  placed = 0;
  while (placed < 15) {
    const a = rand() * Math.PI * 2;
    const d = 13 + rand() * 68;
    const x = Math.cos(a) * d;
    const z = Math.sin(a) * d;
    if (nearShrine(x, z, 9)) continue;
    const sx = 0.9 + rand() * 1.4;
    ruinBlocks.push({
      x,
      z,
      rotY: rand() * Math.PI * 2,
      rotZ: (rand() - 0.5) * 0.5,
      sx,
      sy: 0.6 + rand() * 0.8,
      sz: 0.9 + rand() * 1.2,
    });
    colliders.push({ x, z, r: sx * 0.8 });
    placed++;
  }

  return { colliders, ruinColumns, ruinBlocks, statues };
}

const world = buildWorld();

export const COLLIDERS: Collider[] = world.colliders;
export const RUIN_COLUMNS: RuinColumnDef[] = world.ruinColumns;
export const RUIN_BLOCKS: RuinBlockDef[] = world.ruinBlocks;
export const STATUES: StatueDef[] = world.statues;

/** Grass exclusion — no blades on the marble pads. */
export function onFlatPad(x: number, z: number): boolean {
  return FLAT_SPOTS.some((p) => Math.hypot(x - p.x, z - p.z) < p.r * 0.9);
}
