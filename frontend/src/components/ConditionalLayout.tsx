'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import SignOutButton from './SignOutButton';
import { APP_VERSION } from '@/lib/version';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth');
  const isHelpPage = pathname?.startsWith('/help') || pathname?.startsWith('/release-notes');

  if (isAuthPage || isHelpPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                LDC Tools
              </h1>
            </div>
            <div className="flex items-center space-x-6">
              <nav className="flex space-x-6">
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
                <Link href="/congregations" className="text-gray-700 hover:text-blue-600 font-medium">
                  Congregations
                </Link>
                <Link href="/admin" className="text-gray-700 hover:text-blue-600 font-medium">
                  Admin
                </Link>
                <span className="text-gray-300">|</span>
                <Link href="/help" className="text-gray-600 hover:text-blue-600 font-medium">
                  Help
                </Link>
              </nav>
              <div className="border-l border-gray-300 pl-6">
                <SignOutButton />
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              <p>LDC Tools v{APP_VERSION}</p>
            </div>
            <div className="flex space-x-6 text-sm">
              <Link href="/help/feedback" className="text-gray-600 hover:text-blue-600">
                💡 Send Feedback
              </Link>
              <Link href="/help" className="text-gray-600 hover:text-blue-600">
                Help Center
              </Link>
              <Link href="/release-notes" className="text-gray-600 hover:text-blue-600">
                Release Notes
              </Link>
              <Link href="/admin" className="text-gray-600 hover:text-blue-600">
                Admin Panel
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
