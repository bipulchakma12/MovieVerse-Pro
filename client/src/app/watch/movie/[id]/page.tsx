'use client';

import React, { useState, useEffect } from 'react';
import {
  Star, Calendar, Clock, ArrowLeft, Play, Tv, Loader2, AlertCircle, Info
} from 'lucide-react';
import Link from 'next/link';
import { VideoPlayer } from '@/components/VideoPlayer';
import ServerSwitcher from '@/components/watch/ServerSwitcher';
import { getMovieServers, StreamServerId } from '@/utils/streamServers';
import { resolveMovieDetail, extractNumericTmdbId } from '@/utils/mediaDetail';
import { addToWatchHistory } from '@/utils/userLists';

export default function WatchMoviePage({ params }: { params: { id: string } }) {
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<'sources' | 'trailer'>('sources');
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
      <div className="min-h-[75vh] flex flex-col items-center justify-center gap-4 select-none animate-fade-in">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-semibold tracking-wide">Preparing your stream…</p>
      </div>
    );
  }

  if (notFound || !movie) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-center px-6">
        <AlertCircle className="w-12 h-12 text-slate-600" />
        <p className="text-slate-400">Movie not found.</p>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  const tmdbId = extractNumericTmdbId(movie.tmdbId) ?? extractNumericTmdbId(params.id);

  if (!tmdbId) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-center px-6">
        <AlertCircle className="w-12 h-12 text-slate-600" />
        <p className="text-slate-400">Streaming isn’t available for this title yet — no TMDB id found.</p>
        <Link
          href={`/movie/${params.id}`}
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
        >
          Back to Details
        </Link>
      </div>
    );
  }

  const trailerUrl = movie.trailerUrl || 'https://www.youtube.com/embed/YoHD9XEInc0';
  const servers = getMovieServers(tmdbId);
  const currentStreamUrl = servers.find((s) => s.id === streamServer)?.url ?? servers[0].url;

  const genreNames = Array.isArray(movie.genres)
    ? movie.genres.map((g: any) => (typeof g === 'string' ? g : g.name)).filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white pb-16 animate-fade-in">
      {/* Watch-page top bar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#0b0c10]/85 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link
            href={`/movie/${params.id}`}
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-300 hover:text-white transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Details</span>
            <span className="sm:hidden">Back</span>
          </Link>

          <div className="flex items-center gap-2 min-w-0">
            <span className="hidden md:inline text-[10px] font-black tracking-widest text-[#ffd233] uppercase shrink-0">
              Now Playing
            </span>
            <h1 className="text-sm sm:text-base font-black text-white truncate">{movie.title}</h1>
          </div>

          <span className="shrink-0 px-2.5 py-1 rounded-md bg-[#00e054] text-black font-black text-[10px] sm:text-xs shadow">
            HD
          </span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Player Controls & Server Switcher */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-xl">
          <div className="flex items-center gap-2" role="tablist" aria-label="Watch mode">
            <button
              onClick={() => setActiveTab('sources')}
              role="tab"
              aria-selected={activeTab === 'sources'}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'sources'
                  ? 'bg-[#ffd233] text-black shadow-lg font-black'
                  : 'text-slate-400 hover:text-white bg-slate-800'
              }`}
            >
              <Tv className="w-4 h-4" /> Watch Full Movie
            </button>
            <button
              onClick={() => setActiveTab('trailer')}
              role="tab"
              aria-selected={activeTab === 'trailer'}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'trailer'
                  ? 'bg-rose-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white bg-slate-800'
              }`}
            >
              <Play className="w-4 h-4 fill-current" /> Trailer
            </button>
          </div>

          {activeTab === 'sources' && tmdbId && (
            <ServerSwitcher servers={servers} active={streamServer} onChange={setStreamServer} />
          )}
        </div>

        {/* Video Player Embed */}
        {activeTab === 'trailer' ? (
          <div className="space-y-2">
            <VideoPlayer
              src={trailerUrl}
              poster={movie.bannerUrl || movie.posterUrl}
              title={`${movie.title} — Official Trailer`}
            />
            <p className="text-xs text-slate-500 text-center">
              🎬 Official YouTube HD Trailer
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <VideoPlayer
              key={currentStreamUrl}
              src={currentStreamUrl}
              poster={movie.bannerUrl || movie.posterUrl}
              title={`${movie.title} — Full Movie HD Stream`}
            />
            <p className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              If a server fails to load, switch to another server above.
            </p>
          </div>
        )}

        {/* Compact movie info strip */}
        <div className="flex flex-col sm:flex-row gap-5 p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-20 sm:w-24 aspect-[2/3] object-cover rounded-xl border border-white/10 shadow-lg shrink-0"
          />
          <div className="min-w-0 space-y-2">
            <h2 className="text-lg sm:text-xl font-black text-white leading-snug">{movie.title}</h2>
            <div className="flex flex-wrap items-center gap-3 text-[11px] sm:text-xs text-slate-300 font-semibold">
              <span className="flex items-center gap-1.5 text-[#f5c518] font-black">
                <Star className="w-3.5 h-3.5 fill-[#f5c518]" /> {movie.ratingAverage || 8.2}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" /> {movie.releaseYear || 2024}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" /> {movie.runtimeMinutes || 120} min
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
              {movie.storyline || movie.overview || 'No overview available for this movie.'}
            </p>
            {genreNames.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {genreNames.slice(0, 5).map((g: string) => (
                  <span
                    key={g}
                    className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-white/5 border border-white/10 text-slate-300"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
