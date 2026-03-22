'use client';

import { useEffect } from 'react';

export default function ScrollAnimator() {
  useEffect(() => {
    // Scroll-triggered fade-up animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated');
          }
        });
      },
      { threshold: 0.15 }
    );
    
    // Slight delay to ensure DOM is fully ready
    setTimeout(() => {
      const els = document.querySelectorAll('.animate-on-scroll');
      els.forEach((el) => observer.observe(el));
    }, 100);

    return () => observer.disconnect();
  }, []);

  return null;
}
