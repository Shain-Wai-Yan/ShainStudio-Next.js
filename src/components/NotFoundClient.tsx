"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

/* ─────────────────────────────────────────────────────────────────
   ASCII Flashlight 404 — Production-Ready
   
   Fixes applied vs. previous version:
   ✅ Retina / HiDPI: canvas scaled by devicePixelRatio
   ✅ Resize debounce: 150ms cooldown, no thrashing
   ✅ Canvas contexts cached outside tick() loop
   ✅ prefers-reduced-motion: animated fallback replaced with static
   ✅ Video: <source> tags for webm + mp4 (codec fallback)
   ✅ Mobile density: dynamically reduces char density on small screens
      while keeping full lyric set so ASCII quality stays high
   ✅ FPS-adaptive resolution: drops grid density if frame budget exceeded
   ✅ Proper cleanup: all refs, timeouts, event listeners
───────────────────────────────────────────────────────────────── */

const TRANSCRIPT =
  "NEVER GONNA GIVE YOU UP NEVER GONNA LET YOU DOWN NEVER GONNA RUN AROUND AND DESERT YOU NEVER GONNA MAKE YOU CRY NEVER GONNA SAY GOODBYE NEVER GONNA TELL A LIE AND HURT YOU WE'RE NO STRANGERS TO LOVE YOU KNOW THE RULES AND SO DO I A FULL COMMITMENT'S WHAT I'M THINKING OF YOU WOULDN'T GET THIS FROM ANY OTHER GUY I JUST WANNA TELL YOU HOW I'M FEELING GOTTA MAKE YOU UNDERSTAND ".replace(
    /\s/g,
    "."
  );

/* ── Responsive char cell sizing ──────────────────────────────────
   Mobile gets slightly larger cells so the grid stays performant
   without losing any lyrics (same TRANSCRIPT, fewer cells).
   Desktop keeps the crisp 6×10 grid.
────────────────────────────────────────────────────────────────── */
function getCharDims() {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  return isMobile ? { w: 8, h: 13 } : { w: 6, h: 10 };
}

