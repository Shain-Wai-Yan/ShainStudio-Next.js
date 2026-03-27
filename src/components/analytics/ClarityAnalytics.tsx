'use client';

import { useEffect } from 'react';
import Clarity from '@microsoft/clarity';

/**
 * ClarityAnalytics - A client-side component to initialize Microsoft Clarity.
 * It uses the "use client" directive and runs inside a useEffect hook
 * to ensure initialization only occurs in the browser.
 */
export default function ClarityAnalytics() {
  useEffect(() => {
    // Pull the Clarity Project ID from environment variables
    const projectId = process.env.NEXT_PUBLIC_CLARITY_ID;
    
    // Only initialize if the ID exists
    if (projectId) {
      try {
        Clarity.init(projectId);
        // Only log in development or if explicitly needed
        if (process.env.NODE_ENV === 'development') {
          console.log('Microsoft Clarity initialized with project ID:', projectId);
        }
      } catch (error) {
        console.error('Microsoft Clarity failed to initialize:', error);
      }
    }
  }, []);

  // This component renders nothing; its sole purpose is to handle side effects.
  return null;
}
