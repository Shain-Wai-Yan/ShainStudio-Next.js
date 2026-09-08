'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import type { Photo } from '@/lib/strapi/photography';
import { PhotoCard } from './PhotoCard';

interface MasonryGridProps { photos: Photo[]; onPhotoClick: (photo: Photo) => void }
const GAP = 12;
const columnsForWidth = (width: number) => width < 640 ? 1 : width < 1024 ? 2 : width < 1280 ? 3 : 4;

export function MasonryGrid({ photos, onPhotoClick }: MasonryGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [scrollMargin, setScrollMargin] = useState(0);
  const columns = columnsForWidth(width);
  const columnWidth = Math.max(1, (width - GAP * (columns - 1)) / columns);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const update = () => {
      setWidth(element.clientWidth);
      setScrollMargin(element.getBoundingClientRect().top + window.scrollY);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    window.addEventListener('resize', update, { passive: true });
    return () => { observer.disconnect(); window.removeEventListener('resize', update); };
  }, []);

  const estimates = useMemo(() => photos.map((photo) => {
    const imageWidth = photo.width ?? 600;
    const imageHeight = photo.height ?? 400;
    return Math.max(120, Math.round(columnWidth * imageHeight / imageWidth));
  }), [photos, columnWidth]);

  const virtualizer = useWindowVirtualizer({
    count: photos.length,
    lanes: columns,
    gap: GAP,
    overscan: columns * 6,
    scrollMargin,
    estimateSize: (index) => estimates[index] ?? 240,
    getItemKey: (index) => photos[index]?.documentId ?? photos[index]?.id ?? index,
  });

  return (
    <div ref={containerRef} className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
      {width > 0 && virtualizer.getVirtualItems().map((item) => {
        const photo = photos[item.index];
        if (!photo) return null;
        return (
          <div
            key={item.key}
            ref={virtualizer.measureElement}
            data-index={item.index}
            className="absolute left-0 top-0"
            style={{ width: columnWidth, transform: `translate3d(${item.lane * (columnWidth + GAP)}px, ${item.start - scrollMargin}px, 0)` }}
          >
            <PhotoCard photo={photo} onClick={() => onPhotoClick(photo)} priority={item.index === 0} />
          </div>
        );
      })}
    </div>
  );
}
