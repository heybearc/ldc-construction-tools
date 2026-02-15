'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { APP_VERSION } from '@/lib/version'

interface Release {
  version: string
  date: string
  type: string
  title: string
  description: string
  sections: {
    title: string
    items: string[]
  }[]
}

const releases: Release[] = [
  {
    version: '1.27.3',
    date: '2026-02-15',
    type: 'minor',
    title: 'Password Reset & Feedback Management',
    description: 'Added password reset functionality and improved feedback tracking system',
    sections: [
      {
        title: 'New Features',
        items: [
          'Password reset functionality - Admins can now send password reset emails to users',
          'Feedback ID system - All feedback now has sequential IDs (FB-001, FB-002, etc.) for easy reference',
          'Resolution tracking - All feedback items now include resolution comments for better audit trail'
        ]
      },
      {
        title: 'Bug Fixes',
        items: [
          'Fixed password reset email sending errors',
          'Fixed feedback commenting for non-admin users'
        ]
      }
    ]
  },
  {
    version: '1.27.2',
    date: '2026-01-25',
    type: 'patch',
    title: 'Crew Request Fixes',
    description: 'Fixed crew request submission on behalf of others',
    sections: [
      {
        title: 'Bug Fixes',
        items: [
          'Personnel Contacts can now successfully submit crew requests on behalf of volunteers',
          'Fixed role permission checks for PC/PCA/PC_SUPPORT roles'
        ]
      }
    ]
  },
  {
    version: '1.27.1',
    date: '2026-01-13',
    type: 'patch',
    title: 'Search Box Improvements',
    description: 'Fixed volunteer search functionality issues',
    sections: [
      {
        title: 'Bug Fixes',
        items: [
          'Search box now keeps focus while you type',
          'Multi-word searches (like "Amber Allen") now work correctly',
          'Smooth search experience without page refreshes'
        ]
      }
    ]
  },
  {
    version: '1.27.0',
    date: '2026-01-05',
    type: 'minor',
    title: 'Enhanced Contact Management',
    description: 'Major improvements to volunteer search, filtering, and bulk operations',
    sections: [
      {
        title: 'New Features',
        items: [
          'Multi-field search across name, BA ID, congregation, phone, email, and role',
          'Saved search filters for quick access to frequently used searches',
          'Quick filter buttons (Has Email, Has Phone, Assigned/Unassigned)',
          'Email verification badges showing verification status',
          'Emergency contact information fields',
          'Congregation distribution statistics card',
          'Bulk edit modal for updating multiple volunteers at once',
          'Bulk reassignment wizard for moving volunteers between teams',
          'Enhanced export functionality with filter support'
        ]
      },
      {
        title: 'Improvements',
        items: [
          'Phone number validation using international standards',
          'Faster search with debouncing',
          'Better mobile responsiveness',
          'Improved loading states and error messages'
        ]
      }
    ]
  }
]

function getTypeColor(type: string) {
  switch (type) {
    case 'major':
      return 'bg-red-100 text-red-800'
    case 'minor':
      return 'bg-blue-100 text-blue-800'
    case 'patch':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function ReleaseNotesPage() {
  const [selectedVersion, setSelectedVersion] = useState(releases[0]?.version || '')
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (releases.length > 0 && !selectedVersion) {
      setSelectedVersion(releases[0].version)
    }
  }, [])

  const selectedRelease = releases.find(r => r.version === selectedVersion) || releases[0]

  const toggleSection = (version: string, sectionTitle: string) => {
    const key = `${version}-${sectionTitle}`
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const isSectionExpanded = (version: string, sectionTitle: string) => {
    const key = `${version}-${sectionTitle}`
    return expandedSections[key] !== false
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">📋</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Release Notes</h1>
              <span className="text-sm text-gray-500">v{APP_VERSION}</span>
            </div>
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm"
            >
              ← Back to App
            </Link>
          </div>
        </div>
      </div>

      {/* Main Layout with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-64 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-3 px-2">Versions</h2>
              <nav className="space-y-1">
                {releases.map((release) => (
                  <button
                    key={release.version}
                    onClick={() => setSelectedVersion(release.version)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedVersion === release.version
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>v{release.version}</span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        release.type === 'major' ? 'bg-red-100 text-red-700' :
                        release.type === 'minor' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {release.type}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{release.date}</div>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {selectedRelease && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Release Header */}
                <div className="border-b border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-3xl font-bold text-gray-900">v{selectedRelease.version}</h2>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          selectedRelease.type === 'major' ? 'bg-red-100 text-red-700' :
                          selectedRelease.type === 'minor' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {selectedRelease.type.toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">{selectedRelease.title}</h3>
                      <p className="text-gray-600">{selectedRelease.description}</p>
                    </div>
                    <span className="text-sm text-gray-500 whitespace-nowrap ml-4">{selectedRelease.date}</span>
                  </div>
                </div>

                {/* Release Sections */}
                <div className="p-6 space-y-6">
                  {selectedRelease.sections.map((section, idx) => (
                    <div key={idx} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                      <button
                        onClick={() => toggleSection(selectedRelease.version, section.title)}
                        className="flex items-center justify-between w-full text-left group"
                      >
                        <h4 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {section.title === 'New Features' && '✨ '}
                          {section.title === 'Improvements' && '🔧 '}
                          {section.title === 'Bug Fixes' && '🐛 '}
                          {section.title}
                        </h4>
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform ${
                            isSectionExpanded(selectedRelease.version, section.title) ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isSectionExpanded(selectedRelease.version, section.title) && (
                        <ul className="mt-4 space-y-3">
                          {section.items.map((item, itemIdx) => (
                            <li key={itemIdx} className="flex items-start gap-3">
                              <span className="text-blue-500 mt-1 flex-shrink-0">•</span>
                              <span className="text-gray-700 leading-relaxed">{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Help Section */}
            <div className="mt-8 bg-blue-50 rounded-lg border border-blue-100 p-6">
              <div className="flex items-start gap-4">
                <div className="text-3xl">�</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Have questions about a release or need assistance? We're here to help.
                  </p>
                  <div className="flex gap-3">
                    <Link
                      href="/help"
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 underline"
                    >
                      Visit Help Center
                    </Link>
                    <span className="text-gray-300">•</span>
                    <Link
                      href="/feedback"
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 underline"
                    >
                      Send Feedback
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
