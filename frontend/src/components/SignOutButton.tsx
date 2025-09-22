'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignOutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Redirect to signin page
        window.location.href = '/auth/signin';
      } else {
        console.error('Sign out failed');
        // Still redirect to signin even if API fails
        window.location.href = '/auth/signin';
      }
    } catch (error) {
      console.error('Sign out error:', error);
      // Still redirect to signin even if there's an error
      window.location.href = '/auth/signin';
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="text-gray-700 hover:text-red-600 font-medium disabled:opacity-50"
    >
      {loading ? 'Signing out...' : 'Sign Out'}
    </button>
  );
}
