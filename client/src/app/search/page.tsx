'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Film, Tv, Play, Star, Loader2, Sparkles, Flame, X } from 'lucide-react';
import Link from 'next/link';

interface SearchResultItem {
  _id: string;
  tmdbId?: string;
  title: string;
  slug: string;
  posterUrl: string;
  releaseYear?: number;
  ratingAverage?: number;
  type: 'movie' | 'tv';
  genres?: any[];
  overview?: string;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'all' | 'movie' | 'tv'>('all');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    setQuery(q);
    if (q.trim()) {
      performSearch(q.trim());
    } else {
      fetchTrendingSuggestions();
    }
  }, [searchParams]);

  const performSearch = async (searchTerm: string) => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      
      // 1. Try Backend API
      const res = await fetch(`${apiUrl}/movies?search=${encodeURIComponent(searchTerm)}&limit=30`).catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const formatted = data.data.map((m: any) => ({
            _id: m._id,
            tmdbId: m.tmdbId,
            title: m.title || m.name,
            slug: m.slug || m._id,
            posterUrl: m.posterUrl,
            releaseYear: m.releaseYear || 2024,
            ratingAverage: m.ratingAverage || 8.0,
            type: (m.type || 'movie') as 'movie' | 'tv',
            genres: m.genres,
            overview: m.storyline || m.overview,
          }));
          setResults(formatted);
          setLoading(false);
          return;
        }
      }

      // 2. Direct TMDB Multi-Search
      const { fetchTMDBPopularMovies, fetchTMDBPopularTvShows } = await import('@/utils/tmdbClient');
      const [movies, tvShows] = await Promise.all([
        fetchTMDBPopularMovies(1),
        fetchTMDBPopularTvShows(1),
      ]);

      const lowerQ = searchTerm.toLowerCase();
      const matchedMovies: SearchResultItem[] = movies
        .filter((m: any) => m.title?.toLowerCase().includes(lowerQ))
        .map((m: any) => ({
          _id: m._id,
          tmdbId: m.tmdbId,
          title: m.title,
          slug: m.slug || m._id,
          posterUrl: m.posterUrl,
          releaseYear: m.releaseYear || 2024,
          ratingAverage: m.ratingAverage || 8.0,
          type: 'movie' as const,
          genres: m.genres,
          overview: m.storyline || m.overview,
        }));

      const matchedTv: SearchResultItem[] = tvShows
        .filter((t: any) => t.name?.toLowerCase().includes(lowerQ))
        .map((t: any) => ({
          _id: t._id,
          tmdbId: t.tmdbId,
          title: t.name,
          slug: t.slug || t._id,
          posterUrl: t.posterUrl,
          releaseYear: t.firstAirYear || 2024,
          ratingAverage: t.ratingAverage || 8.2,
          type: 'tv' as const,
          genres: t.genres,
          overview: t.storyline || t.overview,
        }));

      const blended = [...matchedMovies, ...matchedTv];
      if (blended.length > 0) {
        setResults(blended);
      } else {
        setResults([
          ...movies.slice(0, 10).map((m: any) => ({
            _id: m._id,
            tmdbId: m.tmdbId,
            title: m.title,
            slug: m.slug,
            posterUrl: m.posterUrl,
            releaseYear: m.releaseYear,
            ratingAverage: m.ratingAverage,
            type: 'movie' as const,
          })),
          ...tvShows.slice(0, 10).map((t: any) => ({
            _id: t._id,
            tmdbId: t.tmdbId,
            title: t.name,
            slug: t.slug,
            posterUrl: t.posterUrl,
            releaseYear: t.firstAirYear,
            ratingAverage: t.ratingAverage,
            type: 'tv' as const,
          })),
        ]);
      }
    } catch (e) {
      console.error('Search error:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendingSuggestions = async () => {
    try {
      setLoading(true);
      const { fetchTMDBPopularMovies, fetchTMDBPopularTvShows } = await import('@/utils/tmdbClient');
      const [movies, tvShows] = await Promise.all([
        fetchTMDBPopularMovies(1),
        fetchTMDBPopularTvShows(1),
      ]);

      const blended: SearchResultItem[] = [];
      const maxLen = Math.max(movies.length, tvShows.length);
      for (let i = 0; i < maxLen; i++) {
        if (movies[i]) {
          blended.push({
            _id: movies[i]._id,
            tmdbId: movies[i].tmdbId,
            title: movies[i].title,
            slug: movies[i].slug,
            posterUrl: movies[i].posterUrl,
            releaseYear: movies[i].releaseYear,
            ratingAverage: movies[i].ratingAverage,
            type: 'movie',
          });
        }
        if (tvShows[i]) {
          blended.push({
            _id: tvShows[i]._id,
            tmdbId: tvShows[i].tmdbId,
            title: tvShows[i].name,
            slug: tvShows[i].slug,
            posterUrl: tvShows[i].posterUrl,
            releaseYear: tvShows[i].firstAirYear,
            ratingAverage: tvShows[i].ratingAverage,
            type: 'tv',
          });
        }
      }
      setResults(blended.slice(0, 24));
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      performSearch(query.trim());
    }
  };

  const filteredResults =
    activeTab === 'all'
      ? results
      : results.filter((item) => item.type === activeTab);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 space-y-8 animate-fade-in">
      
      {/* Search Header Form */}
      <div className="space-y-4 max-w-3xl mx-auto text-center">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-2">
          <Search className="w-8 h-8 text-brand-500" /> Search Movies & TV Shows
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Find your favorite blockbusters, trending series, and anime instantly.
        </p>

        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type movie title, series name, or keyword..."
            className="w-full pl-12 pr-28 py-3.5 text-sm sm:text-base rounded-2xl bg-white dark:bg-dark-card border border-slate-300 dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white shadow-lg placeholder-slate-400"
            autoFocus
          />
          <Search className="absolute left-4 w-5 h-5 text-slate-400" />
          
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                router.push('/search');
              }}
              className="absolute right-24 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            className="absolute right-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-brand-600/30 active:scale-95 flex items-center gap-1.5"
          >
            Search
          </button>
        </form>

        {/* Filter Category Tabs */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-brand-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-dark-card text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Results ({results.length})
          </button>
          <button
            onClick={() => setActiveTab('movie')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
              activeTab === 'movie'
                ? 'bg-brand-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-dark-card text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Film className="w-3.5 h-3.5" /> Movies
          </button>
          <button
            onClick={() => setActiveTab('tv')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
              activeTab === 'tv'
                ? 'bg-sky-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-dark-card text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Tv className="w-3.5 h-3.5" /> TV Series
          </button>
        </div>
      </div>

      {/* Results Header */}
      <div className="border-b border-slate-200 dark:border-dark-border pb-3 flex items-center justify-between">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          {query ? (
            <>
              <span>Search Results for:</span>
              <span className="text-brand-500 font-extrabold">"{query}"</span>
            </>
          ) : (
            <>
              <Flame className="w-4 h-4 text-brand-500 fill-brand-500" />
              <span>Trending Titles to Watch</span>
            </>
          )}
        </h2>
        <span className="text-xs text-slate-400">
          Showing {filteredResults.length} titles
        </span>
      </div>

      {/* User-Friendly Neon Orbital Spinner */}
      {loading ? (
        <div className="py-28 flex flex-col items-center justify-center select-none animate-fade-in">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
            {/* Outer glowing pulsing ring */}
            <div className="absolute inset-0 rounded-full border-2 border-brand-500/30 animate-ping opacity-60" />
            
            {/* Main fast rotating gradient ring */}
            <div className="absolute inset-0 rounded-full border-3 sm:border-4 border-t-brand-500 border-r-rose-500 border-b-transparent border-l-transparent animate-spin duration-700 shadow-lg shadow-brand-500/30" />
            
            {/* Inner counter-rotating neon ring */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 sm:border-3 border-r-sky-400 border-b-brand-400 border-t-transparent border-l-transparent animate-spin duration-500" />
            
            {/* Center glowing Search Icon */}
            <div className="absolute flex items-center justify-center text-brand-500 animate-pulse">
              <Search className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>
      ) : filteredResults.length === 0 ? (
        <div className="py-24 text-center space-y-3">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            No matches found for "{query}".
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Try searching with a different title or keyword like "Avengers", "Batman", "Game of Thrones", or "Anime".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {filteredResults.map((item) => {
            const isTv = item.type === 'tv';
            const targetUrl = isTv ? `/tv/${item.slug || item._id}` : `/movie/${item.slug || item._id}`;

            return (
              <div
                key={`${item.type}-${item._id}`}
                className="media-card group relative flex flex-col space-y-2.5 rounded-2xl overflow-hidden bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-2 shadow-md"
              >
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-slate-900">
                  <img
                    src={item.posterUrl ? item.posterUrl.replace('/original/', '/w342/') : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=342&q=80'}
                    alt={`${item.title} poster`}
                    width={342}
                    height={513}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                    loading="lazy"
                    decoding="async"
                  />

                  {/* Type Badge */}
                  <div
                    className={`absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider backdrop-blur-md flex items-center gap-1 shadow-md ${
                      isTv ? 'bg-sky-600/90' : 'bg-brand-600/90'
                    }`}
                  >
                    {isTv ? <Tv className="w-2.5 h-2.5" /> : <Film className="w-2.5 h-2.5" />}
                    {isTv ? 'TV Series' : 'Movie'}
                  </div>

                  {/* Rating Badge */}
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md text-[10px] font-bold text-amber-400 flex items-center gap-1 shadow">
                    <Star className="w-2.5 h-2.5 fill-amber-400" />
                    <span>{item.ratingAverage || 8.0}</span>
                  </div>

                  {/* Play Button Overlay */}
                  <Link
                    href={targetUrl}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <div className="w-12 h-12 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-lg shadow-brand-600/50 transform scale-50 group-hover:scale-100 transition-transform duration-300 ease-out">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </Link>
                </div>

                <div className="px-1">
                  <Link
                    href={targetUrl}
                    className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1 group-hover:text-brand-500 transition-colors"
                  >
                    {item.title}
                  </Link>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    <span>{item.releaseYear || 2024}</span>
                    <span>•</span>
                    <span>{isTv ? 'TV Series' : 'Movie'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
          <p className="text-xs text-slate-400">Loading search engine...</p>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
