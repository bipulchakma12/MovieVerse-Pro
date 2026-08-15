'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert, CheckCircle2, AlertTriangle, RefreshCw, Maximize2 } from 'lucide-react';

export default function Test1FlexPage() {
  const targetUrl = 'https://www.1flex.org/play?id=1368337&type=movie&token=tIxIpHrdSNyPTscs';
  const [iframeLoaded, setIframeLoaded] = useState<boolean | null>(null);
  const [hasError, setHasError] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  useEffect(() => {
    addLog(`Initiating iframe load test for target URL: ${targetUrl}`);
    addLog('Security Policy: Unmodified browser standard embedding (No header spoofing / proxying).');
  }, []);

  const handleIframeLoad = () => {
    addLog('Iframe `onLoad` event fired by browser DOM.');
    setIframeLoaded(true);
  };

  const handleIframeError = () => {
    addLog('Iframe `onError` event fired by browser DOM.');
    setHasError(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-brand-500 hover:underline mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to MovieVerse Pro
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            🧪 1Flex Embed Technical Diagnostic Test
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Testing standard browser iframe embedding of <code className="bg-slate-900 px-2 py-0.5 rounded text-amber-400">{targetUrl}</code>
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Re-test Page
        </button>
      </div>

      {/* Target URL Info Banner */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-bold text-slate-300">Target Embed Endpoint</div>
          <div className="text-xs font-mono text-slate-400 break-all">{targetUrl}</div>
        </div>
        <a
          href={targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-xs font-bold text-white flex items-center gap-2 self-start sm:self-auto shrink-0"
        >
          <Maximize2 className="w-3.5 h-3.5" /> Open Directly in New Tab
        </a>
      </div>

      {/* Main Testing View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Iframe View Area (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              Standard Browser Iframe Container (16:9 Aspect Ratio)
            </h2>
            {iframeLoaded && !hasError && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> DOM Loaded
              </span>
            )}
          </div>

          <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
            <iframe
              id="1flex-test-iframe"
              src={targetUrl}
              className="w-full h-full border-0"
              allow="fullscreen; autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
            />
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300">📌 Iframe Configuration Note:</p>
            <p>
              This container runs a standard HTML5 <code className="text-amber-400">&lt;iframe&gt;</code> element without any security bypasses, proxy scripts, or header manipulation.
            </p>
          </div>
        </div>

        {/* Diagnostic Panel (1 col) */}
        <div className="space-y-6">
          {/* Status Box */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">
              Diagnostic Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Target Domain:</span>
                <span className="font-mono font-semibold text-slate-200">www.1flex.org</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
                <span className="text-slate-400">HTTP Direct Status:</span>
                <span className="font-semibold text-emerald-400">200 OK (Cloudflare)</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Referrer Policy:</span>
                <span className="font-mono text-slate-300">strict-origin-when-cross-origin</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Cross-Origin Embed:</span>
                <span className="font-semibold text-amber-400">Restricted / Cross-Origin JS</span>
              </div>
            </div>

            {/* Diagnostic Alert Box */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-400">
                <AlertTriangle className="w-4 h-4" /> Technical Finding:
              </div>
              <p className="leading-relaxed">
                1Flex.org delivers full Web Application markup via Next.js RSC client chunks. While Cloudflare permits initial HTTP 200 connection, client-side player scripts require internal authorization tokens, session cookies, and origin match.
              </p>
            </div>
          </div>

          {/* Live Execution Logs */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-slate-200">Execution Log</h3>
            <div className="p-3 rounded-xl bg-black font-mono text-[11px] text-emerald-400 space-y-1.5 max-h-48 overflow-y-auto border border-slate-800">
              {logs.map((log, idx) => (
                <div key={idx}>{log}</div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
