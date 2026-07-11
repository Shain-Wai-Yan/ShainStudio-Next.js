"use client";

import React, { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsapSetup";
import CImage from "@/components/ui/CImage";

/**
 * StatueHoverReveal
 * ------------------------------------------------------------------
 * A cursor-driven "liquid portal" that reveals the OPPOSITE theme's
 * statue through a chaotic, gooey, water-drop blob (inspired by the
 * Cuberto-built Lando Norris site).
 *
 *  - Light mode  →  blob reveals the DARK statue on a dark backdrop.
 *  - Dark mode   →  blob reveals the LIGHT statue on a light backdrop.
 *
 * Technique (no WebGL, no new deps):
 *  - A multi-blob CSS `mask-image` (several radial-gradients) whose
 *    centers/radii are driven by CSS variables. One primary blob
 *    follows the cursor; three satellites drift + pulse chaotically.
 *  - An SVG `feTurbulence` + `feDisplacementMap` filter on the parent
 *    wrapper warps the already-masked pixels into a rippling, watery
 *    edge (filter must sit on an ancestor so it runs AFTER the mask).
 *
 * The two theme portals are CSS-toggled (`block dark:hidden` /
 * `hidden dark:block`) exactly like the base statue in GsapHero, so
 * there is no `useTheme`, no hydration flicker, and both `.webp`
 * assets are already loaded by the base markup (zero extra network).
 */

// Union of four soft radial blobs. Kept in a JS constant (never a
// className) to stay clear of the styled-jsx + Turbopack multi-line
// className issue. Positions/radii come from inherited CSS variables.
const BLOB_MASK = [
  "radial-gradient(circle var(--r) at var(--mx) var(--my), #000 0%, #000 62%, rgba(0,0,0,0) 100%)",
  "radial-gradient(circle var(--r1) at calc(var(--mx) + var(--b1x)) calc(var(--my) + var(--b1y)), #000 0%, #000 60%, rgba(0,0,0,0) 100%)",
  "radial-gradient(circle var(--r2) at calc(var(--mx) + var(--b2x)) calc(var(--my) + var(--b2y)), #000 0%, #000 60%, rgba(0,0,0,0) 100%)",
  "radial-gradient(circle var(--r3) at calc(var(--mx) + var(--b3x)) calc(var(--my) + var(--b3y)), #000 0%, #000 60%, rgba(0,0,0,0) 100%)",
].join(", ");

const maskStyle: React.CSSProperties = {
  maskImage: BLOB_MASK,
  WebkitMaskImage: BLOB_MASK,
  maskRepeat: "no-repeat",
  WebkitMaskRepeat: "no-repeat",
};

// Initial (at-rest) CSS variables. All radii start at 0 so nothing is
// revealed until the pointer enters and GSAP grows the blob.
const initialVars = {
  "--mx": "180px",
  "--my": "210px",
  "--r": "0px",
  "--r1": "0px",
  "--r2": "0px",
  "--r3": "0px",
  "--b1x": "40px",
  "--b1y": "-30px",
  "--b2x": "-46px",
  "--b2y": "34px",
  "--b3x": "20px",
  "--b3y": "52px",
} as React.CSSProperties;

function RevealLayer() {
  const rootRef = useRef<HTMLDivElement>(null);
  const turbRef = useRef<SVGFETurbulenceElement>(null);
  const dispRef = useRef<SVGFEDisplacementMapElement>(null);

  useGSAP(
    () => {
      const el = rootRef.current;
      if (!el) return;

      const BASE_R = 56; // smallest visible radius (awake but slow / still)
      const MAX_R = 212; // largest radius on a fast flick
      const SPEED_TO_R = 2.6; // how strongly speed inflates the visible area
      const IDLE_HIDE = 0.4; // seconds of stillness before it dissolves
      const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
      const max0 = (v: number) => Math.max(0, v);

      // Animated state. GSAP mutates the drift/radius fields; velocity is
      // integrated by hand in the ticker. A single ticker callback writes
      // everything to CSS vars once per frame.
      const S = {
        mx: 180,
        my: 210,
        r: 0,
        m1: 0.6,
        m2: 0.5,
        m3: 0.45,
        // ambient random drift (animated by the loops below)
        d1x: 40,
        d1y: -30,
        d2x: -46,
        d2y: 34,
        d3x: 20,
        d3y: 52,
        // smoothed pointer velocity (drives the watery trail + ripple)
        velx: 0,
        vely: 0,
      };

      // Raw per-move velocity, decayed each frame so the trail retracts
      // once the pointer stops. `lastPx` starts null so the first move
      // doesn't register a huge jump.
      let rawVx = 0;
      let rawVy = 0;
      let lastPx: number | null = null;
      let lastPy: number | null = null;

      // Trail factors: satellites lag progressively further behind the
      // motion, elongating the goo into a water-drop along the direction
      // of travel.
      const TF = [0.72, 1.32, 1.95];

      // Awake = pointer moved recently; drives the speed-based radius in
      // the ticker. The idle timer flips it false so the blob dissolves.
      let awake = false;

      const render = () => {
        // Integrate + decay velocity.
        S.velx += (rawVx - S.velx) * 0.25;
        S.vely += (rawVy - S.vely) * 0.25;
        rawVx *= 0.82;
        rawVy *= 0.82;
        const speed = Math.hypot(S.velx, S.vely);
        const vx = clamp(S.velx, -90, 90);
        const vy = clamp(S.vely, -90, 90);

        // Visible area tracks speed: small when slow/still, large on a
        // fast flick. Grows quickly, contracts more gently.
        const targetR = awake ? BASE_R + Math.min(speed * SPEED_TO_R, MAX_R - BASE_R) : 0;
        // Grow fast; ease down gently while still hovering (watery), but
        // dissolve snappily once the idle timer has fired.
        const rLerp = targetR > S.r ? 0.24 : awake ? 0.1 : 0.19;
        S.r += (targetR - S.r) * rLerp;

        // Faster movement = more turbulent, watery displacement.
        if (dispRef.current) {
          dispRef.current.setAttribute("scale", String(16 + Math.min(speed * 2.3, 72)));
        }

        el.style.setProperty("--mx", S.mx + "px");
        el.style.setProperty("--my", S.my + "px");
        el.style.setProperty("--r", max0(S.r) + "px");
        el.style.setProperty("--r1", max0(S.r * S.m1) + "px");
        el.style.setProperty("--r2", max0(S.r * S.m2) + "px");
        el.style.setProperty("--r3", max0(S.r * S.m3) + "px");
        el.style.setProperty("--b1x", S.d1x - vx * TF[0] + "px");
        el.style.setProperty("--b1y", S.d1y - vy * TF[0] + "px");
        el.style.setProperty("--b2x", S.d2x - vx * TF[1] + "px");
        el.style.setProperty("--b2y", S.d2y - vy * TF[1] + "px");
        el.style.setProperty("--b3x", S.d3x - vx * TF[2] + "px");
        el.style.setProperty("--b3y", S.d3y - vy * TF[2] + "px");
      };

      gsap.ticker.add(render);

      // Smoothed cursor follow — the signature trailing lag.
      const xTo = gsap.quickTo(S, "mx", { duration: 0.45, ease: "power3.out" });
      const yTo = gsap.quickTo(S, "my", { duration: 0.45, ease: "power3.out" });

      // Chaos drivers: satellites perpetually drift + pulse so the goo
      // shape merges and splits. repeatRefresh + function values
      // re-randomise every cycle.
      const rnd = gsap.utils.random;
      const loops: gsap.core.Tween[] = [
        gsap.to(S, {
          d1x: () => rnd(15, 58),
          d1y: () => rnd(-56, 12),
          duration: () => rnd(1.6, 2.8),
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          repeatRefresh: true,
        }),
        gsap.to(S, {
          d2x: () => rnd(-64, -18),
          d2y: () => rnd(8, 60),
          duration: () => rnd(1.8, 3.2),
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          repeatRefresh: true,
        }),
        gsap.to(S, {
          d3x: () => rnd(-26, 48),
          d3y: () => rnd(22, 74),
          duration: () => rnd(1.4, 2.6),
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          repeatRefresh: true,
        }),
        gsap.to(S, {
          m1: () => rnd(0.45, 0.82),
          m2: () => rnd(0.4, 0.72),
          m3: () => rnd(0.35, 0.66),
          duration: () => rnd(1.2, 2.2),
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          repeatRefresh: true,
        }),
      ];

      // Idle shimmer: keep the turbulence noise itself alive over time
      // (the displacement *scale* is driven by pointer speed in render).
      if (turbRef.current) {
        loops.push(
          gsap.to(turbRef.current, {
            attr: { baseFrequency: 0.024 },
            duration: 7,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          })
        );
      }

      let idleCall: gsap.core.Tween | null = null;

      // Dissolve after a period of stillness (pointer still hovering).
      // The ticker eases the radius toward 0 once `awake` is false.
      const sleep = () => {
        awake = false;
      };

      // Re-form on movement and (re)arm the idle timer.
      const wake = () => {
        idleCall?.kill();
        idleCall = gsap.delayedCall(IDLE_HIDE, sleep);
        awake = true;
      };

      const onEnter = (e: PointerEvent) => {
        const rect = el.getBoundingClientRect();
        // Snap to the entry point so the blob doesn't sweep across.
        S.mx = e.clientX - rect.left;
        S.my = e.clientY - rect.top;
        xTo(S.mx);
        yTo(S.my);
        lastPx = S.mx;
        lastPy = S.my;
        rawVx = rawVy = 0;
        S.velx = S.vely = 0;
        awake = false;
        wake();
      };

      const onMove = (e: PointerEvent) => {
        const rect = el.getBoundingClientRect();
        const px = e.clientX - rect.left;
        const py = e.clientY - rect.top;
        if (lastPx !== null && lastPy !== null) {
          rawVx = px - lastPx;
          rawVy = py - lastPy;
        }
        lastPx = px;
        lastPy = py;
        xTo(px);
        yTo(py);
        wake();
      };

      const onLeave = () => {
        idleCall?.kill();
        awake = false;
        rawVx = rawVy = 0;
        lastPx = lastPy = null;
      };

      el.addEventListener("pointerenter", onEnter);
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);

      return () => {
        el.removeEventListener("pointerenter", onEnter);
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
        gsap.ticker.remove(render);
        loops.forEach((t) => t.kill());
        idleCall?.kill();
      };
    },
    { scope: rootRef }
  );

  return (
    <div ref={rootRef} className="absolute inset-0 z-[22] pointer-events-auto" style={initialVars}>
      {/* Filter wrapper — the goo/water filter runs on the already-masked children. */}
      <div className="absolute inset-0 pointer-events-none" style={{ filter: "url(#hero-reveal-goo)", WebkitFilter: "url(#hero-reveal-goo)" }}>
        {/* LIGHT MODE → reveals the DARK statue on a GOLD portal. */}
        <div className="block dark:hidden absolute inset-0 isolate" style={maskStyle}>
          <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 42%, #d9ad46 0%, #a9791f 52%, #6f4d12 100%)" }} />
          <div className="absolute inset-0 bg-[radial-gradient(circle,_#5c430e_1px,_transparent_1px)] bg-[length:16px_16px] opacity-40" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-[280px] h-[340px] scale-105">
              <CImage src="/images/hero-statue.webp" alt="" fill sizes="280px" loading="eager" className="object-contain mix-blend-screen" />
            </div>
          </div>
        </div>

        {/* DARK MODE → reveals the LIGHT statue. */}
        <div className="hidden dark:block absolute inset-0 isolate" style={maskStyle}>
          <div className="absolute inset-0 bg-gray-50" />
          <div className="absolute inset-0 bg-[radial-gradient(circle,_#e5e7eb_1px,_transparent_1px)] bg-[length:16px_16px] opacity-60" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-[280px] h-[340px] scale-105">
              <CImage src="/images/hero-statue-clean.webp" alt="" fill sizes="280px" loading="eager" className="object-contain mix-blend-multiply" />
            </div>
          </div>
        </div>
      </div>

      {/* Inline SVG filter: turbulence-driven displacement = liquid ripple. */}
      <svg aria-hidden="true" className="absolute" width="0" height="0" style={{ position: "absolute", width: 0, height: 0 }}>
        <defs>
          <filter id="hero-reveal-goo" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
            <feTurbulence ref={turbRef} type="fractalNoise" baseFrequency="0.014" numOctaves={2} seed={7} result="noise" />
            <feDisplacementMap ref={dispRef} in="SourceGraphic" in2="noise" scale={24} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}

/**
 * Gate: only mount the interactive layer on fine-pointer devices with
 * motion allowed. On touch / coarse pointer / reduced-motion we render
 * nothing (zero filter cost, hero untouched). Rendering `null` on the
 * server and first client paint keeps hydration clean.
 */
export default function StatueHoverReveal() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const fine = window.matchMedia("(pointer: fine)");
    const motionOk = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const update = () => setEnabled(fine.matches && motionOk.matches);
    update();
    fine.addEventListener("change", update);
    motionOk.addEventListener("change", update);
    return () => {
      fine.removeEventListener("change", update);
      motionOk.removeEventListener("change", update);
    };
  }, []);

  if (!enabled) return null;
  return <RevealLayer />;
}
