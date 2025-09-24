'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import SignOutButton from './SignOutButton';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth');

  if (isAuthPage) {
    // For auth pages, just return children without navigation
    return <>{children}</>;
  }

  // For all other pages, show the full layout with navigation
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                LDC Construction Tools
              </h1>
              <span className="ml-2 text-sm text-gray-500">
                Region 01.12
              </span>
            </div>
            <div className="flex items-center space-x-8">
              <nav className="flex space-x-8">
                <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium">
                  Dashboard
                </Link>
                <Link href="/trade-teams" className="text-gray-700 hover:text-blue-600 font-medium">
                  Trade Teams
                </Link>
                <Link href="/projects" className="text-gray-700 hover:text-blue-600 font-medium">
                  Projects
                </Link>
                <Link href="/calendar" className="text-gray-700 hover:text-blue-600 font-medium">
                  Calendar
                </Link>
                <Link href="/volunteers" className="text-gray-700 hover:text-blue-600 font-medium">
                  Volunteers
                </Link>
                <Link href="/admin" className="text-gray-700 hover:text-blue-600 font-medium">
                  Admin
                </Link>
              </nav>
              <div className="border-l border-gray-300 pl-8">
                <SignOutButton />
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
