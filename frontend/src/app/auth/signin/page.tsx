'use client';

import { useEffect, useState } from 'react';

export default function SignIn() {
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const params = new URLSearchParams(window.location.search);
        const callbackUrl = params.get('callbackUrl') || '/';
        window.location.href = callbackUrl;
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state until mounted, then show form
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-sm">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Sign in to LDC Construction Tools
            </h2>
            <p className="text-gray-600">
              Region 01.12
            </p>
          </div>
          <div className="space-y-4">
            <div className="animate-pulse bg-gray-200 h-10 rounded"></div>
            <div className="animate-pulse bg-gray-200 h-10 rounded"></div>
            <div className="animate-pulse bg-gray-200 h-10 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-sm">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Sign in to LDC Construction Tools
          </h2>
          <p className="text-gray-600">
            Region 01.12
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              defaultValue="admin@ldc-construction.local"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              defaultValue="password123"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer'
            }`}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
