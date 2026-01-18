import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth-config'
import HelpLayout from '@/components/HelpLayout'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function VolunteersHelpPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <HelpLayout title="Volunteer Management">
      <div className="max-w-4xl mx-auto">
        <nav className="mb-6 text-sm">
          <Link href="/help" className="text-blue-600 hover:text-blue-800">Help Center</Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-600">Volunteer Management</span>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">🙋 Volunteer Management</h1>

        <div className="prose prose-lg max-w-none">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-blue-900 mt-0 mb-3">About Volunteers</h2>
            <p className="text-blue-800 mb-0">
              The Volunteers section helps you manage all personnel involved in LDC construction projects. Track contact information, skills, availability, and assignments.
            </p>
          </div>

          <h2>👀 Viewing Volunteers</h2>
          <h3>Volunteer List</h3>
          <ol>
            <li>Click <strong>Volunteers</strong> in the main navigation</li>
            <li>Browse the list of all registered volunteers</li>
            <li>Use search and filters to find specific people</li>
          </ol>

          <h3>Volunteer Profile</h3>
          <p>Click on any volunteer to see their full profile:</p>
          <ul>
            <li><strong>Personal Info</strong> - Name, contact details</li>
            <li><strong>Email Addresses</strong> - Personal and JW email</li>
            <li><strong>Phone</strong> - Contact number</li>
            <li><strong>Congregation</strong> - Home congregation</li>
            <li><strong>Skills</strong> - Trade skills and certifications</li>
            <li><strong>Assignments</strong> - Current team and project assignments</li>
          </ul>

          <h2>➕ Adding a New Volunteer</h2>
          <p><em>Requires: Super Admin, Zone Overseer, or Personnel Contact role</em></p>
          <ol>
            <li>Go to <strong>Volunteers</strong></li>
            <li>Click <strong>+ Add Volunteer</strong></li>
            <li>Fill in the volunteer information:
              <ul>
                <li><strong>First Name</strong> - Required</li>
                <li><strong>Last Name</strong> - Required</li>
                <li><strong>Email</strong> - Primary contact email</li>
                <li><strong>Phone</strong> - Contact number</li>
                <li><strong>Congregation</strong> - Home congregation</li>
                <li><strong>BA ID</strong> - Builder Assistant ID (if applicable)</li>
              </ul>
            </li>
            <li>Click <strong>Save Volunteer</strong></li>
          </ol>

          <h2>✏️ Editing Volunteer Information</h2>
          <ol>
            <li>Find the volunteer in the list</li>
            <li>Click on their name to open their profile</li>
            <li>Click <strong>Edit</strong></li>
            <li>Update the necessary fields</li>
            <li>Click <strong>Save Changes</strong></li>
          </ol>

          <h2>🔍 Searching for Volunteers</h2>
          <h3>Quick Search</h3>
          <p>Use the search box to find volunteers by:</p>
          <ul>
            <li>First or last name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>Congregation name</li>
          </ul>

          <h3>Advanced Filters</h3>
          <ul>
            <li><strong>By Team</strong> - Show volunteers in a specific trade team</li>
            <li><strong>By Status</strong> - Active, Inactive, or All</li>
            <li><strong>By Role</strong> - Filter by assigned role</li>
          </ul>

          <h2>👥 Assigning Volunteers to Teams</h2>
          <ol>
            <li>Open the volunteer's profile</li>
            <li>Go to the <strong>Assignments</strong> section</li>
            <li>Click <strong>+ Add Assignment</strong></li>
            <li>Select the trade team and crew</li>
            <li>Set the assignment dates</li>
            <li>Click <strong>Assign</strong></li>
          </ol>

          <h2>📊 Volunteer Statistics</h2>
          <p>The dashboard shows key volunteer metrics:</p>
          <ul>
            <li><strong>Total Volunteers</strong> - All registered volunteers</li>
            <li><strong>Active</strong> - Currently assigned to projects</li>
            <li><strong>Available</strong> - Not currently assigned</li>
            <li><strong>By Trade</strong> - Breakdown by skill area</li>
          </ul>

          <h2>📤 Importing Volunteers</h2>
          <p><em>Requires: Super Admin role</em></p>
          <p>Bulk import volunteers from a CSV file:</p>
          <ol>
            <li>Go to <strong>Admin</strong> → <strong>Import</strong></li>
            <li>Download the CSV template</li>
            <li>Fill in volunteer data following the template format</li>
            <li>Upload the completed CSV file</li>
            <li>Review the import preview</li>
            <li>Confirm the import</li>
          </ol>

          <h2>📥 Exporting Volunteer Data</h2>
          <ol>
            <li>Go to <strong>Volunteers</strong></li>
            <li>Apply any filters you want</li>
            <li>Click <strong>Export</strong></li>
            <li>Choose the format (CSV or Excel)</li>
            <li>Download the file</li>
          </ol>

          <h2>❓ Frequently Asked Questions</h2>
          
          <div className="bg-gray-50 rounded-lg p-4 my-4">
            <h4 className="font-semibold text-gray-900 mt-0">How do I update a volunteer's contact information?</h4>
            <p className="text-gray-600 mb-0">Open their profile, click Edit, update the fields, and save. Changes take effect immediately.</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 my-4">
            <h4 className="font-semibold text-gray-900 mt-0">Can I delete a volunteer?</h4>
            <p className="text-gray-600 mb-0">Instead of deleting, we recommend marking volunteers as Inactive. This preserves historical data while removing them from active lists.</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 my-4">
            <h4 className="font-semibold text-gray-900 mt-0">What's the difference between Personal and JW email?</h4>
            <p className="text-gray-600 mb-0">Personal email is their regular email. JW email is their @jw.org address if they have one, used for official communications.</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 my-4">
            <h4 className="font-semibold text-gray-900 mt-0">How do I see a volunteer's assignment history?</h4>
            <p className="text-gray-600 mb-0">Open their profile and scroll to the Assignments section. Past assignments are shown with dates.</p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 my-8">
            <h3 className="text-lg font-semibold text-gray-900 mt-0 mb-3">💡 Related Topics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/help/trade-teams" className="text-blue-600 hover:text-blue-800">
                👥 Trade Teams
              </Link>
              <Link href="/help/projects" className="text-blue-600 hover:text-blue-800">
                📋 Project Management
              </Link>
              <Link href="/help/admin" className="text-blue-600 hover:text-blue-800">
                ⚙️ Admin Panel
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
