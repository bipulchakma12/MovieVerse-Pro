'use client';

import React from 'react';
import { MovieCard, MovieItem } from '@/components/MovieCard';
import { Bookmark, Heart } from 'lucide-react';

const savedFavorites: MovieItem[] = [
  {
    _id: '1',
    title: 'Inception',
    slug: 'inception',
    posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80',
    releaseYear: 2010,
    runtimeMinutes: 148,
    ratingAverage: 8.8,
    genres: [{ name: 'Sci-Fi', slug: 'sci-fi' }, { name: 'Action', slug: 'action' }],
  },
  {
    _id: '2',
    title: 'Oppenheimer',
    slug: 'oppenheimer',
    posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=600&q=80',
    releaseYear: 2023,
    runtimeMinutes: 180,
    ratingAverage: 8.9,
    genres: [{ name: 'Drama', slug: 'drama' }],
  },
];

export default function FavoritesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-slate-200 dark:border-dark-border pb-6">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Heart className="w-8 h-8 text-rose-500 fill-rose-500" /> My Saved Favorites
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your saved movies, watchlist, and continue watching history
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {savedFavorites.map((movie) => (
          <MovieCard key={movie._id} movie={movie} />
        ))}
      </div>
    </div>
  );
}
