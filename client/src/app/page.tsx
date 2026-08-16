'use client';

import React, { useState, useEffect } from 'react';
import { Play, Flame, Star, Sparkles, MonitorPlay, Tv, Film, Bookmark } from 'lucide-react';
import Link from 'next/link';

interface MediaItem {
  _id: string;
  tmdbId?: string;
  title: string;
  slug: string;
  posterUrl: string;
  releaseYear?: number;
  ratingAverage?: number;
  type: 'movie' | 'tv';
  runtimeOrSeasons?: string;
  genres?: any[];
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'all' | 'movie' | 'tv'>('all');
  const [allMedia, setAllMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeCatalog = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

        // 1. Fetch Movies
        let moviesList: MediaItem[] = [];
        const movieRes = await fetch(`${apiUrl}/movies?limit=24`).catch(() => null);
        if (movieRes && movieRes.ok) {
          const data = await movieRes.json();
          if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            moviesList = data.data.map((m: any) => ({
              _id: m._id,
              tmdbId: m.tmdbId,
              title: m.title,
              slug: m.slug,
              posterUrl: m.posterUrl,
              releaseYear: m.releaseYear || 2024,
              ratingAverage: m.ratingAverage || 7.9,
              type: 'movie' as const,
              runtimeOrSeasons: `${m.runtimeMinutes || 120} min`,
              genres: m.genres,
            }));
          }
        }
        if (moviesList.length === 0) {
          const { fetchTMDBPopularMovies } = await import('@/utils/tmdbClient');
          const fallbackMovies = await fetchTMDBPopularMovies();
          moviesList = fallbackMovies.slice(0, 24).map((m: any) => ({
            _id: m._id,
            tmdbId: m.tmdbId,
            title: m.title,
            slug: m.slug,
            posterUrl: m.posterUrl,
            releaseYear: m.releaseYear || 2024,
            ratingAverage: m.ratingAverage || 7.9,
            type: 'movie' as const,
            runtimeOrSeasons: `${m.runtimeMinutes || 120} min`,
            genres: m.genres,
          }));
        }

