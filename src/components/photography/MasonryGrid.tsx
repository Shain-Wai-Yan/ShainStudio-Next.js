'use client';

import { Photo } from '@/lib/strapi/photography';
import { PhotoCard } from './PhotoCard';

interface MasonryGridProps {
  photos: Photo[];
  onPhotoClick: (photo: Photo) => void;
}

/**
 * Pure CSS column masonry — no library, no JS measurement.
 *
 * How it works:
 *   `columns` makes the browser flow items top-to-bottom into N equal-width
 *   columns, automatically placing each item in the shortest column.
 *   This is literally the algorithm `react-masonry-css` tries to approximate
 *   but the browser does it perfectly using real rendered heights.
 *
 * `break-inside: avoid` on each card (via PhotoCard) prevents a single card
 * from being split across two columns.
 *
 * The responsive column counts match the previous breakpoints exactly so
 * nothing else needs to change.
 */
export function MasonryGrid({ photos, onPhotoClick }: MasonryGridProps) {
  return (
    <div
      className={[
        // CSS multi-column layout
        'columns-1',           // <480px  → 1 column
        'sm:columns-2',        // ≥640px  → 2 columns
        'lg:columns-3',        // ≥1024px → 3 columns
        'xl:columns-4',        // ≥1280px → 4 columns
        // Gap between columns (vertical gap is handled by mb-3 on PhotoCard)
        'gap-3',
      ].join(' ')}
    >
      {photos.map((photo, index) => (
        <PhotoCard
          key={photo.id}
          photo={photo}
          onClick={() => onPhotoClick(photo)}
          priority={index < 12}
        />
      ))}
    </div>
  );
}