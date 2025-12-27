'use client';

import AnnouncementBanner from '@/components/AnnouncementBanner';
import FeedbackUpdateBanner from '@/components/FeedbackUpdateBanner';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import SignOutButton from './SignOutButton';
import ReleaseBanner from './ReleaseBanner';
import { APP_VERSION } from '@/lib/version';
import { canAccessAdmin } from '@/lib/permissions';
import { usePermissions } from '@/hooks/usePermissions';
import { ChevronDown } from 'lucide-react';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { canManageVolunteers } = usePermissions();
  const [userLastSeenVersion, setUserLastSeenVersion] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const isAuthPage = pathname?.startsWith('/auth');
  const isHelpPage = pathname?.startsWith('/help') || pathname?.startsWith('/release-notes');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    if (openDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openDropdown]);

  // Fetch user's last seen release version
  useEffect(() => {
    if (session?.user?.email && !isAuthPage && !isHelpPage) {
      fetch('/api/v1/user/profile')
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.success && data.user) {
            setUserLastSeenVersion(data.user.lastSeenReleaseVersion || null);
          }
        })
        .catch(() => {
          // Silently fail - banner just won't show
        });
    }
  }, [session?.user?.email, isAuthPage, isHelpPage]);

  if (isAuthPage || isHelpPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ReleaseBanner 
        currentVersion={APP_VERSION}
        userLastSeenVersion={userLastSeenVersion}
      />
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <img src="/logo.svg" alt="LDC Logo" className="h-10 w-10" />
              <h1 className="text-2xl font-bold text-gray-900">
                LDC Tools
              </h1>
            </div>
            <div className="flex items-center space-x-6">
              <nav className="flex space-x-6">
                <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium">
                  Dashboard
                </Link>

                {/* People Dropdown */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdown(openDropdown === 'people' ? null : 'people');
                    }}
                    className="text-gray-700 hover:text-blue-600 font-medium flex items-center space-x-1"
                  >
                    <span>People</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  {openDropdown === 'people' && (
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                      <Link href="/volunteers" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Volunteers
                      </Link>
                      <Link href="/trade-teams" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Trade Teams
                      </Link>
                      <Link href="/congregations" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Congregations
                      </Link>
                    </div>
                  )}
                </div>

                {/* Projects Dropdown */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdown(openDropdown === 'projects' ? null : 'projects');
                    }}
                    className="text-gray-700 hover:text-blue-600 font-medium flex items-center space-x-1"
                  >
                    <span>Projects</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  {openDropdown === 'projects' && (
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                      <Link href="/projects" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Projects List
                      </Link>
                      <Link href="/calendar" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Calendar
                      </Link>
                    </div>
                  )}
                </div>

                {/* Requests Dropdown */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdown(openDropdown === 'requests' ? null : 'requests');
                    }}
                    className="text-gray-700 hover:text-blue-600 font-medium flex items-center space-x-1"
                  >
                    <span>Requests</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  {openDropdown === 'requests' && (
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                      <Link href="/crew-request" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Submit Request
                      </Link>
                      <Link href="/my-requests" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        My Requests
                      </Link>
                      {canManageVolunteers && (
                        <Link href="/crew-requests" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Manage Requests
                        </Link>
                      )}
                    </div>
                  )}
                </div>

                {/* Admin Dropdown */}
                {canAccessAdmin(session) && (
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdown(openDropdown === 'admin' ? null : 'admin');
                      }}
                      className="text-gray-700 hover:text-blue-600 font-medium flex items-center space-x-1"
                    >
                      <span>Admin</span>
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    {openDropdown === 'admin' && (
                      <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                        <Link href="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Admin Dashboard
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                <span className="text-gray-300">|</span>

                {/* Help Dropdown */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdown(openDropdown === 'help' ? null : 'help');
                    }}
                    className="text-gray-600 hover:text-blue-600 font-medium flex items-center space-x-1"
                  >
                    <span>Help</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  {openDropdown === 'help' && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                      <Link href="/help" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Help Center
                      </Link>
                      <Link href="/help/my-feedback" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        My Feedback
                      </Link>
                      <Link href="/release-notes" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Release Notes
                      </Link>
                    </div>
                  )}
                </div>
              </nav>
              <div className="border-l border-gray-300 pl-6">
                <SignOutButton />
              </div>
            </div>
          </div>
        </div>
      </header>
      <FeedbackUpdateBanner />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnnouncementBanner />
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
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
