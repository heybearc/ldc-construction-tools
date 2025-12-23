'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UserRolesHelpPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            👥 Understanding User Roles
          </h1>
          <p className="text-gray-600">
            Learn about System Roles and LDC Roles in LDC Construction Tools
          </p>
        </div>

        {/* Overview */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📋 Overview</h2>
          <p className="text-gray-700 mb-4">
            LDC Construction Tools uses two types of roles to manage both system permissions and organizational structure:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">🔐 System Role</h3>
              <p className="text-sm text-blue-800">
                Controls what features and pages a user can access in the system. This determines their permissions and capabilities.
              </p>
            </div>
            <div className="border border-green-200 bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">🏢 LDC Role</h3>
              <p className="text-sm text-green-800">
                Represents the user's actual organizational role within the LDC structure. This affects visibility in personnel lists and assignment options.
              </p>
            </div>
          </div>
        </div>

        {/* Why Two Roles? */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🤔 Why Two Roles?</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">Example Scenario</h3>
              <p className="text-gray-700 mb-2">
                A user might be a <strong>SUPER_ADMIN</strong> (System Role) for system management purposes, but their actual organizational role is <strong>Personnel Contact</strong> (LDC Role).
              </p>
              <p className="text-gray-700">
                Without the LDC Role, this user wouldn't appear in personnel assignment lists or be properly represented in their Construction Group's organizational structure.
              </p>
            </div>
          </div>
        </div>

        {/* Setting User Roles */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">⚙️ How to Set User Roles</h2>
          
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Step 1: Navigate to User Management</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
              <li>Go to <strong>Admin</strong> → <strong>Users</strong></li>
              <li>Find the user you want to edit</li>
              <li>Click the <strong>Edit</strong> button (pencil icon)</li>
            </ol>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Step 2: Configure Roles</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div>
                <p className="font-medium text-gray-900 mb-1">System Role (Required)</p>
                <p className="text-sm text-gray-600">
                  Select the primary system role that determines their access level:
                </p>
                <ul className="text-sm text-gray-600 ml-4 mt-1">
                  <li>• <strong>SUPER_ADMIN</strong> - Full system access</li>
                  <li>• <strong>PERSONNEL_CONTACT</strong> - Personnel management</li>
                  <li>• <strong>ZONE_OVERSEER</strong> - Zone-level access</li>
                  <li>• <strong>READ_ONLY</strong> - View-only access</li>
                </ul>
              </div>
              
              <div>
                <p className="font-medium text-gray-900 mb-1">LDC Role (Optional)</p>
                <p className="text-sm text-gray-600">
                  Select their organizational role within the LDC structure:
                </p>
                <ul className="text-sm text-gray-600 ml-4 mt-1">
                  <li>• <strong>Personnel Contact</strong></li>
                  <li>• <strong>Personnel Contact Assistant</strong></li>
                  <li>• <strong>Zone Overseer</strong></li>
                  <li>• <strong>Construction Group Overseer</strong></li>
                  <li>• And more...</li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-gray-900 mb-1">Construction Group</p>
                <p className="text-sm text-gray-600">
                  Select which Construction Group the user belongs to (e.g., "CG 01.12")
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Step 3: Save Changes</h3>
            <p className="text-gray-700">
              Click <strong>Update User</strong> to save the role assignments.
            </p>
          </div>
        </div>

        {/* Impact on Features */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🎯 How Roles Affect Features</h2>
          
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Crew Request Assignments</h3>
              <p className="text-sm text-gray-700 mb-2">
                When assigning crew requests, the system looks for users with:
              </p>
              <ul className="text-sm text-gray-600 ml-4">
                <li>• System Role containing "PERSONNEL", OR</li>
                <li>• LDC Role containing "PERSONNEL"</li>
              </ul>
              <p className="text-sm text-gray-700 mt-2">
                This ensures that both system admins with personnel duties and actual personnel contacts appear in assignment dropdowns.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Construction Group Personnel Lists</h3>
              <p className="text-sm text-gray-700">
                Users with an LDC Role and Construction Group assignment will appear in their CG's personnel lists, ensuring accurate organizational representation.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">System Access</h3>
              <p className="text-sm text-gray-700">
                The System Role determines which pages and features a user can access, regardless of their LDC Role.
              </p>
            </div>
          </div>
        </div>

        {/* Common Questions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">❓ Common Questions</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Q: Do I need to set both roles?</h3>
              <p className="text-gray-700">
                <strong>System Role</strong> is required for all users. <strong>LDC Role</strong> is optional but recommended for users who have an actual organizational role within the LDC structure.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Q: Can a SUPER_ADMIN also have an LDC Role?</h3>
              <p className="text-gray-700">
                Yes! This is the primary use case. A system administrator might also serve as a Personnel Contact in their Construction Group, so they need both roles.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Q: What if I don't set an LDC Role?</h3>
              <p className="text-gray-700">
                The user will still have full access based on their System Role, but they won't appear in personnel-specific lists or organizational charts unless their System Role already includes "PERSONNEL".
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Q: Can I change roles later?</h3>
              <p className="text-gray-700">
                Yes, administrators can edit user roles at any time through the User Management page.
              </p>
            </div>
          </div>
        </div>

        {/* Best Practices */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">💡 Best Practices</h2>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Set LDC Role for all users who have an actual organizational position</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Assign Construction Group to ensure users appear in the correct organizational context</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Use System Role to control access, LDC Role to represent organizational structure</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Review user roles periodically to ensure they match current assignments</span>
            </li>
          </ul>
        </div>

        {/* Need Help */}
        <div className="bg-gray-100 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">📞 Need More Help?</h2>
          <div className="space-y-2 text-gray-700">
            <p>
              <Link href="/help/admin" className="text-blue-600 hover:text-blue-800">
                ← Back to Admin Help
              </Link>
            </p>
            <p>
              <Link href="/help" className="text-blue-600 hover:text-blue-800">
                View All Help Topics
              </Link>
            </p>
            <p>
              <Link href="/feedback" className="text-blue-600 hover:text-blue-800">
                Send Feedback
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
