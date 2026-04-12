'use client';

import { useEffect, useRef, useState } from 'react';

export default function ScrollRevealText({ text }: { text: string }) {
  const containerRef = useRef<HTMLParagraphElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const elementHeight = rect.height;
      const elementTop = rect.top;
      
      // Start revealing when the element is 85% down the viewport screen
      const startReveal = windowHeight * 0.85; 
      
      // The amount the user has scrolled past the trigger line
      const distanceScrolled = startReveal - elementTop;
      
      // To feel "line by line", the total distance to fully reveal should span
      // most of the element's height plus a small buffer.
      const totalDistance = elementHeight; 
      
      let currentProgress = 0;
      if (totalDistance > 0) {
        currentProgress = distanceScrolled / totalDistance;
      }
      
      currentProgress = Math.max(0, Math.min(1, currentProgress));
      setProgress(currentProgress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  // Split the text into tokens that handle both English words and Chinese characters correctly
  let tokens: string[] = [];
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: 'word' });
    tokens = Array.from(segmenter.segment(text)).map(s => s.segment);
  } else {
    // Fallback regex that splits by English words, spaces, or individual special/CJK characters
    tokens = text.match(/([a-zA-Z0-9'’\-]+|\s+|[^\w\s])/g) || [];
  }

  return (
    <p ref={containerRef}>
      {tokens.map((token, i) => {
        const isWhitespace = /^\s+$/.test(token);
        
        // Progress step for this token
        // We calculate step based on only non-whitespace tokens to make the pacing smooth,
        // but for simplicity, distributing linearly across all tokens is generally fine.
        const step = 1 / tokens.length;
        const wordStart = i * step;
        const wordEnd = wordStart + (step * 0.5); // slight overlap for smoothness
        
        let opacity = 0.15; // Pale color when not revealed
        
        if (progress > wordStart) {
          if (progress > wordEnd) {
            opacity = 1;
          } else {
            opacity = 0.15 + 0.85 * ((progress - wordStart) / (wordEnd - wordStart));
          }
        }

        return (
          <span 
            key={i} 
            style={{ 
              opacity: isWhitespace ? 1 : opacity, 
              transition: isWhitespace ? 'none' : 'opacity 0.15s ease-out'
            }}
            className={isWhitespace ? "" : "text-text-light dark:text-gray-400"}
          >
            {token}
          </span>
        );
      })}
    </p>
  );
}
