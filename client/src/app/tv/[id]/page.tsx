'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Star, Clock, Calendar, Globe, Bookmark, Heart, Send,
  MessageSquare, Loader2, Play, Tv, Layers, Film, CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { VideoPlayer } from '@/components/VideoPlayer';
import { isItemInFavorites, toggleItemFavorite, isItemInWatchLater, toggleItemWatchLater, addToWatchHistory } from '@/utils/userLists';
import { getLocalReviews, saveLocalReview, ReviewItem } from '@/utils/reviews';
import Link from 'next/link';

export default function TvShowDetailsPage({ params }: { params: { id: string } }) {
  const [tvShow, setTvShow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [activeTab, setActiveTab] = useState<'stream' | 'trailer'>('stream');
  const [streamServer, setStreamServer] = useState<'server1' | 'server2' | 'server3' | 'server4'>('server1');
  const [userRating, setUserRating] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isWatchLater, setIsWatchLater] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [wlLoading, setWlLoading] = useState(false);
  const playerSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTvDetail();
    fetchTvReviews();
  }, [params.id]);

  const fetchTvReviews = () => {
    const list = getLocalReviews(String(params.id));
    setReviews(list);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !tvShow) return;

    const newRev = saveLocalReview(
      String(tvShow._id || tvShow.tmdbId || params.id),
      commentText,
      userRating || 9
    );

    setReviews((prev) => [newRev, ...prev.filter((r) => r._id !== newRev._id)]);
    setCommentText('');
    setUserRating(0);
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 3500);
  };

  const recordTvWatchHistory = (showObj: any) => {
    if (!showObj) return;
    addToWatchHistory({
      _id: String(showObj._id || showObj.tmdbId),
      tmdbId: String(showObj.tmdbId || showObj._id),
      title: `${showObj.name} (S${selectedSeason}:E${selectedEpisode})`,
      slug: showObj.slug || String(showObj._id),
      posterUrl: showObj.posterUrl,
      releaseYear: showObj.firstAirYear || 2024,
      runtimeMinutes: 45,
      ratingAverage: showObj.ratingAverage || 8.2,
      type: 'tv',
      genres: showObj.genres,
    });
  };

  const fetchTvDetail = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/tv/${params.id}`).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setTvShow(data.data);
          const showId = String(data.data._id || data.data.tmdbId);
          setIsFavorite(isItemInFavorites(showId));
          setIsWatchLater(isItemInWatchLater(showId));
          recordTvWatchHistory(data.data);
          setLoading(false);
          return;
        }
      }
      const { fetchTMDBTvShowDetail } = await import('@/utils/tmdbClient');
      const fallbackShow = await fetchTMDBTvShowDetail(params.id);
      if (fallbackShow) {
        setTvShow(fallbackShow);
        const showId = String(fallbackShow._id || fallbackShow.tmdbId);
        setIsFavorite(isItemInFavorites(showId));
        setIsWatchLater(isItemInWatchLater(showId));
        recordTvWatchHistory(fallbackShow);
      }
    } catch (e) {
      console.error('Failed to fetch TV detail:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = () => {
    if (!tvShow) return;
    setFavLoading(true);
    const newState = toggleItemFavorite({
      _id: String(tvShow._id || tvShow.tmdbId),
      tmdbId: String(tvShow.tmdbId || tvShow._id),
      title: tvShow.name,
      slug: tvShow.slug || String(tvShow._id),
      posterUrl: tvShow.posterUrl,
      releaseYear: tvShow.firstAirYear || 2024,
      runtimeMinutes: 45,
      ratingAverage: tvShow.ratingAverage || 8.2,
      type: 'tv',
      genres: tvShow.genres,
    });
    setIsFavorite(newState);
    setTimeout(() => setFavLoading(false), 200);
  };

  const handleToggleWatchLater = () => {
    if (!tvShow) return;
    setWlLoading(true);
    const newState = toggleItemWatchLater({
      _id: String(tvShow._id || tvShow.tmdbId),
      tmdbId: String(tvShow.tmdbId || tvShow._id),
      title: tvShow.name,
      slug: tvShow.slug || String(tvShow._id),
      posterUrl: tvShow.posterUrl,
      releaseYear: tvShow.firstAirYear || 2024,
      runtimeMinutes: 45,
      ratingAverage: tvShow.ratingAverage || 8.2,
      type: 'tv',
      genres: tvShow.genres,
    });
    setIsWatchLater(newState);
    setTimeout(() => setWlLoading(false), 200);
  };

  const scrollToPlayer = () => {
    setActiveTab('stream');
    if (playerSectionRef.current) {
      playerSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-sky-500 animate-spin" />
        <p className="text-xs text-slate-400">Loading TV Series details...</p>
      </div>
    );
  }

  if (!tvShow) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-slate-400">
        TV Show not found.
      </div>
    );
  }

  const genreNames = Array.isArray(tvShow.genres)
    ? tvShow.genres.map((g: any) => (typeof g === 'string' ? g : g.name))
    : ['Action', 'Drama'];

  const tmdbId = tvShow.tmdbId || '1399';
  const totalSeasons = tvShow.numberOfSeasons || 1;
  const totalEpisodes = 16;

  // Fast TV Stream URLs with Season & Episode support
  const server1Url = `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${selectedSeason}&e=${selectedEpisode}`;
  const server2Url = `https://vidsrc.xyz/embed/tv?tmdb=${tmdbId}&season=${selectedSeason}&episode=${selectedEpisode}`;
  const server3Url = `https://player.smashy.stream/tv/${tmdbId}?s=${selectedSeason}&e=${selectedEpisode}`;
  const server4Url = `https://vidsrc.cc/v2/embed/tv/${tmdbId}/${selectedSeason}/${selectedEpisode}`;

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
      
      {/* CineB-Style Cinematic TV Hero Details Header */}
      <section className="relative w-full min-h-[560px] lg:min-h-[620px] bg-slate-950 overflow-hidden select-none">
        
        {/* Full-Width Backdrop with Gentle CineB Lighting */}
        <div className="absolute inset-0 z-0">
          <img
            src={tvShow.bannerUrl || tvShow.posterUrl}
            alt={tvShow.name}
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
                src={tvShow.posterUrl}
                alt={tvShow.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-[#00e054] text-black font-black text-xs shadow-md">
                HD
              </div>
            </div>
          </div>

          {/* Right TV Series Info Column */}
          <div className="flex-1 space-y-4 text-white">
            
            {/* Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight drop-shadow-md">
              {tvShow.name}
            </h1>

            {/* Tagline in Gold Italics */}
            <p className="text-[#f5c518] italic font-semibold text-sm sm:text-base">
              "{tvShow.tagline || 'Only one can wear the ring.' || 'Stream full HD episodes on MovieVerse Pro.'}"
            </p>

            {/* Meta Icons Row */}
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-semibold pt-1">
              <span className="flex items-center gap-1.5 text-[#f5c518] font-black">
                <Star className="w-4 h-4 fill-[#f5c518]" /> {tvShow.ratingAverage || 8.2}
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <Calendar className="w-4 h-4 text-slate-400" /> {tvShow.firstAirYear || 2026}
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <Clock className="w-4 h-4 text-slate-400" /> 45 min
              </span>
              <span className="text-slate-300">
                {tvShow.status || 'Returning Series'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-sky-950/80 border border-sky-800 text-[11px] text-sky-300">
                {totalSeasons} Season{totalSeasons > 1 ? 's' : ''}
              </span>
            </div>

            {/* HD Badge Pill */}
            <div>
              <span className="inline-block px-3 py-0.5 rounded-full bg-[#00e054] text-black font-black text-xs shadow">
                HD
              </span>
            </div>

            {/* CineB Season & Episode Dropdowns */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1.5">Season</label>
                <div className="relative">
                  <select
                    value={selectedSeason}
                    onChange={(e) => {
                      setSelectedSeason(Number(e.target.value));
                      setSelectedEpisode(1);
                    }}
                    className="appearance-none bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs sm:text-sm rounded-xl pl-4 pr-9 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#ffd233] cursor-pointer shadow-lg"
                  >
                    {Array.from({ length: Math.max(totalSeasons, 1) }, (_, i) => (
                      <option key={i + 1} value={i + 1} className="bg-slate-900 text-white">
                        Season {i + 1}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1.5">Episode</label>
                <div className="relative">
                  <select
                    value={selectedEpisode}
                    onChange={(e) => setSelectedEpisode(Number(e.target.value))}
                    className="appearance-none bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs sm:text-sm rounded-xl pl-4 pr-9 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#ffd233] cursor-pointer shadow-lg"
                  >
                    {Array.from({ length: totalEpisodes }, (_, i) => (
                      <option key={i + 1} value={i + 1} className="bg-slate-900 text-white">
                        Episode {i + 1}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>
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
                {tvShow.storyline || tvShow.overview || 'No overview available for this series.'}
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
            <span className="px-3 py-1.5 rounded-xl bg-sky-600/20 text-sky-400 text-xs font-bold">
              Playing: S{selectedSeason} - Episode {selectedEpisode}
            </span>
          </div>

          {/* Server Switcher */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs font-bold">
            <span className="px-2 text-slate-400">Server:</span>
            <button
              onClick={() => setStreamServer('server1')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                streamServer === 'server1' ? 'bg-[#00e054] text-black font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              Server 1 (MultiEmbed)
            </button>
            <button
              onClick={() => setStreamServer('server2')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                streamServer === 'server2' ? 'bg-[#00e054] text-black font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              Server 2 (VidSrc.xyz)
            </button>
            <button
              onClick={() => setStreamServer('server3')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                streamServer === 'server3' ? 'bg-[#00e054] text-black font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              Server 3 (Smashy)
            </button>
            <button
              onClick={() => setStreamServer('server4')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                streamServer === 'server4' ? 'bg-[#00e054] text-black font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              Server 4 (VidSrc.cc)
            </button>
          </div>
        </div>

        {/* Video Player Embed */}
        <div className="space-y-3">
          <VideoPlayer
            src={currentStreamUrl}
            poster={tvShow.bannerUrl || tvShow.posterUrl}
            title={`${tvShow.name} Season ${selectedSeason} Episode ${selectedEpisode}`}
          />
        </div>

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
                placeholder="Write your thoughts or review about this series..."
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
                Be the first to review and rate {tvShow.name}!
              </p>
            ) : (
              reviews.map((rev) => (
                <div
                  key={rev._id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{rev.user?.name || 'TV Fan'}</span>
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
