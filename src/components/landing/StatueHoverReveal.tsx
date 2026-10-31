"use client";

import { useEffect, useRef } from "react";
import CImage from "@/components/ui/CImage";

// Only the mask deforms; both sculpture layers stay completely still.
const PUFFS = [
  { lag: .12, scale: .76, phase: .5 },
  { lag: .2, scale: .62, phase: 2.2 },
  { lag: .29, scale: .49, phase: 4 },
  { lag: .4, scale: .36, phase: 5.6 },
];
const MASK = [
  "radial-gradient(ellipse var(--reveal-rx) var(--reveal-ry) at calc(var(--reveal-x) + var(--reveal-bleed)) calc(var(--reveal-y) + var(--reveal-bleed)), #000 0%, #000 58%, transparent 100%)",
  ...PUFFS.map((_, index) =>
    `radial-gradient(circle var(--reveal-p${index}-r, 0px) at calc(var(--reveal-p${index}-x, 0px) + var(--reveal-bleed)) calc(var(--reveal-p${index}-y, 0px) + var(--reveal-bleed)), #000 0%, rgba(0,0,0,.85) 48%, transparent 100%)`
  ),
].join(", ");

const SIZES = "(min-width: 1024px) 540px, (min-width: 768px) 48vw, 85vw";
const MOBILE_DISABLED = (process.env.NEXT_PUBLIC_MOBILE_REVEAL ?? "").toLowerCase() === "disable";