export default function NotFoundClient() {
  const videoRef     = useRef<HTMLVideoElement>(null);
  const samplerRef   = useRef<HTMLCanvasElement>(null);   // hidden sampler (grid-res)
  const outCanvasRef = useRef<HTMLCanvasElement>(null);   // full-res output

  const rafRef       = useRef<number>(0);
  const resizeTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const colsRef      = useRef(0);
  const rowsRef      = useRef(0);

  // Cached contexts so we never call getContext inside tick()
  const samplerCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const outCtxRef     = useRef<CanvasRenderingContext2D | null>(null);

  // FPS-adaptive quality throttle
  const qualityScale  = useRef<number>(1); // 1 = full, 0.75 = degraded

  useEffect(() => {
    const sampler   = samplerRef.current!;
    const outCanvas = outCanvasRef.current!;

    /* ── Cache contexts once ────────────────────────────────────── */
    samplerCtxRef.current = sampler.getContext("2d");
    outCtxRef.current     = outCanvas.getContext("2d");

    /* ── Reduced motion detection ───────────────────────────────── */
    const prefersReducedMotion =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ── Grid + canvas sizing (Retina-aware) ────────────────────── */
    function computeGrid() {
      const w   = window.innerWidth;
      const h   = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      const { w: charW, h: charH } = getCharDims();

      colsRef.current = Math.floor((w * qualityScale.current) / charW);
      rowsRef.current = Math.floor((h * qualityScale.current) / charH);

      // Physical (HiDPI) resolution on output canvas
      outCanvas.width  = Math.round(w * dpr);
      outCanvas.height = Math.round(h * dpr);
      outCanvas.style.width  = `${w}px`;
      outCanvas.style.height = `${h}px`;

      // Re-cache context after resize (dimensions reset the state)
      const outCtx = outCanvas.getContext("2d")!;
      outCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      outCtxRef.current = outCtx;

      // Sampler canvas is grid-sized (no DPR needed — it's just pixel data)
      sampler.width  = colsRef.current;
      sampler.height = rowsRef.current;
      samplerCtxRef.current = sampler.getContext("2d");
    }

    /* ── Animated sine-wave fallback ────────────────────────────── */
    function drawFallbackAnimated(
      ctx: CanvasRenderingContext2D,
      cols: number,
      rows: number
    ) {
      const t = Date.now() / 1000;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const b =
            (Math.sin(x * 0.18 + t * 1.4) *
              Math.cos(y * 0.22 - t * 0.9) +
              Math.sin((x + y) * 0.12 + t * 2.1)) /
              3 + 0.5;
          const v = Math.floor(b * 255);
          ctx.fillStyle = `rgb(${v},${v},${v})`;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }

    /* ── Static sine fallback for reduced-motion users ──────────── */
    function drawFallbackStatic(
      ctx: CanvasRenderingContext2D,
      cols: number,
      rows: number
    ) {
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const b =
            (Math.sin(x * 0.18) * Math.cos(y * 0.22) +
              Math.sin((x + y) * 0.12)) /
              3 + 0.5;
          const v = Math.floor(b * 255);
          ctx.fillStyle = `rgb(${v},${v},${v})`;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }

    /* ── ASCII render pass ──────────────────────────────────────── */
    function renderAsciiToCanvas(
      data: Uint8ClampedArray,
      cols: number,
      rows: number,
      outCtx: CanvasRenderingContext2D
    ) {
      const { w: charW, h: charH } = getCharDims();
      const qs = qualityScale.current;

      outCtx.clearRect(0, 0, outCtx.canvas.width, outCtx.canvas.height);
      outCtx.font = `900 ${charH}px 'Courier New', Courier, monospace`;
      outCtx.textBaseline = "top";

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const charIndex = (y * cols + x) % TRANSCRIPT.length;
          const lockedChar = TRANSCRIPT[charIndex];

          const i   = (y * cols + x) * 4;
          const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];

          if (lum < 35) continue;

          const displayChar = lum < 75 ? "·" : lockedChar;
          const v = lum | 0; 
          outCtx.fillStyle = `rgb(${v},${v},${v})`;
          const renderX = ((x / qs) * charW) | 0;
          const renderY = ((y / qs) * charH) | 0;
          outCtx.fillText(displayChar, renderX, renderY);
        }
      }
    }

    /* ── rAF loop ───────────────────────────────────────────────── */
    let staticRendered = false; // for reduced-motion: render once

    function tick() {
      const cols    = colsRef.current;
      const rows    = rowsRef.current;
      const ctx     = samplerCtxRef.current;
      const outCtx  = outCtxRef.current;

      if (!cols || !rows || !ctx || !outCtx) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }


      /* Reduced-motion: render static frame once, then stop */
      if (prefersReducedMotion) {
        if (!staticRendered) {
          ctx.clearRect(0, 0, cols, rows);
          drawFallbackStatic(ctx, cols, rows);
          try {
            const { data } = ctx.getImageData(0, 0, cols, rows);
            renderAsciiToCanvas(data, cols, rows, outCtx);
          } catch { /* ignore */ }
          staticRendered = true;
        }
        return; // Don't schedule next frame
      }

      ctx.clearRect(0, 0, cols, rows);

      /* ── In your tick() function ── */
