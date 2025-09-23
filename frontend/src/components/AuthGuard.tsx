'use client';

import { useRouter } from 'next/navigation';
import { useEffect, ReactNode, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  requiredRole?: string;
}

export default function AuthGuard({ 
  children, 
  requireAuth = true, 
  requiredRole 
}: AuthGuardProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // For now, since we have a custom auth system, we'll simulate authentication
    // In a real implementation, you'd check localStorage, cookies, or make an API call
    const checkAuth = async () => {
      try {
        // Simulate checking authentication status
        // You can replace this with actual auth logic
        const authStatus = localStorage.getItem('isAuthenticated');
        const role = localStorage.getItem('userRole');
        
        setIsAuthenticated(authStatus === 'true');
        setUserRole(role);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated === null) return; // Still loading

    if (requireAuth && !isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
      router.push('/auth/signin');
      return;
    }

    if (requiredRole && userRole !== requiredRole) {
      console.log(`User role ${userRole} does not match required role ${requiredRole}`);
      router.push('/auth/signin');
      return;
    }
  }, [isAuthenticated, userRole, router, requireAuth, requiredRole]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null; // Will redirect
  }

  if (requiredRole && userRole !== requiredRole) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="mt-2 text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
