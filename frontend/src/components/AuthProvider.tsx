'use client';

import { ReactNode } from 'react';

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  // Simple wrapper - no complex providers needed
  return <>{children}</>;
}