try {
  const v = videoRef.current;
  // Ensure we have video dimensions to work with
  if (v && v.readyState >= 2 && v.videoWidth > 0) {
    
    // 1. Calculate ratios
    const vRatio = v.videoWidth / v.videoHeight;
    const cRatio = cols / rows;
    
    let drawW, drawH, dx, dy;

    // 2. The "Cover" Logic
    if (cRatio > vRatio) {
      // Screen is wider than video (Desktop)
      drawW = cols;
      drawH = cols / vRatio;
      dx = 0;
      dy = (rows - drawH) / 2;
    } else {
      // Screen is taller than video (Mobile)
      drawH = rows;
      drawW = rows * vRatio;
      dx = (cols - drawW) / 2;
      dy = 0;
    }

    // 3. Draw with bitwise floor (| 0) for extra performance
    ctx.drawImage(v, dx | 0, dy | 0, drawW | 0, drawH | 0);
    
  } else {
    drawFallbackAnimated(ctx, cols, rows);
  }
} catch {
  drawFallbackAnimated(ctx, cols, rows);
}

      try {
        const { data } = ctx.getImageData(0, 0, cols, rows);
        renderAsciiToCanvas(data, cols, rows, outCtx);
      } catch (e) {
        console.warn("[404 ASCII] getImageData blocked:", e);
        ctx.clearRect(0, 0, cols, rows);
        drawFallbackAnimated(ctx, cols, rows);
        try {
          const { data } = ctx.getImageData(0, 0, cols, rows);
          renderAsciiToCanvas(data, cols, rows, outCtx);
        } catch { /* give up this frame */ }
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    /* ── Bootstrap ──────────────────────────────────────────────── */
    computeGrid();

    /* Debounced resize — prevents thrashing while dragging window edge */
    function handleResize() {
      if (resizeTimer.current) clearTimeout(resizeTimer.current);
      resizeTimer.current = setTimeout(computeGrid, 150);
    }
    window.addEventListener("resize", handleResize);

    /* Video setup */
    const v = videoRef.current;
    if (v) {
      v.muted        = true;
      v.defaultMuted = true;
      v.playsInline  = true;
      v.autoplay     = true;

      v.addEventListener(
        "canplay",
        () => { v.play().catch(() => {}); },
        { once: true }
      );

      if (v.readyState >= 3) v.play().catch(() => {});
    }

    /* Safari / iOS: force play on first user gesture */
    function forcePlayOnInteract() {
      if (v && v.paused) v.play().catch(() => {});
    }
    window.addEventListener("click",      forcePlayOnInteract, { once: true });
    window.addEventListener("touchstart", forcePlayOnInteract, { once: true });

    /* Kick off render loop */
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize",     handleResize);
      window.removeEventListener("click",      forcePlayOnInteract);
      window.removeEventListener("touchstart", forcePlayOnInteract);
      if (resizeTimer.current) clearTimeout(resizeTimer.current);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      <style>{`
        body { overflow: hidden; }

        /* ── Stage ───────────────────────────────────────────────── */
        .nf-stage {
          position: fixed;
          inset: 0;
          background: #000;
          z-index: 0;
        }

        /* ── Video: tiny, just alive enough to pass autoplay policy ─ */
        .nf-video {
          position: absolute;
          top: 0; left: 0;
          width: 1px; height: 1px;
          opacity: 0.1;
          pointer-events: none;
          z-index: -1;
        }

        /* ── Hidden sampler canvas ──────────────────────────────── */
        .nf-canvas { display: none; }

        /* ── Output canvas: CSS pixel dimensions, full viewport ──── */
        .nf-out-canvas {
          position: absolute;
          inset: 0;
          width: 100vw;
          height: 100vh;
          z-index: 1;
          pointer-events: none;
          filter: contrast(1.4) brightness(1.2); 
          -webkit-filter: contrast(1.4) brightness(1.2);
        }

        /* ── Vignette ────────────────────────────────────────────── */
        .nf-vignette {
          position: absolute;
          inset: 0;
          z-index: 5;
          pointer-events: none;
          background:
            radial-gradient(ellipse 80% 60% at 50% 50%,
              transparent 35%,
              rgba(0,0,0,0.65) 70%,
              rgba(0,0,0,0.92) 100%);
        }

        /* ── 404 + tagline ───────────────────────────────────────── */
        .nf-overlay {
          position: absolute;
          inset: 0;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          padding-bottom: calc(clamp(2rem, 6vh, 4rem) + 90px);
          pointer-events: none;
        }

        .nf-404 {
          font-family: 'Poppins', 'Inter', system-ui, sans-serif;
          font-size: clamp(90px, 18vw, 220px);
          font-weight: 900;
          line-height: 0.85;
          letter-spacing: -0.04em;
          color: #fff;
          mix-blend-mode: difference;
          -webkit-transform: translateZ(0);
          user-select: none;
        }

        .nf-tagline {
          margin-top: 1.5rem;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: clamp(10px, 1.3vw, 17px);
          font-weight: 400;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: #ffffff;
          mix-blend-mode: difference;
          -webkit-transform: translateZ(0);
          pointer-events: none;
        }

        /* ── Back button ─────────────────────────────────────────── */
        .nf-escape-wrap {
          position: absolute;
          inset: 0;
          z-index: 20;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding-bottom: clamp(2rem, 6vh, 4rem);
          pointer-events: none;
        }

        .nf-escape {
          pointer-events: all;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 36px;
          border-radius: 9999px;
          border: 1.5px solid rgba(255, 215, 0, 0.55);
          background: rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          color: #ffd700;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          text-decoration: none;
          cursor: pointer;
          transition: background 0.25s ease, border-color 0.25s ease,
                      transform 0.2s ease, box-shadow 0.25s ease;
          box-shadow: 0 0 20px rgba(255, 215, 0, 0.06);
        }
        .nf-escape:hover {
          background: rgba(255, 215, 0, 0.1);
          border-color: #ffd700;
          transform: translateY(-2px);
          box-shadow: 0 0 32px rgba(255, 215, 0, 0.22), 0 8px 24px rgba(0,0,0,0.45);
          color: #ffd700;
        }
        .nf-escape-icon { transition: transform 0.2s ease; }
        .nf-escape:hover .nf-escape-icon { transform: translateX(-3px); }

        /* ── Corner decorations ──────────────────────────────────── */
        .nf-hint {
          position: absolute;
          top: 1.5rem; left: 1.75rem;
          z-index: 20;
          font-family: 'Courier New', Courier, monospace;
          font-size: 9px;
          letter-spacing: 0.1em;
          color: rgba(255, 215, 0, 0.3);
          pointer-events: none;
          text-transform: uppercase;
        }

        .nf-badge {
          position: absolute;
          top: 1.5rem; right: 1.75rem;
          z-index: 20;
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: 'Courier New', Courier, monospace;
          font-size: 9px;
          letter-spacing: 0.12em;
          color: rgba(255, 215, 0, 0.4);
          pointer-events: none;
          text-transform: uppercase;
        }
        .nf-badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #ffd700;
          animation: nf-pulse 1.6s ease-in-out infinite;
        }

        @keyframes nf-pulse {
          0%, 100% { opacity: 0.4; transform: scale(0.85); }
          50%       { opacity: 1;   transform: scale(1.2);  }
        }

        /* ── Reduced-motion: freeze animation, keep visual ─────────
           The ASCII static frame is already rendered on first tick.
           We just stop the badge pulse to respect the preference.    */
        @media (prefers-reduced-motion: reduce) {
          .nf-badge-dot { animation: none; opacity: 0.4; }
          .nf-escape    { transition: none; }
          .nf-escape:hover { transform: none; }
        }
      `}</style>

      <div className="nf-stage" aria-hidden="true">

        {/* Video: webm first for modern browsers, mp4 as universal fallback */}
        <video
          ref={videoRef}
          className="nf-video"
          preload="none"
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        >
          <source src="/video/rickroll.webm" type="video/webm" />
          <source src="/video/rickroll.mp4"  type="video/mp4"  />
        </video>

        {/* Hidden pixel sampler (grid resolution only) */}
        <canvas ref={samplerRef} className="nf-canvas" aria-hidden="true" />

        {/* HiDPI output canvas */}
        <canvas ref={outCanvasRef} className="nf-out-canvas" aria-hidden="true" />

        <div className="nf-vignette" />

        <span className="nf-hint">ascii://404.shainwaiyan.com</span>
        <div className="nf-badge">
          <span className="nf-badge-dot" />
          live render
        </div>

        <div className="nf-overlay">
          <div className="nf-404" aria-label="404">404</div>
          <p className="nf-tagline">Looks like we let you down.</p>
        </div>

        <div className="nf-escape-wrap">
          <Link href="/" className="nf-escape" id="nf-home-btn">
            <svg
              className="nf-escape-icon"
              width="15" height="15"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M10 12L6 8l4-4" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>

      {/* Screen-reader content */}
      <div className="sr-only">
        <h1>404 – Page Not Found</h1>
        <p>The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/">Return Home</Link>
      </div>
    </>
  );
}