import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth-config'
import HelpLayout from '@/components/HelpLayout'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminHelpPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <HelpLayout title="Admin Panel">
      <div className="max-w-4xl mx-auto">
        <nav className="mb-6 text-sm">
          <Link href="/help" className="text-blue-600 hover:text-blue-800">Help Center</Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-600">Admin Panel</span>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">⚙️ Admin Panel</h1>

        <div className="prose prose-lg max-w-none">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-yellow-900 mt-0 mb-3">🔒 Admin Access Required</h2>
            <p className="text-yellow-800 mb-0">
              The Admin Panel is only accessible to users with Super Admin privileges. If you need admin access, contact your system administrator.
            </p>
          </div>

          <h2>🏠 Admin Control Center</h2>
          <p>The Admin Control Center is your hub for system management. Access it by clicking <strong>Admin</strong> in the main navigation.</p>

          <h2>📊 Admin Modules</h2>

          <h3>👥 User Management</h3>
          <p>Manage all users in the system:</p>
          <ul>
            <li><strong>View Users</strong> - See all registered users</li>
            <li><strong>Add Users</strong> - Create new user accounts</li>
            <li><strong>Edit Users</strong> - Update user information and roles</li>
            <li><strong>Invite Users</strong> - Send email invitations to new users</li>
            <li><strong>Deactivate Users</strong> - Disable user access without deleting</li>
          </ul>

          <h4>User Roles</h4>
          <div className="bg-gray-50 rounded-lg p-4 my-4">
            <ul className="mb-0">
              <li><strong>Super Admin</strong> - Full system access, can manage all settings</li>
              <li><strong>Zone Overseer</strong> - Manage projects and teams in their zone</li>
              <li><strong>Personnel Contact</strong> - Manage volunteers and assignments</li>
              <li><strong>Read Only</strong> - View-only access to information</li>
            </ul>
          </div>

          <h3>📧 Email Configuration</h3>
          <p>Set up email for system notifications:</p>
          <ul>
            <li><strong>Gmail Integration</strong> - Connect a Gmail account for sending emails</li>
            <li><strong>SMTP Settings</strong> - Configure custom email server</li>
            <li><strong>Test Email</strong> - Send a test to verify configuration</li>
            <li><strong>Email Templates</strong> - Customize invitation and notification emails</li>
          </ul>

          <h4>Setting Up Gmail</h4>
          <ol>
            <li>Go to <strong>Admin</strong> → <strong>Email Configuration</strong></li>
            <li>Select <strong>Gmail</strong> as the provider</li>
            <li>Enter your Gmail address</li>
            <li>Create an App Password in your Google Account settings</li>
            <li>Enter the App Password (not your regular password)</li>
            <li>Click <strong>Test Connection</strong></li>
            <li>Save the configuration</li>
          </ol>

          <h3>💚 Health Monitor</h3>
          <p>Monitor system health and performance:</p>
          <ul>
            <li><strong>System Status</strong> - Overall health indicator</li>
            <li><strong>Database Status</strong> - Connection and performance</li>
            <li><strong>API Status</strong> - Endpoint availability</li>
            <li><strong>Memory Usage</strong> - Server resource consumption</li>
          </ul>

          <h3>📊 API Status</h3>
          <p>Monitor API performance:</p>
          <ul>
            <li><strong>Response Times</strong> - How fast APIs respond</li>
            <li><strong>Error Rates</strong> - Track failed requests</li>
            <li><strong>Endpoint Health</strong> - Status of each API endpoint</li>
          </ul>

          <h3>📋 Audit Logs</h3>
          <p>Track all system activity:</p>
          <ul>
            <li><strong>User Actions</strong> - Who did what and when</li>
            <li><strong>Login History</strong> - Track user sessions</li>
            <li><strong>Data Changes</strong> - Record of modifications</li>
            <li><strong>Export Logs</strong> - Download for compliance</li>
          </ul>

          <h4>Filtering Audit Logs</h4>
          <ul>
            <li><strong>By User</strong> - See actions by specific user</li>
            <li><strong>By Action</strong> - Filter by type (create, update, delete)</li>
            <li><strong>By Date</strong> - View logs from specific time period</li>
            <li><strong>By Resource</strong> - Filter by what was affected</li>
          </ul>

          <h3>💡 Feedback Management</h3>
          <p>Review and manage user feedback:</p>
          <ul>
            <li><strong>View Feedback</strong> - See all submitted feedback</li>
            <li><strong>Filter by Type</strong> - Bugs, enhancements, features</li>
            <li><strong>Update Status</strong> - Mark as new, in progress, resolved</li>
            <li><strong>Add Comments</strong> - Respond to feedback internally</li>
          </ul>

          <h3>🔧 System Operations</h3>
          <p>Perform system maintenance:</p>
          <ul>
            <li><strong>Data Protection</strong> - Backup and restore options</li>
            <li><strong>Cache Management</strong> - Clear system caches</li>
            <li><strong>System Info</strong> - View version and configuration</li>
          </ul>

          <h2>🔐 Security Best Practices</h2>
          <ul>
            <li><strong>Regular Audits</strong> - Review audit logs weekly</li>
            <li><strong>User Reviews</strong> - Periodically review user access</li>
            <li><strong>Strong Passwords</strong> - Enforce password requirements</li>
            <li><strong>Deactivate Unused Accounts</strong> - Remove access for inactive users</li>
          </ul>

          <h2>❓ Frequently Asked Questions</h2>
          
          <div className="bg-gray-50 rounded-lg p-4 my-4">
            <h4 className="font-semibold text-gray-900 mt-0">How do I invite a new user?</h4>
            <p className="text-gray-600 mb-0">Go to User Management, click "Invite User", enter their email and role, and send the invitation. They'll receive an email with setup instructions.</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 my-4">
            <h4 className="font-semibold text-gray-900 mt-0">How do I change a user's role?</h4>
            <p className="text-gray-600 mb-0">Open User Management, find the user, click Edit, select the new role, and save. Changes take effect immediately.</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 my-4">
            <h4 className="font-semibold text-gray-900 mt-0">What if email isn't working?</h4>
            <p className="text-gray-600 mb-0">Check Email Configuration, verify your credentials, and use the Test Email feature. For Gmail, ensure you're using an App Password, not your regular password.</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 my-4">
            <h4 className="font-semibold text-gray-900 mt-0">How often should I check audit logs?</h4>
            <p className="text-gray-600 mb-0">We recommend reviewing audit logs at least weekly, and immediately after any security concerns.</p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 my-8">
            <h3 className="text-lg font-semibold text-gray-900 mt-0 mb-3">💡 Related Topics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/help/authentication" className="text-blue-600 hover:text-blue-800">
                🔐 Login & Security
              </Link>
              <Link href="/help/troubleshooting" className="text-blue-600 hover:text-blue-800">
                🔧 Troubleshooting
              </Link>
              <Link href="/help/getting-started" className="text-blue-600 hover:text-blue-800">
                🚀 Getting Started
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
