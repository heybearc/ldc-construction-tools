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
import { ChevronDown, Menu, X } from 'lucide-react';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { canManageVolunteers } = usePermissions();
  const [userLastSeenVersion, setUserLastSeenVersion] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <img src="/logo.svg" alt="LDC Logo" className="h-8 w-8 sm:h-10 sm:w-10" />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                LDC Tools
              </h1>
            </div>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6">
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

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Drawer */}
          <div className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-xl z-50 lg:hidden overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="p-4 space-y-1">
              {/* Dashboard */}
              <Link 
                href="/" 
                className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                🏠 Dashboard
              </Link>

              {/* People Section */}
              <div className="pt-2">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  People
                </div>
                <Link 
                  href="/volunteers" 
                  className="block px-4 py-3 text-base text-gray-700 hover:bg-gray-100 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  👥 Volunteers
                </Link>
                <Link 
                  href="/trade-teams" 
                  className="block px-4 py-3 text-base text-gray-700 hover:bg-gray-100 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  🔧 Trade Teams
                </Link>
                <Link 
                  href="/congregations" 
                  className="block px-4 py-3 text-base text-gray-700 hover:bg-gray-100 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  ⛪ Congregations
                </Link>
              </div>

              {/* Projects Section */}
              <div className="pt-2">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Projects
                </div>
                <Link 
                  href="/projects" 
                  className="block px-4 py-3 text-base text-gray-700 hover:bg-gray-100 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  📋 Projects List
                </Link>
                <Link 
                  href="/calendar" 
                  className="block px-4 py-3 text-base text-gray-700 hover:bg-gray-100 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  📅 Calendar
                </Link>
              </div>

              {/* Requests Section */}
              <div className="pt-2">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Requests
                </div>
                <Link 
                  href="/crew-request" 
                  className="block px-4 py-3 text-base text-gray-700 hover:bg-gray-100 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  ✏️ Submit Request
                </Link>
                <Link 
                  href="/my-requests" 
                  className="block px-4 py-3 text-base text-gray-700 hover:bg-gray-100 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  📝 My Requests
                </Link>
                {canManageVolunteers && (
                  <Link 
                    href="/crew-requests" 
                    className="block px-4 py-3 text-base text-gray-700 hover:bg-gray-100 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    ⚙️ Manage Requests
                  </Link>
                )}
              </div>

              {/* Admin Section */}
              {canAccessAdmin(session) && (
                <div className="pt-2">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Admin
                  </div>
                  <Link 
                    href="/admin" 
                    className="block px-4 py-3 text-base text-gray-700 hover:bg-gray-100 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    🔐 Admin Dashboard
                  </Link>
                </div>
              )}

              {/* Help Section */}
              <div className="pt-2 border-t border-gray-200 mt-2">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Help & Support
                </div>
                <Link 
                  href="/help" 
                  className="block px-4 py-3 text-base text-gray-700 hover:bg-gray-100 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  ❓ Help Center
                </Link>
                <Link 
                  href="/help/my-feedback" 
                  className="block px-4 py-3 text-base text-gray-700 hover:bg-gray-100 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  💬 My Feedback
                </Link>
                <Link 
                  href="/help/feedback" 
                  className="block px-4 py-3 text-base text-gray-700 hover:bg-gray-100 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  💡 Send Feedback
                </Link>
                <Link 
                  href="/release-notes" 
                  className="block px-4 py-3 text-base text-gray-700 hover:bg-gray-100 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  📢 Release Notes
                </Link>
              </div>

              {/* Sign Out */}
              <div className="pt-4 border-t border-gray-200 mt-4">
                <div className="px-4">
                  <SignOutButton />
                </div>
              </div>
            </nav>
          </div>
        </>
      )}

      <FeedbackUpdateBanner />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnnouncementBanner />
        {children}
      </main>
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-500">
              <p>LDC Tools v{APP_VERSION}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm">
              <Link href="/help/feedback" className="text-gray-600 hover:text-blue-600 whitespace-nowrap">
                💡 Send Feedback
              </Link>
              <Link href="/help" className="text-gray-600 hover:text-blue-600 whitespace-nowrap">
                Help Center
              </Link>
              <Link href="/release-notes" className="text-gray-600 hover:text-blue-600 whitespace-nowrap">
                Release Notes
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
