import { promises as fs } from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { marked } from 'marked'
import ReleaseNotesClient from './ReleaseNotesClient'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export interface Release {
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

export default async function ReleaseNotesPage() {
  const releases = await getReleases()
  
  return <ReleaseNotesClient releases={releases} />
}
