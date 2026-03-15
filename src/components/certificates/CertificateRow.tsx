'use client';

import { useRef, useEffect } from 'react';
import { CertificateCard } from './CertificateCard';

interface RowCertificate {
  id: number;
  title: string;
  issuedBy: string;
  imageUrl: string;
}

interface CertificateRowProps {
  certificates: RowCertificate[];
  direction: 'left' | 'right';
  onCertificateClick: (certificateId: number) => void;
}

export function CertificateRow({
  certificates,
  direction,
  onCertificateClick,
}: CertificateRowProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isPausedRef = useRef(false);
  const isDraggingRef = useRef(false);
  const positionRef = useRef(0);
  const startXRef = useRef(0);
  const dragStartPosRef = useRef(0);
  const dragDistanceRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const speed = direction === 'left' ? -0.8 : 0.8;

  const tripled = [...certificates, ...certificates, ...certificates];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    requestAnimationFrame(() => {
      const single = track.scrollWidth / 3;
      positionRef.current = -single;
      track.style.transform = `translateX(${positionRef.current}px)`;

      const animate = () => {
        if (!isPausedRef.current && !isDraggingRef.current) {
          positionRef.current += speed;
          const s = track.scrollWidth / 3;
          if (positionRef.current <= -s * 2) positionRef.current += s;
          else if (positionRef.current >= 0) positionRef.current -= s;
          track.style.transform = `translateX(${positionRef.current}px)`;
        }
        animationRef.current = requestAnimationFrame(animate);
      };

      animationRef.current = requestAnimationFrame(animate);
    });

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [speed]);

  const onMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    dragStartPosRef.current = positionRef.current;
    dragDistanceRef.current = 0;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const delta = e.clientX - startXRef.current;
    dragDistanceRef.current = Math.abs(delta);
    positionRef.current = dragStartPosRef.current + delta;
    if (trackRef.current) trackRef.current.style.transform = `translateX(${positionRef.current}px)`;
  };

  const onMouseUp = () => { isDraggingRef.current = false; };

  const onTouchStart = (e: React.TouchEvent) => {
    isDraggingRef.current = true;
    isPausedRef.current = true;
    startXRef.current = e.touches[0].clientX;
    dragStartPosRef.current = positionRef.current;
    dragDistanceRef.current = 0;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    const delta = e.touches[0].clientX - startXRef.current;
    dragDistanceRef.current = Math.abs(delta);
    positionRef.current = dragStartPosRef.current + delta;
    if (trackRef.current) trackRef.current.style.transform = `translateX(${positionRef.current}px)`;
  };

  const onTouchEnd = () => {
    isDraggingRef.current = false;
    isPausedRef.current = false;
  };

  return (
    <div
      className="w-full overflow-hidden cursor-grab active:cursor-grabbing select-none py-4"
      onMouseEnter={() => { isPausedRef.current = true; }}
      onMouseLeave={() => { isPausedRef.current = false; isDraggingRef.current = false; }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div
        ref={trackRef}
        className="flex gap-5 will-change-transform"
        style={{ width: 'max-content' }}
      >
        {tripled.map((cert, index) => (
          <div
            key={`${cert.id}-${index}`}
            className="flex-shrink-0"
            style={{ width: '320px', height: '240px' }}
          >
            <CertificateCard
              title={cert.title}
              issuedBy={cert.issuedBy}
              imageUrl={cert.imageUrl}
              onClick={() => {
                if (dragDistanceRef.current < 5) onCertificateClick(cert.id);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}