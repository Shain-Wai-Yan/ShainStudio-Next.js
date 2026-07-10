import { create } from 'zustand';
import type { ShrineId } from '../config';

interface GameStore {
  /** Normalized world-space movement vector (W = −z). */
  input: { x: number; z: number };
  nearShrineId: ShrineId | null;
  transitioning: boolean;
  hasMoved: boolean;
  setInput: (x: number, z: number) => void;
  setNearShrine: (id: ShrineId | null) => void;
  startTransition: () => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>()((set, get) => ({
  input: { x: 0, z: 0 },
  nearShrineId: null,
  transitioning: false,
  hasMoved: false,

  setInput: (x, z) => {
    const cur = get().input;
    if (cur.x === x && cur.z === z) return;
    set({ input: { x, z }, ...(x || z ? { hasMoved: true } : null) });
  },

  setNearShrine: (id) => {
    if (get().nearShrineId !== id) set({ nearShrineId: id });
  },

  startTransition: () => set({ transitioning: true }),

  // The store is module-level and outlives the canvas: reset on every
  // game mount so back-button re-entry doesn't inherit a stale fade.
  reset: () =>
    set({ input: { x: 0, z: 0 }, nearShrineId: null, transitioning: false, hasMoved: false }),
}));
