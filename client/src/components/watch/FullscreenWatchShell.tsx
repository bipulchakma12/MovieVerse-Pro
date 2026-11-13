'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, X, ChevronLeft, Loader2, Maximize, Minimize, AlertCircle } from 'lucide-react';
import type { StreamServer } from '@/utils/streamServers';

const PROBE_TIMEOUT_MS = 5000;

interface FullscreenWatchShellProps {
  backHref: string;
  title: string;
  embedSrc: string;
  embedTitle: string;
  tabLabel: string;
  sidebarLabel: string;
  sidebar: React.ReactNode;
  servers: StreamServer[];
  activeServerId: string;
  onSelectServer: (id: string) => void;
}

/**
 * Fullscreen watch experience: black viewport, edge-to-edge iframe embed,
 * minimal top chrome (back arrow + centered title + fullscreen toggle) and a
 * right-side sliding sidebar toggled by a vertical edge tab.
 *
 * Auto server selection: each server gets a 5s window. A server counts as
 * reachable when its iframe fires `load` or any postMessage arrives from its
 * origin. Otherwise the player advances to the next server automatically, and
 * the edge panel is the manual fallback.
 * Note: browsers block unmuted autoplay inside cross-origin iframes, so the
 * embed itself starts muted — the mute toggle lives inside the player and is
 * under the user's control.
 */
