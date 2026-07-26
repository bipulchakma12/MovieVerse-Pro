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
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '@/context/AuthContext';

export const Navbar: React.FC = () => {
  const router = useRouter();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-dark-border bg-white/90 dark:bg-dark-bg/90 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Compact Search */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-rose-400 flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
                <Film className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white transition-colors">
                MovieVerse<span className="text-brand-500 font-extrabold">Pro</span>
              </span>
            </Link>

            {/* Desktop Search Bar - Compact Width */}
            <div className="hidden md:block w-56 lg:w-64">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search movies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 transition-all"
                />
                <Search className="absolute left-3 top-2 w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-9 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <Link href="/" className="flex items-center gap-2 px-2 py-1 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              <Home className="w-4 h-4 text-brand-500" /> Home
            </Link>
            <Link href="/trending" className="flex items-center gap-2 px-2 py-1 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              <Clapperboard className="w-4 h-4 text-rose-500" /> Movies
            </Link>
            <Link href="/trending" className="flex items-center gap-2 px-2 py-1 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              <Tv className="w-4 h-4 text-sky-500" /> TV Shows
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
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
            />
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          </div>

          <div className="flex flex-col space-y-3 font-semibold text-slate-700 dark:text-slate-200">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 p-2 hover:text-brand-500">
              <Home className="w-5 h-5 text-brand-500" /> Home
            </Link>
            <Link href="/trending" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 p-2 hover:text-brand-500">
              <Clapperboard className="w-5 h-5 text-rose-500" /> Movies
            </Link>
            <Link href="/trending" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 p-2 hover:text-brand-500">
              <Tv className="w-5 h-5 text-sky-500" /> TV Shows
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