        // 2. Fetch TV Shows
        let tvList: MediaItem[] = [];
        const tvRes = await fetch(`${apiUrl}/tv?limit=24`).catch(() => null);
        if (tvRes && tvRes.ok) {
          const data = await tvRes.json();
          if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            tvList = data.data.map((t: any) => ({
              _id: t._id,
              tmdbId: t.tmdbId,
              title: t.name,
              slug: t.slug,
              posterUrl: t.posterUrl,
              releaseYear: t.firstAirYear || 2024,
              ratingAverage: t.ratingAverage || 8.1,
              type: 'tv' as const,
              runtimeOrSeasons: `${t.numberOfSeasons || 1} Seasons`,
              genres: t.genres,
            }));
          }
        }
        if (tvList.length === 0) {
          const { fetchTMDBPopularTvShows } = await import('@/utils/tmdbClient');
          const fallbackTv = await fetchTMDBPopularTvShows();
          tvList = fallbackTv.slice(0, 24).map((t: any) => ({
            _id: t._id,
            tmdbId: t.tmdbId,
            title: t.name,
            slug: t.slug,
            posterUrl: t.posterUrl,
            releaseYear: t.firstAirYear || 2024,
            ratingAverage: t.ratingAverage || 8.1,
            type: 'tv' as const,
            runtimeOrSeasons: `${t.numberOfSeasons || 1} Seasons`,
            genres: t.genres,
          }));
        }

        // Interleave / Combine both Movies and TV Shows alternately for "All" feed
        const combined: MediaItem[] = [];
        const maxLen = Math.max(moviesList.length, tvList.length);
        for (let i = 0; i < maxLen; i++) {
          if (i < moviesList.length) combined.push(moviesList[i]);
          if (i < tvList.length) combined.push(tvList[i]);
        }

        setAllMedia(combined);
      } catch (e) {
        console.error('Failed to fetch home media:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeCatalog();
  }, []);

  const displayedMedia =
    activeTab === 'all'
      ? allMedia
      : activeTab === 'movie'
      ? allMedia.filter((item) => item.type === 'movie')
      : allMedia.filter((item) => item.type === 'tv');

  return (
    <div className="space-y-16 pb-20">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 bg-gradient-to-b from-slate-900/60 to-transparent dark:from-dark-nav/80">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-900/30 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-500 border border-brand-500/20 mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Next-Gen Movies & TV Streaming Platform
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-none max-w-4xl mx-auto">
            Unlimited Movies, TV Shows & Custom{' '}
            <span className="bg-gradient-to-r from-brand-500 via-rose-500 to-sky-400 bg-clip-text text-transparent">
              Watchlists
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Welcome to <strong className="text-slate-800 dark:text-slate-200">MovieVerse Pro</strong>. Explore 50,000+ trending blockbusters, live TV series, reviews, and interactive video playback.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/trending"
              className="px-8 py-3.5 rounded-full font-bold text-white bg-brand-600 hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 active:scale-95 text-sm"
            >
              <Film className="w-4 h-4" /> Explore All Movies
            </Link>
            <Link
              href="/tv"
              className="px-8 py-3.5 rounded-full font-bold text-white bg-sky-600 hover:bg-sky-700 transition-all shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 active:scale-95 text-sm"
            >
              <Tv className="w-4 h-4" /> Browse TV Shows
            </Link>
          </div>
        </div>
      </section>

      {/* Main Combined Feed: Featured Movies & TV Shows */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Section Header with Category Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-dark-border pb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-brand-500 fill-brand-500" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Featured Movies & TV Shows
            </h2>
          </div>

          {/* Quick Filter Tabs: All / Movies / TV Shows */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-dark-card p-1 rounded-xl border border-slate-200 dark:border-dark-border">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'all'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              🔥 All Titles
            </button>
            <button
              onClick={() => setActiveTab('movie')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'movie'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              🍿 Movies
            </button>
            <button
              onClick={() => setActiveTab('tv')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'tv'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              📺 TV Series
            </button>
          </div>
        </div>

        {/* Media Grid: Displays Both Movies & TV Series with Type Badges */}
        {loading && displayedMedia.length === 0 ? (
          <div className="text-center py-16 text-xs text-slate-400">
            Loading movies & TV series catalog...
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {displayedMedia.map((item) => {
              const targetUrl = item.type === 'movie' ? `/movie/${item.slug || item._id}` : `/tv/${item.slug || item._id}`;
              const isTv = item.type === 'tv';

              return (
                <Link
                  key={`${item.type}-${item._id}`}
                  href={targetUrl}
                  className="group flex flex-col space-y-2.5"
                >
                  <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-dark-border shadow-md group-hover:border-brand-500 transition-all duration-300">
                    <img
                      src={item.posterUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Type Badge: Rose for Movie, Sky Blue for TV Series */}
                    <div
                      className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider backdrop-blur-md flex items-center gap-1 shadow-md ${
                        isTv ? 'bg-sky-600/90' : 'bg-brand-600/90'
                      }`}
                    >
                      {isTv ? <Tv className="w-2.5 h-2.5" /> : <Film className="w-2.5 h-2.5" />}
                      {isTv ? 'TV Series' : 'Movie'}
                    </div>

                    {/* Rating Badge */}
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] font-bold text-amber-400 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400" /> {item.ratingAverage || 8.0}
                    </div>

                    {/* Hover Play Icon Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="w-11 h-11 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1 group-hover:text-brand-500 transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <span>{item.releaseYear || 2024}</span>
                      <span>•</span>
                      <span>{item.runtimeOrSeasons}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-6 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-sm hover:border-brand-500/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Curated Ratings & Reviews</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Engage with film critics and enthusiasts. Share star ratings, replies, and helpful feedback.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-sm hover:border-brand-500/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center mb-4">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">TMDB Live Sync</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Stream live popular blockbusters and TV series fetched directly from TMDB API with real posters.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-sm hover:border-brand-500/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center mb-4">
              <MonitorPlay className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Multi-Server HD Streaming</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Stream movies & TV series with fast server switching, subtitles, resume memory, and fullscreen support.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}
