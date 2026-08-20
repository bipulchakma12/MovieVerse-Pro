'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Film,
  Search,
  User,
  Menu,
  X,
  Home,
  Clapperboard,
  Tv,
  Bookmark,
  LogOut,
  ShieldCheck,
  ChevronDown,
  History,
  Star,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '@/context/AuthContext';

export const Navbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  // Detect window scroll to toggle navbar transparency with high performance passive listener
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Live Auto-Suggest Search with Debounce (CineB Style)
  useEffect(() => {
    if (!searchQuery || !searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      setIsSearching(false);
      return;
    }

    setShowDropdown(true);
    setIsSearching(true);
    const timeout = setTimeout(async () => {
      try {
        const { searchTMDBMulti } = await import('@/utils/tmdbClient');
        const results = await searchTMDBMulti(searchQuery, 6);
        setSearchResults(results);
      } catch (err) {
        console.error('Live search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    router.push('/login');
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setShowDropdown(false);
    if (searchQuery.trim()) {
      setMobileMenuOpen(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/search');
    }
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 w-full transition-all duration-300 border-none ${
        isScrolled
          ? 'bg-slate-950/95 backdrop-blur-md shadow-2xl py-0'
          : 'bg-gradient-to-b from-black/80 via-black/30 to-transparent py-1'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Brand Logo & Interactive Animated Nav Links */}
          <div className="flex items-center gap-5 xl:gap-8 flex-shrink-0">
            <Link href="/" className="flex items-center group flex-shrink-0">
              <span className="text-2xl font-black text-white tracking-tight transition-transform group-hover:scale-105 drop-shadow whitespace-nowrap">
                MovieVerse<span className="text-brand-500 font-black">Pro</span>
              </span>
            </Link>

            {/* Nav Links - Interactive Glass Pills with Left-to-Right Background Sweep Animations */}
            <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2 text-sm font-semibold whitespace-nowrap flex-shrink-0 bg-black/35 p-1 rounded-full border border-white/10 backdrop-blur-md shadow-inner">
              
              {/* Home */}
              <Link
                href="/"
                className={`group relative overflow-hidden px-3.5 py-1.5 rounded-full transition-all duration-300 flex items-center gap-2 text-xs xl:text-sm select-none ${
                  pathname === '/'
                    ? 'bg-gradient-to-r from-brand-600 to-rose-600 text-white shadow-lg shadow-brand-600/30 font-bold scale-105'
                    : 'text-slate-300 border border-transparent hover:border-brand-500/40 hover:shadow-md hover:shadow-brand-500/10 hover:scale-105 active:scale-95'
                }`}
              >
                {/* Left-to-Right Red/Rose Sweep */}
                {pathname !== '/' && (
                  <span className="absolute inset-0 bg-gradient-to-r from-brand-600 via-rose-600 to-brand-500 opacity-90 -translate-x-full group-hover:translate-x-0 transition-transform duration-400 ease-out" />
                )}
                <Home className="relative z-10 w-4 h-4 text-brand-400 group-hover:scale-125 group-hover:-rotate-12 transition-transform duration-300 flex-shrink-0" />
                <span className="relative z-10 group-hover:text-white transition-colors duration-300">Home</span>
              </Link>

              {/* Movies */}
              <Link
                href="/trending"
                className={`group relative overflow-hidden px-3.5 py-1.5 rounded-full transition-all duration-300 flex items-center gap-2 text-xs xl:text-sm select-none ${
                  pathname === '/trending'
                    ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-600/30 font-bold scale-105'
                    : 'text-slate-300 border border-transparent hover:border-rose-500/40 hover:shadow-md hover:shadow-rose-500/10 hover:scale-105 active:scale-95'
                }`}
              >
                {/* Left-to-Right Rose/Pink Sweep */}
                {pathname !== '/trending' && (
                  <span className="absolute inset-0 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 opacity-90 -translate-x-full group-hover:translate-x-0 transition-transform duration-400 ease-out" />
                )}
                <Clapperboard className="relative z-10 w-4 h-4 text-rose-400 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-300 flex-shrink-0" />
                <span className="relative z-10 group-hover:text-white transition-colors duration-300">Movies</span>
              </Link>

              {/* TV Shows */}
              <Link
                href="/tv"
                className={`group relative overflow-hidden px-3.5 py-1.5 rounded-full transition-all duration-300 flex items-center gap-2 text-xs xl:text-sm select-none ${
                  pathname === '/tv'
                    ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-lg shadow-sky-600/30 font-bold scale-105'
                    : 'text-slate-300 border border-transparent hover:border-sky-500/40 hover:shadow-md hover:shadow-sky-500/10 hover:scale-105 active:scale-95'
                }`}
              >
                {/* Left-to-Right Sky/Blue Sweep */}
                {pathname !== '/tv' && (
                  <span className="absolute inset-0 bg-gradient-to-r from-sky-600 via-blue-600 to-sky-500 opacity-90 -translate-x-full group-hover:translate-x-0 transition-transform duration-400 ease-out" />
                )}
                <Tv className="relative z-10 w-4 h-4 text-sky-400 group-hover:scale-125 group-hover:-translate-y-0.5 transition-transform duration-300 flex-shrink-0" />
                <span className="relative z-10 group-hover:text-white transition-colors duration-300">TV Shows</span>
              </Link>

              {/* Top IMDB */}
              <Link
                href="/top-imdb"
                className={`group relative overflow-hidden px-3.5 py-1.5 rounded-full transition-all duration-300 flex items-center gap-2 text-xs xl:text-sm select-none ${
                  pathname === '/top-imdb'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/30 font-bold scale-105'
                    : 'text-slate-300 border border-transparent hover:border-amber-400/50 hover:shadow-md hover:shadow-amber-500/10 hover:scale-105 active:scale-95'
                }`}
              >
                {/* Left-to-Right Amber/Orange Sweep */}
                {pathname !== '/top-imdb' && (
                  <span className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 opacity-90 -translate-x-full group-hover:translate-x-0 transition-transform duration-400 ease-out" />
                )}
                <Star className="relative z-10 w-4 h-4 text-amber-400 fill-amber-400 group-hover:scale-125 group-hover:rotate-45 transition-transform duration-300 flex-shrink-0" />
                <span className={`relative z-10 transition-colors duration-300 ${pathname !== '/top-imdb' ? 'group-hover:text-black font-semibold' : ''}`}>Top IMDB</span>
              </Link>

            </nav>
          </div>

          {/* Right: CineB Live Search Bar + User Controls */}
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            
            {/* Desktop Search Bar with Live Floating Dropdown (CineB Style) */}
            <div ref={searchContainerRef} className="relative hidden md:block w-48 sm:w-56 lg:w-64 xl:w-72 flex-shrink-0">
              <form onSubmit={handleSearch} className="relative w-full flex items-center">
                <input
                  type="text"
                  placeholder="Enter keywords..."
                  value={searchQuery}
                  onFocus={() => {
                    if (searchQuery.trim().length >= 2) setShowDropdown(true);
                  }}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-xs rounded-full bg-white/10 hover:bg-white/15 focus:bg-slate-900/95 backdrop-blur-md border border-white/15 focus:border-[#ffd233] focus:outline-none focus:ring-1 focus:ring-[#ffd233] text-white placeholder:text-slate-400 transition-all shadow-inner"
                />
                <button
                  type="submit"
                  className="absolute left-3 top-2.5 text-slate-300 hover:text-white transition-colors"
                  title="Search"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setShowDropdown(false);
                    }}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>

              {/* CineB Live Auto-Suggest Dropdown Modal */}
              {showDropdown && searchQuery.trim().length >= 2 && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-[#14151c]/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden z-50 animate-fade-in">
                  {isSearching ? (
                    <div className="p-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                      <Loader2 className="w-4 h-4 text-brand-500 animate-spin" />
                      <span>Searching live movies & series...</span>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="divide-y divide-white/5 max-h-[380px] overflow-y-auto">
                      {searchResults.map((item) => (
                        <Link
                          key={`${item.type}-${item.id}`}
                          href={item.type === 'tv' ? `/tv/${item.slug || item.id}` : `/movie/${item.slug || item.id}`}
                          onClick={() => {
                            setShowDropdown(false);
                            setSearchQuery('');
                          }}
                          className="flex items-center gap-3.5 p-3 hover:bg-white/10 transition-colors group"
                        >
                          <img
                            src={item.posterUrl}
                            alt={item.title}
                            className="w-10 h-14 rounded-lg object-cover bg-slate-800 flex-shrink-0 shadow group-hover:scale-105 transition-transform"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-white group-hover:text-brand-400 transition-colors truncate">
                              {item.title}
                            </h4>
                            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5 capitalize">
                              <span>{item.type === 'tv' ? 'TV Show' : 'Movie'}</span>
                              <span>•</span>
                              <span>{item.year}</span>
                              {item.rating > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="text-amber-400 font-bold flex items-center gap-0.5">
                                    <Star className="w-2.5 h-2.5 fill-amber-400" /> {item.rating}
                                  </span>
                                </>
                              )}
                            </p>
                          </div>
                        </Link>
                      ))}

                      {/* View all button */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowDropdown(false);
                          router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                        }}
                        className="w-full py-2.5 px-4 bg-slate-900/80 hover:bg-brand-600/30 text-brand-400 hover:text-brand-300 font-bold text-xs text-center transition-colors border-t border-white/5 block"
                      >
                        View all results for "{searchQuery}" →
                      </button>
                    </div>
                  ) : (
                    <div className="p-5 text-center text-xs text-slate-400">
                      No results found. Press Enter to view full search catalog.
                    </div>
                  )}
                </div>
              )}
            </div>

            <ThemeToggle />

            {/* User State Component */}
            {isAuthenticated && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-dark-card border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-500/50"
                  />
                  <span className="hidden sm:inline-block text-xs font-semibold text-white max-w-[100px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline-block" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#14151c] border border-white/10 shadow-2xl py-2 z-50 divide-y divide-slate-800">
                    <div className="px-4 py-3">
                      <p className="text-sm font-bold text-white truncate">{user.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      {isAdmin && (
                        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-500">
                          <ShieldCheck className="w-3 h-3" /> Admin Account
                        </span>
                      )}
                    </div>

                    <div className="py-1 text-sm font-medium text-slate-200">
                      <Link
                        href="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 transition-colors"
                      >
                        <User className="w-4 h-4 text-brand-500" />
                        My Profile
                      </Link>
                      <Link
                        href="/favorites"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 transition-colors"
                      >
                        <Bookmark className="w-4 h-4 text-amber-500" />
                        Favorites & Watchlist
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 text-brand-400 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          Admin Dashboard
                        </Link>
                      )}
                    </div>

                    <div className="py-1 text-sm font-medium">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-rose-500 hover:bg-rose-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-600/30 transition-all hover:scale-105 active:scale-95"
              >
                <User className="w-3.5 h-3.5" /> Sign In
              </Link>
            )}

            {/* Mobile Hamburger Button */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 px-4 pt-3 pb-6 space-y-4 bg-slate-950/95 backdrop-blur-xl transition-colors">
          
          {/* Mobile Search Form */}
          <div ref={mobileSearchRef} className="relative">
            <form onSubmit={handleSearch} className="relative w-full flex items-center">
              <input
                type="text"
                placeholder="Search movies & TV series..."
                value={searchQuery}
                onFocus={() => {
                  if (searchQuery.trim().length >= 2) setShowDropdown(true);
                }}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs rounded-full bg-white/10 text-white placeholder-slate-400 border border-white/20 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button type="submit" className="absolute left-3 top-2.5 text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Mobile Live Dropdown */}
            {showDropdown && searchQuery.trim().length >= 2 && (
              <div className="mt-2 w-full rounded-xl bg-slate-900 border border-white/10 shadow-2xl overflow-hidden divide-y divide-white/5 max-h-72 overflow-y-auto">
                {searchResults.map((item) => (
                  <Link
                    key={`mob-${item.type}-${item.id}`}
                    href={item.type === 'tv' ? `/tv/${item.slug || item.id}` : `/movie/${item.slug || item.id}`}
                    onClick={() => {
                      setShowDropdown(false);
                      setMobileMenuOpen(false);
                      setSearchQuery('');
                    }}
                    className="flex items-center gap-3 p-2.5 hover:bg-white/10 transition-colors"
                  >
                    <img
                      src={item.posterUrl}
                      alt={item.title}
                      className="w-9 h-12 rounded object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{item.title}</p>
                      <p className="text-[10px] text-slate-400 capitalize">{item.type === 'tv' ? 'TV Show' : 'Movie'} • {item.year}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <nav className="flex flex-col space-y-1.5 text-sm font-semibold text-slate-200">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="group relative overflow-hidden flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-white/5 hover:border-brand-500/30 transition-all duration-300"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-brand-600 via-rose-600 to-brand-500 opacity-90 -translate-x-full group-hover:translate-x-0 transition-transform duration-400 ease-out" />
              <Home className="relative z-10 w-4 h-4 text-brand-500 group-hover:text-white" />
              <span className="relative z-10 group-hover:text-white transition-colors">Home</span>
            </Link>
            <Link
              href="/trending"
              onClick={() => setMobileMenuOpen(false)}
              className="group relative overflow-hidden flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-white/5 hover:border-rose-500/30 transition-all duration-300"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 opacity-90 -translate-x-full group-hover:translate-x-0 transition-transform duration-400 ease-out" />
              <Clapperboard className="relative z-10 w-4 h-4 text-rose-500 group-hover:text-white" />
              <span className="relative z-10 group-hover:text-white transition-colors">Movies Catalog</span>
            </Link>
            <Link
              href="/tv"
              onClick={() => setMobileMenuOpen(false)}
              className="group relative overflow-hidden flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-white/5 hover:border-sky-500/30 transition-all duration-300"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-sky-600 via-blue-600 to-sky-500 opacity-90 -translate-x-full group-hover:translate-x-0 transition-transform duration-400 ease-out" />
              <Tv className="relative z-10 w-4 h-4 text-sky-500 group-hover:text-white" />
              <span className="relative z-10 group-hover:text-white transition-colors">TV Shows & Series</span>
            </Link>
            <Link
              href="/top-imdb"
              onClick={() => setMobileMenuOpen(false)}
              className="group relative overflow-hidden flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-white/5 hover:border-amber-400/30 transition-all duration-300"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 opacity-90 -translate-x-full group-hover:translate-x-0 transition-transform duration-400 ease-out" />
              <Star className="relative z-10 w-4 h-4 text-amber-400 fill-amber-400 group-hover:text-black group-hover:fill-black" />
              <span className="relative z-10 group-hover:text-black font-semibold transition-colors">Top IMDB</span>
            </Link>
            <Link
              href="/favorites"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/10 transition-colors"
            >
              <Bookmark className="w-4 h-4 text-amber-500" /> My Favorites & Watchlist
            </Link>
            <Link
              href="/history"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/10 transition-colors"
            >
              <History className="w-4 h-4 text-emerald-500" /> Watch History
            </Link>
          </nav>

          {/* Mobile User Actions */}
          <div className="pt-2 border-t border-white/10">
            {isAuthenticated && user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded-xl">
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-brand-500"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{user.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-rose-400 bg-rose-500/10 rounded-xl hover:bg-rose-500/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md transition-all active:scale-95"
              >
                <User className="w-4 h-4" /> Sign In to Account
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
