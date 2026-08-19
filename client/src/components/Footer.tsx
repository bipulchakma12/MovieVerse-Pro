'use client';

import React from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-dark-border bg-white dark:bg-dark-nav text-slate-600 dark:text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                MovieVerse<span className="text-brand-500 font-black">Pro</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed max-w-sm text-slate-500 dark:text-slate-400">
              Your ultimate destination for discovering, tracking, and reviewing movies & TV shows with high-performance recommendations.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-3">Explore</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/" className="hover:text-brand-500 transition-colors">Featured Movies</Link></li>
              <li><Link href="/trending" className="hover:text-brand-500 transition-colors">Movies Catalog</Link></li>
              <li><Link href="/tv" className="hover:text-brand-500 transition-colors">TV Shows</Link></li>
              <li><Link href="/trending" className="hover:text-brand-500 transition-colors">Top IMDB</Link></li>
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

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-dark-border flex flex-col sm:flex-row items-center justify-between text-xs gap-4 text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} MovieVerse Pro. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Crafted with <Heart className="w-3.5 h-3.5 text-brand-500 fill-brand-500" /> for cinema lovers.
          </p>
        </div>
      </div>
    </footer>
  );
};
