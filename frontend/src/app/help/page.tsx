import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth-config'
import HelpLayout from '@/components/HelpLayout'
import Link from 'next/link'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface HelpTopic {
  id: string
  title: string
  description: string
  roles: string[]
  icon: string
}

const helpTopics: HelpTopic[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Learn the basics of using LDC Tools',
    roles: ['SUPER_ADMIN', 'ZONE_OVERSEER', 'PERSONNEL_CONTACT', 'READ_ONLY'],
    icon: '🚀'
  },
  {
    id: 'authentication',
    title: 'Login & Security',
    description: 'How to log in, manage your session, and stay secure',
    roles: ['SUPER_ADMIN', 'ZONE_OVERSEER', 'PERSONNEL_CONTACT', 'READ_ONLY'],
    icon: '🔐'
  },
  {
    id: 'my-feedback',
    title: 'My Feedback',
    description: 'Track your submitted feedback and see admin responses',
    roles: ['SUPER_ADMIN', 'ZONE_OVERSEER', 'PERSONNEL_CONTACT', 'READ_ONLY'],
    icon: '📋'
  },
  {
    id: 'trade-teams',
    title: 'Trade Teams',
    description: 'Managing trade teams, crews, and assignments',
    roles: ['SUPER_ADMIN', 'ZONE_OVERSEER', 'PERSONNEL_CONTACT', 'READ_ONLY'],
    icon: '👥'
  },
  {
    id: 'projects',
    title: 'Project Management',
    description: 'Creating and managing construction projects',
    roles: ['SUPER_ADMIN', 'ZONE_OVERSEER', 'PERSONNEL_CONTACT', 'READ_ONLY'],
    icon: '📋'
  },
  {
    id: 'volunteers',
    title: 'Volunteer Management',
    description: 'Tracking and managing volunteer information',
    roles: ['SUPER_ADMIN', 'ZONE_OVERSEER', 'PERSONNEL_CONTACT', 'READ_ONLY'],
    icon: '🙋'
  },
  {
    id: 'admin',
    title: 'Admin Panel',
    description: 'System administration, users, and configuration',
    roles: ['SUPER_ADMIN', 'ZONE_OVERSEER', 'PERSONNEL_CONTACT', 'READ_ONLY'],
    icon: '⚙️'
  },
  {
    id: 'crew-requests',
    title: 'Crew Requests',
    description: 'Submit and manage crew change requests for volunteers',
    roles: ['SUPER_ADMIN', 'ZONE_OVERSEER', 'PERSONNEL_CONTACT', 'READ_ONLY'],
    icon: '📝'
  },
  {
    id: 'organization',
    title: 'Organization Hierarchy',
    description: 'Understanding Branch, Zone, Region, and CG structure',
    roles: ['SUPER_ADMIN', 'ZONE_OVERSEER', 'PERSONNEL_CONTACT', 'READ_ONLY'],
    icon: '🏢'
  },
  {
    id: 'feedback',
    title: 'Send Feedback',
    description: 'Report bugs, suggest improvements, or request new features',
    roles: ['SUPER_ADMIN', 'ZONE_OVERSEER', 'PERSONNEL_CONTACT', 'READ_ONLY'],
    icon: '💡'
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    description: 'Common issues and how to resolve them',
    roles: ['SUPER_ADMIN', 'ZONE_OVERSEER', 'PERSONNEL_CONTACT', 'READ_ONLY'],
    icon: '🔧'
  }
]

export default async function HelpPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  // Show all help topics to all users - help documentation should be accessible to everyone
  const userTopics = helpTopics

  return (
    <HelpLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📚 Help Center</h1>
          <p className="text-gray-600">
            Find answers and learn how to use LDC Tools effectively
          </p>
        </div>

        {/* Quick Links */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">🔗 Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/release-notes"
              className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
            >
              📋 Release Notes
            </Link>
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
            >
              🏠 Dashboard
            </Link>
            <Link
              href="/admin"
              className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
            >
              ⚙️ Admin Panel
            </Link>
          </div>
        </div>

        {/* Help Topics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {userTopics.map((topic) => (
            <div
              key={topic.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-3">
                <span className="text-3xl">{topic.icon}</span>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {topic.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {topic.description}
                  </p>
                  <Link
                    href={`/help/${topic.id}`}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium"
                  >
                    Learn More
                    <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Support */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">💬 Need More Help?</h2>
          <p className="text-gray-600 mb-4">
            Can't find what you're looking for? Send us feedback or contact your system administrator.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/help/feedback"
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              💡 Send Feedback
            </Link>
            <Link
              href="/release-notes"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              📋 View Release Notes
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              🏠 Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </HelpLayout>
  )
}
