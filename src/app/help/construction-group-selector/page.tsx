'use client';

import { Building2, Filter, Globe, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function CGSelectorHelpPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Construction Group Selector
            </h1>
          </div>

          <div className="prose prose-blue max-w-none">
            <p className="text-lg text-gray-600 mb-8">
              The Construction Group (CG) Selector allows administrators to view and manage data across different Construction Groups.
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
              <div className="flex items-start">
                <Globe className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Administrator Feature
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    This feature is only available to SUPER_ADMIN users. Regular users automatically see data for their assigned Construction Group.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              📍 What is a Construction Group?
            </h2>
            <p className="text-gray-700 mb-4">
              A Construction Group (CG) is an organizational unit within the LDC structure. Each CG has its own:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
              <li>Volunteers and staff members</li>
              <li>Trade teams and crews</li>
              <li>Projects and assignments</li>
              <li>Crew change requests</li>
            </ul>
            <p className="text-gray-700 mb-6">
              The organizational hierarchy is: <strong>Branch → Zone → Region → Construction Group</strong>
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              🎯 How to Use the CG Selector
            </h2>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
              Finding the CG Selector
            </h3>
            <p className="text-gray-700 mb-4">
              The CG Selector appears in the top navigation bar (desktop) or in the mobile menu. Look for the dropdown with a building icon.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
              Switching Between Construction Groups
            </h3>
            <ol className="list-decimal pl-6 text-gray-700 space-y-3 mb-6">
              <li>
                <strong>Click the CG Selector dropdown</strong> in the navigation bar
              </li>
              <li>
                <strong>Choose a Construction Group</strong> from the list, or select "All CGs" to view data across all groups
              </li>
              <li>
                <strong>The page will refresh automatically</strong> and display data for the selected CG
              </li>
              <li>
                <strong>Your selection is saved</strong> - it will persist as you navigate between pages
              </li>
            </ol>

            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
              <div className="flex items-start">
                <RefreshCw className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-900">
                    Auto-Refresh
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    When you switch CGs, the page automatically refreshes to show the correct data. You'll stay on the same page you were viewing.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              🔍 What You'll See
            </h2>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
              "All CGs" View
            </h3>
            <p className="text-gray-700 mb-4">
              When you select "All CGs", you'll see:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
              <li>Combined data from all Construction Groups</li>
              <li>Volunteers, projects, and requests across the entire organization</li>
              <li>Useful for organization-wide reporting and oversight</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
              Specific CG View
            </h3>
            <p className="text-gray-700 mb-4">
              When you select a specific CG (e.g., "CG 01.12"), you'll see:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
              <li>Only volunteers assigned to that CG</li>
              <li>Only projects and crews for that CG</li>
              <li>Only crew change requests for that CG</li>
              <li>Filtered statistics and reports</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              💡 Common Use Cases
            </h2>

            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Managing Multiple CGs
                </h4>
                <p className="text-gray-700 text-sm">
                  If you oversee multiple Construction Groups, use the CG Selector to switch between them quickly without needing separate logins.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Organization-Wide Reports
                </h4>
                <p className="text-gray-700 text-sm">
                  Select "All CGs" when you need to see statistics or export data across the entire organization.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Focused Management
                </h4>
                <p className="text-gray-700 text-sm">
                  Select a specific CG when you need to focus on managing volunteers, requests, or projects for that group only.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              ❓ Frequently Asked Questions
            </h2>

            <div className="space-y-4 mb-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Why don't I see the CG Selector?
                </h4>
                <p className="text-gray-700 text-sm">
                  The CG Selector is only visible to SUPER_ADMIN users. Regular users automatically see data for their assigned Construction Group and don't need to switch.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Does my CG selection affect other users?
                </h4>
                <p className="text-gray-700 text-sm">
                  No, your CG selection is personal to your session. Other users won't see any changes based on your selection.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Will my selection be remembered?
                </h4>
                <p className="text-gray-700 text-sm">
                  Yes, your CG selection is saved and will persist even if you log out and log back in. You can change it anytime using the dropdown.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Can I view data from multiple CGs at once?
                </h4>
                <p className="text-gray-700 text-sm">
                  Yes, select "All CGs" to see combined data from all Construction Groups. This is useful for organization-wide reporting.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  What happens if I switch CGs while editing something?
                </h4>
                <p className="text-gray-700 text-sm">
                  The page will refresh when you switch CGs, so it's best to save any changes before switching. Unsaved changes may be lost.
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
              <div className="flex items-start">
                <Filter className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">
                    Data Isolation
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Each Construction Group's data is completely isolated. Regular users can only see data for their assigned CG, ensuring proper data security and privacy.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              📞 Need More Help?
            </h2>
            <p className="text-gray-700 mb-4">
              If you have questions about the CG Selector or multi-tenant features:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
              <li>Contact your system administrator</li>
              <li>Use the "Send Feedback" button in the app</li>
              <li>Check the <Link href="/help" className="text-blue-600 hover:text-blue-800 underline">Help Center</Link> for more guides</li>
            </ul>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link
              href="/help"
              className="inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              ← Back to Help Center
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
