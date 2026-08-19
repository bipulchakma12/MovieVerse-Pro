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

// Instant Pre-rendered Blockbuster Heroes (0ms instant display on refresh)
const INITIAL_HERO_BLOCKBUSTERS: MediaItem[] = [
  {
    _id: '634649',
    tmdbId: '634649',
    title: 'Spider-Man: No Way Home',
    slug: 'spider-man-no-way-home-634649',
    posterUrl: 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
    bannerUrl: 'https://image.tmdb.org/t/p/original/14QbnygCuTO0vl7CAFmPf1fgZfV.jpg',
    releaseYear: 2021,
    runtimeMinutes: 148,
    runtimeOrSeasons: '148min',
    ratingAverage: 8.2,
    type: 'movie',
    storyline: 'Peter Parker seeks the help of Doctor Strange to make people forget his identity as Spider-Man, leading to dangerous multiverse collisions.',
  },
  {
    _id: '533535',
    tmdbId: '533535',
    title: 'Deadpool & Wolverine',
    slug: 'deadpool-and-wolverine-533535',
    posterUrl: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    bannerUrl: 'https://image.tmdb.org/t/p/original/yDHYTjA3R0jFYba16jBB1jv82E9.jpg',
    releaseYear: 2024,
    runtimeMinutes: 128,
    runtimeOrSeasons: '128min',
    ratingAverage: 8.0,
    type: 'movie',
    storyline: 'A listless Wade Wilson toils in civilian life until a threat to his universe forces him to team up with an even more reluctant Wolverine.',
  },
  {
    _id: '693134',
    tmdbId: '693134',
    title: 'Dune: Part Two',
    slug: 'dune-part-two-693134',
    posterUrl: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    bannerUrl: 'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s520b4q.jpg',
    releaseYear: 2024,
    runtimeMinutes: 166,
    runtimeOrSeasons: '166min',
    ratingAverage: 8.6,
    type: 'movie',
    storyline: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
  },
  {
    _id: '872585',
    tmdbId: '872585',
    title: 'Oppenheimer',
    slug: 'oppenheimer-872585',
    posterUrl: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    bannerUrl: 'https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg',
    releaseYear: 2023,
    runtimeMinutes: 180,
    runtimeOrSeasons: '180min',
    ratingAverage: 8.9,
    type: 'movie',
    storyline: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
  },
  {
    _id: '1399',
    tmdbId: '1399',
    title: 'Game of Thrones',
    slug: 'game-of-thrones-1399',
    posterUrl: 'https://image.tmdb.org/t/p/w500/7WUHnWGx5OO145IRxPDUkQSh4C7.jpg',
    bannerUrl: 'https://image.tmdb.org/t/p/original/suopoADq0k8YZr4dQXcU6p0k3xH.jpg',
    releaseYear: 2011,
    runtimeOrSeasons: '8 Seasons',
    ratingAverage: 8.4,
    type: 'tv',
    storyline: 'Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia.',
  },
  {
    _id: '76600',
    tmdbId: '76600',
    title: 'Avatar: The Way of Water',
    slug: 'avatar-the-way-of-water-76600',
    posterUrl: 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
    bannerUrl: 'https://image.tmdb.org/t/p/original/ovM06PdF36CfeK0upcN0G986VWn.jpg',
    releaseYear: 2022,
    runtimeMinutes: 192,
    runtimeOrSeasons: '192min',
    ratingAverage: 7.8,
    type: 'movie',
    storyline: 'Jake Sully lives with his newfound family on the extrasolar moon Pandora. Once a familiar threat returns, Jake must work with the army of the Na\'vi.',
  }
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<'all' | 'movie' | 'tv'>('all');
  const [allMedia, setAllMedia] = useState<MediaItem[]>(INITIAL_HERO_BLOCKBUSTERS);
  const [heroSlides, setHeroSlides] = useState<MediaItem[]>(INITIAL_HERO_BLOCKBUSTERS);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const slideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Mobile Touch Swipe Gesture Detection
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 45) {
      nextSlide(); // Swipe Left -> Next Slide
    } else if (diff < -45) {
      prevSlide(); // Swipe Right -> Prev Slide
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  useEffect(() => {
    // Fast parallel background fetch
    const fetchHomeCatalog = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

        // Parallel TMDB & API fetch with 2s timeout
        const fetchMoviesPromise = fetch(`${apiUrl}/movies?limit=24`, { signal: AbortSignal.timeout(2000) })
          .then((res) => (res.ok ? res.json() : null))
          .catch(() => null);

        const fetchTvPromise = fetch(`${apiUrl}/tv?limit=24`, { signal: AbortSignal.timeout(2000) })
          .then((res) => (res.ok ? res.json() : null))
          .catch(() => null);

        const [movieData, tvData] = await Promise.all([fetchMoviesPromise, fetchTvPromise]);

        let moviesList: MediaItem[] = [];
        if (movieData && movieData.success && Array.isArray(movieData.data) && movieData.data.length > 0) {
          moviesList = movieData.data.map((m: any) => ({
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
        } else {
          const { fetchTMDBPopularMovies } = await import('@/utils/tmdbClient');
          const fallbackMovies = await fetchTMDBPopularMovies();
          if (fallbackMovies && fallbackMovies.length > 0) {
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
        }

        let tvList: MediaItem[] = [];
        if (tvData && tvData.success && Array.isArray(tvData.data) && tvData.data.length > 0) {
          tvList = tvData.data.map((t: any) => ({
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
        } else {
          const { fetchTMDBPopularTvShows } = await import('@/utils/tmdbClient');
          const fallbackTv = await fetchTMDBPopularTvShows();
          if (fallbackTv && fallbackTv.length > 0) {
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
        }

        if (moviesList.length > 0) {
          setHeroSlides(moviesList.slice(0, 6));
        }

        const combined: MediaItem[] = [];
        const maxLen = Math.max(moviesList.length, tvList.length);
        for (let i = 0; i < maxLen; i++) {
          if (i < moviesList.length) combined.push(moviesList[i]);
          if (i < tvList.length) combined.push(tvList[i]);
        }

        if (combined.length > 0) {
          setAllMedia(combined);
        }
      } catch (e) {
        console.error('Fast catalog sync:', e);
      }
    };

    fetchHomeCatalog();

    // Real-Time Live Auto-Update: Polling every 5 minutes for globally published movies
    const autoSyncTimer = setInterval(fetchHomeCatalog, 5 * 60 * 1000);
    return () => clearInterval(autoSyncTimer);
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

  const currentHero = heroSlides[currentSlide] || heroSlides[0];

  const displayedMedia =
    activeTab === 'all'
      ? allMedia
      : activeTab === 'movie'
      ? allMedia.filter((item) => item.type === 'movie')
      : allMedia.filter((item) => item.type === 'tv');

  return (
    <div className="space-y-8 sm:space-y-12 pb-20 animate-fade-in">
      
      {/* CineB-Style Cinematic Hero Slider with Touch-Swipe Support */}
      {currentHero && (
        <section
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="relative w-full h-[480px] sm:h-[580px] lg:h-[680px] overflow-hidden bg-slate-950 select-none group"
        >
          {/* Background Backdrop Image with Smooth Crossfade */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img
              key={currentHero._id}
              src={currentHero.bannerUrl || currentHero.posterUrl}
              alt={currentHero.title}
              className="w-full h-full object-cover object-center animate-fade-in transform scale-105 duration-1000 ease-out"
              loading="eager"
            />
            {/* CineB Crystal-Clear Full-Light Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent max-w-xl sm:max-w-2xl" />
            <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#0b0c10] via-[#0b0c10]/40 to-transparent" />
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/60 to-transparent" />
          </div>

          {/* Left Hero Content Info */}
          <div className="relative z-10 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-center pt-20 sm:pt-24 pb-12 sm:pb-16 space-y-3 sm:space-y-6">
            
            {/* Big Bold Movie Title */}
            <h1 className="text-2xl sm:text-4xl lg:text-6xl font-black text-white leading-tight max-w-3xl drop-shadow-lg tracking-tight line-clamp-2">
              {currentHero.title}
            </h1>

            {/* Meta Tags Row: HD Badge | Duration | IMDB Rating */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[11px] sm:text-sm">
              <span className="px-2 py-0.5 rounded bg-[#00e054] text-black font-black text-[10px] sm:text-xs tracking-wider shadow">
                HD
              </span>
              <span className="text-slate-300 font-medium">
                Duration: <strong className="text-white">{currentHero.runtimeOrSeasons || '145min'}</strong>
              </span>
              <span className="flex items-center gap-1 font-semibold">
                <span className="text-[#f5c518] font-black">IMDB:</span>
                <span className="text-white font-bold">{currentHero.ratingAverage || 7.9}</span>
              </span>
              <span className="text-slate-400">
                Year: <span className="text-slate-200">{currentHero.releaseYear || 2024}</span>
              </span>
            </div>

            {/* Storyline / Overview snippet */}
            {currentHero.storyline && (
              <p className="text-xs sm:text-sm text-slate-300/90 line-clamp-2 sm:line-clamp-3 max-w-2xl leading-relaxed hidden sm:block">
                {currentHero.storyline}
              </p>
            )}

            {/* Action Buttons: Watch Now & Details */}
            <div className="pt-1 sm:pt-2 flex items-center gap-3">
              <Link
                href={currentHero.type === 'tv' ? `/tv/${currentHero.slug || currentHero._id}` : `/movie/${currentHero.slug || currentHero._id}`}
                className="px-5 sm:px-8 py-2.5 sm:py-3.5 rounded-full bg-[#00e054] hover:bg-[#00c74a] text-black font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg shadow-[#00e054]/30 hover:scale-105 active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" /> Watch now
              </Link>
              <Link
                href={currentHero.type === 'tv' ? `/tv/${currentHero.slug || currentHero._id}` : `/movie/${currentHero.slug || currentHero._id}`}
                className="px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm backdrop-blur-md border border-white/10 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
              >
                <Info className="w-4 h-4" /> Details
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
          <div className="absolute bottom-5 right-4 sm:right-8 z-20 flex items-center gap-1.5 sm:gap-2 bg-black/50 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/10">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 ${
                  idx === currentSlide
                    ? 'bg-white scale-125 ring-2 ring-[#00e054]'
                    : 'bg-white/40 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </section>
      )}

      {/* Main Combined Feed: Featured Movies & TV Shows */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
        
        {/* Section Header with Category Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-dark-border pb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-brand-500 fill-brand-500 animate-pulse" />
            <h2 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white">
              Featured Movies & TV Shows
            </h2>
          </div>

          {/* Quick Filter Tabs: All / Movies / TV Shows with Modern Animated Hover Pills */}
          <div className="flex items-center gap-1.5 bg-black/40 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md shadow-inner overflow-x-auto scrollbar-none select-none">
            <button
              onClick={() => setActiveTab('all')}
              className={`group px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 flex items-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-gradient-to-r from-brand-600 to-rose-600 text-white shadow-lg shadow-brand-600/40 scale-105'
                  : 'text-slate-300 hover:text-white hover:bg-white/15 hover:scale-105 active:scale-95'
              }`}
            >
              <span className="group-hover:scale-125 transition-transform duration-300">🔥</span>
              <span>All Titles</span>
            </button>

            <button
              onClick={() => setActiveTab('movie')}
              className={`group px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 flex items-center gap-1.5 ${
                activeTab === 'movie'
                  ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-600/40 scale-105'
                  : 'text-slate-300 hover:text-rose-300 hover:bg-white/15 hover:scale-105 active:scale-95'
              }`}
            >
              <span className="group-hover:scale-125 group-hover:rotate-12 transition-transform duration-300">🍿</span>
              <span>Movies</span>
            </button>

            <button
              onClick={() => setActiveTab('tv')}
              className={`group px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 flex items-center gap-1.5 ${
                activeTab === 'tv'
                  ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-lg shadow-sky-600/40 scale-105'
                  : 'text-slate-300 hover:text-sky-300 hover:bg-white/15 hover:scale-105 active:scale-95'
              }`}
            >
              <span className="group-hover:scale-125 group-hover:-translate-y-0.5 transition-transform duration-300">📺</span>
              <span>TV Series</span>
            </button>
          </div>
        </div>

        {/* Media Grid: 2 Columns on Mobile, 6 Columns on Desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-6">
          {displayedMedia.map((item) => {
            const targetUrl = item.type === 'movie' ? `/movie/${item.slug || item._id}` : `/tv/${item.slug || item._id}`;
            const isTv = item.type === 'tv';

            return (
              <Link
                key={`${item.type}-${item._id}`}
                href={targetUrl}
                className="media-card group flex flex-col space-y-2 rounded-xl sm:rounded-2xl overflow-hidden bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-1.5 sm:p-2 shadow-md"
              >
                <div className="relative aspect-[2/3] rounded-lg sm:rounded-xl overflow-hidden bg-slate-900">
                  <img
                    src={item.posterUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                    loading="lazy"
                  />

                  {/* Type Badge */}
                  <div
                    className={`absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold text-white uppercase tracking-wider backdrop-blur-md flex items-center gap-1 shadow-md ${
                      isTv ? 'bg-sky-600/90' : 'bg-brand-600/90'
                    }`}
                  >
                    {isTv ? <Tv className="w-2.5 h-2.5" /> : <Film className="w-2.5 h-2.5" />}
                    {isTv ? 'TV' : 'Movie'}
                  </div>

                  {/* Rating Badge */}
                  <div className="absolute top-1.5 right-1.5 px-1.5 sm:px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[9px] sm:text-[10px] font-bold text-amber-400 flex items-center gap-0.5 sm:gap-1 shadow">
                    <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400" /> {item.ratingAverage || 8.0}
                  </div>

                  {/* Hover Play Icon Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-lg shadow-brand-600/50 transform scale-75 group-hover:scale-100 transition-transform duration-200">
                      <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>

                <div className="px-1">
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-brand-500 transition-colors">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    <span>{item.releaseYear || 2024}</span>
                    <span>•</span>
                    <span className="truncate">{item.runtimeOrSeasons}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Feature Highlights Grid with Left-to-Right Sliding Background Animation */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          
          {/* Card 1: Curated Ratings & Reviews */}
          <div className="relative overflow-hidden group p-6 sm:p-7 rounded-3xl bg-[#14151c] border border-white/10 shadow-lg hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-500 cursor-pointer select-none">
            {/* Sliding Background from Left to Right */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/25 via-amber-500/10 to-transparent -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out pointer-events-none" />
            <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-amber-500 via-amber-400 to-transparent -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-out pointer-events-none" />

            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-amber-500 group-hover:text-black transition-all duration-300 shadow-md">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-1.5 group-hover:text-amber-300 transition-colors">
                Curated Ratings & Reviews
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed group-hover:text-slate-200 transition-colors">
                Engage with film critics and enthusiasts. Share star ratings, replies, and helpful feedback.
              </p>
            </div>
          </div>

          {/* Card 2: TMDB Live Sync */}
          <div className="relative overflow-hidden group p-6 sm:p-7 rounded-3xl bg-[#14151c] border border-white/10 shadow-lg hover:border-brand-500/40 hover:shadow-2xl hover:shadow-brand-500/10 transition-all duration-500 cursor-pointer select-none">
            {/* Sliding Background from Left to Right */}
            <div className="absolute inset-0 bg-gradient-to-r from-brand-600/30 via-rose-600/15 to-transparent -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out pointer-events-none" />
            <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-brand-500 via-rose-500 to-transparent -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-out pointer-events-none" />

            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-brand-600 group-hover:text-white transition-all duration-300 shadow-md">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-1.5 group-hover:text-brand-300 transition-colors">
                TMDB Live Sync
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed group-hover:text-slate-200 transition-colors">
                Stream live popular blockbusters and TV series fetched directly from TMDB API with real posters.
              </p>
            </div>
          </div>

          {/* Card 3: Multi-Server HD Streaming */}
          <div className="relative overflow-hidden group p-6 sm:p-7 rounded-3xl bg-[#14151c] border border-white/10 shadow-lg hover:border-sky-500/40 hover:shadow-2xl hover:shadow-sky-500/10 transition-all duration-500 cursor-pointer select-none">
            {/* Sliding Background from Left to Right */}
            <div className="absolute inset-0 bg-gradient-to-r from-sky-500/25 via-sky-500/10 to-transparent -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out pointer-events-none" />
            <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-sky-500 via-sky-400 to-transparent -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-out pointer-events-none" />

            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-sky-500 group-hover:text-black transition-all duration-300 shadow-md">
                <MonitorPlay className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-1.5 group-hover:text-sky-300 transition-colors">
                Multi-Server HD Streaming
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed group-hover:text-slate-200 transition-colors">
                Stream movies & TV series with fast server switching, subtitles, resume memory, and fullscreen support.
              </p>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
