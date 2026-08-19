'use client';

import React from 'react';
import Link from 'next/link';
import {
  Heart,
  ChevronRight,
  Sparkles,
  Clapperboard,
  Tv,
  Star,
  Compass,
  User,
  Bookmark,
  History,
  ShieldCheck,
  Film,
  HelpCircle,
  FileText
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const Footer: React.FC = () => {
  const { isAdmin, isAuthenticated } = useAuth();

  return (
    <footer className="mt-auto border-t border-white/5 bg-[#0b0c10] text-slate-400 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-block group">
              <span className="text-2xl sm:text-3xl font-black text-white tracking-tight group-hover:scale-105 transition-transform duration-300 inline-block drop-shadow">
                MovieVerse<span className="text-brand-500 font-black">Pro</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm leading-relaxed max-w-md text-slate-400">
              The premier destination for discovering, streaming, and reviewing trending blockbusters, popular TV series, and live TMDB premieres in crystal-clear HD.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#00e054]/10 text-[#00e054] border border-[#00e054]/20 flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#00e054] animate-ping" />
                Live HD Streaming Active
              </span>
            </div>
          </div>

          {/* Explore Links */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-white/10">
              <Compass className="w-4 h-4 text-brand-500" />
              <h4 className="text-xs font-black uppercase tracking-wider text-white">Explore</h4>
            </div>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <Link
                  href="/"
                  className="group flex items-center gap-1.5 py-1 text-slate-400 hover:text-white transition-all duration-200 hover:translate-x-2"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-brand-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 flex-shrink-0" />
                  <span className="group-hover:text-brand-400 transition-colors">Featured Movies</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/trending"
                  className="group flex items-center gap-1.5 py-1 text-slate-400 hover:text-white transition-all duration-200 hover:translate-x-2"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-rose-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 flex-shrink-0" />
                  <span className="group-hover:text-rose-400 transition-colors">Movies Catalog</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/tv"
                  className="group flex items-center gap-1.5 py-1 text-slate-400 hover:text-white transition-all duration-200 hover:translate-x-2"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-sky-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 flex-shrink-0" />
                  <span className="group-hover:text-sky-400 transition-colors">TV Shows & Series</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/trending"
                  className="group flex items-center gap-1.5 py-1 text-slate-400 hover:text-white transition-all duration-200 hover:translate-x-2"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-amber-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 flex-shrink-0" />
                  <span className="group-hover:text-amber-400 transition-colors">Top IMDB Blockbusters</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Account Links (Admin Dashboard only visible for verified Admins) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-white/10">
              <User className="w-4 h-4 text-sky-400" />
              <h4 className="text-xs font-black uppercase tracking-wider text-white">Account</h4>
            </div>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <Link
                  href={isAuthenticated ? "/profile" : "/login"}
                  className="group flex items-center gap-1.5 py-1 text-slate-400 hover:text-white transition-all duration-200 hover:translate-x-2"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-sky-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 flex-shrink-0" />
                  <span className="group-hover:text-sky-400 transition-colors">User Profile</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/favorites"
                  className="group flex items-center gap-1.5 py-1 text-slate-400 hover:text-white transition-all duration-200 hover:translate-x-2"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-amber-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 flex-shrink-0" />
                  <span className="group-hover:text-amber-400 transition-colors">My Favorites & Watchlist</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/history"
                  className="group flex items-center gap-1.5 py-1 text-slate-400 hover:text-white transition-all duration-200 hover:translate-x-2"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 flex-shrink-0" />
                  <span className="group-hover:text-emerald-400 transition-colors">Watch History</span>
                </Link>
              </li>
              {/* Only shown if user is logged in as an Admin */}
              {isAdmin ? (
                <li>
                  <Link
                    href="/admin"
                    className="group flex items-center gap-1.5 py-1 text-slate-400 hover:text-white transition-all duration-200 hover:translate-x-2"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-rose-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 flex-shrink-0" />
                    <span className="group-hover:text-rose-400 transition-colors flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-rose-500" /> Admin Dashboard
                    </span>
                  </Link>
                </li>
              ) : (
                <li>
                  <Link
                    href="/search"
                    className="group flex items-center gap-1.5 py-1 text-slate-400 hover:text-white transition-all duration-200 hover:translate-x-2"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-rose-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 flex-shrink-0" />
                    <span className="group-hover:text-rose-400 transition-colors">Search All Movies</span>
                  </Link>
                </li>
              )}
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs gap-4 text-slate-500">
          <p>© {new Date().getFullYear()} MovieVerse Pro. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
            <span>for cinema lovers worldwide.</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
