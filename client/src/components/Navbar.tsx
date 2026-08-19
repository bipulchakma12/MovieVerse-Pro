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
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '@/context/AuthContext';

export const Navbar: React.FC = () => {
  const router = useRouter();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Detect window scroll to toggle navbar transparency
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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
          
          {/* Logo & Compact Search */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-rose-400 flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
                <Film className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white transition-colors drop-shadow">
                MovieVerse<span className="text-brand-500 font-extrabold">Pro</span>
              </span>
            </Link>

            {/* Desktop Search Bar - CineB Translucent Glass Style */}
            <form onSubmit={handleSearch} className="hidden md:block w-56 lg:w-72">
              <div className="relative w-full flex items-center">
                <input
                  type="text"
                  placeholder="Enter keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-1.5 text-xs rounded-full bg-white/10 hover:bg-white/15 focus:bg-slate-900/90 backdrop-blur-md border border-white/15 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 text-white placeholder:text-slate-400 transition-all shadow-inner"
                />
                <button
                  type="submit"
                  className="absolute left-2.5 top-2 text-slate-300 hover:text-white transition-colors"
                  title="Search"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold">
            <Link href="/" className="flex items-center gap-1.5 px-2 py-1 text-white hover:text-brand-400 transition-colors">
              <Home className="w-4 h-4 text-brand-500" /> Home
            </Link>
            <Link href="/trending" className="flex items-center gap-1.5 px-2 py-1 text-slate-200 hover:text-brand-400 transition-colors">
              <Clapperboard className="w-4 h-4 text-rose-500" /> Movies
            </Link>
            <Link href="/tv" className="flex items-center gap-1.5 px-2 py-1 text-slate-200 hover:text-sky-400 transition-colors">
              <Tv className="w-4 h-4 text-sky-400" /> TV Shows
            </Link>
            <Link href="/trending" className="flex items-center gap-1.5 px-2 py-1 text-slate-200 hover:text-amber-400 transition-colors">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Top IMDB
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
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
                  <span className="hidden sm:inline-block text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[100px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline-block" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-2xl py-2 z-50 divide-y divide-slate-100 dark:divide-slate-800">
                    <div className="px-4 py-3">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                      {isAdmin && (
                        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-500">
                          <ShieldCheck className="w-3 h-3" /> Admin Account
                        </span>
                      )}
                    </div>

                    <div className="py-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                      <Link
                        href="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                      >
                        <User className="w-4 h-4 text-brand-500" />
                        My Profile
                      </Link>
                      <Link
                        href="/favorites"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                      >
                        <Bookmark className="w-4 h-4 text-amber-500" />
                        Favorites & Watchlist
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 text-brand-600 dark:text-brand-400 transition-colors"
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
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-all shadow-md shadow-brand-600/20 active:scale-95"
              >
                <User className="w-4 h-4" />
                Sign In
              </Link>
            )}

            {/* Mobile Quick Search Button */}
            <Link
              href="/search"
              className="md:hidden p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-card rounded-lg transition-colors"
              title="Search"
            >
              <Search className="w-5 h-5 text-slate-500" />
            </Link>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-card rounded-lg transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-dark-border px-4 pt-3 pb-6 space-y-4 bg-white dark:bg-dark-bg transition-colors">
          <form onSubmit={handleSearch} className="relative w-full flex items-center">
            <input
              type="text"
              placeholder="Search movies & TV shows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-24 py-2.5 text-sm rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
            />
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <button
              type="submit"
              className="absolute right-1.5 px-4 py-1.5 rounded-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-all shadow active:scale-95"
            >
              Search
            </button>
          </form>

          <div className="flex flex-col space-y-3 font-semibold text-slate-700 dark:text-slate-200">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 p-2 hover:text-brand-500">
              <Home className="w-5 h-5 text-brand-500" /> Home
            </Link>
            <Link href="/trending" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 p-2 hover:text-brand-500">
              <Clapperboard className="w-5 h-5 text-rose-500" /> Movies
            </Link>
            <Link href="/tv" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 p-2 hover:text-brand-500">
              <Tv className="w-5 h-5 text-sky-500" /> TV Shows
            </Link>
            <Link href="/trending" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 p-2 hover:text-amber-500">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" /> Top IMDB
            </Link>

            {isAuthenticated && user ? (
              <>
                <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 p-2 hover:text-brand-500">
                  <User className="w-5 h-5 text-brand-500" /> My Profile ({user.name})
                </Link>
                {isAdmin && (
                  <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 p-2 text-brand-500 font-bold">
                    <ShieldCheck className="w-5 h-5" /> Admin Dashboard
                  </Link>
                )}
                <button onClick={handleLogout} className="flex items-center gap-2 p-2 text-rose-500 font-bold text-left">
                  <LogOut className="w-5 h-5" /> Sign Out
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center gap-2 p-2 rounded-lg bg-brand-600 text-white font-semibold shadow-md">
                <User className="w-5 h-5" /> Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
