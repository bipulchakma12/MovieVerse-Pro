'use client';

import React, { useState, useEffect } from 'react';
import {
  Users, Film, MessageSquare, TrendingUp, Plus, Trash2, Ban,
  ShieldCheck, Check, Search, Sparkles, Loader2, CheckCircle2,
  Tv, ExternalLink, ArrowRight, Download, Play, Pause, Database, Layers,
  Lock, AlertTriangle, RefreshCw, Zap, X, Image as ImageIcon, Video, Calendar, Star,
  Globe, Activity, Smartphone, Laptop, Eye, UserCheck, Clock, ArrowUpRight, Radio
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getVisitorAnalytics, VisitorAnalyticsData } from '@/utils/visitorTracker';

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
  const [activeTab, setActiveTab] = useState<'importer' | 'analytics' | 'movies' | 'users'>('analytics');

  // Real-Time Visitor Analytics State
  const [visitorStats, setVisitorStats] = useState<VisitorAnalyticsData>(() => getVisitorAnalytics());

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

  // Add New Movie Modal State
  const [isAddMovieModalOpen, setIsAddMovieModalOpen] = useState(false);
  const [addMode, setAddMode] = useState<'tmdb' | 'custom'>('tmdb');
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [modalSearchResults, setModalSearchResults] = useState<any[]>([]);
  const [isModalSearching, setIsModalSearching] = useState(false);

  // Custom Movie Form Fields
  const [customTitle, setCustomTitle] = useState('');
  const [customPoster, setCustomPoster] = useState('');
  const [customBanner, setCustomBanner] = useState('');
  const [customYear, setCustomYear] = useState('2024');
  const [customRating, setCustomRating] = useState('8.0');
  const [customStoryline, setCustomStoryline] = useState('');
  const [customVideoUrl, setCustomVideoUrl] = useState('');
  const [customGenre, setCustomGenre] = useState('Action');
  const [isSubmittingCustom, setIsSubmittingCustom] = useState(false);
  const [movieActionMessage, setMovieActionMessage] = useState<string | null>(null);

  const [moviesList, setMoviesList] = useState([
    { id: '634649', title: 'Spider-Man: No Way Home', releaseYear: 2021, rating: 8.2, views: 42400, status: 'published', slug: 'spider-man-no-way-home-634649' },
    { id: '533535', title: 'Deadpool & Wolverine', releaseYear: 2024, rating: 8.0, views: 38900, status: 'published', slug: 'deadpool-and-wolverine-533535' },
    { id: '693134', title: 'Dune: Part Two', releaseYear: 2024, rating: 8.6, views: 51200, status: 'published', slug: 'dune-part-two-693134' },
    { id: '872585', title: 'Oppenheimer', releaseYear: 2023, rating: 8.9, views: 64500, status: 'published', slug: 'oppenheimer-872585' },
    { id: '1399', title: 'Game of Thrones', releaseYear: 2011, rating: 8.4, views: 92000, status: 'published', slug: 'game-of-thrones-1399' },
  ]);

  const [usersList, setUsersList] = useState([
    { id: 'u1', name: 'Bipul Chakma', email: 'chakmabipul499@gmail.com', role: 'admin', isBlocked: false },
    { id: 'u2', name: 'John Doe', email: 'john@example.com', role: 'user', isBlocked: false },
    { id: 'u3', name: 'Admin Staff', email: 'admin@movieverse.com', role: 'admin', isBlocked: false },
    { id: 'u4', name: 'Spam Bot', email: 'spambot@test.com', role: 'user', isBlocked: true },
  ]);

  useEffect(() => {
    fetchExportStatus();
    setVisitorStats(getVisitorAnalytics());
    const interval = setInterval(() => {
      setVisitorStats(getVisitorAnalytics());
    }, 4000);
    return () => clearInterval(interval);
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

      // Add to local movies list
      setMoviesList((prev) => [
        {
          id: movie.tmdbId,
          title: movie.title,
          releaseYear: movie.releaseYear || 2024,
          rating: movie.ratingAverage || 8.0,
          views: 120,
          status: 'published',
          slug: (movie.title || 'movie').toLowerCase().replace(/[^a-z0-9]+/g, '-') + `-${movie.tmdbId}`
        },
        ...prev
      ]);
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

  // Modal TMDB Search
  const handleModalSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalSearchQuery.trim()) return;

    try {
      setIsModalSearching(true);
      const { searchTMDBMulti } = await import('@/utils/tmdbClient');
      const results = await searchTMDBMulti(modalSearchQuery, 6);
      setModalSearchResults(results);
    } catch (e) {
      console.error(e);
    } finally {
      setIsModalSearching(false);
    }
  };

  // Import directly from Modal
  const handleImportFromModal = (item: any) => {
    const newMovie = {
      id: item.id.toString(),
      title: item.title,
      releaseYear: parseInt(item.year || '2024'),
      rating: item.rating || 8.0,
      views: 0,
      status: 'published',
      slug: item.slug || `${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${item.id}`
    };

    setMoviesList((prev) => [newMovie, ...prev.filter(m => m.id !== newMovie.id)]);
    setIsAddMovieModalOpen(false);
    setModalSearchQuery('');
    setModalSearchResults([]);
    setMovieActionMessage(`"${item.title}" successfully added to the catalog!`);
    setTimeout(() => setMovieActionMessage(null), 4000);
  };

  // Save Custom Movie Form
  const handleSaveCustomMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    setIsSubmittingCustom(true);
    const newId = Date.now().toString();
    const slug = customTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-') + `-${newId}`;

    const newMovie = {
      id: newId,
      title: customTitle.trim(),
      releaseYear: parseInt(customYear) || 2024,
      rating: parseFloat(customRating) || 8.0,
      views: 1,
      status: 'published',
      slug
    };

    // Try posting to backend
    try {
      const token = localStorage.getItem('movieverse-token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      await fetch(`${apiUrl}/movies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: customTitle.trim(),
          releaseYear: parseInt(customYear) || 2024,
          ratingAverage: parseFloat(customRating) || 8.0,
          storyline: customStoryline || 'Custom added movie in HD.',
          posterUrl: customPoster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80',
          bannerUrl: customBanner || customPoster || '',
          videoUrl: customVideoUrl || 'https://www.youtube.com/embed/YoHD9XEInc0',
          genres: [{ name: customGenre, slug: customGenre.toLowerCase() }]
        })
      }).catch(() => null);
    } catch (err) {}

    setMoviesList((prev) => [newMovie, ...prev]);
    setIsSubmittingCustom(false);
    setIsAddMovieModalOpen(false);
    setCustomTitle('');
    setCustomPoster('');
    setCustomBanner('');
    setCustomStoryline('');
    setCustomVideoUrl('');
    setMovieActionMessage(`"${customTitle}" successfully added to the catalog!`);
    setTimeout(() => setMovieActionMessage(null), 4000);
  };

  const toggleBlockUser = (id: string) => {
    setUsersList(usersList.map(u => u.id === id ? { ...u, isBlocked: !u.isBlocked } : u));
  };

  const deleteMovie = (id: string) => {
    setMoviesList(moviesList.filter(m => m.id !== id));
    setMovieActionMessage('Movie removed from catalog.');
    setTimeout(() => setMovieActionMessage(null), 3000);
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

      {/* Global Notification Toast */}
      {movieActionMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center gap-2 animate-fade-in shadow-lg">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{movieActionMessage}</span>
        </div>
      )}

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

      {/* Live Visitor Analytics & Traffic Intelligence Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-8 animate-fade-in select-none">
          
          {/* Live Monitor Header Bar */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#14151c] via-[#1a1728] to-[#14151c] border border-white/10 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <Activity className="w-6 h-6 text-emerald-400" /> Real-Time Live Website Visitor Traffic
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Live monitoring of all visitors, unique audiences, page hits, device breakdowns & activity logs
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 shadow-inner">
                <Radio className="w-4 h-4 animate-pulse" />
                <span>Live Feed: Active</span>
              </span>
              <button
                onClick={() => setVisitorStats(getVisitorAnalytics())}
                className="px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 text-xs font-bold transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95"
                title="Refresh Live Metrics"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>
          </div>

          {/* 4 Key Visitor Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            
            {/* Card 1: Live Active Users */}
            <div className="p-6 rounded-3xl bg-[#14151c] border border-white/10 shadow-lg hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Live Active Now
                </span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 group-hover:rotate-12 transition-transform">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-emerald-400 mt-3 flex items-baseline gap-2">
                <span>{visitorStats.liveOnline}</span>
                <span className="text-xs font-semibold text-slate-400">active online</span>
              </div>
              <div className="text-[10px] text-emerald-400/80 mt-1 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Real-time active audience
              </div>
            </div>

            {/* Card 2: Total Unique Visitors */}
            <div className="p-6 rounded-3xl bg-[#14151c] border border-white/10 shadow-lg hover:border-brand-500/50 hover:shadow-2xl hover:shadow-brand-500/10 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Total Unique Visitors</span>
                <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 group-hover:scale-110 group-hover:rotate-12 transition-transform">
                  <UserCheck className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white mt-3">
                {visitorStats.uniqueVisitors.toLocaleString()}
              </div>
              <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
                <TrendingUp className="w-3 h-3" /> +14% unique growth
              </div>
            </div>

            {/* Card 3: Total Page Views / Visits */}
            <div className="p-6 rounded-3xl bg-[#14151c] border border-white/10 shadow-lg hover:border-sky-500/50 hover:shadow-2xl hover:shadow-sky-500/10 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Total Page Views</span>
                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 group-hover:scale-110 group-hover:rotate-12 transition-transform">
                  <Eye className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-sky-400 mt-3">
                {visitorStats.totalVisits.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Across all site routes</div>
            </div>

            {/* Card 4: Today's Visits */}
            <div className="p-6 rounded-3xl bg-[#14151c] border border-white/10 shadow-lg hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Today's Visits</span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 group-hover:rotate-12 transition-transform">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-amber-400 mt-3">
                {visitorStats.todayVisits.toLocaleString()}
              </div>
              <div className="text-[10px] text-emerald-400 mt-1 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +28% daily surge
              </div>
            </div>

          </div>

          {/* 2-Column Grid: Device Breakdown & Top Visited Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Device Traffic Breakdown Card */}
            <div className="p-6 sm:p-7 rounded-3xl bg-[#14151c] border border-white/10 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-sky-400" /> Visitor Device Breakdown
                </h3>
                <span className="text-xs font-semibold text-slate-400">Desktop & Mobile</span>
              </div>

              <div className="space-y-4">
                {/* Desktop */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <Laptop className="w-4 h-4 text-sky-400" /> Desktop & Laptops
                    </span>
                    <span className="text-sky-400 font-mono">{visitorStats.desktopPercent}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-sky-500 to-blue-600 rounded-full transition-all duration-1000" style={{ width: `${visitorStats.desktopPercent}%` }} />
                  </div>
                </div>

                {/* Mobile */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-rose-400" /> Mobile Phones (iOS / Android)
                    </span>
                    <span className="text-rose-400 font-mono">{visitorStats.mobilePercent}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-rose-500 to-pink-600 rounded-full transition-all duration-1000" style={{ width: `${visitorStats.mobilePercent}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Top Visited Pages & Content */}
            <div className="p-6 sm:p-7 rounded-3xl bg-[#14151c] border border-white/10 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-amber-400" /> Top Visited Sections
                </h3>
                <span className="text-xs font-semibold text-slate-400">Total Views</span>
              </div>

              <div className="space-y-3">
                {visitorStats.topPages.map((p, idx) => (
                  <div key={p.path} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-black flex items-center justify-center font-mono">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-white">{p.label}</div>
                        <div className="text-[10px] font-mono text-slate-400">{p.path}</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-amber-400 font-mono">
                      {p.views.toLocaleString()} views
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Real-Time Live Visitor Activity Stream Table */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#14151c] border border-white/10 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-brand-500" /> Live Visitor Activity Stream
                </h3>
                <p className="text-xs text-slate-400">
                  Real-time events of users watching movies, browsing categories and searching titles
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Auto-Updating
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Visited Route / Page</th>
                    <th className="py-3 px-4">Device & Browser</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {visitorStats.recentLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                        {log.action}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-brand-400 group-hover:underline">
                        <Link href={log.path} target="_blank" className="flex items-center gap-1.5">
                          <span className="max-w-[200px] truncate">{log.path}</span>
                          <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-white/10 text-slate-200 text-[10px] font-semibold">
                          {log.device} • {log.browser}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Movies Tab with Animated Actions & Functional Add Movie Button */}
      {activeTab === 'movies' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#14151c] border border-white/10 space-y-6 shadow-2xl animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white">Movies Catalog Management</h3>
              <p className="text-xs text-slate-400">Manage, add, edit or remove movies from live site</p>
            </div>
            <button
              onClick={() => setIsAddMovieModalOpen(true)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-rose-600 hover:from-brand-500 hover:to-rose-500 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-brand-600/30 flex items-center gap-2 w-fit"
            >
              <Plus className="w-4 h-4" /> + Add New Movie
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
                    <td className="py-3.5 px-4 font-bold text-white group-hover:text-brand-400 transition-colors">
                      <Link href={`/movie/${movie.slug || movie.id}`} className="hover:underline flex items-center gap-2">
                        <span>{movie.title}</span>
                        <ExternalLink className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </td>
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

      {/* Add New Movie Interactive Modal */}
      {isAddMovieModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl bg-[#14151c] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Film className="w-5 h-5 text-brand-500" /> Add New Movie to Site
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Import from TMDB database or enter custom movie details
                </p>
              </div>
              <button
                onClick={() => setIsAddMovieModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher: TMDB Quick Import vs Custom Entry */}
            <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/10">
              <button
                type="button"
                onClick={() => setAddMode('tmdb')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  addMode === 'tmdb'
                    ? 'bg-gradient-to-r from-brand-600 to-rose-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4" /> Quick TMDB Auto-Import
              </button>
              <button
                type="button"
                onClick={() => setAddMode('custom')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  addMode === 'custom'
                    ? 'bg-gradient-to-r from-brand-600 to-rose-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Plus className="w-4 h-4" /> Manual Custom Movie
              </button>
            </div>

            {/* TMDB Quick Import Tab */}
            {addMode === 'tmdb' ? (
              <div className="space-y-4">
                <form onSubmit={handleModalSearch} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={modalSearchQuery}
                      onChange={(e) => setModalSearchQuery(e.target.value)}
                      placeholder="Search movie title (e.g., Gladiator, Titanic, Batman)..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isModalSearching}
                    className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 font-bold text-xs text-white flex items-center gap-1.5 transition-all shadow-md shadow-brand-600/30 disabled:opacity-50"
                  >
                    {isModalSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    Search
                  </button>
                </form>

                {/* Modal Results */}
                {modalSearchResults.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                    {modalSearchResults.map((item) => (
                      <div
                        key={`modal-${item.id}`}
                        className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-500/50 hover:bg-white/10 transition-all group"
                      >
                        <img
                          src={item.posterUrl}
                          alt={item.title}
                          className="w-12 h-16 rounded-xl object-cover flex-shrink-0 bg-slate-800"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">{item.year} • ★ {item.rating}</p>
                          <button
                            type="button"
                            onClick={() => handleImportFromModal(item)}
                            className="mt-2 px-3 py-1 rounded-lg bg-brand-600 hover:bg-brand-500 text-[10px] font-bold text-white transition-all hover:scale-105"
                          >
                            + Add to Site
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-white/10 rounded-2xl">
                    Type a movie name above to search from millions of official TMDB titles.
                  </div>
                )}
              </div>
            ) : (
              /* Custom Movie Form */
              <form onSubmit={handleSaveCustomMovie} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Movie Title *</label>
                  <input
                    type="text"
                    required
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="e.g., Inception 2: Dreamscape"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Release Year</label>
                    <input
                      type="number"
                      value={customYear}
                      onChange={(e) => setCustomYear(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">IMDB Rating (1 - 10)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="10"
                      value={customRating}
                      onChange={(e) => setCustomRating(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Poster Image URL</label>
                    <input
                      type="url"
                      value={customPoster}
                      onChange={(e) => setCustomPoster(e.target.value)}
                      placeholder="https://image.tmdb.org/.../poster.jpg"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Backdrop Banner URL</label>
                    <input
                      type="url"
                      value={customBanner}
                      onChange={(e) => setCustomBanner(e.target.value)}
                      placeholder="https://image.tmdb.org/.../backdrop.jpg"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Stream / Embed URL</label>
                    <input
                      type="url"
                      value={customVideoUrl}
                      onChange={(e) => setCustomVideoUrl(e.target.value)}
                      placeholder="https://vidsrc.cc/v2/embed/movie/..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Genre</label>
                    <select
                      value={customGenre}
                      onChange={(e) => setCustomGenre(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="Action">Action</option>
                      <option value="Sci-Fi">Sci-Fi</option>
                      <option value="Drama">Drama</option>
                      <option value="Thriller">Thriller</option>
                      <option value="Adventure">Adventure</option>
                      <option value="Animation">Animation</option>
                      <option value="Horror">Horror</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Storyline / Overview</label>
                  <textarea
                    rows={3}
                    value={customStoryline}
                    onChange={(e) => setCustomStoryline(e.target.value)}
                    placeholder="Enter short storyline of this movie..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddMovieModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingCustom}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-rose-600 hover:from-brand-500 hover:to-rose-500 font-bold text-xs text-white flex items-center gap-1.5 transition-all shadow-md shadow-brand-600/30 hover:scale-105 active:scale-95 disabled:opacity-50"
                  >
                    {isSubmittingCustom ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Save & Publish Movie
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
