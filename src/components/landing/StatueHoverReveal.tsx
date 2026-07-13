"use client";

import React, { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsapSetup";
import CImage from "@/components/ui/CImage";

/**
 * StatueHoverReveal
 * ------------------------------------------------------------------
 * A pointer-driven "liquid portal" that reveals the OPPOSITE theme's
 * statue through a chaotic, gooey, water-drop blob (inspired by the
 * Cuberto-built Lando Norris site). Desktop drives it by hover; touch
 * drives it by press-drag-lift (the card owns the gesture via
 * `touch-action: none`, so a finger paints the portal in any direction).
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

// Memoised so a re-render of the parent gate (e.g. a matchMedia change)
// never re-runs this subtree — which would re-apply the JSX `filter` style
// and clobber the imperative on/off toggling in the ticker.
const RevealLayer = React.memo(function RevealLayer() {
  const rootRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const turbRef = useRef<SVGFETurbulenceElement>(null);
  const dispRef = useRef<SVGFEDisplacementMapElement>(null);

  useGSAP(
    () => {
      const el = rootRef.current;
      if (!el) return;

      // WebKit (desktop Safari + every iOS browser) runs the SVG water filter
      // on the CPU and can't sustain the full effect, so it gets a calmer,
      // lighter variant: static noise, 1 octave, gentler ripple, slower drift.
      // `vendor` is the most reliable WebKit signal (Safari = "Apple Computer,
      // Inc."; Chrome = "Google Inc."). Cast past its lib.dom deprecation tag.
      const vendor = typeof navigator !== "undefined" ? (navigator as { vendor?: string }).vendor : "";
      const isWebKit = vendor === "Apple Computer, Inc.";

      const BASE_R = 56; // smallest visible radius (awake but slow / still)
      const MAX_R = 212; // largest radius on a fast flick
      const SPEED_TO_R = isWebKit ? 2.0 : 2.6; // how strongly speed inflates the area
      const IDLE_HIDE = 0.4; // seconds of stillness before it dissolves
      // Displacement (watery warp) — gentler on WebKit to keep it calm & cheap.
      const DISP_BASE = isWebKit ? 12 : 16;
      const DISP_K = isWebKit ? 1.6 : 2.3;
      const DISP_MAX = isWebKit ? 46 : 72;
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

      const fw = filterRef.current;

      // Chaos drivers: satellites perpetually drift + pulse so the goo
      // shape merges and splits. repeatRefresh + function values
      // re-randomise every cycle. Paused while idle (see setActive) so an
      // untouched hero spends zero CPU.
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

      // Calmer chaos on WebKit: one octave, static noise (the shimmer is
      // skipped in the render loop), and slower-drifting satellites.
      if (isWebKit) {
        turbRef.current?.setAttribute("numOctaves", "1");
        loops.forEach((l) => l.timeScale(0.7));
      }

      // Active = SVG goo filter running + chaos loops playing. Once the
      // portal has fully dissolved we flip this off: the (Safari-expensive)
      // filter drops to `none` and the loops pause, so an idle hero costs
      // nothing and Safari stops re-rasterising a filter layer every frame.
      let active = false;
      const setActive = (on: boolean) => {
        if (on === active) return;
        active = on;
        if (fw) {
          const f = on ? "url(#hero-reveal-goo)" : "none";
          fw.style.filter = f;
          fw.style.setProperty("-webkit-filter", f);
          fw.style.willChange = on ? "filter" : "auto";
        }
        for (const l of loops) {
          if (on) l.resume();
          else l.pause();
        }
      };

      // Commit the twelve mask CSS vars in a single pass.
      const writeVars = (vx: number, vy: number) => {
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

      // Cap the heavy mask/filter writes at ~60fps so a 120Hz ProMotion
      // Safari doesn't recompute the displacement filter twice as often as
      // the eye needs. Velocity + radius still integrate every tick (cheap).
      // The turbulence shimmer refreshes even less often (see below).
      const MIN_FRAME_MS = 15;
      const SHIMMER_MS = 66; // ~15fps baseFrequency refresh
      const TWO_PI = Math.PI * 2;
      let lastWrite = 0;
      let lastShim = 0;
      let lastTick = 0; // for frame-rate-independent stepping
      let lastScale = -1;

      const render = () => {
        if (!active) return;
        const now = performance.now();

        // Frame-rate-independent step. `dr` = how long this frame took vs a
        // 60fps baseline, so the smoothing/decay/growth below advance by real
        // elapsed time. This is what stops Safari's dropped frames from making
        // the motion chaotic: the blob covers the same ground per second at
        // 30fps as at 120fps. Clamped so a tab-away / resume can't jump.
        const dt = lastTick ? now - lastTick : 16.667;
        lastTick = now;
        const dr = Math.min(3, Math.max(0.1, dt / 16.667));

        // Living-water shimmer — skipped on WebKit, which keeps STATIC noise
        // (re-seeding feTurbulence per frame is the op Safari can't afford).
        // Elsewhere the ~14s cycle refreshes ~15fps: identical to per-frame,
        // but the browser reuses the cached noise on the frames between.
        if (!isWebKit && turbRef.current && now - lastShim >= SHIMMER_MS) {
          lastShim = now;
          const bf = 0.019 - 0.005 * Math.cos((now / 14000) * TWO_PI); // 0.014↔0.024
          turbRef.current.setAttribute("baseFrequency", bf.toFixed(4));
        }

        // Integrate + decay velocity, normalised to frame time.
        const smooth = 1 - Math.pow(0.75, dr); // ≙ *0.25 at 60fps
        S.velx += (rawVx - S.velx) * smooth;
        S.vely += (rawVy - S.vely) * smooth;
        const decay = Math.pow(0.82, dr); // ≙ *0.82 at 60fps
        rawVx *= decay;
        rawVy *= decay;
        const speed = Math.hypot(S.velx, S.vely);
        const vx = clamp(S.velx, -90, 90);
        const vy = clamp(S.vely, -90, 90);

        // Visible area tracks speed: small when slow/still, large on a
        // fast flick. Grows quickly, contracts more gently.
        const targetR = awake ? BASE_R + Math.min(speed * SPEED_TO_R, MAX_R - BASE_R) : 0;
        const rLerpBase = targetR > S.r ? 0.24 : awake ? 0.1 : 0.19;
        const rLerp = 1 - Math.pow(1 - rLerpBase, dr);
        S.r += (targetR - S.r) * rLerp;

        // Fully dissolved and idle → collapse once, then drop the filter.
        if (!awake && S.r < 0.5) {
          S.r = 0;
          writeVars(0, 0);
          setActive(false);
          return;
        }

        // Cap the heavy mask writes at ~60fps (velocity already integrated).
        if (now - lastWrite < MIN_FRAME_MS) return;
        lastWrite = now;

        // Faster movement = more turbulent, watery displacement (gentler on
        // WebKit). Only touch the attribute when the rounded value changes.
        const nextScale = Math.round(DISP_BASE + Math.min(speed * DISP_K, DISP_MAX));
        if (dispRef.current && nextScale !== lastScale) {
          dispRef.current.setAttribute("scale", String(nextScale));
          lastScale = nextScale;
        }

        writeVars(vx, vy);
      };

      gsap.ticker.add(render);

      // Smoothed cursor follow — the signature trailing lag.
      const xTo = gsap.quickTo(S, "mx", { duration: 0.45, ease: "power3.out" });
      const yTo = gsap.quickTo(S, "my", { duration: 0.45, ease: "power3.out" });

      // Start fully idle: freeze the loops and drop the filter until the
      // first pointer interaction wakes the portal.
      loops.forEach((l) => l.pause());
      if (fw) {
        fw.style.filter = "none";
        fw.style.setProperty("-webkit-filter", "none");
        fw.style.willChange = "auto";
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
        setActive(true);
      };

      // Begin a reveal (mouse hover-enter OR touch press). Snap to the
      // entry/press point so the blob doesn't sweep across, then wake.
      const begin = (e: PointerEvent) => {
        const rect = el.getBoundingClientRect();
        S.mx = e.clientX - rect.left;
        S.my = e.clientY - rect.top;
        xTo(S.mx);
        yTo(S.my);
        lastPx = S.mx;
        lastPy = S.my;
        rawVx = rawVy = 0;
        S.velx = S.vely = 0;
        lastTick = 0; // fresh frame clock so the resume step isn't a catch-up
        awake = false;
        wake();
      };

      // Follow the pointer and integrate raw velocity for the watery trail.
      const move = (e: PointerEvent) => {
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

      // End a reveal (mouse hover-leave OR touch lift/cancel). The ticker
      // eases the radius to 0 once `awake` is false, so the blob dissolves.
      const end = () => {
        idleCall?.kill();
        awake = false;
        rawVx = rawVy = 0;
        lastPx = lastPy = null;
      };

      // Mouse/pen reveal on hover; touch reveals on press-drag-lift. The
      // touch-only guards on up/cancel are critical: without them a desktop
      // mouse-up would dissolve the portal on every click.
      const onEnter = (e: PointerEvent) => begin(e);
      const onDown = (e: PointerEvent) => {
        if (e.pointerType !== "touch") return;
        try {
          el.setPointerCapture(e.pointerId);
        } catch {
          // capture unsupported — moves still fire while the finger is on the card
        }
        begin(e);
      };
      const onMove = (e: PointerEvent) => move(e);
      const onLeave = () => end();
      const onUp = (e: PointerEvent) => {
        if (e.pointerType !== "touch") return;
        try {
          el.releasePointerCapture(e.pointerId);
        } catch {
          // pointer was not captured — non-fatal
        }
        end();
      };

      el.addEventListener("pointerenter", onEnter);
      el.addEventListener("pointerdown", onDown);
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
      el.addEventListener("pointerup", onUp);
      el.addEventListener("pointercancel", onUp);

      return () => {
        el.removeEventListener("pointerenter", onEnter);
        el.removeEventListener("pointerdown", onDown);
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
        el.removeEventListener("pointerup", onUp);
        el.removeEventListener("pointercancel", onUp);
        gsap.ticker.remove(render);
        loops.forEach((t) => t.kill());
        idleCall?.kill();
      };
    },
    { scope: rootRef }
  );

  return (
    <div
      ref={rootRef}
      className="absolute inset-0 z-[22] pointer-events-auto"
      style={{
        ...initialVars,
        // Own touch gestures so a drag drives the portal instead of
        // scrolling / selecting / raising a long-press callout. Swipes that
        // start on the card won't scroll the page (scroll starts below it).
        touchAction: "none",
        WebkitUserSelect: "none",
        userSelect: "none",
        WebkitTouchCallout: "none",
      }}
    >
      {/* Filter wrapper — the goo/water filter runs on the already-masked children. */}
      <div ref={filterRef} className="absolute inset-0 pointer-events-none" style={{ filter: "url(#hero-reveal-goo)", WebkitFilter: "url(#hero-reveal-goo)" }}>
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
            {/* Chrome/Firefox: 2 octaves + a slow ~15fps baseFrequency
                shimmer (noise stays cached between refreshes). WebKit/Safari:
                the render loop drops this to 1 octave with STATIC noise — the
                per-frame reseed is exactly what its CPU filter can't afford. */}
            <feTurbulence ref={turbRef} type="fractalNoise" baseFrequency="0.014" numOctaves={2} seed={7} result="noise" />
            <feDisplacementMap ref={dispRef} in="SourceGraphic" in2="noise" scale={24} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
    </div>
  );
});

