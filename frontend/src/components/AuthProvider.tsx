'use client';

import { ReactNode } from 'react';

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  // Simple wrapper component - no longer using NextAuth SessionProvider
  return <>{children}</>;
}
