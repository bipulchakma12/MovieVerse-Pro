'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Filter, Search, Star, Play, Flame, Loader2, ChevronLeft, ChevronRight, Bookmark } from 'lucide-react';
import { MovieItem } from '@/components/MovieCard';

export default function TrendingTopImdbPage() {
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
      const { fetchTMDBTopRatedMovies } = await import('@/utils/tmdbClient');
      
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append('search', searchTerm);
      if (selectedGenre !== 'all') queryParams.append('genre', selectedGenre.toLowerCase());
      queryParams.append('page', pageNum.toString());
      queryParams.append('limit', '100');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 600);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const backendPromise = fetch(`${apiUrl}/movies?${queryParams.toString()}&sort=rating`, { signal: controller.signal })
        .then(r => r.ok ? r.json() : null)
        .catch(() => null);

      const tmdbPromise = fetchTMDBTopRatedMovies(pageNum, selectedGenre, searchTerm);

      const [backendRes, tmdbData] = await Promise.all([
        backendPromise.finally(() => clearTimeout(timeoutId)),
        tmdbPromise
      ]);

      let resultList: MovieItem[] = [];

      if (backendRes?.success && Array.isArray(backendRes?.data) && backendRes.data.length > 0) {
        resultList = backendRes.data;
        setTotalPages(backendRes.pages || 1);
        setTotalCount(backendRes.total || backendRes.data.length);
      } else {
        resultList = tmdbData;
        setTotalPages(500);
        setTotalCount(50000);
      }

      // Sort strictly in descending order of IMDb rating so #1 is the highest rated
      const sorted = [...resultList].sort((a, b) => (b.ratingAverage || 0) - (a.ratingAverage || 0));
      setMovies(sorted);
    } catch (error) {
      console.error('Failed to fetch live Top IMDb movies:', error);
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
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-24 pb-12 space-y-6 sm:space-y-8 animate-fade-in select-none">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-white flex items-center gap-2.5">
            <Star className="w-7 h-7 sm:w-8 sm:h-8 text-amber-400 fill-amber-400" /> Top IMDb Ranked Movies
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Highest-rated all-time masterworks and blockbusters, ranked in exact descending order of IMDb score.
          </p>
        </div>

        {/* Filter Search Bar */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <input
              type="text"
              placeholder="Search top rated movies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-full bg-black/60 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>
        </div>
      </div>

      {/* Genre Pills with Left-to-Right Background Sweep Animation */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-3 scrollbar-none">
        {genres.map((g) => {
          const isActive = selectedGenre.toLowerCase() === g.toLowerCase();

          return (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`relative overflow-hidden group px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/30 font-black scale-105'
                  : 'bg-white/5 text-slate-300 border border-white/10 hover:border-amber-400/50 hover:shadow-md hover:shadow-amber-500/10'
              }`}
            >
              {/* Left-to-Right Gradient Background Sweep Animation */}
              {!isActive && (
                <span className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 opacity-90 -translate-x-full group-hover:translate-x-0 transition-transform duration-400 ease-out" />
              )}

              {/* Pill Text Content */}
              <span className={`relative z-10 flex items-center gap-1.5 transition-colors duration-300 ${!isActive ? 'group-hover:text-black font-semibold' : ''}`}>
                {g === 'all' ? 'All Genres' : g}
              </span>
            </button>
          );
        })}
      </div>

      {/* Movie Grid with Top IMDb Ranking Badges (#1, #2, #3...) */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-28 select-none animate-fade-in">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
            {/* Outer glowing pulsing ring */}
            <div className="absolute inset-0 rounded-full border-2 border-amber-400/30 animate-ping opacity-60" />
            
            {/* Main fast rotating gradient ring */}
            <div className="absolute inset-0 rounded-full border-3 sm:border-4 border-t-amber-400 border-r-amber-600 border-b-transparent border-l-transparent animate-spin duration-700 shadow-lg shadow-amber-500/30" />
            
            {/* Inner counter-rotating neon ring */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 sm:border-3 border-r-rose-400 border-b-amber-400 border-t-transparent border-l-transparent animate-spin duration-500" />
            
            {/* Center glowing Star Icon */}
            <div className="absolute flex items-center justify-center text-amber-400 animate-pulse">
              <Star className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-6">
          {movies.map((movie, idx) => {
            const rankNumber = (currentPage - 1) * 20 + idx + 1;

            return (
              <Link
                key={movie._id || movie.slug}
                href={`/movie/${movie.slug || movie._id}`}
                className="media-card group flex flex-col space-y-2 rounded-xl sm:rounded-2xl overflow-hidden bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-1.5 sm:p-2 shadow-md hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300"
              >
                <div className="relative aspect-[2/3] rounded-lg sm:rounded-xl overflow-hidden bg-slate-900">
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                    loading="lazy"
                  />

                  {/* Yellow/Gold Top Rank Badge (#1, #2, #3...) */}
                  <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-[#ffd233] text-black font-black text-[10px] sm:text-xs shadow-md flex items-center gap-0.5">
                    <span>#{rankNumber}</span>
                  </div>

                  {/* Green HD Badge */}
                  <div className="absolute top-1.5 right-1.5 px-1.5 sm:px-2 py-0.5 rounded-md bg-[#00e054] text-black font-black text-[9px] sm:text-[10px] tracking-wider shadow-md">
                    HD
                  </div>

                  {/* Hover Play Icon Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-lg shadow-brand-600/50 transform scale-75 group-hover:scale-100 transition-transform duration-200">
                      <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>

                <div className="px-1">
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-amber-400 transition-colors">
                    {movie.title}
                  </h3>
                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    <span>{movie.releaseYear || 2024}</span>
                    <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{movie.ratingAverage > 0 ? movie.ratingAverage.toFixed(1) : '8.0'}</span>
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6 border-t border-white/10">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white/5 border border-white/10 text-slate-300 hover:bg-white/15 disabled:opacity-50 flex items-center gap-1 transition-all"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          <span className="text-xs font-bold text-slate-400">
            Page <strong className="text-amber-400">{currentPage}</strong> of {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black font-extrabold shadow-md shadow-amber-500/20 disabled:opacity-50 flex items-center gap-1 transition-all"
          >
            Next Page <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {!loading && movies.length === 0 && (
        <div className="text-center py-16 text-slate-400 text-sm">
          No movies found matching your search criteria.
        </div>
      )}

    </div>
  );
}
