'use client';

import { useState } from 'react';

export default function SignInForm() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
        // Get callback URL from current page URL
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

  return (
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
  );
}
