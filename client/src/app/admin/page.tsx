'use client';

import React, { useState } from 'react';
import { Users, Film, MessageSquare, TrendingUp, Plus, Trash2, Ban, ShieldCheck, Check } from 'lucide-react';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'movies' | 'users'>('analytics');

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

  const toggleBlockUser = (id: string) => {
    setUsersList(usersList.map(u => u.id === id ? { ...u, isBlocked: !u.isBlocked } : u));
  };

  const deleteMovie = (id: string) => {
    setMoviesList(moviesList.filter(m => m.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 dark:border-dark-border pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-brand-500" /> Admin Control Center
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            System metrics, user management, and movie management
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-dark-card p-1.5 rounded-2xl border border-slate-200 dark:border-dark-border">
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
            Movies CRUD
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
