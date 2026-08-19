'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Flame, Star, Sparkles, MonitorPlay, Tv, Film, Bookmark, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import Link from 'next/link';

interface MediaItem {
  _id: string;
  tmdbId?: string;
  title: string;
  slug: string;
  posterUrl: string;
  bannerUrl?: string;
  releaseYear?: number;
  runtimeMinutes?: number;
  ratingAverage?: number;
  type: 'movie' | 'tv';
  runtimeOrSeasons?: string;
  genres?: any[];
  storyline?: string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'all' | 'movie' | 'tv'>('all');
  const [allMedia, setAllMedia] = useState<MediaItem[]>([]);
  const [heroSlides, setHeroSlides] = useState<MediaItem[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const slideTimerRef = useRef<NodeJS.Timeout | null>(null);

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
              bannerUrl: m.bannerUrl || m.posterUrl,
              releaseYear: m.releaseYear || 2024,
              ratingAverage: m.ratingAverage || 7.9,
              type: 'movie' as const,
              runtimeOrSeasons: `${m.runtimeMinutes || 135}min`,
              genres: m.genres,
              storyline: m.storyline,
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
            bannerUrl: m.bannerUrl || m.posterUrl,
            releaseYear: m.releaseYear || 2024,
            ratingAverage: m.ratingAverage || 7.9,
            type: 'movie' as const,
            runtimeOrSeasons: `${m.runtimeMinutes || 135}min`,
            genres: m.genres,
            storyline: m.storyline,
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
              bannerUrl: t.bannerUrl || t.posterUrl,
              releaseYear: t.firstAirYear || 2024,
              ratingAverage: t.ratingAverage || 8.1,
              type: 'tv' as const,
              runtimeOrSeasons: `${t.numberOfSeasons || 1} Seasons`,
              genres: t.genres,
              storyline: t.storyline,
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
            bannerUrl: t.bannerUrl || t.posterUrl,
            releaseYear: t.firstAirYear || 2024,
            ratingAverage: t.ratingAverage || 8.1,
            type: 'tv' as const,
            runtimeOrSeasons: `${t.numberOfSeasons || 1} Seasons`,
            genres: t.genres,
            storyline: t.storyline,
          }));
        }

        // Top 6 Blockbusters for Hero Slider Carousel
        const topHeroItems = moviesList.slice(0, 6);
        setHeroSlides(topHeroItems);

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

  // Automatic Hero Carousel Slider Interval (every 5 seconds)
  useEffect(() => {
    if (heroSlides.length <= 1 || isPaused) return;

    slideTimerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => {
      if (slideTimerRef.current) clearInterval(slideTimerRef.current);
    };
  }, [heroSlides, isPaused, currentSlide]);

  const nextSlide = () => {
    if (heroSlides.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    if (heroSlides.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const currentHero = heroSlides[currentSlide] || null;

  const displayedMedia =
    activeTab === 'all'
      ? allMedia
      : activeTab === 'movie'
      ? allMedia.filter((item) => item.type === 'movie')
      : allMedia.filter((item) => item.type === 'tv');

  return (
    <div className="space-y-12 pb-20 animate-fade-in">
      
      {/* CineB-Style Cinematic Hero Slider */}
      {currentHero ? (
        <section
          className="relative w-full h-[520px] sm:h-[600px] lg:h-[680px] overflow-hidden bg-slate-950 select-none group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Background Backdrop Image with Smooth Crossfade */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img
              key={currentHero._id}
              src={currentHero.bannerUrl || currentHero.posterUrl}
              alt={currentHero.title}
              className="w-full h-full object-cover object-center animate-fade-in transform scale-105 duration-1000 ease-out"
            />
            {/* CineB Crystal-Clear Full-Light Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent max-w-xl sm:max-w-2xl" />
            <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#0b0c10] via-[#0b0c10]/30 to-transparent" />
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/50 to-transparent" />
          </div>

          {/* Left Hero Content Info */}
          <div className="relative z-10 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-center pt-20 sm:pt-24 pb-12 sm:pb-16 space-y-4 sm:space-y-6">
            
            {/* Big Bold Movie Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight max-w-3xl drop-shadow-lg tracking-tight">
              {currentHero.title}
            </h1>

            {/* Meta Tags Row: HD Badge | Duration | IMDB Rating */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm">
              <span className="px-2 py-0.5 rounded bg-[#00e054] text-black font-black text-xs tracking-wider shadow">
                HD
              </span>
              <span className="text-slate-300 font-medium">
                Duration: <strong className="text-white">{currentHero.runtimeOrSeasons || '145min'}</strong>
              </span>
              <span className="flex items-center gap-1.5 font-semibold">
                <span className="text-[#f5c518] font-black">IMDB:</span>
                <span className="text-white font-bold">{currentHero.ratingAverage || 7.9}</span>
              </span>
              <span className="text-slate-400">
                Year: <span className="text-slate-200">{currentHero.releaseYear || 2024}</span>
              </span>
            </div>

            {/* Storyline / Overview snippet */}
            {currentHero.storyline && (
              <p className="text-xs sm:text-sm text-slate-300/90 line-clamp-2 sm:line-clamp-3 max-w-2xl leading-relaxed">
                {currentHero.storyline}
              </p>
            )}

            {/* Action Buttons: Watch Now & Details */}
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <Link
                href={`/movie/${currentHero.slug || currentHero._id}`}
                className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl bg-[#00e054] hover:bg-[#00c74a] text-black font-extrabold text-xs sm:text-sm flex items-center gap-2.5 transition-all shadow-lg shadow-[#00e054]/30 hover:scale-105 active:scale-95"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" /> Watch now
              </Link>
              <Link
                href={`/movie/${currentHero.slug || currentHero._id}`}
                className="px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm backdrop-blur-md border border-white/10 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <Info className="w-4 h-4" /> Movie Info
              </Link>
            </div>
          </div>

          {/* Left & Right Arrow Navigation Controls */}
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white opacity-0 group-hover:opacity-100 transition-all backdrop-blur-md border border-white/10 z-20 active:scale-90 hidden sm:block"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white opacity-0 group-hover:opacity-100 transition-all backdrop-blur-md border border-white/10 z-20 active:scale-90 hidden sm:block"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Bottom Right Pagination Dots (CineB Style) */}
          <div className="absolute bottom-6 right-4 sm:right-8 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  idx === currentSlide
                    ? 'bg-white scale-125 ring-2 ring-[#00e054]'
                    : 'bg-white/40 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </section>
      ) : (
        /* Loading Skeleton for Hero */
        <div className="w-full h-[520px] sm:h-[600px] bg-slate-900 animate-pulse flex items-center justify-center">
          <div className="text-slate-500 text-xs font-semibold">Loading blockbuster cinematic premiere...</div>
        </div>
      )}

      {/* Main Combined Feed: Featured Movies & TV Shows */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Section Header with Category Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-dark-border pb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-brand-500 fill-brand-500 animate-pulse" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Featured Movies & TV Shows
            </h2>
          </div>

          {/* Quick Filter Tabs: All / Movies / TV Shows */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-dark-card p-1 rounded-xl border border-slate-200 dark:border-dark-border shadow-inner">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                activeTab === 'all'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 scale-105'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
              }`}
            >
              🔥 All Titles
            </button>
            <button
              onClick={() => setActiveTab('movie')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                activeTab === 'movie'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 scale-105'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
              }`}
            >
              🍿 Movies
            </button>
            <button
              onClick={() => setActiveTab('tv')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                activeTab === 'tv'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 scale-105'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
              }`}
            >
              📺 TV Series
            </button>
          </div>
        </div>

        {/* Media Grid: Displays Both Movies & TV Series with Type Badges */}
        {loading && displayedMedia.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {Array.from({ length: 12 }).map((_, idx) => (
              <div key={idx} className="aspect-[2/3] rounded-2xl bg-slate-200 dark:bg-dark-card shimmer-loading animate-pulse" />
            ))}
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
                  className="media-card group flex flex-col space-y-2.5 rounded-2xl overflow-hidden bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-2 shadow-md"
                >
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-slate-900">
                    <img
                      src={item.posterUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                    />

                    {/* Type Badge: Rose for Movie, Sky Blue for TV Series */}
                    <div
                      className={`absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider backdrop-blur-md flex items-center gap-1 shadow-md transition-transform duration-300 group-hover:scale-105 ${
                        isTv ? 'bg-sky-600/90' : 'bg-brand-600/90'
                      }`}
                    >
                      {isTv ? <Tv className="w-2.5 h-2.5" /> : <Film className="w-2.5 h-2.5" />}
                      {isTv ? 'TV Series' : 'Movie'}
                    </div>

                    {/* Rating Badge */}
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-bold text-amber-400 flex items-center gap-1 shadow">
                      <Star className="w-3 h-3 fill-amber-400" /> {item.ratingAverage || 8.0}
                    </div>

                    {/* Hover Play Icon Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-lg shadow-brand-600/50 transform scale-50 group-hover:scale-100 transition-transform duration-300 ease-out">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>

                  <div className="px-1">
                    <h3 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1 group-hover:text-brand-500 transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
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
          
          <div className="media-card p-6 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-sm hover:border-amber-500/50">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Curated Ratings & Reviews</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Engage with film critics and enthusiasts. Share star ratings, replies, and helpful feedback.
            </p>
          </div>

          <div className="media-card p-6 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-sm hover:border-brand-500/50">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">TMDB Live Sync</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Stream live popular blockbusters and TV series fetched directly from TMDB API with real posters.
            </p>
          </div>

          <div className="media-card p-6 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-sm hover:border-sky-500/50">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
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
