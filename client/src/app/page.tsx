'use client';

import React, { useState, useEffect } from 'react';
import { Play, Flame, Star, Sparkles, MonitorPlay, Tv, Film } from 'lucide-react';
import Link from 'next/link';
import { MovieCard, MovieItem } from '@/components/MovieCard';

interface TvItem {
  _id: string;
  tmdbId?: string;
  name: string;
  slug: string;
  posterUrl: string;
  firstAirYear?: number;
  ratingAverage?: number;
  numberOfSeasons?: number;
  genres?: any[];
}

export default function Home() {
  const [featuredMovies, setFeaturedMovies] = useState<MovieItem[]>([]);
  const [featuredTvShows, setFeaturedTvShows] = useState<TvItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeCatalog = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

        // 1. Fetch Movies
        const movieRes = await fetch(`${apiUrl}/movies?limit=30`).catch(() => null);
        if (movieRes && movieRes.ok) {
          const data = await movieRes.json();
          if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            setFeaturedMovies(data.data);
          } else {
            const { fetchTMDBPopularMovies } = await import('@/utils/tmdbClient');
            const fallbackMovies = await fetchTMDBPopularMovies();
            setFeaturedMovies(fallbackMovies.slice(0, 30));
          }
        } else {
          const { fetchTMDBPopularMovies } = await import('@/utils/tmdbClient');
          const fallbackMovies = await fetchTMDBPopularMovies();
          setFeaturedMovies(fallbackMovies.slice(0, 30));
        }

        // 2. Fetch TV Shows
        const tvRes = await fetch(`${apiUrl}/tv?limit=30`).catch(() => null);
        if (tvRes && tvRes.ok) {
          const data = await tvRes.json();
          if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            setFeaturedTvShows(data.data);
          } else {
            const { fetchTMDBPopularTvShows } = await import('@/utils/tmdbClient');
            const fallbackTv = await fetchTMDBPopularTvShows();
            setFeaturedTvShows(fallbackTv.slice(0, 30));
          }
        } else {
          const { fetchTMDBPopularTvShows } = await import('@/utils/tmdbClient');
          const fallbackTv = await fetchTMDBPopularTvShows();
          setFeaturedTvShows(fallbackTv.slice(0, 30));
        }
      } catch (e) {
        console.error('Failed to fetch home catalog:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeCatalog();
  }, []);

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

      {/* 1. Featured & Popular Movies Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-dark-border pb-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Flame className="w-6 h-6 text-brand-500 fill-brand-500" /> Featured & Popular Movies
          </h2>
          <Link href="/trending" className="text-xs font-bold text-brand-500 hover:underline">
            View All Movies →
          </Link>
        </div>

        {loading && featuredMovies.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-400">
            Loading live movies...
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {featuredMovies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        )}
      </section>

      {/* 2. Trending TV Series & Shows Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-dark-border pb-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Tv className="w-6 h-6 text-sky-500" /> Trending TV Series & Shows
          </h2>
          <Link href="/tv" className="text-xs font-bold text-sky-500 hover:underline">
            View All TV Shows →
          </Link>
        </div>

        {loading && featuredTvShows.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-400">
            Loading live TV shows...
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {featuredTvShows.map((show) => (
              <Link
                key={show._id}
                href={`/tv/${show.slug || show._id}`}
                className="group flex flex-col space-y-2.5"
              >
                <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-dark-border shadow-md group-hover:border-sky-500 transition-all duration-300">
                  <img
                    src={show.posterUrl}
                    alt={show.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* TV Show Badge */}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-sky-600/90 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
                    <Tv className="w-2.5 h-2.5" /> TV Series
                  </div>

                  {/* Rating Badge */}
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] font-bold text-amber-400 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400" /> {show.ratingAverage || 8.0}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1 group-hover:text-sky-500 transition-colors">
                    {show.name}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    <span>{show.firstAirYear || 2024}</span>
                    <span>•</span>
                    <span>HD Series</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 3. Feature Highlights Grid */}
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
