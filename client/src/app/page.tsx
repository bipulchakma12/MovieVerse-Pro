'use client';

import React, { useState, useEffect } from 'react';
import { Play, Flame, Star, Sparkles, MonitorPlay } from 'lucide-react';
import Link from 'next/link';
import { MovieCard, MovieItem } from '@/components/MovieCard';

export default function Home() {
  const [featuredMovies, setFeaturedMovies] = useState<MovieItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeMovies = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${apiUrl}/movies?limit=12`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setFeaturedMovies(data.data);
        }
      } catch (e) {
        console.error('Failed to fetch home movies:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeMovies();
  }, []);

  return (
    <div className="space-y-12 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-32 bg-gradient-to-b from-slate-900/60 to-transparent dark:from-dark-nav/80">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-900/30 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-500 border border-brand-500/20 mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Next-Gen Streaming & Recommendation Platform
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-none max-w-4xl mx-auto">
            Unlimited Movies, Series & Custom{' '}
            <span className="bg-gradient-to-r from-brand-500 via-rose-500 to-amber-500 bg-clip-text text-transparent">
              Watchlists
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Welcome to <strong className="text-slate-800 dark:text-slate-200">MovieVerse Pro</strong>. Explore trending blockbusters, live TMDB collections, real-time reviews, and interactive video playback.
          </p>

          <div className="mt-8 flex items-center justify-center">
            <Link
              href="/trending"
              className="px-8 py-3.5 rounded-full font-bold text-white bg-brand-600 hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 active:scale-95"
            >
              <Play className="w-5 h-5 fill-current" /> Explore All Movies
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Live Movies Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-dark-border pb-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Flame className="w-6 h-6 text-brand-500 fill-brand-500" /> Featured & Popular Movies
          </h2>
          <Link href="/trending" className="text-xs font-bold text-brand-500 hover:underline">
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-xs text-slate-400">
            Loading live TMDB movies from database...
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {featuredMovies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
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
              Stream live popular blockbusters fetched directly from TMDB API with real posters and trailers.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-sm hover:border-brand-500/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
              <MonitorPlay className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Advanced Video Player</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Stream trailers with quality options, subtitles, resume playback memory, and fullscreen mode.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}
