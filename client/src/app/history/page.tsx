'use client';

import React, { useState, useEffect } from 'react';
import { History, Film, Tv, Trash2, Play, Clock, Sparkles } from 'lucide-react';
import Link from 'next/link';
import {
  SavedMediaItem,
  getWatchHistory,
  removeFromWatchHistory,
  clearWatchHistory,
} from '@/utils/userLists';

export default function HistoryPage() {
  const [watchHistory, setWatchHistory] = useState<SavedMediaItem[]>([]);

  const loadHistory = () => {
    setWatchHistory(getWatchHistory());
  };

  useEffect(() => {
    loadHistory();
    const handleUpdate = () => loadHistory();
    window.addEventListener('movieverse_lists_updated', handleUpdate);
    return () => window.removeEventListener('movieverse_lists_updated', handleUpdate);
  }, []);

  const handleRemove = (item: SavedMediaItem) => {
    removeFromWatchHistory(String(item._id || item.tmdbId));
    loadHistory();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-dark-border pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-8 h-8 text-amber-500" /> Watch History
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track your recently watched movies and TV series (automatically saved on your device without needing to sign in).
          </p>
        </div>

        {watchHistory.length > 0 && (
          <button
            onClick={() => {
              if (confirm('Are you sure you want to clear your entire watch history?')) {
                clearWatchHistory();
                loadHistory();
              }
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 transition-all flex items-center gap-1.5 active:scale-95 self-start sm:self-auto"
          >
            <Trash2 className="w-4 h-4" /> Clear History
          </button>
        )}
      </div>

      {/* Media Grid */}
      {watchHistory.length === 0 ? (
        <div className="py-24 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-dark-card flex items-center justify-center text-slate-400">
            <History className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            No Watch History Recorded Yet
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
            Play any movie or TV series on MovieVerse Pro, and your watch history will automatically appear here!
          </p>
          <Link
            href="/"
            className="px-6 py-2.5 rounded-full font-bold text-xs text-white bg-brand-600 hover:bg-brand-700 transition-all shadow-md active:scale-95"
          >
            Start Watching
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {watchHistory.map((item) => {
            const targetUrl = item.type === 'movie' ? `/movie/${item.slug || item._id}` : `/tv/${item.slug || item._id}`;
            const isTv = item.type === 'tv';

            return (
              <div
                key={`${item.type}-${item._id}-${item.watchedAt || ''}`}
                className="media-card group relative flex flex-col space-y-2.5 rounded-2xl overflow-hidden bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-2 shadow-md"
              >
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-slate-900">
                  <img
                    src={item.posterUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                  />

                  {/* Type Badge */}
                  <div
                    className={`absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider backdrop-blur-md flex items-center gap-1 shadow-md ${
                      isTv ? 'bg-sky-600/90' : 'bg-brand-600/90'
                    }`}
                  >
                    {isTv ? <Tv className="w-2.5 h-2.5" /> : <Film className="w-2.5 h-2.5" />}
                    {isTv ? 'TV Series' : 'Movie'}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemove(item);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/80 backdrop-blur-md text-white hover:text-rose-500 hover:scale-110 active:scale-95 transition-all shadow"
                    title="Remove from history"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Play Link Overlay */}
                  <Link
                    href={targetUrl}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <div className="w-12 h-12 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-lg shadow-brand-600/50 transform scale-50 group-hover:scale-100 transition-transform duration-300 ease-out">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </Link>
                </div>

                <div className="px-1">
                  <Link
                    href={targetUrl}
                    className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1 group-hover:text-brand-500 transition-colors"
                  >
                    {item.title}
                  </Link>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    <span>{item.releaseYear || 2024}</span>
                    {item.formattedWatchedTime && (
                      <span className="text-amber-500 text-[10px] font-semibold">{item.formattedWatchedTime}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
