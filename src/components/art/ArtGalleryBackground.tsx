'use client';

import React from 'react';

/**
 * ArtGalleryBackground
 *
 * A theme-aware, code-generated repeating mini pattern for the Pencil Art Gallery.
 * Built with an SVG architectural crosshair grid & micro-dot matrix.
 *
 * Inspired by modern design systems (Magic UI, Aceternity, Linear, Vercel).
 * - Scoped strictly to the gallery exhibition area (does NOT bleed behind sidebar).
 * - Repeating 36x36px geometric drafting cells with crisp '+' crosshairs at intersections and delicate center stipple dots.
 * - Soft radial vignette mask feathering out towards the perimeter.
 * - Light mode: refined graphite hairlines and charcoal crosshairs.
 * - Dark mode: luminous silver hairlines with warm champagne/amber accents.
 */
export function ArtGalleryBackground() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none -z-0 overflow-hidden select-none"
      style={{
        maskImage:
          'radial-gradient(ellipse 85% 80% at 50% 48%, black 40%, rgba(0,0,0,0.5) 75%, transparent 100%)',
        WebkitMaskImage:
          'radial-gradient(ellipse 85% 80% at 50% 48%, black 40%, rgba(0,0,0,0.5) 75%, transparent 100%)',
      }}
    >
      {/* Ambient Gallery Wall Glow (Warm parchment in light mode, deep indigo-amber in dark mode) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_65%_at_50%_48%,rgba(244,242,238,0.7),transparent)] dark:bg-[radial-gradient(ellipse_75%_65%_at_50%_48%,rgba(24,28,46,0.5),transparent)] transition-colors duration-500" />
      <div className="absolute inset-0 opacity-0 dark:opacity-100 bg-[radial-gradient(circle_450px_at_50%_48%,rgba(245,158,11,0.05),transparent)] transition-opacity duration-700" />

      {/* Repeating SVG Architectural Crosshair & Dot Grid */}
      <svg
        className="w-full h-full transition-opacity duration-700"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="gallery-crosshair-pattern"
            width="36"
            height="36"
            patternUnits="userSpaceOnUse"
            x="0"
            y="0"
          >
            {/* Fine Grid Hairline */}
            <path
              d="M 36 0 L 0 0 0 36"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.75"
              className="text-neutral-900/[0.08] dark:text-white/[0.08]"
            />

            {/* Micro Crosshair (+) at Intersection */}
            <path
              d="M -3.5 0 L 3.5 0 M 0 -3.5 L 0 3.5"
              stroke="currentColor"
              strokeWidth="1.2"
              className="text-neutral-900/[0.28] dark:text-amber-400/[0.35]"
            />

            {/* Delicate Stipple Dot at Cell Center */}
            <circle
              cx="18"
              cy="18"
              r="0.9"
              className="fill-neutral-900/[0.14] dark:fill-white/[0.18]"
            />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#gallery-crosshair-pattern)" />
      </svg>
    </div>
  );
}
