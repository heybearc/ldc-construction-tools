import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth-config'
import HelpLayout from '@/components/HelpLayout'
import Link from 'next/link'
import fs from 'fs'
import path from 'path'
import { marked } from 'marked'

export const dynamic = 'force-dynamic'

export default async function AuditLogsHelpPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  // Read the markdown file
  const filePath = path.join(process.cwd(), 'src/app/help/admin/audit-logs.md')
  const fileContents = fs.readFileSync(filePath, 'utf8')
  const htmlContent = marked(fileContents)

  return (
    <HelpLayout title="Multi-Tenant Audit Logs">
      <div className="max-w-4xl mx-auto">
        <nav className="mb-6 text-sm">
          <Link href="/help" className="text-blue-600 hover:text-blue-800">Help Center</Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link href="/help/admin" className="text-blue-600 hover:text-blue-800">Admin Help</Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-600">Multi-Tenant Audit Logs</span>
        </nav>

        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    </HelpLayout>
  )
}
