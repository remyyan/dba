"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { login, register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        // Validate password confirmation
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setError('Password must be at least 6 characters long.');
          setLoading(false);
          return;
        }

        await register(email, password);
        router.push('/');
      } else {
        await login(email, password);
        router.push('/');
      }
    } catch (error: any) {
      if (isSignUp) {
        if (error.code === 'auth/email-already-in-use') {
          setError('An account with this email already exists.');
        } else if (error.code === 'auth/weak-password') {
          setError('Password is too weak. Please choose a stronger password.');
        } else if (error.code === 'auth/invalid-email') {
          setError('Please enter a valid email address.');
        } else {
          setError('Failed to create account. Please try again.');
        }
      } else {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
          setError('Invalid email or password.');
        } else if (error.code === 'auth/invalid-email') {
          setError('Please enter a valid email address.');
        } else {
          setError('Failed to log in. Please check your credentials.');
        }
      }
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <div className="flex items-center justify-center min-h-[calc(100vh-100px)] px-4">
        <div className="bg-white/10 rounded-xl p-8 border border-white/20 w-full max-w-md">
          <h1 className="text-3xl font-bold text-white mb-6 text-center">
            {isSignUp ? 'Join DBA' : 'Login to DBA'}
          </h1>

          {/* Toggle between Login and Sign Up */}
          <div className="flex bg-white/5 rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setError('');
                setConfirmPassword('');
              }}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                !isSignUp
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setError('');
              }}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                isSignUp
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-white font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-white font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                placeholder={isSignUp ? "Create a password (min 6 characters)" : "Enter your password"}
                required
              />
            </div>

            {/* Confirm Password field - only show during sign up */}
            {isSignUp && (
              <div>
                <label htmlFor="confirmPassword" className="block text-white font-medium mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                  placeholder="Confirm your password"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              {loading
                ? (isSignUp ? 'Creating Account...' : 'Logging in...')
                : (isSignUp ? 'Create Account' : 'Login')
              }
            </button>
          </form>

          {/* Sign up benefits */}
          {isSignUp && (
            <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <h3 className="text-white font-semibold mb-2">Join the DBA Community!</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Vote for MVP of each game</li>
                <li>• Access detailed player statistics</li>
                <li>• Follow your favorite teams</li>
                <li>• Get notified about new games</li>
              </ul>
            </div>
          )}

          <div className="mt-4 text-center">
            <Link
              href="/"
              className="text-orange-400 hover:text-orange-300 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
