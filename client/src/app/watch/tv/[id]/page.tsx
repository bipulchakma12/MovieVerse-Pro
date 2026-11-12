'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Star, Calendar, ArrowLeft, Tv, Loader2, AlertCircle, ChevronDown, Info
} from 'lucide-react';
import Link from 'next/link';
import { VideoPlayer } from '@/components/VideoPlayer';
import ServerSwitcher from '@/components/watch/ServerSwitcher';
import { getTvServers, StreamServerId } from '@/utils/streamServers';
import { resolveTvShowDetail, extractNumericTmdbId } from '@/utils/mediaDetail';
import { fetchTMDBTvSeasonEpisodeCount } from '@/utils/tmdbClient';
import { addToWatchHistory } from '@/utils/userLists';

const FALLBACK_EPISODE_COUNT = 16;

export default function WatchTvPage({ params }: { params: { id: string } }) {
  const [tvShow, setTvShow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [streamServer, setStreamServer] = useState<StreamServerId>('server1');
  const [seasonEpisodeCount, setSeasonEpisodeCount] = useState(FALLBACK_EPISODE_COUNT);
  const lastRecordedRef = useRef('');

  useEffect(() => {
    let cancelled = false;

    resolveTvShowDetail(params.id)
      .then((resolved) => {
        if (cancelled) return;
        if (!resolved) {
          setNotFound(true);
          return;
        }
        setTvShow(resolved);
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

  // Resolve episode count for the selected season from TMDB (falls back to
  // FALLBACK_EPISODE_COUNT when the season can't be loaded), and clamp the
  // selected episode into the valid range.
  const tmdbIdNum = extractNumericTmdbId(tvShow?.tmdbId) ?? extractNumericTmdbId(params.id);

  useEffect(() => {
    if (!tmdbIdNum) return;
    let cancelled = false;
    fetchTMDBTvSeasonEpisodeCount(tmdbIdNum, selectedSeason).then((count) => {
      if (cancelled) return;
      const resolved = count ?? FALLBACK_EPISODE_COUNT;
      setSeasonEpisodeCount(resolved);
      setSelectedEpisode((ep) => (ep > resolved ? resolved : ep));
    });
    return () => {
      cancelled = true;
    };
  }, [tmdbIdNum, selectedSeason]);

  // Record watch history once per (show, season, episode) selection.
  // Selecting a season resets the episode to 1, so this fires exactly on
  // user-driven context switches — not on repeat renders or StrictMode double-invoke.
  useEffect(() => {
    if (!tvShow) return;
    const key = `${tvShow._id || tvShow.tmdbId}:S${selectedSeason}:E${selectedEpisode}`;
    if (lastRecordedRef.current === key) return;
    lastRecordedRef.current = key;
    addToWatchHistory({
      _id: String(tvShow._id || tvShow.tmdbId),
      tmdbId: String(tvShow.tmdbId || tvShow._id),
      title: `${tvShow.name} (S${selectedSeason}:E${selectedEpisode})`,
      slug: tvShow.slug || String(tvShow._id),
      posterUrl: tvShow.posterUrl,
      releaseYear: tvShow.firstAirYear || 2024,
      runtimeMinutes: 45,
      ratingAverage: tvShow.ratingAverage || 8.2,
      type: 'tv',
      genres: tvShow.genres,
    });
  }, [tvShow, selectedSeason, selectedEpisode]);

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center gap-4 select-none animate-fade-in">
        <Loader2 className="w-10 h-10 text-sky-500 animate-spin" />
        <p className="text-xs text-slate-400 font-semibold tracking-wide">Preparing your stream…</p>
      </div>
    );
  }

  if (notFound || !tvShow) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-center px-6">
        <AlertCircle className="w-12 h-12 text-slate-600" />
        <p className="text-slate-400">TV show not found.</p>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  if (!tmdbIdNum) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-center px-6">
        <AlertCircle className="w-12 h-12 text-slate-600" />
        <p className="text-slate-400">Streaming isn’t available for this title yet — no TMDB id found.</p>
        <Link
          href={`/tv/${params.id}`}
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
        >
          Back to Details
        </Link>
      </div>
    );
  }

  const tmdbId = tmdbIdNum;
  const totalSeasons = tvShow.numberOfSeasons || 1;
  const servers = getTvServers(tmdbId, selectedSeason, selectedEpisode);
  const currentStreamUrl = servers.find((s) => s.id === streamServer)?.url ?? servers[0].url;

  const genreNames = Array.isArray(tvShow.genres)
    ? tvShow.genres.map((g: any) => (typeof g === 'string' ? g : g.name)).filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white pb-16 animate-fade-in">
      {/* Watch-page top bar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#0b0c10]/85 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link
            href={`/tv/${params.id}`}
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-300 hover:text-white transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Details</span>
            <span className="sm:hidden">Back</span>
          </Link>

          <div className="flex items-center gap-2 min-w-0">
            <span className="hidden md:inline text-[10px] font-black tracking-widest text-sky-400 uppercase shrink-0">
              Now Playing
            </span>
            <h1 className="text-sm sm:text-base font-black text-white truncate">
              {tvShow.name} <span className="text-slate-400 font-bold">S{selectedSeason}:E{selectedEpisode}</span>
            </h1>
          </div>

          <span className="shrink-0 px-2.5 py-1 rounded-md bg-[#00e054] text-black font-black text-[10px] sm:text-xs shadow">
            HD
          </span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Season & Episode Selectors + Server Switcher */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1.5 rounded-xl bg-sky-600/20 text-sky-400 text-xs font-bold">
              S{selectedSeason} : E{selectedEpisode}
            </span>

            <div className="relative">
              <select
                value={selectedSeason}
                onChange={(e) => {
                  setSelectedSeason(Number(e.target.value));
                  setSelectedEpisode(1);
                }}
                aria-label="Season"
                className="appearance-none bg-slate-950 hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs rounded-xl pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((s) => (
                  <option key={s} value={s} className="bg-slate-900 text-white">
                    Season {s}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2 top-2 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={selectedEpisode}
                onChange={(e) => setSelectedEpisode(Number(e.target.value))}
                aria-label="Episode"
                className="appearance-none bg-slate-950 hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs rounded-xl pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                {Array.from({ length: seasonEpisodeCount }, (_, i) => i + 1).map((ep) => (
                  <option key={ep} value={ep} className="bg-slate-900 text-white">
                    Episode {ep}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2 top-2 pointer-events-none" />
            </div>
          </div>

          <ServerSwitcher servers={servers} active={streamServer} onChange={setStreamServer} />
        </div>

        {/* Video Player Embed */}
        <div className="space-y-3">
          <VideoPlayer
            key={currentStreamUrl}
            src={currentStreamUrl}
            poster={tvShow.bannerUrl || tvShow.posterUrl}
            title={`${tvShow.name} Season ${selectedSeason} Episode ${selectedEpisode}`}
          />
          <p className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            If a server fails to load, switch to another server above.
          </p>
        </div>

        {/* Compact show info strip */}
        <div className="flex flex-col sm:flex-row gap-5 p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <img
            src={tvShow.posterUrl}
            alt={tvShow.name}
            className="w-20 sm:w-24 aspect-[2/3] object-cover rounded-xl border border-white/10 shadow-lg shrink-0"
          />
          <div className="min-w-0 space-y-2">
            <h2 className="text-lg sm:text-xl font-black text-white leading-snug">{tvShow.name}</h2>
            <div className="flex flex-wrap items-center gap-3 text-[11px] sm:text-xs text-slate-300 font-semibold">
              <span className="flex items-center gap-1.5 text-[#f5c518] font-black">
                <Star className="w-3.5 h-3.5 fill-[#f5c518]" /> {tvShow.ratingAverage || 8.2}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" /> {tvShow.firstAirYear || 2026}
              </span>
              <span className="flex items-center gap-1.5">
                <Tv className="w-3.5 h-3.5 text-slate-500" /> {totalSeasons} Season{totalSeasons > 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
              {tvShow.storyline || tvShow.overview || 'No overview available for this series.'}
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
