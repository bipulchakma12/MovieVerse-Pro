'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, X, ChevronLeft } from 'lucide-react';

interface FullscreenWatchShellProps {
  backHref: string;
  title: string;
  embedSrc: string;
  embedTitle: string;
  tabLabel: string;
  sidebarLabel: string;
  sidebar: React.ReactNode;
}

/**
 * Fullscreen watch experience: black viewport, edge-to-edge iframe embed,
 * minimal top chrome (back arrow + centered title) and a right-side sliding
 * sidebar toggled by a vertical edge tab.
 */
export default function FullscreenWatchShell({
  backHref,
  title,
  embedSrc,
  embedTitle,
  tabLabel,
  sidebarLabel,
  sidebar,
}: FullscreenWatchShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const closeSidebar = () => {
    setSidebarOpen(false);
    // Return focus to the edge tab so keyboard users aren't stranded
    requestAnimationFrame(() => toggleRef.current?.focus());
  };

  // Escape closes the sidebar (and returns focus to the toggle)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSidebar();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="relative h-screen min-h-[480px] w-full bg-black overflow-hidden select-none">
      {/* Fullscreen embed — switches instantly when embedSrc changes */}
      <iframe
        key={embedSrc}
        src={embedSrc}
        title={embedTitle}
        className="absolute inset-0 h-full w-full border-0"
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture; accelerometer; gyroscope"
        allowFullScreen
      />

      {/* Top gradient scrim for legibility */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/80 via-black/40 to-transparent z-10" />

      {/* Top chrome: back arrow (left) + centered title */}
      <div className="absolute top-0 inset-x-0 z-20 h-16 flex items-center px-3 sm:px-5">
        <Link
          href={backHref}
          aria-label="Back to details"
          className="p-2 text-white/85 hover:text-white hover:scale-110 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2.25} />
        </Link>
        <h1 className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[62vw] sm:max-w-[70vw] truncate text-xs sm:text-sm font-medium text-white/90">
          {title}
        </h1>
      </div>

      {/* Right-edge vertical tab (visible when sidebar is closed) */}
      {!sidebarOpen && (
        <button
          ref={toggleRef}
          onClick={() => setSidebarOpen(true)}
          aria-label="Open panel"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-3 rounded-l-2xl border border-r-0 border-white/10 bg-[#141417]/90 backdrop-blur px-2 py-4 shadow-2xl hover:bg-[#1b1b1f] transition-colors"
        >
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-600/25 border border-red-500/50">
            <ChevronLeft className="w-4 h-4 text-red-500" strokeWidth={3} />
          </span>
          <span className="text-[10px] sm:text-[11px] font-black tracking-[0.25em] text-white/85 [writing-mode:vertical-rl] rotate-180 whitespace-nowrap">
            {tabLabel}
          </span>
        </button>
      )}

      {/* Right-side sliding sidebar — hidden from tab order & AT when closed */}
      <aside
        aria-label={sidebarLabel}
        aria-hidden={!sidebarOpen}
        className={`absolute right-0 top-0 z-30 h-full w-[400px] max-w-[94vw] bg-[#0d0d10]/95 backdrop-blur-md border-l border-white/5 shadow-2xl transition-all duration-300 ease-out ${
          sidebarOpen ? 'translate-x-0 visible' : 'translate-x-full invisible pointer-events-none'
        }`}
      >
        <button
          onClick={closeSidebar}
          aria-label="Close panel"
          className="absolute right-3 top-3 z-10 rounded-lg border border-white/10 bg-[#1b1b1f] p-2 text-slate-400 hover:text-white hover:bg-[#242429] transition-all"
        >
          <X className="w-4 h-4" strokeWidth={2.5} />
        </button>
        {sidebar}
      </aside>
    </div>
  );
}
