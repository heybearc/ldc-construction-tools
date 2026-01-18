import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth-config'
import HelpLayout from '@/components/HelpLayout'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function OrganizationHelpPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <HelpLayout title="Organization Hierarchy">
      <div className="max-w-4xl mx-auto">
        <nav className="mb-6 text-sm">
          <Link href="/help" className="text-blue-600 hover:text-blue-800">Help Center</Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-600">Organization Hierarchy</span>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">🏢 Organization Hierarchy</h1>

        <div className="prose prose-lg max-w-none">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-blue-900 mt-0 mb-3">📋 Overview</h2>
            <p className="text-blue-800 mb-0">
              The Organization Hierarchy page shows how your LDC organization is structured. 
              It displays the Branch, Zone, Region, and Construction Group (CG) hierarchy 
              and helps you understand your access scope.
            </p>
          </div>

          <h2>🌳 Understanding the Hierarchy</h2>
          <p>LDC Tools organizes data in a four-level hierarchy:</p>
          
          <div className="bg-gray-50 rounded-lg p-4 my-4">
            <ul className="mb-0">
              <li><strong>🌐 Branch</strong> - The top level (e.g., United States Branch)</li>
              <li><strong>📍 Zone</strong> - Geographic zones within a branch (e.g., Zone 1, Zone 2)</li>
              <li><strong>📌 Region</strong> - Regions within a zone (e.g., Region 01.12)</li>
              <li><strong>🏗️ Construction Group (CG)</strong> - Your local CG (e.g., CG 01.12)</li>
            </ul>
          </div>

          <h2>👁️ Your Access Level</h2>
          <p>When you open the Organization page, you&apos;ll see your access level at the top:</p>
          
          <div className="space-y-3 my-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <strong className="text-purple-900">Full Branch Access (Super Admin)</strong>
              <p className="text-purple-800 text-sm mb-0 mt-1">
                You can see and manage the entire organization hierarchy. You can add new regions and construction groups.
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <strong className="text-blue-900">Zone Level Access</strong>
              <p className="text-blue-800 text-sm mb-0 mt-1">
                You can see all regions and CGs within your assigned zone.
              </p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <strong className="text-green-900">Construction Group Access</strong>
              <p className="text-green-800 text-sm mb-0 mt-1">
                You can see your assigned Construction Group and its details.
              </p>
            </div>
          </div>

          <h2>📊 Stats Overview</h2>
          <p>At the top of the page, you&apos;ll see counts for:</p>
          <ul>
            <li><strong>Branches</strong> - Total number of branches</li>
            <li><strong>Zones</strong> - Total zones you can access</li>
            <li><strong>Regions</strong> - Total regions in your scope</li>
            <li><strong>Construction Groups</strong> - Total CGs in your scope</li>
          </ul>

          <h2>🌲 Organization Tree</h2>
          <p>The main section shows an expandable tree view:</p>
          <ul>
            <li>Click on a <strong>Zone</strong> to expand/collapse its regions</li>
            <li>Click on a <strong>Region</strong> to expand/collapse its CGs</li>
            <li>Each CG shows user count, team count, and project count</li>
          </ul>

          <h2>➕ Adding Regions and CGs (Super Admin Only)</h2>
          <p>If you&apos;re a Super Admin, you&apos;ll see + buttons to add new items:</p>
          
          <h3>Adding a Region</h3>
          <ol>
            <li>Find the Zone where you want to add a region</li>
            <li>Click the <strong>+</strong> button next to the zone</li>
            <li>Enter the region code (e.g., &quot;01.15&quot; for Zone 1, Region 15)</li>
            <li>Enter a name (or leave blank to auto-generate)</li>
            <li>Click <strong>Save</strong></li>
          </ol>

          <h3>Adding a Construction Group</h3>
          <ol>
            <li>Expand the Zone and find the Region</li>
            <li>Click the <strong>+</strong> button next to the region</li>
            <li>Enter the CG code (e.g., &quot;CG 01.15&quot;)</li>
            <li>Enter a name (usually same as code)</li>
            <li>Click <strong>Save</strong></li>
          </ol>

          <h2>✏️ Editing and Deleting CGs (Super Admin Only)</h2>
          <p>Super Admins can edit or remove Construction Groups when needed:</p>

          <h3>Editing a Construction Group</h3>
          <ol>
            <li>Find the CG you want to edit in the tree</li>
            <li>Click the <strong>Edit</strong> button (pencil icon) next to the CG</li>
            <li>Update the CG code or name as needed</li>
            <li>Click <strong>Save Changes</strong></li>
          </ol>

          <h3>Deleting a Construction Group</h3>
          <ol>
            <li>Find the CG you want to remove</li>
            <li>Click the <strong>Delete</strong> button (trash icon) next to the CG</li>
            <li>Confirm the deletion when prompted</li>
          </ol>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 my-6">
            <h3 className="text-lg font-semibold text-yellow-900 mt-0 mb-3">⚠️ Important Notes About Deletion</h3>
            <ul className="text-yellow-800 mb-0">
              <li>Deleting a CG is a <strong>soft delete</strong> - the data is preserved</li>
              <li>Users, volunteers, and other data remain in the system</li>
              <li>The CG is marked as inactive and hidden from normal views</li>
              <li>Super Admins can reactivate deleted CGs if needed</li>
              <li>All changes are tracked in the audit logs</li>
            </ul>
          </div>

          <h3>Reactivating a Deleted CG</h3>
          <p>If a CG was deleted by mistake, Super Admins can reactivate it:</p>
          <ol>
            <li>The deleted CG will show with a <strong>Reactivate</strong> button</li>
            <li>Click <strong>Reactivate</strong> to restore the CG</li>
            <li>The CG and all its data will be available again</li>
          </ol>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 my-6">
            <h3 className="text-lg font-semibold text-yellow-900 mt-0 mb-3">💡 Naming Convention</h3>
            <p className="text-yellow-800 mb-2">
              Construction Groups follow a standard naming format:
            </p>
            <ul className="text-yellow-800 mb-0">
              <li><strong>CG 01.12</strong> - Zone 01, Region 12</li>
              <li><strong>CG 03.05</strong> - Zone 03, Region 05</li>
            </ul>
          </div>

          <h2>❓ Frequently Asked Questions</h2>

          <h3>Why can&apos;t I see the + buttons?</h3>
          <p>
            Only Super Admins can add new regions and construction groups. 
            If you need to add hierarchy items, contact your Super Admin.
          </p>

          <h3>Why do I only see one CG?</h3>
          <p>
            Your access is scoped to your assigned Construction Group. 
            This is normal for most users. Zone Overseers and Super Admins 
            can see more of the hierarchy.
          </p>

          <h3>How do I get assigned to a different CG?</h3>
          <p>
            Contact your Super Admin to update your user profile with a 
            different Construction Group assignment.
          </p>

          <h3>What does the user/team/project count mean?</h3>
          <p>
            Each CG shows how many users are assigned to it, how many trade 
            teams operate within it, and how many projects are associated with it.
          </p>

          <div className="bg-gray-100 rounded-lg p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mt-0 mb-3">📍 Quick Access</h3>
            <p className="text-gray-700 mb-3">
              Access the Organization page from:
            </p>
            <p className="text-gray-700 mb-0">
              <strong>Admin</strong> → <strong>Organization</strong> (in the sidebar)
            </p>
          </div>
        </div>
      </div>
    </HelpLayout>
  )
}
