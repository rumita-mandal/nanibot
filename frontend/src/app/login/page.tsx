'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, UserCheck } from 'lucide-react';
import { authApi } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authApi.login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-parchment-50 border border-parchment-200 rounded-3xl p-8 shadow-warm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-turmeric-400 to-terracotta-500 text-white flex items-center justify-center mx-auto text-xl font-serif font-bold">
            🌿
          </div>
          <h1 className="font-serif font-bold text-2xl text-charcoal">Sign In to NaniBot</h1>
          <p className="text-xs text-charcoal/70">
            Access your saved traditional wisdom and private family notebook
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold uppercase tracking-wider text-charcoal">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-charcoal/40 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@nanibot.com or your email"
                className="w-full bg-white border border-parchment-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-charcoal focus:outline-none focus:border-terracotta-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold uppercase tracking-wider text-charcoal">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-charcoal/40 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border border-parchment-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-charcoal focus:outline-none focus:border-terracotta-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-turmeric-500 to-terracotta-500 text-white font-semibold py-3 rounded-xl hover:opacity-95 disabled:opacity-50 transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-charcoal/60 pt-4 border-t border-parchment-200">
          Don't have an account?{' '}
          <Link href="/register" className="font-semibold text-terracotta-600 hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
