'use client';
import { useEffect } from 'react';
export default function ClarityAnalytics() {
  useEffect(() => {
    const projectId = process.env.NEXT_PUBLIC_CLARITY_ID;
    if (!projectId) return;
    let disposed = false;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(() => {
        void import('@microsoft/clarity').then(({ default: Clarity }) => {
          if (!disposed) Clarity.init(projectId);
        }).catch(error => console.error('Clarity initialization failed:', error));
      }, 1500);
    };
    if (document.readyState === 'complete') schedule();
    else window.addEventListener('load', schedule, { once: true });
    return () => { disposed = true; clearTimeout(timer); window.removeEventListener('load', schedule); };
  }, []);
  return null;
}
