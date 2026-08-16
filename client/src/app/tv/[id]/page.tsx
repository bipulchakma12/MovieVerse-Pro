'use client';

import React, { useState, useEffect } from 'react';
import {
  Star, Clock, Calendar, Globe, Bookmark, Heart, Send,
  MessageSquare, Loader2, Play, Tv, Layers, Film, CheckCircle2
} from 'lucide-react';
import { VideoPlayer } from '@/components/VideoPlayer';
import { isItemInFavorites, toggleItemFavorite, isItemInWatchLater, toggleItemWatchLater, addToWatchHistory } from '@/utils/userLists';
import { getLocalReviews, saveLocalReview, ReviewItem } from '@/utils/reviews';

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
  const totalEpisodes = 12;

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
  const tvSchema = {
    '@context': 'https://schema.org',
    '@type': 'TVSeries',
    name: tvShow.name,
    image: tvShow.posterUrl,
    description: tvShow.storyline || tvShow.overview || 'Watch TV Series Online',
    numberOfSeasons: tvShow.numberOfSeasons || 1,
    numberOfEpisodes: tvShow.numberOfEpisodes || 10,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: tvShow.ratingAverage || 8.0,
      reviewCount: tvShow.ratingCount || 200,
      bestRating: 10,
      worstRating: 1,
    },
  };

  return (
    <div className="pb-16">
      {/* Google Schema.org TVSeries Rich Snippet */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(tvSchema) }}
      />

      {/* Hero Banner Header */}
      <div className="relative w-full h-[50vh] min-h-[350px] bg-slate-950 overflow-hidden">
        <img
          src={tvShow.bannerUrl || tvShow.posterUrl}
          alt={tvShow.name}
          className="w-full h-full object-cover opacity-40 blur-sm scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

        <div className="absolute bottom-0 inset-x-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-end gap-6 z-10">
          <img
            src={tvShow.posterUrl}
            alt={tvShow.name}
            className="w-36 sm:w-48 rounded-2xl border-4 border-slate-900 shadow-2xl flex-shrink-0 object-cover"
          />
          <div className="space-y-3 text-white">
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-600/90 backdrop-blur-md uppercase tracking-wider">
                TV Series
              </span>
              {genreNames.filter(Boolean).map((g: string) => (
                <span key={g} className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800/80 backdrop-blur-md">{g}</span>
              ))}
            </div>
            <h1 className="text-3xl sm:text-5xl font-black">{tvShow.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-300">
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <Star className="w-4 h-4 fill-amber-400" /> {tvShow.ratingAverage || 8.2} ({tvShow.ratingCount || 200} reviews)
              </span>
              <span className="flex items-center gap-1"><Layers className="w-4 h-4 text-sky-400" /> {totalSeasons} Season{totalSeasons > 1 ? 's' : ''}</span>
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> First Aired: {tvShow.firstAirYear || 2024}</span>
              <span className="flex items-center gap-1"><Globe className="w-4 h-4" /> {tvShow.country || 'US'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Player & Season/Episode Selectors */}
        <div className="lg:col-span-2 space-y-6">

          {/* Player & Controls */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('stream')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                    activeTab === 'stream' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-800'
                  }`}
                >
                  <Tv className="w-3.5 h-3.5" /> Watch Episode
                </button>
                <button
                  onClick={() => setActiveTab('trailer')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                    activeTab === 'trailer' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-800'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Trailer
                </button>
              </div>

              {/* Server Switcher */}
              {activeTab === 'stream' && (
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
                  <span className="px-2 text-slate-500">Server:</span>
                  <button
                    onClick={() => setStreamServer('server1')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${streamServer === 'server1' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    Server 1 (MultiEmbed)
                  </button>
                  <button
                    onClick={() => setStreamServer('server2')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${streamServer === 'server2' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    Server 2 (VidSrc.xyz)
                  </button>
                  <button
                    onClick={() => setStreamServer('server3')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${streamServer === 'server3' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    Server 3 (Smashy)
                  </button>
                  <button
                    onClick={() => setStreamServer('server4')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${streamServer === 'server4' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    Server 4 (CineSrc)
                  </button>
                </div>
              )}
            </div>

            {/* Video Player */}
            {activeTab === 'stream' ? (
              <div className="space-y-3">
                <VideoPlayer
                  src={currentStreamUrl}
                  poster={tvShow.bannerUrl || tvShow.posterUrl}
                  title={`${tvShow.name} — Season ${selectedSeason} Episode ${selectedEpisode}`}
                />
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span className="font-semibold text-sky-400 flex items-center gap-1.5">
                    <Tv className="w-4 h-4" /> Season {selectedSeason} • Episode {selectedEpisode}
                  </span>
                </div>
              </div>
            ) : (
              <VideoPlayer
                src={tvShow.trailerUrl || 'https://www.youtube.com/embed/YoHD9XEInc0'}
                poster={tvShow.bannerUrl || tvShow.posterUrl}
                title={`${tvShow.name} — Official Trailer`}
              />
            )}
          </div>

          {/* Season & Episode Selector Bar */}
          <div className="p-6 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-sky-500" /> Select Season & Episode
            </h3>

            {/* Seasons Selector */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-500">Seasons:</span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((sNum) => (
                  <button
                    key={sNum}
                    onClick={() => { setSelectedSeason(sNum); setSelectedEpisode(1); }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      selectedSeason === sNum
                        ? 'bg-sky-600 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    Season {sNum}
                  </button>
                ))}
              </div>
            </div>

            {/* Episodes Grid */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-dark-border">
              <span className="text-xs font-semibold text-slate-500">Season {selectedSeason} Episodes:</span>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map((epNum) => (
                  <button
                    key={epNum}
                    onClick={() => setSelectedEpisode(epNum)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      selectedEpisode === epNum
                        ? 'bg-brand-600 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    EP {epNum}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Storyline */}
          <div className="p-6 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Storyline</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {tvShow.storyline || tvShow.overview || 'No storyline available.'}
            </p>
          </div>

          {/* User Reviews */}
          <div className="p-6 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-brand-500" /> User Reviews & Comments
              </span>
              <span className="text-xs font-normal text-slate-400">({reviews.length} reviews)</span>
            </h3>

            {reviewSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4" /> Your review was published successfully!
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="space-y-4 border-b border-slate-200 dark:border-dark-border pb-6">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Your Rating:</span>
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-dark-bg px-2.5 py-1 rounded-xl border border-slate-200 dark:border-dark-border">
                  {[1,2,3,4,5,6,7,8,9,10].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUserRating(star)}
                      className={`text-base leading-none transition-transform hover:scale-125 ${
                        (userRating || 9) >= star ? 'text-amber-400' : 'text-slate-400 dark:text-slate-600'
                      }`}
                      title={`${star}/10`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold text-amber-500">
                  {userRating ? `${userRating}/10` : '9/10 (Recommended)'}
                </span>
              </div>

              <textarea
                rows={3}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your review or thoughts about this TV series..."
                className="w-full p-3.5 text-xs rounded-xl bg-slate-100 dark:bg-dark-bg border border-slate-200 dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white placeholder-slate-400 resize-none transition-all"
                required
              />

              <button
                type="submit"
                disabled={!commentText.trim()}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 transition-all flex items-center gap-2 active:scale-95 shadow-md shadow-brand-600/30"
              >
                <Send className="w-3.5 h-3.5" /> Submit Review
              </button>
            </form>

            <div className="space-y-4">
              {reviews.map((rev) => (
                <div key={rev._id} className="p-4 rounded-xl bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold shadow">
                        {(rev.user?.name || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">{rev.user?.name || 'Anonymous'}</div>
                        <div className="text-[10px] text-slate-400">{rev.createdAt || 'Recently'}</div>
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
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Series Info</h4>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div><span className="font-semibold text-slate-900 dark:text-white">First Aired:</span> {tvShow.firstAirYear || 2024}</div>
              <div><span className="font-semibold text-slate-900 dark:text-white">Seasons:</span> {totalSeasons}</div>
              <div><span className="font-semibold text-slate-900 dark:text-white">Episodes:</span> {totalEpisodes * totalSeasons}</div>
              <div><span className="font-semibold text-slate-900 dark:text-white">Language:</span> {tvShow.originalLanguage || 'English'}</div>
              <div><span className="font-semibold text-slate-900 dark:text-white">Status:</span> {tvShow.status || 'Returning Series'}</div>
              {tmdbId && <div><span className="font-semibold text-slate-900 dark:text-white">TMDB ID:</span> {tmdbId}</div>}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border space-y-3">
            <button
              onClick={() => {
                if (!tvShow) return;
                const newState = toggleItemFavorite({
                  _id: String(tvShow._id || tvShow.tmdbId),
                  tmdbId: String(tvShow.tmdbId || tvShow._id),
                  title: tvShow.name,
                  slug: tvShow.slug || String(tvShow._id),
                  posterUrl: tvShow.posterUrl,
                  releaseYear: tvShow.firstAirYear || 2024,
                  runtimeMinutes: (tvShow.numberOfSeasons || 1) * 10 * 45,
                  ratingAverage: tvShow.ratingAverage || 8.0,
                  type: 'tv',
                  genres: tvShow.genres,
                });
                setIsFavorite(newState);
              }}
              className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 ${
                isFavorite ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current text-white' : ''}`} />
              {isFavorite ? 'Saved in Favorites ❤️' : 'Add to Favorites'}
            </button>
            <button
              onClick={() => {
                if (!tvShow) return;
                const newState = toggleItemWatchLater({
                  _id: String(tvShow._id || tvShow.tmdbId),
                  tmdbId: String(tvShow.tmdbId || tvShow._id),
                  title: tvShow.name,
                  slug: tvShow.slug || String(tvShow._id),
                  posterUrl: tvShow.posterUrl,
                  releaseYear: tvShow.firstAirYear || 2024,
                  runtimeMinutes: (tvShow.numberOfSeasons || 1) * 10 * 45,
                  ratingAverage: tvShow.ratingAverage || 8.0,
                  type: 'tv',
                  genres: tvShow.genres,
                });
                setIsWatchLater(newState);
              }}
              className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 ${
                isWatchLater ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-lg shadow-sky-600/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isWatchLater ? 'fill-current text-white' : ''}`} />
              {isWatchLater ? 'Added to Watch Later 🔖' : 'Watch Later'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
