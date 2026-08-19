'use client';

import React, { useState, useEffect } from 'react';
import { MovieCard, MovieItem } from '@/components/MovieCard';
import { Filter, Search, Flame, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function TrendingPage() {
  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const genres = ['all', 'Action', 'Sci-Fi', 'Drama', 'Thriller', 'Adventure', 'Animation', 'Crime'];

  useEffect(() => {
    setCurrentPage(1);
    fetchMovies(1);
  }, [selectedGenre, searchTerm]);

  const fetchMovies = async (pageNum = currentPage) => {
    try {
      setLoading(true);
      const { fetchTMDBPopularMovies } = await import('@/utils/tmdbClient');
      
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append('search', searchTerm);
      if (selectedGenre !== 'all') queryParams.append('genre', selectedGenre.toLowerCase());
      queryParams.append('page', pageNum.toString());
      queryParams.append('limit', '100');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 600);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const backendPromise = fetch(`${apiUrl}/movies?${queryParams.toString()}`, { signal: controller.signal })
        .then(r => r.ok ? r.json() : null)
        .catch(() => null);

      const tmdbPromise = fetchTMDBPopularMovies(pageNum, selectedGenre, searchTerm);

      const [backendRes, tmdbData] = await Promise.all([
        backendPromise.finally(() => clearTimeout(timeoutId)),
        tmdbPromise
      ]);

      if (backendRes?.success && Array.isArray(backendRes?.data) && backendRes.data.length > 0) {
        setMovies(backendRes.data);
        setTotalPages(backendRes.pages || 1);
        setTotalCount(backendRes.total || backendRes.data.length);
      } else {
        setMovies(tmdbData);
        setTotalPages(500);
        setTotalCount(50000);
      }
    } catch (error) {
      console.error('Failed to fetch live movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchMovies(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 space-y-8 animate-fade-in">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 dark:border-dark-border pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Flame className="w-8 h-8 text-brand-500 fill-brand-500" /> Trending & Discover Movies Catalog
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse <strong className="text-brand-500 font-bold">{totalCount || movies.length}</strong> real popular blockbusters, top-rated hits, and live TMDB collections
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <input
              type="text"
              placeholder="Search movies or TMDB ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-full bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>
      </div>

      {/* Genre pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {genres.map((g) => (
          <button
            key={g}
            onClick={() => setSelectedGenre(g)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedGenre.toLowerCase() === g.toLowerCase()
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                : 'bg-white dark:bg-dark-card text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-dark-border'
            }`}
          >
            {g === 'all' ? 'All Genres' : g}
          </button>
        ))}
      </div>

      {/* Movie Grid with User-Friendly Neon Orbital Spinner */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-28 select-none animate-fade-in">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
            {/* Outer glowing pulsing ring */}
            <div className="absolute inset-0 rounded-full border-2 border-brand-500/30 animate-ping opacity-60" />
            
            {/* Main fast rotating gradient ring */}
            <div className="absolute inset-0 rounded-full border-3 sm:border-4 border-t-brand-500 border-r-rose-500 border-b-transparent border-l-transparent animate-spin duration-700 shadow-lg shadow-brand-500/30" />
            
            {/* Inner counter-rotating neon ring */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 sm:border-3 border-r-sky-400 border-b-brand-400 border-t-transparent border-l-transparent animate-spin duration-500" />
            
            {/* Center glowing Flame Icon */}
            <div className="absolute flex items-center justify-center text-brand-500 animate-pulse">
              <Flame className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6 border-t border-slate-200 dark:border-dark-border">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Page <strong className="text-brand-500">{currentPage}</strong> of {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/20 disabled:opacity-50 flex items-center gap-1"
          >
            Next Page <ChevronRight className="w-4 h-4" />
          </button>
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