/**
 * Feature flag (build-time, inlined by Next.js): set
 *   NEXT_PUBLIC_MOBILE_REVEAL="disable"
 * in `.env.local` to turn the reveal OFF on touch / coarse-pointer devices
 * (phones, most tablets). Any other value — or leaving it unset — keeps it ON.
 * Desktop (fine pointer) is never affected by this flag. Changing it requires
 * a rebuild, since NEXT_PUBLIC_ vars are baked into the client bundle.
 */
const MOBILE_REVEAL_DISABLED =
  (process.env.NEXT_PUBLIC_MOBILE_REVEAL ?? "").toLowerCase() === "disable";

/**
 * Gate: mount the interactive layer on fine AND coarse pointers whenever
 * motion is allowed. Fine pointers drive it by hover; touch drives it by
 * press-drag-lift (see the pointer handlers above). Reduced-motion always
 * renders nothing; coarse pointers additionally honour the env flag above.
 * Rendering `null` on the server and first client paint keeps hydration clean.
 */
export default function StatueHoverReveal() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const motionOk = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const coarse = window.matchMedia("(pointer: coarse)");
    const update = () => {
      // Reduced motion → off everywhere. Coarse (mobile) → off when the flag
      // disables it. Fine pointer (desktop) ignores the flag.
      setEnabled(motionOk.matches && !(coarse.matches && MOBILE_REVEAL_DISABLED));
    };
    update();
    motionOk.addEventListener("change", update);
    coarse.addEventListener("change", update);
    return () => {
      motionOk.removeEventListener("change", update);
      coarse.removeEventListener("change", update);
    };
  }, []);

  if (!enabled) return null;
  return <RevealLayer />;
}
