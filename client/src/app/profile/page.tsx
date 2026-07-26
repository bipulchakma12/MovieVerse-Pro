'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, Shield, Key, Save, CheckCircle } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();

  const [name, setName] = useState(user?.name || 'John Doe');
  const [email, setEmail] = useState(user?.email || 'user@example.com');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('Profile updated successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="border-b border-slate-200 dark:border-dark-border pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Account Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your avatar, credentials, and security</p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-brand-500/10 text-brand-500 border border-brand-500/20">
          {user?.role || 'User Account'}
        </span>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Profile Info Form */}
      <form onSubmit={handleUpdateProfile} className="p-8 rounded-3xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border space-y-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-5 h-5 text-brand-500" /> Basic Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-xl bg-slate-100 dark:bg-dark-bg border border-slate-200 dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-xl bg-slate-100 dark:bg-dark-bg border border-slate-200 dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-200"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-dark-border space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-brand-500" /> Security & Password
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 text-sm rounded-xl bg-slate-100 dark:bg-dark-bg border border-slate-200 dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 text-sm rounded-xl bg-slate-100 dark:bg-dark-bg border border-slate-200 dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 rounded-xl font-bold text-xs text-white bg-brand-600 hover:bg-brand-700 transition-all flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </form>
    </div>
  );
}