export default function StatueHoverReveal() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const host = root?.closest<HTMLElement>(".gallery-sculpture");
    if (!root || !host) return;
    const interactionArea = host.closest<HTMLElement>(".gallery-hero") ?? host;

    const motion = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const coarse = window.matchMedia("(pointer: coarse)");
    const clamp = (value: number, limit: number) => Math.max(-limit, Math.min(limit, value));
    let bounds = host.getBoundingClientRect();
    let width = host.clientWidth;
    let height = host.clientHeight;
    let frame = 0;
    let lastFrame = 0;
    let lastMove = 0;
    let inside = false;
    let ready = false;
    let disposed = false;
    let touching: number | null = null;
    let deformation = 0;
    const point = { x: 0, y: 0, targetX: 0, targetY: 0, vx: 0, vy: 0, radius: 0 };
    const puffs = PUFFS.map(config => ({ ...config, x: 0, y: 0, radius: 0 }));
    const placePuffs = (x: number, y: number) => {
      for (const puff of puffs) { puff.x = x; puff.y = y; puff.radius = 0; }
    };
    const allowed = () => motion.matches && !(coarse.matches && MOBILE_DISABLED);

    const paint = () => {
      root.style.setProperty("--reveal-x", `${point.x.toFixed(2)}px`);
      root.style.setProperty("--reveal-y", `${point.y.toFixed(2)}px`);
      root.style.setProperty("--reveal-r", `${point.radius.toFixed(2)}px`);
      root.style.setProperty("--reveal-rx", `${(point.radius * (1 + deformation)).toFixed(2)}px`);
      root.style.setProperty("--reveal-ry", `${(point.radius * (1 - deformation)).toFixed(2)}px`);
      puffs.forEach((puff, index) => {
        root.style.setProperty(`--reveal-p${index}-x`, `${puff.x.toFixed(2)}px`);
        root.style.setProperty(`--reveal-p${index}-y`, `${puff.y.toFixed(2)}px`);
        root.style.setProperty(`--reveal-p${index}-r`, `${puff.radius.toFixed(2)}px`);
      });
    };

    const render = (now: number) => {
      const dt = Math.min((now - (lastFrame || now - 16.67)) / 1000, .04);
      lastFrame = now;
      // Time-based damping gives the same follow at 30, 60 and 120Hz.
      const follow = 1 - Math.exp(-dt / .075);
      point.x += (point.targetX - point.x) * follow;
      point.y += (point.targetY - point.y) * follow;
      const speed = Math.min(Math.hypot(point.vx, point.vy), 1500);
      const awake = inside && now - lastMove < 550;
      const base = Math.max(38, Math.min(56, width * .12));
      const maxRadius = Math.min(120, Math.min(width, height) * .28);
      const target = awake ? Math.min(base + speed * .11, maxRadius) : 0;
      point.radius += (target - point.radius) * (1 - Math.exp(-dt / (target > point.radius ? .085 : .17)));
      // A small liquid wobble changes the aperture, never the image pixels.
      deformation = Math.sin(now / 160) * Math.min(speed / 1200, 1) * .075;
      // Independently lagging puffs billow around the pointer, then dissolve
      // progressively. Their drift changes only the reveal mask.
      puffs.forEach((puff, index) => {
        const phase = now / (700 + index * 150) + puff.phase;
        const drift = point.radius * (.5 + index * .08);
        const tx = point.x + Math.cos(phase) * drift - clamp(point.vx * puff.lag * .18, 95);
        const ty = point.y + Math.sin(phase * .85) * drift - clamp(point.vy * puff.lag * .18, 95);
        const follow = 1 - Math.exp(-dt / puff.lag);
        puff.x += (tx - puff.x) * follow;
        puff.y += (ty - puff.y) * follow;
        const radius = awake ? point.radius * puff.scale * (1 + Math.sin(phase * 1.3) * .12) : 0;
        puff.radius += (radius - puff.radius) * (1 - Math.exp(-dt / (awake ? .12 : .2 + index * .035)));
      });
      const decay = Math.exp(-dt / .11);
      point.vx *= decay;
      point.vy *= decay;
      if (!awake && point.radius < .2 && puffs.every(puff => puff.radius < .2)) {
        point.radius = 0;
        placePuffs(point.x, point.y);
        paint();
        frame = 0;
        lastFrame = 0;
        root.dataset.active = "false";
        return;
      }
      paint();
      frame = requestAnimationFrame(render);
    };
    const start = () => {
      if (!frame && ready && allowed()) {
        root.dataset.active = "true";
        lastFrame = 0;
        frame = requestAnimationFrame(render);
      }
    };
    const end = () => {
      inside = false;
      touching = null;
      point.vx = point.vy = 0;
      if (point.radius > 0 || puffs.some(puff => puff.radius > 0)) start();
    };
    const reset = () => {
      end();
      cancelAnimationFrame(frame);
      frame = 0;
      lastFrame = 0;
      point.radius = 0;
      placePuffs(point.x, point.y);
      paint();
      root.dataset.active = "false";
      bounds = host.getBoundingClientRect();
      width = host.clientWidth;
      height = host.clientHeight;
    };
    const withinArtwork = (event: PointerEvent) =>
      event.clientX >= bounds.left && event.clientX <= bounds.right &&
      event.clientY >= bounds.top - 64 && event.clientY <= bounds.bottom;
    const locate = (event: PointerEvent) => ({
      x: (event.clientX - bounds.left) * width / Math.max(bounds.width, 1),
      y: (event.clientY - bounds.top) * height / Math.max(bounds.height, 1),
    });
    const begin = (event: PointerEvent) => {
      if (!allowed()) return;
      bounds = host.getBoundingClientRect();
      width = host.clientWidth;
      height = host.clientHeight;
      const next = locate(event);
      point.x = point.targetX = next.x;
      point.y = point.targetY = next.y;
      placePuffs(next.x, next.y);
      point.vx = point.vy = 0;
      lastMove = performance.now();
      inside = true;
      paint();
      start();
    };
    const down = (event: PointerEvent) => {
      if (event.pointerType !== "touch" || !withinArtwork(event)) return;
      touching = event.pointerId;
      begin(event);
    };
    const move = (event: PointerEvent) => {
      if (!allowed()) return;
      if (!withinArtwork(event)) { if (inside) end(); return; }
      if (!inside) {
        if (event.pointerType !== "touch") begin(event);
        return;
      }
      if (event.pointerType === "touch" && touching !== event.pointerId) return;
      const now = performance.now();
      const next = locate(event);
      if (!frame && point.radius === 0) {
        point.x = next.x;
        point.y = next.y;
        placePuffs(next.x, next.y);
      }
      const dt = Math.max((now - lastMove) / 1000, .008);
      point.vx = clamp((next.x - point.targetX) / dt, 1500);
      point.vy = clamp((next.y - point.targetY) / dt, 1500);
      point.targetX = next.x;
      point.targetY = next.y;
      lastMove = now;
      start();
    };
    const up = (event: PointerEvent) => {
      if (event.pointerType === "touch") end();
    };
    const visibility = () => { if (document.hidden) reset(); };
    const resize = new ResizeObserver(reset);
    resize.observe(host);
    const intersection = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) reset(); });
    intersection.observe(host);

    // Both assets use the same responsive URLs as the hero: decoding reuses
    // its requests and avoids a background-only flash on first interaction.
    Promise.all(Array.from(root.querySelectorAll("img"), image => image.decode().catch(() => undefined)))
      .then(() => { if (!disposed) { ready = true; if (inside) start(); } });

    interactionArea.addEventListener("pointerdown", down);
    interactionArea.addEventListener("pointermove", move, { passive: true });
    interactionArea.addEventListener("pointerleave", end);
    interactionArea.addEventListener("pointerup", up);
    interactionArea.addEventListener("pointercancel", end);
    window.addEventListener("scroll", reset, { passive: true });
    window.addEventListener("blur", reset);
    document.addEventListener("visibilitychange", visibility);
    motion.addEventListener("change", reset);
    coarse.addEventListener("change", reset);
    return () => {
      disposed = true;
      reset();
      resize.disconnect();
      intersection.disconnect();
      interactionArea.removeEventListener("pointerdown", down);
      interactionArea.removeEventListener("pointermove", move);
      interactionArea.removeEventListener("pointerleave", end);
      interactionArea.removeEventListener("pointerup", up);
      interactionArea.removeEventListener("pointercancel", end);
      window.removeEventListener("scroll", reset);
      window.removeEventListener("blur", reset);
      document.removeEventListener("visibilitychange", visibility);
      motion.removeEventListener("change", reset);
      coarse.removeEventListener("change", reset);
    };
  }, []);

  return (
    <div ref={rootRef} className="statue-reveal" aria-hidden="true" data-active="false" style={{
      "--reveal-bleed": "240px",
      "--reveal-x": "0px", "--reveal-y": "0px", "--reveal-r": "0px",
      "--reveal-rx": "0px", "--reveal-ry": "0px",
    } as React.CSSProperties}>
      <div className="statue-reveal-layer statue-reveal-layer--dark" style={{ maskImage: MASK, WebkitMaskImage: MASK }}>
        <div className="statue-reveal-stage">
          <div className="statue-reveal-art statue-reveal-art--dark">
            <CImage src="/images/statues-dark/medusa-dark-hair-v7.webp" alt="" fill sizes={SIZES} loading="eager" className="object-contain" />
          </div>
        </div>
      </div>
      <div className="statue-reveal-layer statue-reveal-layer--light" style={{ maskImage: MASK, WebkitMaskImage: MASK }}>
        <div className="statue-reveal-stage">
          <div className="statue-reveal-art statue-reveal-art--light">
            <CImage src="/images/hero-statue-clean.webp" alt="" fill sizes={SIZES} loading="eager" className="object-contain" />
          </div>
        </div>
      </div>
    </div>
  );
}
