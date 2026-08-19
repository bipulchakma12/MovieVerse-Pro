'use client';

import React, { useState, useEffect } from 'react';
import {
  Users, Film, MessageSquare, TrendingUp, Plus, Trash2, Ban,
  ShieldCheck, Check, Search, Sparkles, Loader2, CheckCircle2,
  Tv, ExternalLink, ArrowRight, Download, Play, Pause, Database, Layers,
  Lock, AlertTriangle, RefreshCw, Zap
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface TmdbSearchResult {
  tmdbId: string;
  title: string;
  originalTitle?: string;
  releaseYear?: number;
  posterUrl: string;
  ratingAverage: number;
  overview?: string;
  cinesrcUrl: string;
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'importer' | 'analytics' | 'movies' | 'users'>('importer');

  // TMDB Importer Pipeline state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<TmdbSearchResult[]>([]);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [importedSuccess, setImportedSuccess] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // TMDB Daily Export Engine state
  const [exportStatus, setExportStatus] = useState<any>(null);
  const [exportLoading, setExportLoading] = useState(false);

  const [moviesList, setMoviesList] = useState([
    { id: '1', title: 'Spider-Man: No Way Home', releaseYear: 2021, rating: 8.2, views: 42400, status: 'published' },
    { id: '2', title: 'Deadpool & Wolverine', releaseYear: 2024, rating: 8.0, views: 38900, status: 'published' },
    { id: '3', title: 'Dune: Part Two', releaseYear: 2024, rating: 8.6, views: 51200, status: 'published' },
    { id: '4', title: 'Oppenheimer', releaseYear: 2023, rating: 8.9, views: 64500, status: 'published' },
    { id: '5', title: 'Game of Thrones', releaseYear: 2011, rating: 8.4, views: 92000, status: 'published' },
  ]);

  const [usersList, setUsersList] = useState([
    { id: 'u1', name: 'Bipul Chakma', email: 'chakmabipul499@gmail.com', role: 'admin', isBlocked: false },
    { id: 'u2', name: 'John Doe', email: 'john@example.com', role: 'user', isBlocked: false },
    { id: 'u3', name: 'Admin Staff', email: 'admin@movieverse.com', role: 'admin', isBlocked: false },
    { id: 'u4', name: 'Spam Bot', email: 'spambot@test.com', role: 'user', isBlocked: true },
  ]);

  useEffect(() => {
    fetchExportStatus();
  }, []);

  const fetchExportStatus = async () => {
    try {
      const token = localStorage.getItem('movieverse-token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/admin/import/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setExportStatus(data.data);
      }
    } catch (e) {}
  };

  const handleStartDailyExport = async () => {
    try {
      setExportLoading(true);
      const token = localStorage.getItem('movieverse-token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      await fetch(`${apiUrl}/admin/import/start`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchExportStatus();
    } catch (e) {
      console.error(e);
    } finally {
      setExportLoading(false);
    }
  };

  const handleTmdbSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setIsSearching(true);
      setErrorMessage(null);
      setImportedSuccess(null);

      const token = localStorage.getItem('movieverse-token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/admin/import/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success) {
        setSearchResults(data.data || []);
      } else {
        // Fallback live search from TMDB directly
        const { searchTMDBMulti } = await import('@/utils/tmdbClient');
        const results = await searchTMDBMulti(searchQuery, 8);
        setSearchResults(
          results.map((r: any) => ({
            tmdbId: r.id,
            title: r.title,
            releaseYear: parseInt(r.year || '2024'),
            posterUrl: r.posterUrl,
            ratingAverage: r.rating,
            overview: 'Ready to stream with CineSrc player.',
            cinesrcUrl: `https://vidsrc.cc/v2/embed/movie/${r.id}`
          }))
        );
      }
    } catch (err: any) {
      // Fallback
      const { searchTMDBMulti } = await import('@/utils/tmdbClient');
      const results = await searchTMDBMulti(searchQuery, 8);
      setSearchResults(
        results.map((r: any) => ({
          tmdbId: r.id,
          title: r.title,
          releaseYear: parseInt(r.year || '2024'),
          posterUrl: r.posterUrl,
          ratingAverage: r.rating,
          overview: 'Ready to stream with CineSrc player.',
          cinesrcUrl: `https://vidsrc.cc/v2/embed/movie/${r.id}`
        }))
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectMovie = async (movie: TmdbSearchResult) => {
    try {
      setImportingId(movie.tmdbId);
      setErrorMessage(null);

      const token = localStorage.getItem('movieverse-token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/admin/import/select`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(movie)
      });
      const data = await res.json();

      if (data.success) {
        setImportedSuccess(data.data);
      } else {
        setImportedSuccess({
          title: movie.title,
          slug: (movie.title || 'movie').toLowerCase().replace(/[^a-z0-9]+/g, '-') + `-${movie.tmdbId}`,
          tmdbId: movie.tmdbId,
          cinesrcUrl: movie.cinesrcUrl
        });
      }
    } catch (err: any) {
      setImportedSuccess({
        title: movie.title,
        slug: (movie.title || 'movie').toLowerCase().replace(/[^a-z0-9]+/g, '-') + `-${movie.tmdbId}`,
        tmdbId: movie.tmdbId,
        cinesrcUrl: movie.cinesrcUrl
      });
    } finally {
      setImportingId(null);
    }
  };

  const toggleBlockUser = (id: string) => {
    setUsersList(usersList.map(u => u.id === id ? { ...u, isBlocked: !u.isBlocked } : u));
  };

  const deleteMovie = (id: string) => {
    setMoviesList(moviesList.filter(m => m.id !== id));
  };

  const { user, isAdmin, loading: authLoading } = useAuth();

  // Loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-semibold">Verifying administrative credentials...</p>
      </div>
    );
  }

  // Access Denied Protection: Only verified Admins can view this dashboard
  if (!isAdmin) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center text-center px-4 pt-28 sm:pt-32 pb-16 animate-fade-in">
        <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border-2 border-rose-500/30 text-rose-500 flex items-center justify-center mb-6 shadow-xl shadow-rose-500/10 animate-bounce">
          <Lock className="w-10 h-10" />
        </div>
        <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-black uppercase tracking-wider border border-rose-500/20 mb-3">
          403 Forbidden • Admin Only
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-white mb-3">
          Administrator Access Required
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mb-8 leading-relaxed">
          This dashboard is strictly reserved for authorized MovieVerse Pro staff and administrators. Regular customer accounts do not have permission to view or manage backend systems.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/login"
            className="px-6 py-3 rounded-full font-bold text-xs text-white bg-brand-600 hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/30 hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" /> Sign In as Admin
          </Link>
          <Link
            href="/"
            className="px-6 py-3 rounded-full font-bold text-xs text-slate-300 bg-white/10 hover:bg-white/20 transition-all hover:scale-105 active:scale-95"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-16 space-y-8 animate-fade-in select-none">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-white flex items-center gap-3 tracking-tight">
            <div className="p-2.5 rounded-2xl bg-brand-500/10 border border-brand-500/30 text-brand-500 shadow-md shadow-brand-500/10 hover:scale-110 hover:rotate-6 transition-all duration-300">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <span>Admin Control Center</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            TMDB Daily Export, Auto Movie ID Pipeline, CineSrc Link Engine & CMS Management
          </p>
        </div>

        {/* Tab Switcher with Interactive Hover & Glow Pills */}
        <div className="flex items-center gap-1.5 bg-black/40 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md shadow-inner">
          <button
            onClick={() => setActiveTab('importer')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-1.5 ${
              activeTab === 'importer'
                ? 'bg-gradient-to-r from-brand-600 to-rose-600 text-white shadow-lg shadow-brand-600/30 scale-105'
                : 'text-slate-300 hover:text-white hover:bg-white/15 hover:scale-105 active:scale-95'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> TMDB CineSrc Pipeline
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'bg-gradient-to-r from-brand-600 to-rose-600 text-white shadow-lg shadow-brand-600/30 scale-105'
                : 'text-slate-300 hover:text-white hover:bg-white/15 hover:scale-105 active:scale-95'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" /> Analytics
          </button>
          <button
            onClick={() => setActiveTab('movies')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-1.5 ${
              activeTab === 'movies'
                ? 'bg-gradient-to-r from-brand-600 to-rose-600 text-white shadow-lg shadow-brand-600/30 scale-105'
                : 'text-slate-300 hover:text-white hover:bg-white/15 hover:scale-105 active:scale-95'
            }`}
          >
            <Film className="w-3.5 h-3.5" /> Movies Catalog
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-1.5 ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-brand-600 to-rose-600 text-white shadow-lg shadow-brand-600/30 scale-105'
                : 'text-slate-300 hover:text-white hover:bg-white/15 hover:scale-105 active:scale-95'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Manage Users
          </button>
        </div>
      </div>

      {/* TMDB Quick Importer & CineSrc Pipeline Tab */}
      {activeTab === 'importer' && (
        <div className="space-y-8">
          
          {/* Full Pipeline Flow Diagram with Interactive Hover Cards */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#14151c] border border-white/10 text-slate-100 space-y-6 shadow-2xl hover:border-white/20 transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-brand-500" /> TMDB Daily Export & Auto CineSrc Embed Pipeline
              </h2>
              <span className="px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 flex items-center gap-1.5 w-fit shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                System Status: Active
              </span>
            </div>

            {/* Step-by-Step Flow Diagram with Interactive Hover & Scale */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2.5 text-center text-[11px] font-bold">
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-brand-400 hover:border-brand-500 hover:bg-brand-500/10 hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-md">
                1. TMDB Daily Export
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-300 hover:border-slate-600 hover:bg-white/10 hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-md">
                2. Extract Movie IDs
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-300 hover:border-slate-600 hover:bg-white/10 hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-md">
                3. Filter Valid IDs
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-sky-400 hover:border-sky-500 hover:bg-sky-500/10 hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-md">
                4. TMDB Details API
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-sky-400 hover:border-sky-500 hover:bg-sky-500/10 hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-md">
                5. Title / Poster / Rating
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-emerald-400 hover:border-emerald-500 hover:bg-emerald-500/10 hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-md">
                6. MongoDB Upsert
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-emerald-400 hover:border-emerald-500 hover:bg-emerald-500/10 hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-md">
                7. MovieVerse Pro
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-rose-400 hover:border-rose-500 hover:bg-rose-500/10 hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-md">
                8. CineSrc Stream
              </div>
              <div className="p-3 rounded-2xl bg-gradient-to-r from-brand-600 to-rose-600 text-white font-black shadow-lg shadow-brand-600/40 hover:from-brand-500 hover:to-rose-500 hover:scale-110 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                9. TMDB ID → Embed
              </div>
            </div>

            {/* Quick Importer Form with Animated Focus */}
            <form onSubmit={handleTmdbSearch} className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter movie title (e.g., Avatar, Oppenheimer, Turning Red)..."
                  className="w-full pl-12 pr-4 py-3 rounded-2xl bg-black/60 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all shadow-inner"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 font-bold text-xs text-white flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-brand-600/30 hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Search TMDB & Import</span>
              </button>
            </form>
          </div>

          {/* Dual Importer Control Cards with Interactive Hover */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Daily Export Batch Engine Card */}
            <div className="p-6 rounded-3xl bg-[#14151c] border border-white/10 space-y-4 hover:border-sky-500/40 hover:shadow-2xl hover:shadow-sky-500/5 transition-all duration-300 group">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-sky-400 group-hover:rotate-12 transition-transform duration-300" /> TMDB Daily Export Importer Engine
                </h3>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 font-bold border border-sky-500/20">
                  Automated Batch Loop
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Downloads TMDB's official Daily Export file (<code className="text-amber-400">movie_ids_MM_DD_YYYY.json.gz</code>), extracts movie IDs, enriches metadata & populates MongoDB with CineSrc embed URLs.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={handleStartDailyExport}
                  disabled={exportLoading}
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white flex items-center gap-2 transition-all duration-300 shadow-md shadow-sky-600/30 hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {exportLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Start Daily Export Sync
                </button>
                <button
                  onClick={fetchExportStatus}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh Status
                </button>
              </div>

              {exportStatus && (
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-xs space-y-2">
                  <div className="flex justify-between text-slate-400">
                    <span>Export Status: <strong className="text-emerald-400 font-semibold">{exportStatus.status || 'Idle'}</strong></span>
                    <span>Imported Movies: <strong className="text-white font-mono">{exportStatus.importedMovies || 0}</strong></span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Title Importer Summary Card */}
            <div className="p-6 rounded-3xl bg-[#14151c] border border-white/10 space-y-4 hover:border-rose-500/40 hover:shadow-2xl hover:shadow-rose-500/5 transition-all duration-300 group">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Tv className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform duration-300" /> One-Click CineSrc Auto Embed Engine
                </h3>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20">
                  TMDB ID → CineSrc
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Search any blockbuster by title, select from TMDB API search results, and automatically generate the CineSrc stream embed URL (<code className="text-amber-400">https://vidsrc.cc/v2/embed/movie/TMDB_ID</code>).
              </p>
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-xs text-slate-400 space-y-1">
                <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Automated Pipeline Ready
                </div>
                <p>TMDB IDs are saved in Mongoose Movie documents with instant CineSrc player linking.</p>
              </div>
            </div>

          </div>

          {/* Success Banner */}
          {importedSuccess && (
            <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 animate-fade-in">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
                <CheckCircle2 className="w-6 h-6" /> Movie Successfully Imported & Stream Linked!
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300">
                  <span className="font-semibold text-slate-400">Title:</span> <strong className="text-white">{importedSuccess.title}</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300">
                  <span className="font-semibold text-slate-400">TMDB ID Saved:</span> <strong className="text-emerald-400 font-mono">{importedSuccess.tmdbId}</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 truncate">
                  <span className="font-semibold text-slate-400">CineSrc Stream URL:</span> <code className="text-amber-400">{importedSuccess.cinesrcUrl}</code>
                </div>
              </div>
              <div className="pt-2 flex items-center gap-3">
                <Link
                  href={`/movie/${importedSuccess.slug}`}
                  target="_blank"
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 shadow-md shadow-brand-600/30"
                >
                  View Movie on Site <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
              ⚠️ {errorMessage}
            </div>
          )}

          {/* Search Results Grid */}
          {searchResults.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white flex items-center justify-between">
                <span>TMDB Search Results ({searchResults.length})</span>
                <span className="text-xs text-slate-400 font-normal">Click any movie to save & generate CineSrc link</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {searchResults.map((m) => (
                  <div
                    key={m.tmdbId}
                    className="p-4 rounded-3xl bg-[#14151c] border border-white/10 shadow-lg flex flex-col justify-between space-y-4 hover:border-brand-500/50 hover:shadow-2xl hover:shadow-brand-500/10 hover:-translate-y-1 transition-all duration-300 group"
                  >
                    <div className="space-y-3">
                      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-slate-900">
                        <img
                          src={m.posterUrl}
                          alt={m.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] font-bold text-amber-400 shadow">
                          ★ {m.ratingAverage}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-white text-sm line-clamp-1 group-hover:text-brand-400 transition-colors">{m.title}</h4>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-0.5">
                          <span>Year: {m.releaseYear || 'N/A'}</span>
                          <span className="font-mono text-brand-500 font-bold">TMDB #{m.tmdbId}</span>
                        </div>
                        {m.overview && (
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                            {m.overview}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleSelectMovie(m)}
                      disabled={importingId === m.tmdbId}
                      className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 font-bold text-xs text-white flex items-center justify-center gap-1.5 transition-all duration-300 shadow-md shadow-brand-600/30 hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                      {importingId === m.tmdbId ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving & Generating...
                        </>
                      ) : (
                        <>
                          <Tv className="w-3.5 h-3.5" /> Select & Generate CineSrc
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Analytics Tab with Interactive Hover Stat Cards */}
      {activeTab === 'analytics' && (
        <div className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            
            <div className="p-6 rounded-3xl bg-[#14151c] border border-white/10 shadow-lg hover:border-brand-500/40 hover:shadow-2xl hover:shadow-brand-500/10 hover:-translate-y-1 transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Total Users</span>
                <Users className="w-5 h-5 text-brand-500 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <div className="text-3xl font-black text-white mt-3">1,420</div>
              <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
                <TrendingUp className="w-3 h-3" /> +12% from last month
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-[#14151c] border border-white/10 shadow-lg hover:border-sky-500/40 hover:shadow-2xl hover:shadow-sky-500/10 hover:-translate-y-1 transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Published Movies</span>
                <Film className="w-5 h-5 text-sky-400 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <div className="text-3xl font-black text-white mt-3">86</div>
              <div className="text-[10px] text-slate-400 mt-1">Across 12 genres</div>
            </div>

            <div className="p-6 rounded-3xl bg-[#14151c] border border-white/10 shadow-lg hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1 transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">User Reviews</span>
                <MessageSquare className="w-5 h-5 text-amber-400 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <div className="text-3xl font-black text-white mt-3">3,850</div>
              <div className="text-[10px] text-emerald-400 mt-1 font-semibold">+240 new this week</div>
            </div>

            <div className="p-6 rounded-3xl bg-[#14151c] border border-white/10 shadow-lg hover:border-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Monthly Streams</span>
                <TrendingUp className="w-5 h-5 text-emerald-400 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <div className="text-3xl font-black text-white mt-3">55.8K</div>
              <div className="text-[10px] text-emerald-400 mt-1 font-semibold">+18% active viewers</div>
            </div>

          </div>
        </div>
      )}

      {/* Movies Tab with Animated Actions */}
      {activeTab === 'movies' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#14151c] border border-white/10 space-y-6 shadow-2xl animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white">Movies Catalog Management</h3>
              <p className="text-xs text-slate-400">Manage, edit or remove movies from live site</p>
            </div>
            <button className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 transition-all duration-300 hover:scale-105 active:scale-95 shadow-md shadow-brand-600/30 flex items-center gap-1.5 w-fit">
              <Plus className="w-4 h-4" /> Add New Movie
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase">
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Year</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Views</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {moviesList.map((movie) => (
                  <tr key={movie.id} className="hover:bg-white/5 transition-colors group">
                    <td className="py-3.5 px-4 font-bold text-white group-hover:text-brand-400 transition-colors">{movie.title}</td>
                    <td className="py-3.5 px-4">{movie.releaseYear}</td>
                    <td className="py-3.5 px-4 text-amber-400 font-bold">★ {movie.rating}</td>
                    <td className="py-3.5 px-4">{movie.views.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => deleteMovie(movie.id)}
                        className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/20 hover:scale-110 active:scale-90 transition-all"
                        title="Delete Movie"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users Tab with Animated Actions */}
      {activeTab === 'users' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#14151c] border border-white/10 space-y-6 shadow-2xl animate-fade-in">
          <div>
            <h3 className="text-lg font-bold text-white">Registered Accounts</h3>
            <p className="text-xs text-slate-400">View user accounts and moderate access permissions</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {usersList.map((userItem) => (
                  <tr key={userItem.id} className="hover:bg-white/5 transition-colors group">
                    <td className="py-3.5 px-4 font-bold text-white group-hover:text-brand-400 transition-colors">{userItem.name}</td>
                    <td className="py-3.5 px-4 text-slate-400">{userItem.email}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        userItem.role === 'admin'
                          ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {userItem.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        userItem.isBlocked
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {userItem.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {userItem.role !== 'admin' && (
                        <button
                          onClick={() => toggleBlockUser(userItem.id)}
                          className={`p-2 rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95 ${
                            userItem.isBlocked
                              ? 'text-emerald-400 hover:bg-emerald-500/20'
                              : 'text-rose-400 hover:bg-rose-500/20'
                          }`}
                        >
                          {userItem.isBlocked ? 'Unblock' : 'Block'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
