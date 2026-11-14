'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Re-calls ezstandalone.showAds() on every Next.js App Router pageview
 * (Ezoic treats each client-side navigation as a new pageview).
 */
export default function EzoicPageView() {
  const pathname = usePathname();

  useEffect(() => {
    const w = window as any;
    if (!w.ezstandalone) return;
    w.ezstandalone.cmd = w.ezstandalone.cmd ?? [];
    w.ezstandalone.cmd.push(() => {
      try {
        w.ezstandalone?.showAds?.();
      } catch {
        // Ezoic script may not be ready — next pageview will retry
      }
    });
  }, [pathname]);

  return null;
}
