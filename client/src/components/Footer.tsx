'use client';

import React from 'react';
import Link from 'next/link';
import { Film, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-dark-border bg-white dark:bg-dark-nav text-slate-600 dark:text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-rose-400 flex items-center justify-center">
                <Film className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                MovieVerse<span className="text-brand-500">Pro</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed max-w-sm">
              Your ultimate destination for discovering, tracking, and reviewing movies & TV shows with high-performance recommendations.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-3">Explore</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/" className="hover:text-brand-500 transition-colors">Featured Movies</Link></li>
              <li><Link href="/genres" className="hover:text-brand-500 transition-colors">Genres & Categories</Link></li>
              <li><Link href="/top-rated" className="hover:text-brand-500 transition-colors">Top Rated</Link></li>
              <li><Link href="/upcoming" className="hover:text-brand-500 transition-colors">Upcoming Releases</Link></li>
            </ul>
          </div>

          {/* User Links */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-3">Account</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/profile" className="hover:text-brand-500 transition-colors">User Profile</Link></li>
              <li><Link href="/favorites" className="hover:text-brand-500 transition-colors">My Favorites</Link></li>
              <li><Link href="/history" className="hover:text-brand-500 transition-colors">Watch History</Link></li>
              <li><Link href="/admin" className="hover:text-brand-500 transition-colors">Admin Dashboard</Link></li>
            </ul>
          </div>

        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-dark-border flex flex-col sm:flex-row items-center justify-between text-xs gap-4">
          <p>© {new Date().getFullYear()} MovieVerse Pro.</p>
          <p className="flex items-center gap-1">
            Crafted with <Heart className="w-3.5 h-3.5 text-brand-500 fill-brand-500" /> for cinema lovers.
          </p>
        </div>
      </div>
    </footer>
  );
};
