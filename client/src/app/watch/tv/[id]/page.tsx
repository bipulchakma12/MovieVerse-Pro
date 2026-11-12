'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Star, ArrowLeft, Loader2, AlertCircle, ChevronDown, Search, X, EyeOff, Film, Info
} from 'lucide-react';
import Link from 'next/link';
import FullscreenWatchShell from '@/components/watch/FullscreenWatchShell';
import { getTvServers, StreamServerId } from '@/utils/streamServers';
import {
  resolveTvShowDetail,
  extractNumericTmdbId,
} from '@/utils/mediaDetail';
import { fetchTMDBTvSeason, TMDBSeasonDetail } from '@/utils/tmdbClient';
import { addToWatchHistory } from '@/utils/userLists';

const FALLBACK_EPISODE_COUNT = 16;
const TMDB_STILL_BASE = 'https://image.tmdb.org/t/p/w300';

function formatRuntime(minutes: number | null): string {
  if (!minutes || minutes <= 0) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function WatchTvPage({ params }: { params: { id: string } }) {
  const [tvShow, setTvShow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [streamServer, setStreamServer] = useState<StreamServerId>('server1');
  const [seasonDetail, setSeasonDetail] = useState<TMDBSeasonDetail | null>(null);
  const [seasonLoading, setSeasonLoading] = useState(false);
  const [episodeQuery, setEpisodeQuery] = useState('');
  const [spoilerMode, setSpoilerMode] = useState(false);
  const [revealedEpisodes, setRevealedEpisodes] = useState<Set<number>>(new Set());
  const lastRecordedRef = useRef('');

  const tmdbIdNum = extractNumericTmdbId(tvShow?.tmdbId) ?? extractNumericTmdbId(params.id);

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

  // Load the full season (episode list + overview) from TMDB
  useEffect(() => {
    if (!tmdbIdNum) return;
    let cancelled = false;
    setSeasonLoading(true);

    fetchTMDBTvSeason(tmdbIdNum, selectedSeason)
      .then((detail) => {
        if (cancelled) return;
        setSeasonDetail(detail);
        const count = detail?.episodes.length ?? FALLBACK_EPISODE_COUNT;
        setSelectedEpisode((ep) => Math.min(Math.max(1, ep), count));
      })
      .finally(() => {
        if (!cancelled) setSeasonLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tmdbIdNum, selectedSeason]);

  // Record watch history once per (show, season, episode) selection.
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
      <div className="h-screen bg-black flex flex-col items-center justify-center gap-4 select-none">
        <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
        <p className="text-xs text-slate-500 font-semibold tracking-wide">Preparing your stream…</p>
      </div>
    );
  }

  if (notFound || !tvShow) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center gap-4 text-center px-6">
        <AlertCircle className="w-12 h-12 text-slate-700" />
        <p className="text-slate-400">TV show not found.</p>
        <Link
          href="/"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    );
  }

  if (!tmdbIdNum) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center gap-4 text-center px-6">
        <AlertCircle className="w-12 h-12 text-slate-700" />
        <p className="text-slate-400">Streaming isn’t available for this title yet — no TMDB id found.</p>
        <Link
          href={`/tv/${params.id}`}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Details
        </Link>
      </div>
    );
  }

  const tmdbId = tmdbIdNum;
  const totalSeasons = Math.max(1, tvShow.numberOfSeasons || 1);
  const servers = getTvServers(tmdbId, selectedSeason, selectedEpisode);
  const currentStreamUrl = servers.find((s) => s.id === streamServer)?.url ?? servers[0].url;

  const episodes = seasonDetail?.episodes ?? [];
  const episodeCount = episodes.length || FALLBACK_EPISODE_COUNT;

  const query = episodeQuery.trim().toLowerCase();
  const filteredEpisodes = query
    ? episodes.filter(
        (ep) =>
          ep.name.toLowerCase().includes(query) ||
          String(ep.episode_number) === query ||
          `e${ep.episode_number}` === query ||
          `episode ${ep.episode_number}`.includes(query)
      )
    : episodes;

  const revealEpisode = (n: number) =>
    setRevealedEpisodes((prev) => new Set(prev).add(n));

  const tabLabel = `EPISODES S${selectedSeason}·E${selectedEpisode}`;

  const sidebar = (
    <div className="flex h-full flex-col gap-3 overflow-y-auto px-4 pt-4 pb-6 pr-14">
      {/* Season selector + search (header row) */}
      <div className="flex items-center gap-2">
        <div className="relative shrink-0">
          <select
            value={selectedSeason}
            onChange={(e) => {
              setSelectedSeason(Number(e.target.value));
              setSelectedEpisode(1);
            }}
            aria-label="Season"
            className="appearance-none cursor-pointer rounded-lg border border-red-500/40 bg-gradient-to-b from-red-700 to-red-900 py-2.5 pl-4 pr-9 text-xs font-black text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((s) => (
              <option key={s} value={s} className="bg-[#1b1b1f] text-white">
                Season {s}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/80" />
        </div>

        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={episodeQuery}
            onChange={(e) => setEpisodeQuery(e.target.value)}
            placeholder="Search"
            aria-label="Search episodes"
            className="w-full rounded-lg border border-white/10 bg-[#1b1b1f] py-2.5 pl-9 pr-8 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-red-600"
          />
          {episodeQuery && (
            <button
              onClick={() => setEpisodeQuery('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* SERVER dropdown + SPOILER toggle */}
      <div className="flex items-stretch gap-2">
        <div className="flex flex-1 items-center justify-between gap-2 rounded-lg border border-white/10 bg-[#1b1b1f] py-2.5 pl-4 pr-2">
          <span className="shrink-0 text-[10px] font-black tracking-[0.18em] text-slate-400">
            SERVER
          </span>
          <div className="relative min-w-0">
            <select
              value={streamServer}
              onChange={(e) => setStreamServer(e.target.value as StreamServerId)}
              aria-label="Streaming server"
              className="w-full cursor-pointer appearance-none bg-transparent pl-1 pr-6 text-right text-xs font-bold text-slate-100 focus:outline-none"
            >
              {servers.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#1b1b1f] text-slate-100">
                  {s.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        <button
          onClick={() => setSpoilerMode((v) => !v)}
          aria-pressed={spoilerMode}
          className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 text-[10px] font-black tracking-[0.18em] transition-all ${
            spoilerMode
              ? 'border-red-500/60 bg-red-600/15 text-red-400'
              : 'border-white/10 bg-[#1b1b1f] text-slate-400 hover:text-white'
          }`}
        >
          <EyeOff className="h-4 w-4" />
          SPOILER
        </button>
      </div>

      {/* Season summary */}
      <div className="pt-1">
        <h2 className="text-lg font-black text-white">
          Season {selectedSeason}{' '}
          <span className="align-middle text-[10px] text-red-600">●</span>{' '}
          <span className="text-[10px] font-bold tracking-[0.18em] text-slate-400">
            {episodeCount} EPISODE{episodeCount === 1 ? '' : 'S'}
          </span>
        </h2>
        <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-slate-500">
          {seasonLoading
            ? 'Loading season details…'
            : seasonDetail?.overview ||
              'A collection of episodes from this season. Pick one below to keep watching.'}
        </p>
      </div>

      {/* Episode list */}
      <div className="mt-1 space-y-3">
        {seasonLoading && episodes.length === 0 && (
          <div className="flex items-center justify-center gap-2 py-8 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-xs">Loading episodes…</span>
          </div>
        )}

        {filteredEpisodes.map((ep) => {
          const isCurrent = ep.episode_number === selectedEpisode;
          const hidden = spoilerMode && !revealedEpisodes.has(ep.episode_number);

          return (
            <div
              key={ep.episode_number}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedEpisode(ep.episode_number)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedEpisode(ep.episode_number);
                }
              }}
              aria-current={isCurrent}
              aria-label={`Play episode ${ep.episode_number}: ${ep.name}`}
              className={`w-full cursor-pointer overflow-hidden rounded-2xl border text-left transition-all ${
                isCurrent
                  ? 'border-red-600/70 bg-[#161216] shadow-[0_0_24px_-8px_rgba(229,9,20,0.45)]'
                  : 'border-white/10 bg-[#141418] hover:border-white/25'
              }`}
            >
              {/* Thumbnail */}
              <div className="relative aspect-[16/9] overflow-hidden bg-[#1b1b1f]">
                {ep.still_path ? (
                  <img
                    src={`${TMDB_STILL_BASE}${ep.still_path}`}
                    alt={`Episode ${ep.episode_number} — ${ep.name}`}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-600">
                    <Film className="h-8 w-8" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#141418] via-black/10 to-transparent" />
                {isCurrent && (
                  <span className="absolute right-2 top-2 rounded-md bg-red-600 px-2 py-0.5 text-[9px] font-black tracking-[0.15em] text-white shadow">
                    WATCHING
                  </span>
                )}
              </div>

              {/* Meta */}
              <div className="space-y-1 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-xs font-bold text-slate-100">
                    {ep.episode_number}. {ep.name}
                  </p>
                  <span className="flex shrink-0 items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {ep.vote_average > 0 ? ep.vote_average.toFixed(1) : '—'}
                    {ep.runtime ? <span className="text-slate-600">· {formatRuntime(ep.runtime)}</span> : null}
                  </span>
                </div>

                {hidden ? (
                  <div className="relative overflow-hidden rounded-md">
                    <p
                      aria-hidden="true"
                      className="line-clamp-2 select-none text-[10px] leading-snug text-slate-300 blur-[5px]"
                    >
                      {ep.overview || 'No description available for this episode.'}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        revealEpisode(ep.episode_number);
                      }}
                      className="absolute inset-0 flex items-center justify-center rounded-md bg-black/40 text-[10px] font-black tracking-wide text-white transition-colors hover:bg-black/55"
                    >
                      Click to reveal
                    </button>
                  </div>
                ) : (
                  <p className="line-clamp-2 text-[10px] leading-snug text-slate-500">
                    {ep.overview || 'No description available for this episode.'}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {!seasonLoading && filteredEpisodes.length === 0 && episodes.length > 0 && (
          <p className="py-6 text-center text-xs text-slate-500">
            No episodes match “{episodeQuery}”.
          </p>
        )}
      </div>

      {/* Server hint */}
      <p className="mt-1 flex items-start gap-1.5 text-[10px] leading-snug text-slate-600">
        <Info className="mt-0.5 h-3 w-3 shrink-0" />
        If a server fails to load, switch to another one in the SERVER dropdown — Server 1 starts automatically.
      </p>
    </div>
  );

  return (
    <FullscreenWatchShell
      backHref={`/tv/${params.id}`}
      title={`${tvShow.name} - S${selectedSeason}E${selectedEpisode}`}
      embedSrc={currentStreamUrl}
      embedTitle={`${tvShow.name} — Season ${selectedSeason} Episode ${selectedEpisode}`}
      tabLabel={tabLabel}
      sidebar={sidebar}
    />
  );
}
