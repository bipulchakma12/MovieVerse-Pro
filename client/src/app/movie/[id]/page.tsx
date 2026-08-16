'use client';

import React, { useState, useEffect } from 'react';
import {
  Star, Clock, Calendar, Globe, Bookmark, Heart, Send,
  MessageSquare, Loader2, Play, Tv, Check, CheckCircle2
} from 'lucide-react';
import { VideoPlayer } from '@/components/VideoPlayer';
import { isItemInFavorites, toggleItemFavorite, isItemInWatchLater, toggleItemWatchLater } from '@/utils/userLists';

export default function MovieDetailsPage({ params }: { params: { id: string } }) {
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sources' | 'trailer'>('sources');
  const [streamServer, setStreamServer] = useState<'server1' | 'server2' | 'server3' | 'server4'>('server1');
  const [userRating, setUserRating] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [reviews, setReviews] = useState<any[]>([]);

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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/movies/${params.id}`).catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setMovie(data.data);
          checkUserLists(data.data);
          setLoading(false);
          return;
        }
      }
      const { fetchTMDBMovieDetail } = await import('@/utils/tmdbClient');
      const fallbackMovie = await fetchTMDBMovieDetail(params.id);
      if (fallbackMovie) {
        setMovie(fallbackMovie);
        checkUserLists(fallbackMovie);
      }
    } catch (e) {
      console.error('Failed to fetch movie detail:', e);
    } finally {
      setLoading(false);
    }
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

  const fetchMovieReviews = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/reviews/movie/${params.id}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) setReviews(data.data);
    } catch (e) { /* ignore */ }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText || !movie) return;
    try {
      const token = localStorage.getItem('movieverse-token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/reviews/movie/${movie._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating: userRating || 8, comment: commentText }),
      });
      const data = await res.json();
      if (data.success) { setReviews([data.data, ...reviews]); setCommentText(''); setUserRating(0); }
    } catch (e) { console.error('Failed to post review:', e); }
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
    : ['Action'];

  const tmdbId = movie.tmdbId;
  const trailerUrl = movie.trailerUrl || 'https://www.youtube.com/embed/YoHD9XEInc0';

  // Multi-server endpoints for full movie streaming
  const server1Url = `https://vidsrc.cc/v2/embed/movie/${tmdbId}`;
  const server2Url = `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`;
  const server3Url = `https://autoembed.co/movie/tmdb/${tmdbId}`;
  const server4Url = `https://vidsrc.to/embed/movie/${tmdbId}`;

  const currentStreamUrl =
    streamServer === 'server1'
      ? server1Url
      : streamServer === 'server2'
      ? server2Url
      : streamServer === 'server3'
      ? server3Url
      : server4Url;

  const isUpcoming = movie.releaseYear && movie.releaseYear > 2024;

  const movieSchema = {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    name: movie.title,
    image: movie.posterUrl,
    description: movie.storyline || movie.overview || 'Watch HD Movie Online',
    datePublished: movie.releaseYear ? `${movie.releaseYear}` : '2024',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: movie.ratingAverage || 8.0,
      reviewCount: movie.ratingCount || 120,
      bestRating: 10,
      worstRating: 1,
    },
  };

  return (
    <div className="pb-16">
      {/* Google Schema.org Movie Rich Snippet */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(movieSchema) }}
      />

      {/* Hero Banner */}
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
            className="w-36 sm:w-48 rounded-2xl border-4 border-slate-900 shadow-2xl flex-shrink-0 object-cover"
          />
          <div className="space-y-3 text-white">
            <div className="flex flex-wrap gap-2">
              {isUpcoming && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/90 text-slate-950 uppercase">
                  Coming {movie.releaseYear}
                </span>
              )}
              {genreNames.filter(Boolean).map((g: string) => (
                <span key={g} className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-600/80 backdrop-blur-md">{g}</span>
              ))}
            </div>
            <h1 className="text-3xl sm:text-5xl font-black">{movie.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-300">
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <Star className="w-4 h-4 fill-amber-400" /> {movie.ratingAverage || 8.0} ({movie.ratingCount || 120} reviews)
              </span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {movie.runtimeMinutes || 120} min</span>
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {movie.releaseYear || 2024}</span>
              <span className="flex items-center gap-1"><Globe className="w-4 h-4" /> {movie.country || 'US'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left: Player + Reviews */}
        <div className="lg:col-span-2 space-y-8">

          {/* Player Controls & Server Switcher */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('sources')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                    activeTab === 'sources'
                      ? 'bg-brand-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white bg-slate-800'
                  }`}
                >
                  <Tv className="w-3.5 h-3.5" /> Watch Full Movie
                </button>
                <button
                  onClick={() => setActiveTab('trailer')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                    activeTab === 'trailer'
                      ? 'bg-brand-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white bg-slate-800'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Trailer
                </button>
              </div>

              {/* Server Switcher */}
              {activeTab === 'sources' && tmdbId && (
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
                  <span className="px-2 text-slate-500">Server:</span>
                  <button
                    onClick={() => setStreamServer('server1')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      streamServer === 'server1' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Server 1 (CineSrc)
                  </button>
                  <button
                    onClick={() => setStreamServer('server2')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      streamServer === 'server2' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Server 2 (MultiEmbed)
                  </button>
                  <button
                    onClick={() => setStreamServer('server3')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      streamServer === 'server3' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Server 3 (AutoEmbed)
                  </button>
                  <button
                    onClick={() => setStreamServer('server4')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      streamServer === 'server4' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Server 4 (VidSrc.to)
                  </button>
                </div>
              )}
            </div>

            {/* Official Trailer Player */}
            {activeTab === 'trailer' && (
              <div className="space-y-2">
                <VideoPlayer
                  src={trailerUrl}
                  poster={movie.bannerUrl || movie.posterUrl}
                  title={`${movie.title} — Official Trailer`}
                />
                <p className="text-xs text-slate-500 text-center">
                  🎬 Official YouTube Trailer
                </p>
              </div>
            )}

            {/* Full Movie Stream Player */}
            {activeTab === 'sources' && tmdbId && (
              <div className="space-y-3">
                <VideoPlayer
                  src={currentStreamUrl}
                  poster={movie.bannerUrl || movie.posterUrl}
                  title={`${movie.title} — Full Movie HD Stream`}
                />
              </div>
            )}

            {/* No tmdbId fallback */}
            {activeTab === 'sources' && !tmdbId && (
              <div className="p-6 rounded-xl bg-slate-900 border border-slate-700 text-center text-slate-400 text-sm">
                No authorized video source available for this title.
              </div>
            )}
          </div>

          {/* Storyline */}
          <div className="p-6 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Storyline</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {movie.storyline || movie.overview || 'No overview available.'}
            </p>
          </div>

          {/* User Reviews */}
          <div className="p-6 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-brand-500" /> User Reviews
            </h3>

            <form onSubmit={handleReviewSubmit} className="space-y-4 border-b border-slate-200 dark:border-dark-border pb-6">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Rating:</span>
                {[1,2,3,4,5,6,7,8,9,10].map((star) => (
                  <button
                    key={star} type="button"
                    onClick={() => setUserRating(star)}
                    className={`text-lg leading-none ${userRating >= star ? 'text-amber-400' : 'text-slate-400'}`}
                  >★</button>
                ))}
                <span className="text-xs text-slate-400">({userRating || 0}/10)</span>
              </div>
              <textarea
                rows={3} value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write your thoughts about this movie..."
                className="w-full p-3 text-xs rounded-xl bg-slate-100 dark:bg-dark-bg border border-slate-200 dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-200 resize-none"
              />
              <button type="submit" className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 transition-all flex items-center gap-2">
                <Send className="w-3.5 h-3.5" /> Submit Review
              </button>
            </form>

            <div className="space-y-4">
              {reviews.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">No reviews yet. Be the first!</p>
              )}
              {reviews.map((rev: any) => (
                <div key={rev._id} className="p-4 rounded-xl bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold">
                        {(rev.user?.name || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">{rev.user?.name || 'Anonymous'}</div>
                        <div className="text-[10px] text-slate-400">Recently</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 text-xs font-bold">★ {rev.rating}/10</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Movie Info</h4>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              {movie.releaseYear && <div><span className="font-semibold text-slate-900 dark:text-white">Year:</span> {movie.releaseYear}</div>}
              {movie.runtimeMinutes && <div><span className="font-semibold text-slate-900 dark:text-white">Runtime:</span> {movie.runtimeMinutes} min</div>}
              {movie.language && <div><span className="font-semibold text-slate-900 dark:text-white">Language:</span> {movie.language}</div>}
              {movie.country && <div><span className="font-semibold text-slate-900 dark:text-white">Country:</span> {movie.country}</div>}
              {tmdbId && <div><span className="font-semibold text-slate-900 dark:text-white">TMDB ID:</span> {tmdbId}</div>}
            </div>
          </div>

          {/* Interactive Favorites & Watch Later Buttons */}
          <div className="p-6 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border space-y-3">
            <button
              onClick={handleToggleFavorite}
              disabled={favLoading}
              className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 ${
                isFavorite
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {favLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current text-white' : ''}`} />
              )}
              {isFavorite ? 'Saved in Favorites ❤️' : 'Add to Favorites'}
            </button>

            <button
              onClick={handleToggleWatchLater}
              disabled={wlLoading}
              className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 ${
                isWatchLater
                  ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-600/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {wlLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Bookmark className={`w-4 h-4 ${isWatchLater ? 'fill-current text-white' : ''}`} />
              )}
              {isWatchLater ? 'Added to Watch Later 🔖' : 'Watch Later'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
