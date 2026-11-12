'use client';

import React, { useState, useEffect } from 'react';
import {
  Star, Calendar, Clock, ArrowLeft, Loader2, AlertCircle, Radio, Check, Info
} from 'lucide-react';
import Link from 'next/link';
import FullscreenWatchShell from '@/components/watch/FullscreenWatchShell';
import { getMovieServers, StreamServerId } from '@/utils/streamServers';
import { resolveMovieDetail, extractNumericTmdbId } from '@/utils/mediaDetail';
import { addToWatchHistory } from '@/utils/userLists';

export default function WatchMoviePage({ params }: { params: { id: string } }) {
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [streamServer, setStreamServer] = useState<StreamServerId>('server1');

  useEffect(() => {
    let cancelled = false;

    resolveMovieDetail(params.id)
      .then((resolved) => {
        if (cancelled) return;
        if (!resolved) {
          setNotFound(true);
          return;
        }
        setMovie(resolved);
        addToWatchHistory({
          _id: String(resolved._id || resolved.tmdbId),
          tmdbId: String(resolved.tmdbId || resolved._id),
          title: resolved.title,
          slug: resolved.slug || String(resolved._id),
          posterUrl: resolved.posterUrl,
          releaseYear: resolved.releaseYear || 2024,
          runtimeMinutes: resolved.runtimeMinutes || 120,
          ratingAverage: resolved.ratingAverage || 8.0,
          type: 'movie',
          genres: resolved.genres,
        });
      })
      .catch((err) => {
        console.error('Watch page load failed:', err);
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (loading) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center gap-4 select-none">
        <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
        <p className="text-xs text-slate-500 font-semibold tracking-wide">Preparing your stream…</p>
      </div>
    );
  }

  if (notFound || !movie) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center gap-4 text-center px-6">
        <AlertCircle className="w-12 h-12 text-slate-700" />
        <p className="text-slate-400">Movie not found.</p>
        <Link
          href="/"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    );
  }

  const tmdbId = extractNumericTmdbId(movie.tmdbId) ?? extractNumericTmdbId(params.id);

  if (!tmdbId) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center gap-4 text-center px-6">
        <AlertCircle className="w-12 h-12 text-slate-700" />
        <p className="text-slate-400">Streaming isn’t available for this title yet — no TMDB id found.</p>
        <Link
          href={`/movie/${params.id}`}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Details
        </Link>
      </div>
    );
  }

  const servers = getMovieServers(tmdbId);
  const currentStreamUrl = servers.find((s) => s.id === streamServer)?.url ?? servers[0].url;

  const sidebar = (
    <div className="flex h-full flex-col gap-4 overflow-y-auto px-4 pt-4 pb-6 pr-14">
      <div className="pt-1">
        <h2 className="text-lg font-black text-white">
          Streaming <span className="text-red-600">●</span>{' '}
          <span className="text-[10px] font-bold tracking-[0.18em] text-slate-400 align-middle">
            SERVERS
          </span>
        </h2>
        <p className="mt-1 text-[10px] leading-snug text-slate-500">
          Server 1 selected automatically. Switch anytime if one fails to load.
        </p>
      </div>

      <div className="space-y-2" role="radiogroup" aria-label="Streaming server">
        {servers.map((s) => {
          const active = s.id === streamServer;
          return (
            <button
              key={s.id}
              role="radio"
              aria-checked={active}
              onClick={() => setStreamServer(s.id)}
              className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition-all ${
                active
                  ? 'border-red-600/70 bg-[#161216] shadow-[0_0_24px_-8px_rgba(229,9,20,0.45)]'
                  : 'border-white/10 bg-[#141418] hover:border-white/25'
              }`}
            >
              <span className="flex items-center gap-3">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
                    active ? 'border-red-500/50 bg-red-600/15 text-red-400' : 'border-white/10 bg-[#1b1b1f] text-slate-400'
                  }`}
                >
                  <Radio className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-xs font-bold text-slate-100">{s.label}</span>
                  <span className="block text-[9px] text-slate-600 truncate max-w-[200px]">{s.url.replace(/^https?:\/\//, '').split('/')[0]}</span>
                </span>
              </span>
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                  active ? 'border-red-600 bg-red-600' : 'border-slate-600'
                }`}
              >
                {active && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
              </span>
            </button>
          );
        })}
      </div>

      {/* Movie meta */}
      <div className="rounded-2xl border border-white/10 bg-[#141418] p-4 space-y-2">
        <h3 className="text-sm font-black text-white">{movie.title}</h3>
        <div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold text-slate-400">
          <span className="flex items-center gap-1 text-amber-400">
            <Star className="h-3 w-3 fill-amber-400" /> {movie.ratingAverage || 8.2}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" /> {movie.releaseYear || 2024}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {movie.runtimeMinutes || 120} min
          </span>
        </div>
        <p className="text-[10px] leading-snug text-slate-500 line-clamp-3">
          {movie.storyline || movie.overview || 'No overview available for this movie.'}
        </p>
      </div>

      <p className="mt-auto flex items-start gap-1.5 text-[10px] leading-snug text-slate-600">
        <Info className="mt-0.5 h-3 w-3 shrink-0" />
        Server 1 starts automatically with the best available source. If a server fails, try another — your progress here will always pick up the latest server.
      </p>
    </div>
  );

  return (
    <FullscreenWatchShell
      backHref={`/movie/${params.id}`}
      title={movie.title}
      embedSrc={currentStreamUrl}
      embedTitle={`${movie.title} — Full Movie HD Stream`}
      tabLabel="SERVERS"
      sidebar={sidebar}
    />
  );
}
