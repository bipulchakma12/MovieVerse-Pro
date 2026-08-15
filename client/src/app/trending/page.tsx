'use client';

import React, { useState, useEffect } from 'react';
import { MovieCard, MovieItem } from '@/components/MovieCard';
import { Filter, Search, Flame, Loader2 } from 'lucide-react';

export default function TrendingPage() {
  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const genres = ['all', 'Action', 'Sci-Fi', 'Drama', 'Thriller', 'Adventure', 'Animation', 'Crime'];

  useEffect(() => {
    fetchMovies();
  }, [selectedGenre, searchTerm]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append('search', searchTerm);
      if (selectedGenre !== 'all') queryParams.append('genre', selectedGenre.toLowerCase());
      queryParams.append('limit', '60');

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/movies?${queryParams.toString()}`).catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setMovies(data.data);
          setLoading(false);
          return;
        }
      }

      // Fallback to TMDB API directly for live hosting deployments
      const { fetchTMDBPopularMovies } = await import('@/utils/tmdbClient');
      const fallbackData = await fetchTMDBPopularMovies();
      setMovies(fallbackData);
    } catch (error) {
      console.error('Failed to fetch live movies:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 dark:border-dark-border pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Flame className="w-8 h-8 text-brand-500 fill-brand-500" /> Trending & Discover Movies
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse real popular blockbusters, top-rated hits, and TMDB live imports
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="Search movies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-full bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Genre Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
        {genres.map((g) => (
          <button
            key={g}
            onClick={() => setSelectedGenre(g)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedGenre === g
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                : 'bg-white dark:bg-dark-card text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-dark-border'
            }`}
          >
            {g === 'all' ? 'All Genres' : g}
          </button>
        ))}
      </div>

      {/* Movie Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          <p className="text-xs text-slate-400">Loading live movies from backend...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      )}

      {!loading && movies.length === 0 && (
        <div className="text-center py-16 text-slate-500 dark:text-slate-400 text-sm">
          No movies found matching your search criteria.
        </div>
      )}

    </div>
  );
}
