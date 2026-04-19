'use client';

import { useEffect, useRef } from 'react';

/**
 * CreativeCursor
 *
 * Two-layer cursor:
 *  1. A small gold "crosshair dot" that snaps exactly to the pointer
 *  2. A larger glass-morphism ring that follows with a spring lag
 *
 * On interactive elements (a, button, [data-cursor="text"]):
 *  - Ring scales up and rotates, showing a "drag me" text orbit
 *  - Color shifts to gold
 *
 * On images / project cards ([data-cursor="view"]):
 *  - Ring collapses to a solid pill with a "VIEW →" label
 *
 * Hidden on touch/mobile devices via CSS.
 */
export default function CreativeCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Skip on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const dot = dotRef.current!;
    const ring = ringRef.current!;
    const label = labelRef.current!;

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const loop = () => {
      // Dot snaps instantly
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;

      // Ring follows with spring
      ringX = lerp(ringX, mouseX, 0.1);
      ringY = lerp(ringY, mouseY, 0.1);
      ring.style.transform = `translate(${ringX}px, ${ringY}px)`;

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    document.body.style.cursor = 'none';

    // Hover state detection
    const onEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      if (
        target.closest('a') ||
        target.closest('button') ||
        target.dataset.cursor === 'hover'
      ) {
        ring.classList.add('cursor-ring--hover');
        dot.classList.add('cursor-dot--hover');
        label.textContent = '';
      } else if (target.dataset.cursor === 'view') {
        ring.classList.add('cursor-ring--view');
        dot.classList.add('cursor-dot--hidden');
        label.textContent = 'VIEW →';
      } else {
        ring.classList.remove('cursor-ring--hover', 'cursor-ring--view');
        dot.classList.remove('cursor-dot--hover', 'cursor-dot--hidden');
        label.textContent = '';
      }
    };

    const onLeave = () => {
      ring.classList.remove('cursor-ring--hover', 'cursor-ring--view');
      dot.classList.remove('cursor-dot--hover', 'cursor-dot--hidden');
      label.textContent = '';
    };

    const onMouseDown = () => ring.classList.add('cursor-ring--click');
    const onMouseUp = () => ring.classList.remove('cursor-ring--click');

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseover', onEnter, { passive: true });
    window.addEventListener('mouseout', onLeave, { passive: true });
    window.addEventListener('mousedown', onMouseDown, { passive: true });
    window.addEventListener('mouseup', onMouseUp, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onEnter);
      window.removeEventListener('mouseout', onLeave);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return (
    <>
      {/* Crosshair snap dot */}
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      {/* Lagging ring */}
      <div ref={ringRef} className="cursor-ring" aria-hidden="true">
        <span ref={labelRef} className="cursor-ring__label" />
      </div>
    </>
  );
}