export default function FullscreenWatchShell({
  backHref,
  title,
  embedSrc,
  embedTitle,
  tabLabel,
  sidebarLabel,
  sidebar,
  servers,
  activeServerId,
  onSelectServer,
}: FullscreenWatchShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false); // hidden by default — never auto-opens
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoState, setAutoState] = useState<'probing' | 'ok' | 'failed'>('probing');
  const [probeNonce, setProbeNonce] = useState(0);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  const loadedRef = useRef(false);

  const currentIndex = Math.max(0, servers.findIndex((s) => s.id === activeServerId));

  const clearProbeTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const markWorking = useCallback(() => {
    loadedRef.current = true;
    clearProbeTimer();
    setAutoState('ok');
  }, []);

  const closeSidebar = () => {
    setSidebarOpen(false);
    // Return focus to the edge tab so keyboard users aren't stranded
    requestAnimationFrame(() => toggleRef.current?.focus());
  };

  // Escape closes the sidebar
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSidebar();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Track fullscreen changes (native Escape, browser F11, vendor prefixes)
  useEffect(() => {
    const onChange = () => {
      const doc = document as Document & {
        webkitFullscreenElement?: Element | null;
        mozFullScreenElement?: Element | null;
        msFullscreenElement?: Element | null;
      };
      setIsFullscreen(
        Boolean(
          doc.fullscreenElement ||
            doc.webkitFullscreenElement ||
            doc.mozFullScreenElement ||
            doc.msFullscreenElement
        )
      );
    };
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('webkitfullscreenchange', onChange);
    document.addEventListener('mozfullscreenchange', onChange);
    document.addEventListener('MSFullscreenChange', onChange);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      document.removeEventListener('webkitfullscreenchange', onChange);
      document.removeEventListener('mozfullscreenchange', onChange);
      document.removeEventListener('MSFullscreenChange', onChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    const elem = rootRef.current;
    if (!elem) return;
    try {
      const doc = document as Document & {
        webkitFullscreenElement?: Element | null;
        mozFullScreenElement?: Element | null;
        msFullscreenElement?: Element | null;
        webkitExitFullscreen?: () => Promise<void>;
        mozCancelFullScreen?: () => Promise<void>;
        msExitFullscreen?: () => Promise<void>;
      };
      const isNow = Boolean(
        doc.fullscreenElement ||
          doc.webkitFullscreenElement ||
          doc.mozFullScreenElement ||
          doc.msFullscreenElement
      );

      if (!isNow) {
        if (elem.requestFullscreen) await elem.requestFullscreen();
        else if ((elem as any).webkitRequestFullscreen) await (elem as any).webkitRequestFullscreen();
        else if ((elem as any).mozRequestFullScreen) await (elem as any).mozRequestFullScreen();
        else if ((elem as any).msRequestFullscreen) await (elem as any).msRequestFullscreen();
      } else {
        if (doc.exitFullscreen) await doc.exitFullscreen();
        else if (doc.webkitExitFullscreen) await doc.webkitExitFullscreen();
        else if (doc.mozCancelFullScreen) await doc.mozCancelFullScreen();
        else if (doc.msExitFullscreen) await doc.msExitFullscreen();
      }
    } catch (err) {
      console.error('Fullscreen toggle failed:', err);
    }
  };

  // Keyboard shortcut: F toggles fullscreen (ignored while typing)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'f' && e.key !== 'F') return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || target?.isContentEditable) return;
      toggleFullscreen();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 5-second probe: if the current server doesn't come alive, advance automatically
  useEffect(() => {
    loadedRef.current = false;
    setAutoState('probing');
    const idx = servers.findIndex((s) => s.id === activeServerId);

    timerRef.current = window.setTimeout(() => {
      if (loadedRef.current) return;
      const next = servers[idx + 1];
      if (next) {
        onSelectServer(next.id);
      } else {
        setAutoState('failed');
      }
    }, PROBE_TIMEOUT_MS);

    return () => clearProbeTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeServerId, probeNonce]);

  // Some embed providers broadcast postMessage events once their player is up —
  // treat any message from the active embed's origin as "server is alive".
  useEffect(() => {
    let host = '';
    try {
      host = new URL(embedSrc).origin;
    } catch {
      return;
    }
    const onMsg = (e: MessageEvent) => {
      if (e.origin === host) markWorking();
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [embedSrc, markWorking]);

  const retryFromFirst = () => {
    const first = servers[0];
    if (first && activeServerId !== first.id) {
      onSelectServer(first.id); // probe effect re-arms via activeServerId
    } else {
      setProbeNonce((n) => n + 1); // probe effect re-arms via nonce
    }
  };

  return (
    <div ref={rootRef} className="relative h-screen min-h-[480px] w-full bg-black overflow-hidden select-none">
      {/* Fullscreen embed — remounts when the server changes */}
      <iframe
        key={embedSrc}
        src={embedSrc}
        title={embedTitle}
        className="absolute inset-0 h-full w-full border-0"
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture; accelerometer; gyroscope"
        allowFullScreen
        onLoad={markWorking}
        onError={() => {
          // Treat a load error as a dead server — advance immediately
          clearProbeTimer();
          const next = servers[currentIndex + 1];
          if (next) onSelectServer(next.id);
          else setAutoState('failed');
        }}
      />

      {/* Top gradient scrim for legibility */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/80 via-black/40 to-transparent z-10" />

      {/* Top chrome: back arrow (left) + centered title + fullscreen toggle (right) */}
      <div className="absolute top-0 inset-x-0 z-20 h-16 flex items-center justify-between px-3 sm:px-5">
        <Link
          href={backHref}
          aria-label="Back to details"
          className="p-2 text-white/85 hover:text-white hover:scale-110 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2.25} />
        </Link>
        <h1 className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[58vw] sm:max-w-[64vw] truncate text-xs sm:text-sm font-medium text-white/90">
          {title}
        </h1>
        <button
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          aria-pressed={isFullscreen}
          title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          className="ml-auto p-2.5 rounded-xl border border-white/10 bg-black/60 backdrop-blur text-white/85 hover:text-white hover:bg-black/80 hover:scale-105 active:scale-95 transition-all"
        >
          {isFullscreen ? (
            <Minimize className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.25} />
          ) : (
            <Maximize className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.25} />
          )}
        </button>
      </div>

      {/* Auto server selection status */}
      {autoState === 'probing' && (
        <div className="absolute top-[4.5rem] left-3 sm:left-5 z-20 flex items-center gap-2 rounded-full border border-white/10 bg-black/75 backdrop-blur px-3 py-1.5">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-red-400" />
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-200">
            Finding best server — Server {currentIndex + 1} of {servers.length}…
          </span>
        </div>
      )}
      {autoState === 'failed' && (
        <div className="absolute top-[4.5rem] left-3 sm:left-5 z-20 flex items-center gap-2 rounded-full border border-red-500/40 bg-red-950/80 backdrop-blur px-3 py-1.5 max-w-[92vw]">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-400" />
          <span className="text-[10px] sm:text-[11px] font-semibold text-red-200">
            All servers are busy — try again or pick a server.
          </span>
          <button
            onClick={retryFromFirst}
            className="shrink-0 rounded-full bg-red-600 px-2.5 py-1 text-[9px] sm:text-[10px] font-black text-white hover:bg-red-500 transition-colors"
          >
            RETRY
          </button>
        </div>
      )}

      {/* Right-edge vertical tab (visible when sidebar is closed) — always available, never auto-opens */}
      {!sidebarOpen && (
        <button
          ref={toggleRef}
          onClick={() => setSidebarOpen(true)}
          aria-label="Open panel"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-2 rounded-l-2xl border border-r-0 border-white/10 bg-[#141417]/90 backdrop-blur px-2 py-3 shadow-2xl hover:bg-[#1b1b1f] transition-colors"
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
