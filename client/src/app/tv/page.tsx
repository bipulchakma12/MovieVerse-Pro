'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tv, Search, Filter, Star, Calendar, Layers, Loader2, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface TvShowItem {
  _id: string;
  tmdbId: string;
  name: string;
  slug: string;
  posterUrl: string;
  bannerUrl?: string;
  ratingAverage: number;
  firstAirYear: number;
  numberOfSeasons?: number;
  storyline?: string;
  genres?: any[];
}

export default function TvShowsPage() {
  const [tvShows, setTvShows] = useState<TvShowItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const genres = ['all', 'Action', 'Drama', 'Sci-Fi', 'Animation', 'Comedy', 'Crime', 'Mystery'];

  useEffect(() => {
    setCurrentPage(1);
    fetchTvShows(1);
  }, [selectedGenre, searchTerm]);

  const fetchTvShows = async (pageNum = currentPage) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append('search', searchTerm);
      if (selectedGenre !== 'all') queryParams.append('genre', selectedGenre.toLowerCase());
      queryParams.append('page', pageNum.toString());
      queryParams.append('limit', '100');

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/tv?${queryParams.toString()}`).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setTvShows(data.data);
          setTotalPages(data.pages || 1);
          setTotalCount(data.total || data.data.length);
          setLoading(false);
          return;
        }
      }

      // Direct TMDB API Fallback for Vercel Live Deployment
      const { fetchTMDBPopularTvShows } = await import('@/utils/tmdbClient');
      const fallbackTv = await fetchTMDBPopularTvShows(pageNum, selectedGenre, searchTerm);
      setTvShows(fallbackTv);
      setTotalPages(500);
      setTotalCount(50000);
    } catch (error) {
      console.error('Failed to fetch TV shows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchTvShows(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 space-y-8 animate-fade-in">

      {/* Page Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 dark:border-dark-border pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Tv className="w-8 h-8 text-sky-500" /> Popular TV Shows & Series Catalog
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Showing <strong className="text-sky-400 font-bold">{totalCount || tvShows.length}</strong> available TV series across TMDB collections
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <input
              type="text"
              placeholder="Search any TV series or TMDB ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-full bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
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
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                : 'bg-white dark:bg-dark-card text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-dark-border'
            }`}
          >
            {g === 'all' ? 'All Genres' : g}
          </button>
        ))}
      </div>

      {/* TV Series Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
          <p className="text-xs text-slate-400">Loading TV Series catalog...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {tvShows.map((show) => (
            <Link
              key={show._id}
              href={`/tv/${show.slug || show._id}`}
              className="group flex flex-col space-y-3"
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
                  <Star className="w-3 h-3 fill-amber-400" /> {show.ratingAverage}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1 group-hover:text-sky-500 transition-colors">
                  {show.name}
                </h3>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <span>{show.firstAirYear || 2024}</span>
                  <span className="flex items-center gap-1 text-[11px]">
                    <Layers className="w-3 h-3 text-sky-400" /> {show.numberOfSeasons || 1} Season{(show.numberOfSeasons || 1) > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </Link>
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
            Page <strong className="text-sky-400">{currentPage}</strong> of {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-600/20 disabled:opacity-50 flex items-center gap-1"
          >
            Next Page <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {!loading && tvShows.length === 0 && (
        <div className="text-center py-16 text-slate-500 dark:text-slate-400 text-sm">
          No TV shows found matching your search criteria.
        </div>
      )}

    </div>
  );
}
