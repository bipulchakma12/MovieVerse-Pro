import React from 'react';
import Link from 'next/link';
import { Film } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <Link href="/" className="mb-4 inline-block hover:scale-105 transition-transform">
        <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          MovieVerse<span className="text-brand-500 font-black">Pro</span>
        </span>
      </Link>
      <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">404 - Page Not Found</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
        The movie or page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-6 py-2.5 rounded-full font-bold text-xs text-white bg-brand-600 hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20"
      >
        Back to Home
      </Link>
    </div>
  );
}
