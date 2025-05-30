"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      router.push('/');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="text-4xl font-bold text-white hover:text-orange-400 transition-colors">
            <span className="text-orange-400">DBA</span> League
          </Link>
          <p className="text-gray-300 mt-2">Denlow Basketball Association</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </h2>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-white font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-white font-semibold mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              {loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-orange-400 hover:text-orange-300 transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-white/20">
            <Link 
              href="/"
              className="block text-center text-gray-300 hover:text-white transition-colors"
            >
              ← Back to DBA League
            </Link>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            Sign in to vote for MVP and access exclusive features
          </p>
        </div>
      </div>
    </div>
  );
}
