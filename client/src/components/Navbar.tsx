'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '@/context/AuthContext';

export const Navbar: React.FC = () => {
  const router = useRouter();
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
          
          {/* Left: Brand Logo & Main Nav Links */}
          <div className="flex items-center gap-5 xl:gap-8 flex-shrink-0">
            <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-rose-400 flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
                <Film className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white transition-colors drop-shadow whitespace-nowrap">
                MovieVerse<span className="text-brand-500 font-extrabold">Pro</span>
              </span>
            </Link>

            {/* Nav Links - Guaranteed No Wrap */}
            <nav className="hidden lg:flex items-center gap-4 xl:gap-6 text-sm font-semibold whitespace-nowrap flex-shrink-0">
              <Link href="/" className="flex items-center gap-1.5 px-2 py-1 text-white hover:text-brand-400 transition-colors whitespace-nowrap">
                <Home className="w-4 h-4 text-brand-500 flex-shrink-0" /> Home
              </Link>
              <Link href="/trending" className="flex items-center gap-1.5 px-2 py-1 text-slate-200 hover:text-brand-400 transition-colors whitespace-nowrap">
                <Clapperboard className="w-4 h-4 text-rose-500 flex-shrink-0" /> Movies
              </Link>
              <Link href="/tv" className="flex items-center gap-1.5 px-2 py-1 text-slate-200 hover:text-sky-400 transition-colors whitespace-nowrap">
                <Tv className="w-4 h-4 text-sky-400 flex-shrink-0" /> TV Shows
              </Link>
              <Link href="/trending" className="flex items-center gap-1.5 px-2 py-1 text-slate-200 hover:text-amber-400 transition-colors whitespace-nowrap">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400 flex-shrink-0" /> Top IMDB
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

          <nav className="flex flex-col space-y-2 text-sm font-semibold text-slate-200">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              <Home className="w-4 h-4 text-brand-500" /> Home
            </Link>
            <Link
              href="/trending"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              <Clapperboard className="w-4 h-4 text-rose-500" /> Movies Catalog
            </Link>
            <Link
              href="/tv"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              <Tv className="w-4 h-4 text-sky-500" /> TV Shows & Series
            </Link>
            <Link
              href="/trending"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Top IMDB
            </Link>
            <Link
              href="/favorites"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              <Bookmark className="w-4 h-4 text-amber-500" /> My Favorites & Watchlist
            </Link>
            <Link
              href="/history"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              <History className="w-4 h-4 text-emerald-500" /> Watch History
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
