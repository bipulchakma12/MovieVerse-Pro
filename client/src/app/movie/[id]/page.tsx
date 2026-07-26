'use client';

import React, { useState, useEffect } from 'react';
import { Star, Clock, Calendar, Globe, Bookmark, Heart, Send, MessageSquare, Loader2 } from 'lucide-react';
import { VideoPlayer } from '@/components/VideoPlayer';

export default function MovieDetailsPage({ params }: { params: { id: string } }) {
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [playerMode, setPlayerMode] = useState<'full' | 'trailer'>('full');
  const [userRating, setUserRating] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    fetchMovieDetail();
    fetchMovieReviews();
  }, [params.id]);

  const fetchMovieDetail = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/movies/${params.id}`);
      const data = await res.json();
      if (data.success && data.data) {
        setMovie(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch movie detail:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMovieReviews = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/reviews/movie/${params.id}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setReviews(data.data);
      }
    } catch (e) {
      // Ignore
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText || !movie) return;

    try {
      const token = localStorage.getItem('movieverse-token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/reviews/movie/${movie._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: userRating || 8, comment: commentText }),
      });
      const data = await res.json();
      if (data.success) {
        setReviews([data.data, ...reviews]);
        setCommentText('');
        setUserRating(0);
      }
    } catch (e) {
      console.error('Failed to post review:', e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400">Loading movie details...</p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-slate-400">
        Movie not found.
      </div>
    );
  }

  const genreNames = Array.isArray(movie.genres)
    ? movie.genres.map((g: any) => (typeof g === 'string' ? g : g.name))
    : ['Action', 'Sci-Fi'];

  return (
    <div className="pb-16">
      
      {/* Banner & Hero Header */}
      <div className="relative w-full h-[50vh] min-h-[350px] bg-slate-950 overflow-hidden">
        <img
          src={movie.bannerUrl || movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover opacity-40 blur-sm scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

        <div className="absolute bottom-0 inset-x-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-end gap-6 z-10">
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-36 sm:w-48 rounded-2xl border-4 border-slate-900 shadow-2xl flex-shrink-0"
          />

          <div className="space-y-3 text-white">
            <div className="flex flex-wrap gap-2">
              {genreNames.map((g: string) => (
                <span key={g} className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-600/80 backdrop-blur-md">
                  {g}
                </span>
              ))}
            </div>
            <h1 className="text-3xl sm:text-5xl font-black">{movie.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-300">
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <Star className="w-4 h-4 fill-amber-400" /> {movie.ratingAverage || 8.0} ({movie.ratingCount || 120} reviews)
              </span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {movie.runtimeMinutes || 120} min</span>
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {movie.releaseYear || 2024}</span>
              <span className="flex items-center gap-1"><Globe className="w-4 h-4" /> {movie.country || 'English'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Details Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Player & Reviews */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Video Player & Stream Selector */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Movie Player
              </h2>
              {/* Stream Source Toggle */}
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-dark-card p-1 rounded-xl border border-slate-200 dark:border-dark-border">
                <button
                  onClick={() => setPlayerMode('full')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    playerMode === 'full'
                      ? 'bg-brand-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-300 hover:text-white'
                  }`}
                >
                  ▶ Watch Full Movie (1080p Stream)
                </button>
                <button
                  onClick={() => setPlayerMode('trailer')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    playerMode === 'trailer'
                      ? 'bg-brand-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-300 hover:text-white'
                  }`}
                >
                  🍿 Official Trailer
                </button>
              </div>
            </div>

            <VideoPlayer
              src={
                playerMode === 'full'
                  ? (movie.videoUrl || 'https://vjs.zencdn.net/v/oceans.mp4')
                  : (movie.trailerUrl || 'https://www.youtube.com/embed/YoHD9XEInc0')
              }
              poster={movie.bannerUrl || movie.posterUrl}
              title={`${movie.title} (${playerMode === 'full' ? 'Full Movie 1080p HD' : 'Official Trailer'})`}
            />
          </div>

          {/* Storyline */}
          <div className="p-6 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Storyline</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{movie.storyline}</p>
          </div>

          {/* Reviews & Star Ratings */}
          <div className="p-6 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-brand-500" /> User Reviews & Ratings
            </h3>

            {/* Write Review Form */}
            <form onSubmit={handleReviewSubmit} className="space-y-4 border-b border-slate-200 dark:border-dark-border pb-6">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Your Rating:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUserRating(star)}
                      className={`w-5 h-5 text-xs font-bold rounded ${userRating >= star ? 'text-amber-400' : 'text-slate-400'}`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="text-xs text-slate-400 ml-2">({userRating || 0}/10)</span>
                </div>
              </div>

              <div className="relative">
                <textarea
                  rows={3}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write your review or thoughts about this movie..."
                  className="w-full p-3 text-xs rounded-xl bg-slate-100 dark:bg-dark-bg border border-slate-200 dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-200"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 transition-all flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" /> Submit Review
              </button>
            </form>

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.map((rev: any) => (
                <div key={rev._id || rev.id} className="p-4 rounded-xl bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src={rev.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'} alt={rev.user?.name || 'User'} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">{rev.user?.name || 'Anonymous User'}</div>
                        <div className="text-[10px] text-slate-400">Recently</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 text-xs font-bold">
                      ★ {rev.rating}/10
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>

          </div>

        </div>

        {/* Right Sidebar: Actions */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border space-y-4">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                isFavorite
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              {isFavorite ? 'In Favorites' : 'Add to Favorites'}
            </button>

            <button className="w-full py-3 rounded-xl font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 flex items-center justify-center gap-2">
              <Bookmark className="w-4 h-4" /> Watch Later
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
