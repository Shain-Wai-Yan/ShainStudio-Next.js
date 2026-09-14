'use client';
import { useEffect } from 'react';
export default function ClarityAnalytics({ projectId }: { projectId: string }) {
  useEffect(() => {
    let disposed = false;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(() => {
        void import('@microsoft/clarity').then(({ default: Clarity }) => {
          if (!disposed) {
            Clarity.init(projectId);
            Clarity.consentV2({ ad_Storage: 'denied', analytics_Storage: 'granted' });
          }
        }).catch(error => console.error('Clarity initialization failed:', error));
      }, 1500);
    };
    if (document.readyState === 'complete') schedule();
    else window.addEventListener('load', schedule, { once: true });
    return () => { disposed = true; clearTimeout(timer); window.removeEventListener('load', schedule); };
  }, [projectId]);
  return null;
}
