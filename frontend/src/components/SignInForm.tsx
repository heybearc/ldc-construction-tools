'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get('callbackUrl') || '/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      console.log('WMACS Auth: Attempting login for:', email);
      
      const formData = new FormData()
      formData.append('email', email)
      formData.append('password', password)
      
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
        // Add timeout and better error handling
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      const result = await response.json();
      console.log('WMACS Auth: Result:', result);

      if (result?.error || !response.ok) {
        setError(result?.error || 'Invalid email or password');
        setPassword(''); // Clear password on error
      } else if (result?.success) {
        console.log('WMACS Auth: Success, redirecting to:', callbackUrl);
        
        // Clear form and redirect
        setEmail('');
        setPassword('');
        setError('');
        
        // Force page reload to ensure clean state
        window.location.href = callbackUrl;
      }
    } catch (error) {
      console.error('WMACS Auth error:', error);
      
      // Better error messages based on error type
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          setError('Request timeout. Please try again.');
        } else if (error.message.includes('fetch')) {
          setError('Network error. Please check your connection.');
        } else {
          setError(`Authentication error: ${error.message}`);
        }
      } else {
        setError('An error occurred during sign in. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="off"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="admin@ldc-construction.local"
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
          autoComplete="off"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="AdminPass123!"
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </div>

      <div className="text-center text-sm text-gray-600">
        <p>Development credentials:</p>
        <p className="font-mono text-xs mt-1">
          admin@ldc-construction.local / AdminPass123!
        </p>
      </div>
    </form>
  );
}