import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth-config'
import HelpLayout from '@/components/HelpLayout'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ProjectsHelpPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <HelpLayout title="Project Management">
      <div className="max-w-4xl mx-auto">
        <nav className="mb-6 text-sm">
          <Link href="/help" className="text-blue-600 hover:text-blue-800">Help Center</Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-600">Project Management</span>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">📋 Project Management</h1>

        <div className="prose prose-lg max-w-none">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-blue-900 mt-0 mb-3">About Projects</h2>
            <p className="text-blue-800 mb-0">
              Projects in LDC Tools represent construction sites or building assignments. Track project status, assign trade teams, and monitor progress all in one place.
            </p>
          </div>

          <h2>📊 Project Status Overview</h2>
          <p>Projects move through these stages:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
            <div className="bg-gray-100 rounded-lg p-4">
              <span className="inline-block px-2 py-1 bg-gray-500 text-white text-xs rounded mb-2">PLANNING</span>
              <p className="text-sm mb-0">Project is being planned, not yet started</p>
            </div>
            <div className="bg-blue-100 rounded-lg p-4">
              <span className="inline-block px-2 py-1 bg-blue-500 text-white text-xs rounded mb-2">ACTIVE</span>
              <p className="text-sm mb-0">Construction is currently in progress</p>
            </div>
            <div className="bg-yellow-100 rounded-lg p-4">
              <span className="inline-block px-2 py-1 bg-yellow-500 text-white text-xs rounded mb-2">ON HOLD</span>
              <p className="text-sm mb-0">Project temporarily paused</p>
            </div>
            <div className="bg-green-100 rounded-lg p-4">
              <span className="inline-block px-2 py-1 bg-green-500 text-white text-xs rounded mb-2">COMPLETED</span>
              <p className="text-sm mb-0">Project finished successfully</p>
            </div>
          </div>

          <h2>👀 Viewing Projects</h2>
          <h3>Project List</h3>
          <ol>
            <li>Click <strong>Projects</strong> in the main navigation</li>
            <li>See all projects with their current status</li>
            <li>Use filters to find specific projects</li>
          </ol>

          <h3>Project Details</h3>
          <p>Click on any project to see:</p>
          <ul>
            <li><strong>Basic Info</strong> - Name, description, location</li>
            <li><strong>Timeline</strong> - Start date, end date, duration</li>
            <li><strong>Status</strong> - Current project phase</li>
            <li><strong>Assigned Teams</strong> - Trade teams working on the project</li>
            <li><strong>Budget</strong> - Financial tracking (if enabled)</li>
          </ul>

          <h2>➕ Creating a New Project</h2>
          <p><em>Requires: Super Admin or Zone Overseer role</em></p>
          <ol>
            <li>Go to <strong>Projects</strong></li>
            <li>Click <strong>+ New Project</strong></li>
            <li>Fill in the project details:
              <ul>
                <li><strong>Project Name</strong> - Clear, descriptive name</li>
                <li><strong>Description</strong> - What the project involves</li>
                <li><strong>Region</strong> - Geographic region</li>
                <li><strong>Start Date</strong> - When work begins</li>
                <li><strong>End Date</strong> - Expected completion</li>
                <li><strong>Priority</strong> - Low, Medium, High, or Critical</li>
              </ul>
            </li>
            <li>Click <strong>Create Project</strong></li>
          </ol>

          <h2>✏️ Editing Projects</h2>
          <ol>
            <li>Open the project you want to edit</li>
            <li>Click the <strong>Edit</strong> button</li>
            <li>Update the necessary fields</li>
            <li>Click <strong>Save Changes</strong></li>
          </ol>

          <h2>👥 Assigning Teams to Projects</h2>
          <h3>Adding a Team Assignment</h3>
          <ol>
            <li>Open the project</li>
            <li>Go to the <strong>Assignments</strong> tab</li>
            <li>Click <strong>+ Assign Team</strong></li>
            <li>Select the trade team</li>
            <li>Choose the assignment type:
              <ul>
                <li><strong>Branch Appointed</strong> - Official branch assignment</li>
                <li><strong>Field Continuous</strong> - Ongoing field work</li>
                <li><strong>Field Temporary</strong> - Short-term assignment</li>
              </ul>
            </li>
            <li>Set start and end dates</li>
            <li>Click <strong>Assign</strong></li>
          </ol>

          <h3>Removing an Assignment</h3>
          <ol>
            <li>Open the project</li>
            <li>Find the assignment in the list</li>
            <li>Click <strong>Remove</strong></li>
            <li>Confirm the removal</li>
          </ol>

          <h2>🔍 Filtering and Searching</h2>
          <ul>
            <li><strong>Search</strong> - Find projects by name</li>
            <li><strong>Status Filter</strong> - Show only Planning, Active, etc.</li>
            <li><strong>Priority Filter</strong> - Filter by priority level</li>
            <li><strong>Date Range</strong> - Find projects within a time period</li>
          </ul>

          <h2>📈 Project Priority Levels</h2>
          <div className="bg-gray-50 rounded-lg p-4 my-4">
            <ul className="mb-0">
              <li><strong className="text-green-600">Low</strong> - Can be scheduled flexibly</li>
              <li><strong className="text-yellow-600">Medium</strong> - Standard priority</li>
              <li><strong className="text-orange-600">High</strong> - Important, needs attention</li>
              <li><strong className="text-red-600">Critical</strong> - Urgent, top priority</li>
            </ul>
          </div>

          <h2>❓ Frequently Asked Questions</h2>
          
          <div className="bg-gray-50 rounded-lg p-4 my-4">
            <h4 className="font-semibold text-gray-900 mt-0">Can I assign the same team to multiple projects?</h4>
            <p className="text-gray-600 mb-0">Yes, teams can work on multiple projects simultaneously. The system tracks all assignments.</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 my-4">
            <h4 className="font-semibold text-gray-900 mt-0">What happens when a project is completed?</h4>
            <p className="text-gray-600 mb-0">Completed projects are archived but remain visible for reporting. Team assignments are automatically ended.</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 my-4">
            <h4 className="font-semibold text-gray-900 mt-0">How do I reactivate a project on hold?</h4>
            <p className="text-gray-600 mb-0">Edit the project and change the status from "On Hold" back to "Active".</p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 my-8">
            <h3 className="text-lg font-semibold text-gray-900 mt-0 mb-3">💡 Related Topics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/help/trade-teams" className="text-blue-600 hover:text-blue-800">
                👥 Trade Teams
              </Link>
              <Link href="/help/volunteers" className="text-blue-600 hover:text-blue-800">
                🙋 Volunteer Management
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
