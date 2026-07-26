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
    <div className="group relative flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Rating Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-amber-400 text-xs font-bold border border-white/10">
          <Star className="w-3.5 h-3.5 fill-amber-400" />
          <span>{movie.ratingAverage > 0 ? movie.ratingAverage.toFixed(1) : 'N/A'}</span>
        </div>

        {/* Quick Action Button */}
        <button
          className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/70 backdrop-blur-md text-white hover:text-brand-500 hover:bg-slate-900 transition-colors"
          aria-label="Add to Watchlist"
          title="Add to Watchlist"
        >
          <Bookmark className="w-4 h-4" />
        </button>

        {/* Play Icon Hover Overlay */}
        <Link
          href={`/movie/${movie.slug || movie._id}`}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <div className="w-12 h-12 rounded-full bg-brand-600/90 text-white flex items-center justify-center shadow-lg shadow-brand-600/40 transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-6 h-6 fill-current ml-0.5" />
          </div>
        </Link>
      </div>

      {/* Info Section */}
      <div className="p-4 flex flex-col flex-1">
        <Link
          href={`/movie/${movie.slug || movie._id}`}
          className="font-bold text-base text-slate-900 dark:text-white hover:text-brand-500 dark:hover:text-brand-500 transition-colors line-clamp-1"
        >
          {movie.title}
        </Link>

        <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>{movie.releaseYear}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {movie.runtimeMinutes} min
          </span>
        </div>

        {/* Genre Tags */}
        {movie.genres && movie.genres.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {movie.genres.slice(0, 2).map((g) => (
              <span
                key={g.slug || g.name}
                className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
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
