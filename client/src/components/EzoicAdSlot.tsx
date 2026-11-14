'use client';

import { useEffect } from 'react';

/**
 * Renders an Ezoic ad placement and tells the Ezoic script to fill it.
 * Ezoic controls the ad itself (size, content, format).
 */
export default function EzoicAdSlot({ className = '' }: { className?: string }) {
  useEffect(() => {
    const w = window as any;
    if (!w.ezstandalone) return;
    w.ezstandalone.cmd = w.ezstandalone.cmd ?? [];
    w.ezstandalone.cmd.push(() => {
      try {
        w.ezstandalone?.showAds?.({});
      } catch {
        // Ezoic script may not be ready — pageview refresh will retry
      }
    });
  }, []);

  return <div className={className} aria-hidden="true" />;
}
