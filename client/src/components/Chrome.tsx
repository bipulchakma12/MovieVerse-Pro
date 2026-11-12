'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

/**
 * Renders the site chrome (Navbar/Footer) everywhere except the fullscreen
 * watch experience under /watch, which needs the whole viewport for the player.
 */
export function Chrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isWatch = pathname?.startsWith('/watch') ?? false;

  if (isWatch) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
