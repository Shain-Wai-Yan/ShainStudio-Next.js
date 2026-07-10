import { useEffect } from 'react';
import { useGameStore } from '../state/gameStore';

const MOVE_KEYS = new Set([
  'KeyW',
  'KeyA',
  'KeyS',
  'KeyD',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
]);

/** WASD / arrow keys → normalized vector in the game store. */
export function useKeyboard(): void {
  useEffect(() => {
    const pressed = new Set<string>();

    const update = () => {
      let x = 0;
      let z = 0;
      if (pressed.has('KeyW') || pressed.has('ArrowUp')) z -= 1;
      if (pressed.has('KeyS') || pressed.has('ArrowDown')) z += 1;
      if (pressed.has('KeyA') || pressed.has('ArrowLeft')) x -= 1;
      if (pressed.has('KeyD') || pressed.has('ArrowRight')) x += 1;
      const len = Math.hypot(x, z);
      useGameStore.getState().setInput(len ? x / len : 0, len ? z / len : 0);
    };

    const onDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (!MOVE_KEYS.has(e.code)) return;
      e.preventDefault();
      pressed.add(e.code);
      update();
    };

    const onUp = (e: KeyboardEvent) => {
      if (!MOVE_KEYS.has(e.code)) return;
      pressed.delete(e.code);
      update();
    };

    // Alt-Tab / focus loss must never leave a key stuck down
    const onBlur = () => {
      pressed.clear();
      update();
    };

    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
      window.removeEventListener('blur', onBlur);
      onBlur();
    };
  }, []);
}
