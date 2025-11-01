import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth-config'
import HelpLayout from '@/components/HelpLayout'
import Link from 'next/link'

export default async function GettingStartedPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <HelpLayout title="Getting Started">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <Link href="/help" className="text-blue-600 hover:text-blue-800">Help Center</Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-600">Getting Started</span>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">🚀 Getting Started with LDC Tools</h1>

        <div className="prose prose-lg max-w-none">
          {/* Introduction */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-blue-900 mt-0 mb-3">Welcome to LDC Tools!</h2>
            <p className="text-blue-800 mb-0">
              LDC Tools is your comprehensive system for managing personnel contacts, trade teams, and construction projects for LDC Region 01.12.
            </p>
          </div>

          {/* Quick Start */}
          <h2>⚡ Quick Start</h2>
          <ol>
            <li><strong>Log In</strong> - Navigate to the login page and enter your credentials</li>
            <li><strong>Explore the Dashboard</strong> - See an overview of your projects and teams</li>
            <li><strong>Navigate the Menu</strong> - Use the sidebar to access different features</li>
            <li><strong>Get Help</strong> - Click "Help Center" anytime you need assistance</li>
          </ol>

          {/* First Login */}
          <h2>🔐 Your First Login</h2>
          <h3>Step 1: Access the Login Page</h3>
          <p>Navigate to: <code>https://blue.ldctools.cloudigan.net</code> or <code>https://green.ldctools.cloudigan.net</code></p>

          <h3>Step 2: Enter Your Credentials</h3>
          <ul>
            <li><strong>Email:</strong> Your assigned email address</li>
            <li><strong>Password:</strong> Provided by your administrator</li>
          </ul>

          <h3>Step 3: You're In!</h3>
          <p>After logging in, you'll see the main dashboard with access to all features based on your role.</p>

          {/* Understanding Your Role */}
          <h2>👤 Understanding Your Role</h2>
          <p>Your access level depends on your assigned role:</p>

          <div className="bg-white border border-gray-200 rounded-lg p-4 my-4">
            <h4 className="font-semibold text-gray-900 mt-0">Super Admin</h4>
            <p className="text-sm text-gray-600 mb-0">Full system access, user management, and configuration</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 my-4">
            <h4 className="font-semibold text-gray-900 mt-0">Zone Overseer</h4>
            <p className="text-sm text-gray-600 mb-0">Manage projects, teams, and assignments for your zone</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 my-4">
            <h4 className="font-semibold text-gray-900 mt-0">Personnel Contact</h4>
            <p className="text-sm text-gray-600 mb-0">Coordinate trade teams and manage volunteer information</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 my-4">
            <h4 className="font-semibold text-gray-900 mt-0">Read Only</h4>
            <p className="text-sm text-gray-600 mb-0">View information without making changes</p>
          </div>

          {/* Main Features */}
          <h2>✨ Main Features</h2>

          <h3>📋 Dashboard</h3>
          <p>Your home base showing:</p>
          <ul>
            <li>Quick stats and overview</li>
            <li>Recent activity</li>
            <li>Quick actions</li>
          </ul>

          <h3>👥 Trade Teams</h3>
          <p>Manage your construction trade teams:</p>
          <ul>
            <li>View all trade teams</li>
            <li>Manage crews within teams</li>
            <li>Track team members</li>
          </ul>

          <h3>📊 Projects</h3>
          <p>Track construction projects:</p>
          <ul>
            <li>Create new projects</li>
            <li>Assign teams to projects</li>
            <li>Monitor project status</li>
          </ul>

          <h3>🙋 Volunteers</h3>
          <p>Manage volunteer information:</p>
          <ul>
            <li>Track volunteer details</li>
            <li>View availability</li>
            <li>Manage assignments</li>
          </ul>

          {/* Navigation Tips */}
          <h2>🧭 Navigation Tips</h2>
          <ul>
            <li><strong>Sidebar Menu</strong> - Access all main features</li>
            <li><strong>Top Bar</strong> - User menu, notifications, and quick actions</li>
            <li><strong>Breadcrumbs</strong> - Know where you are in the app</li>
            <li><strong>Back Button</strong> - Return to previous page</li>
          </ul>

          {/* Session Management */}
          <h2>⏱️ Session Management</h2>
          <ul>
            <li><strong>Session Duration:</strong> 24 hours</li>
            <li><strong>Auto Logout:</strong> After 24 hours of inactivity</li>
            <li><strong>Manual Logout:</strong> Click your name → Sign Out</li>
            <li><strong>Security Tip:</strong> Always log out on shared computers</li>
          </ul>

          {/* Browser Recommendations */}
          <h2>🌐 Browser Recommendations</h2>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 my-4">
            <h4 className="font-semibold text-green-900 mt-0">✅ Recommended</h4>
            <ul className="mb-0">
              <li>Chrome (best performance)</li>
              <li>Firefox</li>
              <li>Safari</li>
              <li>Edge</li>
            </ul>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
            <h4 className="font-semibold text-red-900 mt-0">❌ Not Supported</h4>
            <ul className="mb-0">
              <li>Internet Explorer</li>
              <li>Very old browser versions</li>
            </ul>
          </div>

          {/* Next Steps */}
          <h2>🎯 Next Steps</h2>
          <ol>
            <li><strong>Explore the Dashboard</strong> - Get familiar with the interface</li>
            <li><strong>Check Your Role</strong> - Understand what you can do</li>
            <li><strong>Read Other Help Topics</strong> - Learn about specific features</li>
            <li><strong>Try Basic Tasks</strong> - Start with simple operations</li>
          </ol>

          {/* Need Help */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 my-8">
            <h3 className="text-lg font-semibold text-gray-900 mt-0 mb-3">💡 Need More Help?</h3>
            <p className="mb-4">Check out these resources:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/help/authentication" className="text-blue-600 hover:text-blue-800">
                🔐 Login & Security
              </Link>
              <Link href="/help/troubleshooting" className="text-blue-600 hover:text-blue-800">
                🔧 Troubleshooting
              </Link>
              <Link href="/release-notes" className="text-blue-600 hover:text-blue-800">
                📋 Release Notes
              </Link>
              <Link href="/help" className="text-blue-600 hover:text-blue-800">
                📚 Help Center
              </Link>
            </div>
          </div>
        </div>
      </div>
    </HelpLayout>
  )
}
