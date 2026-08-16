'use client';

import React from 'react';
import Link from 'next/link';
import { Star, Play, Bookmark, Clock } from 'lucide-react';

export interface MovieItem {
  _id: string;
  title: string;
  slug: string;
  posterUrl: string;
  releaseYear: number;
  runtimeMinutes: number;
  ratingAverage: number;
  genres?: { name: string; slug: string }[];
}

interface MovieCardProps {
  movie: MovieItem;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  return (
    <div className="media-card group relative flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-md">
      
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-60 group-hover:opacity-85 transition-opacity duration-300" />

        {/* Rating Badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-amber-400 text-[11px] font-bold border border-white/10 shadow">
          <Star className="w-3 h-3 fill-amber-400" />
          <span>{movie.ratingAverage > 0 ? movie.ratingAverage.toFixed(1) : '8.0'}</span>
        </div>

        {/* Quick Action Button */}
        <button
          className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-slate-900/70 backdrop-blur-md text-white hover:text-brand-500 hover:scale-110 active:scale-95 transition-all shadow"
          aria-label="Add to Watchlist"
          title="Add to Watchlist"
        >
          <Bookmark className="w-3.5 h-3.5" />
        </button>

        {/* Play Icon Hover Overlay */}
        <Link
          href={`/movie/${movie.slug || movie._id}`}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <div className="w-12 h-12 rounded-full bg-brand-600/90 backdrop-blur-sm text-white flex items-center justify-center shadow-lg shadow-brand-600/50 transform scale-50 group-hover:scale-100 transition-transform duration-300 ease-out">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </Link>
      </div>

      {/* Info Section */}
      <div className="p-3.5 flex flex-col flex-1">
        <Link
          href={`/movie/${movie.slug || movie._id}`}
          className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-brand-500 transition-colors line-clamp-1"
        >
          {movie.title}
        </Link>

        <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>{movie.releaseYear || 2024}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {movie.runtimeMinutes || 120} min
          </span>
        </div>

        {/* Genre Tags */}
        {movie.genres && movie.genres.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {movie.genres.slice(0, 2).map((g) => (
              <span
                key={g.slug || g.name}
                className="px-2 py-0.5 rounded text-[9px] font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300"
              >
                {g.name}
              </span>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
