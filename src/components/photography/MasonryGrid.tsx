'use client';

import Masonry from 'react-masonry-css';
import { Photo } from '@/lib/strapi/photography';
import { PhotoCard } from './PhotoCard';

interface MasonryGridProps {
  photos: Photo[];
  onPhotoClick: (photo: Photo) => void;
}

/**
 * Masonry via react-masonry-css.
 *
 * Why not CSS `columns`: `columns` re-balances the WHOLE grid whenever items
 * are appended, so already-visible photos jump between columns during infinite
 * scroll. react-masonry-css assigns each item to a column by its index
 * (round-robin), so a new batch only extends the bottom of each column —
 * existing photos never move.
 *
 * react-masonry-css uses `windowWidth <= key` semantics, so these upper-bound
 * keys mirror the previous Tailwind breakpoints exactly:
 *   <640 → 1 · 640–1023 → 2 · 1024–1279 → 3 · ≥1280 → 4
 *
 * Gutter + column CSS lives in globals.css (`.photo-masonry-grid*`).
 */
const breakpointCols = {
  default: 4,
  1279: 3,
  1023: 2,
  639: 1,
};

export function MasonryGrid({ photos, onPhotoClick }: MasonryGridProps) {
  return (
    <Masonry
      breakpointCols={breakpointCols}
      className="photo-masonry-grid"
      columnClassName="photo-masonry-grid_column"
    >
      {photos.map((photo, index) => (
        <PhotoCard
          key={photo.id}
          photo={photo}
          onClick={() => onPhotoClick(photo)}
          // Only the top row (one per column) is above the fold — keep the
          // eager/priority set small so they don't contend for bandwidth.
          priority={index < 5}
        />
      ))}
    </Masonry>
  );
}
