import { promises as fs } from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { marked } from 'marked'
import HelpLayout from '@/components/HelpLayout'

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
    <HelpLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📋 Release Notes</h1>
          <p className="text-gray-600">
            Stay updated with the latest features, improvements, and fixes
          </p>
        </div>

        {releases.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <p className="text-yellow-800">No release notes available yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {releases.map((release) => (
              <div key={release.version} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                {/* Release Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <h2 className="text-2xl font-bold text-gray-900">v{release.version}</h2>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(release.type)}`}>
                      {release.type.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">{release.date}</span>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mb-2">{release.title}</h3>
                <p className="text-gray-600 mb-6">{release.description}</p>

                {/* Markdown Content */}
                <div 
                  className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-a:text-blue-600 prose-strong:text-gray-900"
                  dangerouslySetInnerHTML={{ __html: release.content }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">🔔 Stay Updated</h3>
            <p className="text-gray-600 mb-4">
              Want to be notified about new releases? Contact your administrator to be added to the update notifications.
            </p>
            <div className="text-sm text-gray-500">
              <p>Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </div>
      </div>
    </HelpLayout>
  )
}
