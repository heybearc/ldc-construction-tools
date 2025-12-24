'use client';

import { Building2, Users, Wrench, FolderKanban, Briefcase, Star } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function VolunteerRolesHelpPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          📋 Volunteer Organizational Roles
        </h1>
        <p className="text-lg text-gray-600">
          Learn how to assign and manage multiple organizational roles for volunteers in your Construction Group.
        </p>
      </div>

      {/* Overview */}
      <section className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">📖 Overview</h2>
        <p className="text-gray-700 mb-4">
          The Volunteer Roles system allows you to assign multiple organizational responsibilities to volunteers beyond their trade team or crew assignments. This helps track regional roles, project-specific assignments, and Construction Group oversight positions.
        </p>
        <div className="bg-white rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-gray-600">
            <strong>Key Benefits:</strong>
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
            <li>Track volunteers with multiple responsibilities</li>
            <li>Identify regional and project-specific contacts</li>
            <li>Distinguish between primary and secondary roles</li>
            <li>Link roles to specific teams, crews, or projects</li>
          </ul>
        </div>
      </section>

      {/* Role Categories */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">🏷️ Role Categories</h2>
        <p className="text-gray-700 mb-4">
          Roles are organized into five categories, each with a distinct color for easy identification:
        </p>

        <div className="space-y-4">
          {/* CG Oversight */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Building2 className="h-5 w-5 text-purple-600 mr-2" />
              <h3 className="text-lg font-semibold text-purple-900">CG Oversight</h3>
              <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">Purple</span>
            </div>
            <p className="text-sm text-gray-700 mb-2">
              Construction Group leadership and support roles
            </p>
            <p className="text-xs text-gray-600">
              <strong>Examples:</strong> CGO, ACGO, CG Support
            </p>
          </div>

          {/* CG Staff */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Briefcase className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-blue-900">CG Staff</h3>
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">Blue</span>
            </div>
            <p className="text-sm text-gray-700 mb-2">
              Construction Group staff and regional support services
            </p>
            <p className="text-xs text-gray-600">
              <strong>Examples:</strong> CG Members, Safety Coordinator, PCC, Regulatory Consultant, Estimator, Scheduler, Personnel Contact, Housing Contact, Equipment Management, Sourcing Buyer, Training Organizer
            </p>
          </div>

          {/* Trade Team */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Users className="h-5 w-5 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-green-900">Trade Team</h3>
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">Green</span>
            </div>
            <p className="text-sm text-gray-700 mb-2">
              Trade team leadership and support roles
            </p>
            <p className="text-xs text-gray-600">
              <strong>Examples:</strong> TTO, TTOA, TT Support
            </p>
          </div>

          {/* Trade Crew */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Wrench className="h-5 w-5 text-amber-600 mr-2" />
              <h3 className="text-lg font-semibold text-amber-900">Trade Crew</h3>
              <span className="ml-2 px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded">Amber</span>
            </div>
            <p className="text-sm text-gray-700 mb-2">
              Trade crew leadership and member roles
            </p>
            <p className="text-xs text-gray-600">
              <strong>Examples:</strong> TCO, TCOA, TC Support, Crew Volunteer
            </p>
          </div>

        </div>
      </section>

      {/* How to Assign Roles */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">➕ How to Assign Roles</h2>
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Step-by-Step Instructions:</h3>
          
          <ol className="space-y-4">
            <li className="flex">
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full font-semibold mr-3">1</span>
              <div>
                <p className="font-medium text-gray-900">Open Volunteer Editor</p>
                <p className="text-sm text-gray-600">Go to the Volunteers page and click the Edit button (pencil icon) on any volunteer card.</p>
              </div>
            </li>

            <li className="flex">
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full font-semibold mr-3">2</span>
              <div>
                <p className="font-medium text-gray-900">Find Organizational Roles Section</p>
                <p className="text-sm text-gray-600">Scroll down to the "Organizational Roles" section in the edit modal.</p>
              </div>
            </li>

            <li className="flex">
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full font-semibold mr-3">3</span>
              <div>
                <p className="font-medium text-gray-900">Click "Add Role"</p>
                <p className="text-sm text-gray-600">Click the blue "Add Role" button to open the role assignment dialog.</p>
              </div>
            </li>

            <li className="flex">
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full font-semibold mr-3">4</span>
              <div>
                <p className="font-medium text-gray-900">Select Role Category</p>
                <p className="text-sm text-gray-600">Choose the appropriate category (CG Oversight, Construction Staff, etc.).</p>
              </div>
            </li>

            <li className="flex">
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full font-semibold mr-3">5</span>
              <div>
                <p className="font-medium text-gray-900">Select Specific Role</p>
                <p className="text-sm text-gray-600">Choose the specific role from the dropdown (e.g., "Construction Field Rep").</p>
              </div>
            </li>

            <li className="flex">
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full font-semibold mr-3">6</span>
              <div>
                <p className="font-medium text-gray-900">Link to Entity (Optional)</p>
                <p className="text-sm text-gray-600">If the role is for a specific team, crew, or project, select the entity type and enter the ID.</p>
              </div>
            </li>

            <li className="flex">
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full font-semibold mr-3">7</span>
              <div>
                <p className="font-medium text-gray-900">Mark as Primary (Optional)</p>
                <p className="text-sm text-gray-600">Check "Primary role" if this is the volunteer's main responsibility.</p>
              </div>
            </li>

            <li className="flex">
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full font-semibold mr-3">8</span>
              <div>
                <p className="font-medium text-gray-900">Assign Role</p>
                <p className="text-sm text-gray-600">Click "Assign Role" to save. The role will appear in the volunteer's role list.</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* Understanding Role Badges */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">🏷️ Understanding Role Badges</h2>
        
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">What You'll See:</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center">
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                  CFR
                </span>
                <span>Role code for quick identification</span>
              </li>
              <li className="flex items-center">
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                  CFR <Star className="h-3 w-3 ml-0.5" />
                </span>
                <span>Star (★) indicates this is a primary role</span>
              </li>
              <li className="flex items-center">
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 mr-2">
                  +2
                </span>
                <span>Additional roles not shown (click volunteer to see all)</span>
              </li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">💡 Tip:</h3>
            <p className="text-sm text-yellow-800">
              In grid view, up to 3 roles are shown. In list view, up to 2 roles are shown. Click "Edit" on any volunteer to see all assigned roles.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">❓ Frequently Asked Questions</h2>
        
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Can a volunteer have multiple roles?</h3>
            <p className="text-sm text-gray-700">
              Yes! Volunteers can have as many organizational roles as needed. For example, someone might be both a Field Rep and a Housing Contact.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">What does "Primary" role mean?</h3>
            <p className="text-sm text-gray-700">
              A primary role is the volunteer's main responsibility. This helps identify which role takes priority when someone has multiple assignments. Primary roles are marked with a star (★).
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">When should I link a role to an entity?</h3>
            <p className="text-sm text-gray-700">
              Link roles to entities when the assignment is specific to a team, crew, or project. For example, a Project Staffing Contact should be linked to the specific project they're coordinating.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">How do I remove a role?</h3>
            <p className="text-sm text-gray-700">
              Open the volunteer editor, find the role in the "Organizational Roles" section, and click the X button next to the role you want to remove.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">What's the difference between trade team roles and organizational roles?</h3>
            <p className="text-sm text-gray-700">
              Trade team/crew assignments (in the "Role and Assignment" section) are for hands-on construction work. Organizational roles (in the "Organizational Roles" section) are for regional coordination, project management, and Construction Group oversight.
            </p>
          </div>
        </div>
      </section>

      {/* Related Help */}
      <section className="mb-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">📚 Related Help Topics</h2>
        <ul className="space-y-2">
          <li>
            <Link href="/help/volunteers" className="text-blue-600 hover:text-blue-800 hover:underline">
              → Managing Volunteers
            </Link>
          </li>
          <li>
            <Link href="/help/trade-teams" className="text-blue-600 hover:text-blue-800 hover:underline">
              → Trade Teams & Crews
            </Link>
          </li>
          <li>
            <Link href="/help" className="text-blue-600 hover:text-blue-800 hover:underline">
              → Back to Help Center
            </Link>
          </li>
        </ul>
      </section>

      {/* Need More Help */}
      <section className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-900 mb-2">📞 Need More Help?</h2>
        <p className="text-blue-800 mb-4">
          If you have questions about volunteer roles or need assistance, contact your Construction Group Overseer or system administrator.
        </p>
        <Link
          href="/help"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Back to Help Center
        </Link>
      </section>
    </div>
  );
}
