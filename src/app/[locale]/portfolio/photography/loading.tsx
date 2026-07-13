/**
 * Instant skeleton for the photography route.
 *
 * The page render is dynamic (per-visitor shuffle), so this Suspense fallback
 * paints immediately while the photo data resolves — steady perceived
 * performance even when the CMS is slow to respond.
 */

// Staggered heights so the placeholder reads as a masonry grid.
const SKELETON_HEIGHTS = [
  220, 300, 180, 260, 340, 200, 280, 240,
  300, 190, 260, 320, 210, 290, 230, 270,
];

export default function Loading() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8 md:py-12">
        {/* Breadcrumb */}
        <div className="h-4 w-56 rounded bg-gray-200 dark:bg-gray-800 animate-pulse mb-8" />

        {/* Header */}
        <div className="mb-8 md:mb-10">
          <div className="h-9 md:h-12 w-64 sm:w-80 rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse mb-3" />
          <div className="h-4 w-full max-w-xl rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
        </div>

        {/* Search + filter bar */}
        <div className="mb-6 space-y-3">
          <div className="h-12 w-full rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
          <div className="flex flex-wrap gap-2">
            {[64, 88, 72, 96, 80].map((w, i) => (
              <div
                key={i}
                className="h-8 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse"
                style={{ width: w }}
              />
            ))}
          </div>
        </div>

        {/* Masonry placeholder */}
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-3">
          {SKELETON_HEIGHTS.map((h, i) => (
            <div
              key={i}
              className="break-inside-avoid mb-3 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse"
              style={{ height: h }}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
