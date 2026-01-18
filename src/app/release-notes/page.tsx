import { promises as fs } from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { marked } from 'marked'
import Link from 'next/link'
import { APP_VERSION } from '@/lib/version'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface Release {
  version: string
  date: string
  type: string
  title: string
  description: string
  content: string
}

async function getReleases(): Promise<Release[]> {
  const releasesDir = path.join(process.cwd(), 'release-notes')
  
  try {
    const filenames = await fs.readdir(releasesDir)
    
    const releases = await Promise.all(
      filenames
        .filter(f => f.endsWith('.md') && f !== 'TEMPLATE.md')
        .map(async filename => {
          const filePath = path.join(releasesDir, filename)
          const fileContents = await fs.readFile(filePath, 'utf8')
          const { data, content } = matter(fileContents)
          
          // Extract version from filename if not in frontmatter
          const versionFromFilename = filename.replace(/^v/, '').replace(/\.md$/, '')
          
          return {
            version: data.version || versionFromFilename,
            date: typeof data.date === 'string' ? data.date : data.date?.toISOString?.()?.split('T')[0] || '',
            type: data.type || 'patch',
            title: data.title || `Release v${data.version || versionFromFilename}`,
            description: data.description || '',
            content: marked(content) as string
          }
        })
    )
    
    // Sort by version number (descending)
    return releases.sort((a, b) => {
      const versionA = (a.version || '').replace(/[^0-9.]/g, '')
      const versionB = (b.version || '').replace(/[^0-9.]/g, '')
      return versionB.localeCompare(versionA, undefined, { numeric: true })
    })
  } catch (error) {
    console.error('Error reading release notes:', error)
    return []
  }
}

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

export default async function ReleaseNotesPage() {
  const releases = await getReleases()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="h-10 w-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📋</span>
                </div>
                <h1 className="text-3xl font-bold">Release Notes</h1>
              </div>
              <p className="text-blue-100 ml-13">
                Stay updated with the latest features, improvements, and fixes
              </p>
            </div>
            <Link
              href="/"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 border border-white/20"
            >
              ← Back to App
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {releases.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
            <p className="text-yellow-800 text-lg">No release notes available yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {releases.map((release) => (
              <div key={release.version} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden border border-gray-100">
                {/* Release Header */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-6 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        v{release.version}
                      </h2>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${getTypeColor(release.type)} shadow-sm`}>
                        {release.type.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-600 bg-white px-4 py-2 rounded-lg shadow-sm">
                      📅 {release.date}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mt-4">{release.title}</h3>
                  <p className="text-gray-600 mt-2">{release.description}</p>
                </div>

                {/* Markdown Content */}
                <div className="px-8 py-6">
                  <div 
                    className="prose prose-blue max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-strong:font-semibold prose-ul:list-disc prose-ol:list-decimal prose-li:text-gray-700"
                    dangerouslySetInnerHTML={{ __html: release.content }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer CTA */}
        <div className="mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-8 text-center text-white">
            <div className="text-4xl mb-4">🔔</div>
            <h3 className="text-2xl font-bold mb-3">Stay Updated</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Want to be notified about new releases? Contact your administrator to be added to the update notifications.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/help"
                className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-md"
              >
                📚 Help Center
              </Link>
              <Link
                href="/"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 border border-white/20"
              >
                🏠 Back to Dashboard
              </Link>
            </div>
            <p className="text-blue-100 text-sm mt-6">
              LDC Tools v{APP_VERSION} • Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
