'use client';

import React, { useState, useEffect } from 'react';
import {
  Users, Film, MessageSquare, TrendingUp, Plus, Trash2, Ban,
  ShieldCheck, Check, Search, Sparkles, Loader2, CheckCircle2,
  Tv, ExternalLink, ArrowRight, Download, Play, Pause, Database, Layers,
  Lock, AlertTriangle
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
    { id: '1', title: 'Inception', releaseYear: 2010, rating: 8.8, views: 12400, status: 'published' },
    { id: '2', title: 'Oppenheimer', releaseYear: 2023, rating: 8.9, views: 18900, status: 'published' },
    { id: '3', title: 'Interstellar', releaseYear: 2014, rating: 8.7, views: 24500, status: 'published' },
  ]);

  const [usersList, setUsersList] = useState([
    { id: 'u1', name: 'John Doe', email: 'john@example.com', role: 'user', isBlocked: false },
    { id: 'u2', name: 'Admin User', email: 'admin@movieverse.com', role: 'admin', isBlocked: false },
    { id: 'u3', name: 'Spam Bot', email: 'spambot@test.com', role: 'user', isBlocked: true },
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

  // Handle TMDB Movie Title Search
  const handleTmdbSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setIsSearching(true);
      setErrorMessage(null);
      setImportedSuccess(null);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/admin/import/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        setSearchResults(data.data);
      } else {
        setSearchResults([]);
        setErrorMessage(data.message || 'No search results found on TMDB.');
      }
    } catch (err: any) {
      console.error('TMDB Search Error:', err);
      setErrorMessage('Failed to connect to TMDB import server.');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle Select Movie -> Auto Save TMDB ID & Generate CineSrc URL
  const handleSelectMovie = async (movie: TmdbSearchResult) => {
    try {
      setImportingId(movie.tmdbId);
      setErrorMessage(null);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

      const res = await fetch(`${apiUrl}/admin/import/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tmdbId: movie.tmdbId }),
      });
      const data = await res.json();

      if (data.success && data.movie) {
        setImportedSuccess({
          title: data.movie.title,
          slug: data.movie.slug,
          tmdbId: data.movie.tmdbId,
          cinesrcUrl: data.cinesrcUrl || `https://vidsrc.cc/v2/embed/movie/${data.movie.tmdbId}`,
        });
      } else {
        setErrorMessage(data.message || 'Failed to import movie from TMDB.');
      }
    } catch (err: any) {
      console.error('Select Movie Error:', err);
      setErrorMessage('Network error during movie import.');
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
      <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 py-16 animate-fade-in">
        <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border-2 border-rose-500/30 text-rose-500 flex items-center justify-center mb-6 shadow-xl shadow-rose-500/10">
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 dark:border-dark-border pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-brand-500" /> Admin Control Center
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            TMDB Daily Export, Auto Movie ID Pipeline, CineSrc Link Engine & CMS Management
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-dark-card p-1.5 rounded-2xl border border-slate-200 dark:border-dark-border">
          <button
            onClick={() => setActiveTab('importer')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'importer' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> TMDB CineSrc Pipeline
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'analytics' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('movies')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'movies' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Movies Catalog
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'users' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Manage Users
          </button>
        </div>
      </div>

      {/* TMDB Quick Importer & CineSrc Pipeline Tab */}
      {activeTab === 'importer' && (
        <div className="space-y-8">
          
          {/* Full Pipeline Flow Diagram */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-brand-500" /> TMDB Daily Export & Auto CineSrc Embed Pipeline
              </h2>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                System Status: Active
              </span>
            </div>

            {/* Step-by-Step Flow Diagram */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2 text-center text-[11px] font-bold">
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-brand-400">
                1. TMDB Daily Export
              </div>
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300">
                2. Extract Movie IDs
              </div>
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300">
                3. Filter Valid IDs
              </div>
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-sky-400">
                4. TMDB Details API
              </div>
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-sky-400">
                5. Title / Poster / Rating
              </div>
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-emerald-400">
                6. MongoDB Upsert
              </div>
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-emerald-400">
                7. MovieVerse Pro
              </div>
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-rose-400">
                8. CineSrc Stream
              </div>
              <div className="p-3 rounded-xl bg-brand-600 text-white font-black shadow-lg shadow-brand-600/30">
                9. TMDB ID → Embed
              </div>
            </div>

            {/* Quick Importer Form */}
            <form onSubmit={handleTmdbSearch} className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-slate-800">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter movie title (e.g., Avatar, Oppenheimer, Turning Red)..."
                  className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 font-bold text-xs text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-600/30 disabled:opacity-50"
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Search TMDB & Import
              </button>
            </form>
          </div>

          {/* Dual Importer Control Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Daily Export Batch Engine Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-dark-border pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-sky-500" /> TMDB Daily Export Importer Engine
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-500 font-bold">
                  Automated Batch Loop
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Downloads TMDB's official Daily Export file (<code className="text-amber-500">movie_ids_MM_DD_YYYY.json.gz</code>), extracts movie IDs, enriches metadata & populates MongoDB with CineSrc embed URLs.
              </p>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleStartDailyExport}
                  disabled={exportLoading}
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-xs font-bold text-white flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {exportLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Start Daily Export Sync
                </button>
                <button
                  onClick={fetchExportStatus}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all"
                >
                  Refresh Progress Status
                </button>
              </div>

              {exportStatus && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                  <div className="flex justify-between text-slate-400">
                    <span>Export Status: <strong className="text-emerald-400 font-semibold">{exportStatus.status || 'Idle'}</strong></span>
                    <span>Imported Movies: <strong className="text-white font-mono">{exportStatus.importedMovies || 0}</strong></span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Title Importer Summary Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-dark-border pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Tv className="w-5 h-5 text-rose-500" /> One-Click CineSrc Auto Embed Engine
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 font-bold">
                  TMDB ID → CineSrc
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Search any blockbuster by title, select from TMDB API search results, and automatically generate the CineSrc stream embed URL (<code className="text-amber-500">https://vidsrc.cc/v2/embed/movie/TMDB_ID</code>).
              </p>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-400 space-y-1">
                <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Automated Pipeline Ready
                </div>
                <p>TMDB IDs are saved in Mongoose Movie documents with instant CineSrc player linking.</p>
              </div>
            </div>

          </div>

          {/* Success Banner */}
          {importedSuccess && (
            <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
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
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-xs font-bold text-white flex items-center gap-1.5"
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
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>TMDB Search Results ({searchResults.length})</span>
                <span className="text-xs text-slate-400 font-normal">Click any movie to save & generate CineSrc link</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {searchResults.map((m) => (
                  <div
                    key={m.tmdbId}
                    className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-sm flex flex-col justify-between space-y-4 hover:border-brand-500/50 transition-all group"
                  >
                    <div className="space-y-3">
                      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-slate-900">
                        <img
                          src={m.posterUrl}
                          alt={m.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] font-bold text-amber-400">
                          ★ {m.ratingAverage}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{m.title}</h4>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-0.5">
                          <span>Year: {m.releaseYear || 'N/A'}</span>
                          <span className="font-mono text-brand-500">TMDB #{m.tmdbId}</span>
                        </div>
                        {m.overview && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                            {m.overview}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleSelectMovie(m)}
                      disabled={importingId === m.tmdbId}
                      className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 font-bold text-xs text-white flex items-center justify-center gap-1.5 transition-all shadow-md shadow-brand-600/20 disabled:opacity-50"
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

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Total Users</span>
                <Users className="w-5 h-5 text-brand-500" />
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white mt-3">1,420</div>
              <div className="text-[10px] text-emerald-500 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +12% from last month
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Published Movies</span>
                <Film className="w-5 h-5 text-sky-500" />
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white mt-3">86</div>
              <div className="text-[10px] text-slate-400 mt-1">Across 12 genres</div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">User Reviews</span>
                <MessageSquare className="w-5 h-5 text-amber-500" />
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white mt-3">3,850</div>
              <div className="text-[10px] text-emerald-500 mt-1">+240 new this week</div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Monthly Streams</span>
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white mt-3">55.8K</div>
              <div className="text-[10px] text-emerald-500 mt-1">+18% active viewers</div>
            </div>
          </div>
        </div>
      )}

      {/* Movies Tab */}
      {activeTab === 'movies' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Movies Catalog</h3>
            <button className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 transition-all flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Add New Movie
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-dark-border text-slate-400 font-semibold uppercase">
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Year</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Views</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-border text-slate-700 dark:text-slate-300">
                {moviesList.map((movie) => (
                  <tr key={movie.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                    <td className="py-3 px-4 font-bold">{movie.title}</td>
                    <td className="py-3 px-4">{movie.releaseYear}</td>
                    <td className="py-3 px-4 text-amber-500 font-bold">★ {movie.rating}</td>
                    <td className="py-3 px-4">{movie.views.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => deleteMovie(movie.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
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

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border space-y-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Registered Accounts</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-dark-border text-slate-400 font-semibold uppercase">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-border text-slate-700 dark:text-slate-300">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                    <td className="py-3 px-4 font-bold">{u.name}</td>
                    <td className="py-3 px-4">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.role === 'admin' ? 'bg-brand-500/10 text-brand-500' : 'bg-slate-100 dark:bg-slate-800'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {u.isBlocked ? (
                        <span className="text-rose-500 font-bold flex items-center gap-1">
                          <Ban className="w-3 h-3" /> Blocked
                        </span>
                      ) : (
                        <span className="text-emerald-500 font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Active
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => toggleBlockUser(u.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold ${u.isBlocked ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}
                      >
                        {u.isBlocked ? 'Unblock' : 'Block'}
                      </button>
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
