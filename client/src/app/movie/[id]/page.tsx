'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Star, Clock, Calendar, Globe, Bookmark, Heart, Send,
  MessageSquare, Loader2, Play, Tv, Check, CheckCircle2,
  Film, Sparkles, Share2, Info
} from 'lucide-react';
import { VideoPlayer } from '@/components/VideoPlayer';
import { isItemInFavorites, toggleItemFavorite, isItemInWatchLater, toggleItemWatchLater, addToWatchHistory } from '@/utils/userLists';
import { getLocalReviews, saveLocalReview, ReviewItem } from '@/utils/reviews';
import Link from 'next/link';

export default function MovieDetailsPage({ params }: { params: { id: string } }) {
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sources' | 'trailer'>('sources');
  const [streamServer, setStreamServer] = useState<'server1' | 'server2' | 'server3' | 'server4'>('server1');
  const [userRating, setUserRating] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const playerSectionRef = useRef<HTMLDivElement>(null);

  // User List States
  const [isFavorite, setIsFavorite] = useState(false);
  const [isWatchLater, setIsWatchLater] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [wlLoading, setWlLoading] = useState(false);

  useEffect(() => {
    fetchMovieDetail();
    fetchMovieReviews();
  }, [params.id]);

  const fetchMovieDetail = async () => {
    try {
      setLoading(true);
      const { fetchTMDBMovieDetail } = await import('@/utils/tmdbClient');
      
      // Fast parallel fetch: Don't wait for offline backend timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 600);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const backendPromise = fetch(`${apiUrl}/movies/${params.id}`, { signal: controller.signal })
        .then(r => r.ok ? r.json() : null)
        .catch(() => null);

      const tmdbPromise = fetchTMDBMovieDetail(params.id);

      const [backendRes, tmdbMovie] = await Promise.all([
        backendPromise.finally(() => clearTimeout(timeoutId)),
        tmdbPromise
      ]);

      const resolvedMovie = (backendRes?.success && backendRes?.data) ? backendRes.data : tmdbMovie;

      if (resolvedMovie) {
        setMovie(resolvedMovie);
        checkUserLists(resolvedMovie);
        recordWatchHistory(resolvedMovie);
      }
    } catch (e) {
      console.error('Failed to fetch movie detail:', e);
    } finally {
      setLoading(false);
    }
  };

  const recordWatchHistory = (movieObj: any) => {
    if (!movieObj) return;
    addToWatchHistory({
      _id: String(movieObj._id || movieObj.tmdbId),
      tmdbId: String(movieObj.tmdbId || movieObj._id),
      title: movieObj.title,
      slug: movieObj.slug || String(movieObj._id),
      posterUrl: movieObj.posterUrl,
      releaseYear: movieObj.releaseYear || 2024,
      runtimeMinutes: movieObj.runtimeMinutes || 120,
      ratingAverage: movieObj.ratingAverage || 8.0,
      type: 'movie',
      genres: movieObj.genres,
    });
  };

  const checkUserLists = (movieObj: any) => {
    if (!movieObj) return;
    const movieId = String(movieObj._id || movieObj.tmdbId);
    setIsFavorite(isItemInFavorites(movieId));
    setIsWatchLater(isItemInWatchLater(movieId));
  };

  const handleToggleFavorite = () => {
    if (!movie) return;
    setFavLoading(true);
    const newState = toggleItemFavorite({
      _id: String(movie._id || movie.tmdbId),
      tmdbId: String(movie.tmdbId || movie._id),
      title: movie.title,
      slug: movie.slug || String(movie._id),
      posterUrl: movie.posterUrl,
      releaseYear: movie.releaseYear || 2024,
      runtimeMinutes: movie.runtimeMinutes || 120,
      ratingAverage: movie.ratingAverage || 8.0,
      type: 'movie',
      genres: movie.genres,
    });
    setIsFavorite(newState);
    setTimeout(() => setFavLoading(false), 200);
  };

  const handleToggleWatchLater = () => {
    if (!movie) return;
    setWlLoading(true);
    const newState = toggleItemWatchLater({
      _id: String(movie._id || movie.tmdbId),
      tmdbId: String(movie.tmdbId || movie._id),
      title: movie.title,
      slug: movie.slug || String(movie._id),
      posterUrl: movie.posterUrl,
      releaseYear: movie.releaseYear || 2024,
      runtimeMinutes: movie.runtimeMinutes || 120,
      ratingAverage: movie.ratingAverage || 8.0,
      type: 'movie',
      genres: movie.genres,
    });
    setIsWatchLater(newState);
    setTimeout(() => setWlLoading(false), 200);
  };

  const fetchMovieReviews = () => {
    const list = getLocalReviews(String(params.id));
    setReviews(list);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !movie) return;

    const newRev = saveLocalReview(
      String(movie._id || movie.tmdbId || params.id),
      commentText,
      userRating || 9
    );

    setReviews((prev) => [newRev, ...prev.filter((r) => r._id !== newRev._id)]);
    setCommentText('');
    setUserRating(0);
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 3500);
  };

  const scrollToPlayer = () => {
    setActiveTab('sources');
    if (playerSectionRef.current) {
      playerSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center select-none animate-fade-in">
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
          {/* Outer glowing pulsing ring */}
          <div className="absolute inset-0 rounded-full border-2 border-brand-500/30 animate-ping opacity-60" />
          
          {/* Main fast rotating gradient ring */}
          <div className="absolute inset-0 rounded-full border-3 sm:border-4 border-t-brand-500 border-r-rose-500 border-b-transparent border-l-transparent animate-spin duration-700 shadow-lg shadow-brand-500/30" />
          
          {/* Inner counter-rotating neon ring */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 sm:border-3 border-r-sky-400 border-b-brand-400 border-t-transparent border-l-transparent animate-spin duration-500" />
          
          {/* Center glowing Film Icon */}
          <div className="absolute flex items-center justify-center text-brand-500 animate-pulse">
            <Film className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
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

  const tmdbId = movie.tmdbId;
  const trailerUrl = movie.trailerUrl || 'https://www.youtube.com/embed/YoHD9XEInc0';

  // Multi-server endpoints for full movie streaming
  const server1Url = `https://vidsrc.cc/v2/embed/movie/${tmdbId}`;
  const server2Url = `https://autoembed.co/movie/tmdb/${tmdbId}`;
  const server3Url = `https://vidsrc.to/embed/movie/${tmdbId}`;
  const server4Url = `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`;

  const currentStreamUrl =
    streamServer === 'server1'
      ? server1Url
      : streamServer === 'server2'
      ? server2Url
      : streamServer === 'server3'
      ? server3Url
      : server4Url;

  return (
    <div className="pb-20 space-y-12 animate-fade-in">
      
      {/* CineB-Style Cinematic Movie Hero Details Header */}
      <section className="relative w-full min-h-[560px] lg:min-h-[620px] bg-slate-950 overflow-hidden select-none">
        
        {/* Full-Width Backdrop with Gentle CineB Lighting */}
        <div className="absolute inset-0 z-0">
          <img
            src={movie.bannerUrl || movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover object-center opacity-70 scale-105"
          />
          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 to-black/30 md:to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0b0c10] via-[#0b0c10]/60 to-transparent" />
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/80 to-transparent" />
        </div>

        {/* Main Details Presentation (Exact CineB Layout) */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-12 flex flex-col md:flex-row gap-8 lg:gap-12 items-start">
          
          {/* Left Poster Card */}
          <div className="w-48 sm:w-60 md:w-72 flex-shrink-0 mx-auto md:mx-0">
            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-slate-900 shadow-2xl border-2 border-white/10 ring-1 ring-white/20">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-[#00e054] text-black font-black text-xs shadow-md">
                HD
              </div>
            </div>
          </div>

          {/* Right Movie Info Column */}
          <div className="flex-1 space-y-4 text-white">
            
            {/* Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight drop-shadow-md">
              {movie.title}
            </h1>

            {/* Tagline in Gold Italics */}
            <p className="text-[#f5c518] italic font-semibold text-sm sm:text-base">
              "{movie.tagline || movie.storyline?.slice(0, 70) || 'Stream the full blockbuster movie in HD.'}"
            </p>

            {/* Meta Icons Row */}
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-semibold pt-1">
              <span className="flex items-center gap-1.5 text-[#f5c518] font-black">
                <Star className="w-4 h-4 fill-[#f5c518]" /> {movie.ratingAverage || 8.2}
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <Calendar className="w-4 h-4 text-slate-400" /> {movie.releaseYear || 2024}
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <Clock className="w-4 h-4 text-slate-400" /> {movie.runtimeMinutes || 120} min
              </span>
              <span className="text-slate-300">
                {movie.country || 'United States'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 text-[11px] text-slate-300">
                Movie
              </span>
            </div>

            {/* HD Badge Pill */}
            <div>
              <span className="inline-block px-3 py-0.5 rounded-full bg-[#00e054] text-black font-black text-xs shadow">
                HD
              </span>
            </div>

            {/* Big Yellow "▶ Watch Now" Button & Action Controls */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={scrollToPlayer}
                className="px-8 py-3.5 rounded-full bg-[#ffd233] hover:bg-[#ffca1a] text-black font-black text-sm sm:text-base flex items-center gap-2.5 shadow-xl shadow-[#ffd233]/20 hover:scale-105 active:scale-95 transition-all"
              >
                <Play className="w-5 h-5 fill-current" /> Watch Now
              </button>

              <button
                onClick={handleToggleFavorite}
                className={`p-3.5 rounded-full border transition-all flex items-center gap-2 text-xs font-bold ${
                  isFavorite
                    ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-600/30'
                    : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title="Add to Favorites"
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                <span>{isFavorite ? 'Favorited' : 'Favorite'}</span>
              </button>

              <button
                onClick={handleToggleWatchLater}
                className={`p-3.5 rounded-full border transition-all flex items-center gap-2 text-xs font-bold ${
                  isWatchLater
                    ? 'bg-sky-600 border-sky-500 text-white shadow-lg shadow-sky-600/30'
                    : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title="Watch Later"
              >
                <Bookmark className={`w-4 h-4 ${isWatchLater ? 'fill-current' : ''}`} />
                <span>{isWatchLater ? 'In Watchlist' : 'Watch Later'}</span>
              </button>
            </div>

            {/* Overview Section */}
            <div className="pt-4 space-y-2 border-t border-white/10 mt-6 max-w-4xl">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                Overview
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {movie.storyline || movie.overview || 'No overview available for this movie.'}
              </p>

              {/* Genres & Details Meta */}
              <div className="pt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-400 font-semibold mr-1">Genres:</span>
                {genreNames.filter(Boolean).map((g: string) => (
                  <span
                    key={g}
                    className="px-3 py-1 rounded-xl text-xs font-semibold bg-white/10 border border-white/10 text-slate-200"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Video Streaming Player Section */}
      <section ref={playerSectionRef} id="stream-player" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Player Controls & Server Switcher */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-xl">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('sources')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'sources'
                  ? 'bg-[#ffd233] text-black shadow-lg font-black'
                  : 'text-slate-400 hover:text-white bg-slate-800'
              }`}
            >
              <Tv className="w-4 h-4" /> Watch Full Movie
            </button>
            <button
              onClick={() => setActiveTab('trailer')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'trailer'
                  ? 'bg-rose-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white bg-slate-800'
              }`}
            >
              <Play className="w-4 h-4 fill-current" /> Trailer
            </button>
          </div>

          {/* Server Switcher */}
          {activeTab === 'sources' && tmdbId && (
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs font-bold">
              <span className="px-2 text-slate-400">Server:</span>
              <button
                onClick={() => setStreamServer('server1')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  streamServer === 'server1' ? 'bg-[#00e054] text-black font-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                Server 1 (CineSrc Clean)
              </button>
              <button
                onClick={() => setStreamServer('server2')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  streamServer === 'server2' ? 'bg-[#00e054] text-black font-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                Server 2 (AutoEmbed HD)
              </button>
              <button
                onClick={() => setStreamServer('server3')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  streamServer === 'server3' ? 'bg-[#00e054] text-black font-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                Server 3 (VidSrc.to)
              </button>
              <button
                onClick={() => setStreamServer('server4')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  streamServer === 'server4' ? 'bg-[#00e054] text-black font-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                Server 4 (MultiEmbed)
              </button>
            </div>
          )}
        </div>

        {/* Video Player Embed */}
        {activeTab === 'trailer' ? (
          <div className="space-y-2">
            <VideoPlayer
              src={trailerUrl}
              poster={movie.bannerUrl || movie.posterUrl}
              title={`${movie.title} — Official Trailer`}
            />
            <p className="text-xs text-slate-500 text-center">
              🎬 Official YouTube HD Trailer
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <VideoPlayer
              src={currentStreamUrl}
              poster={movie.bannerUrl || movie.posterUrl}
              title={`${movie.title} — Full Movie HD Stream`}
            />
          </div>
        )}

      </section>

      {/* User Reviews & Comment Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pt-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-md space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-brand-500" /> Reviews & Ratings ({reviews.length})
            </h3>
            <span className="text-xs text-slate-500">Instant Comment Sync</span>
          </div>

          {/* Success Banner */}
          {reviewSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold rounded-xl flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4" /> Your review and rating have been posted instantly!
            </div>
          )}

          {/* Add Review Form */}
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                Your Rating (1 to 10 Stars):
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setUserRating(star)}
                    className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                      userRating >= star
                        ? 'bg-amber-500 text-black font-black shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{star}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write your thoughts or review about this movie..."
                rows={3}
                className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-slate-400"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-all shadow-md active:scale-95 flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" /> Submit Review
            </button>
          </form>

          {/* Reviews List */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            {reviews.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">
                Be the first to review and rate {movie.title}!
              </p>
            ) : (
              reviews.map((rev) => (
                <div
                  key={rev._id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{rev.user?.name || 'Movie Fan'}</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[11px] font-bold flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" /> {rev.rating}/10
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{rev.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
