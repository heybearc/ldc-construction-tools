'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CrewRequestsHelpPage() {
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
            📝 Crew Change Requests
          </h1>
          <p className="text-gray-600">
            Submit and manage requests to add or remove volunteers from crews and project rosters
          </p>
        </div>

        {/* Overview */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📋 What are Crew Requests?</h2>
          <p className="text-gray-700 mb-4">
            Crew Change Requests allow you to formally request changes to volunteer assignments in trade crews and project rosters. The personnel team reviews and processes these requests to ensure proper coordination and documentation.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This is a tracking and notification system. Requests are processed manually by the personnel team after review.
            </p>
          </div>
        </div>

        {/* Request Types */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📑 Types of Requests</h2>
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">➕ Add Volunteer to Crew</h3>
              <p className="text-sm text-gray-700">
                Request to add a volunteer to a specific trade crew (e.g., Carpentry, Electrical).
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">➖ Remove Volunteer from Crew</h3>
              <p className="text-sm text-gray-700">
                Request to remove a volunteer from their current trade crew assignment.
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">📋 Add Volunteer to Project Roster</h3>
              <p className="text-sm text-gray-700">
                Request to add a volunteer to a specific project roster for temporary assignment.
              </p>
            </div>
          </div>
        </div>

        {/* Submitting a Request */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">✍️ How to Submit a Request</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Step 1: Access the Form</h3>
              <p className="text-gray-700 mb-2">
                Click <strong>Submit Crew Request</strong> from the dashboard or navigation menu.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Step 2: Select Request Type</h3>
              <p className="text-gray-700 mb-2">
                Choose the type of change you're requesting from the dropdown.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Step 3: Enter Volunteer Information</h3>
              <ul className="text-gray-700 ml-4 space-y-1">
                <li>• <strong>Volunteer Name:</strong> Full name of the volunteer</li>
                <li>• <strong>BA ID:</strong> Builder Assistant ID number (if available)</li>
              </ul>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
                <p className="text-sm text-green-800">
                  <strong>💡 Tip:</strong> You can add multiple volunteers in one submission! Click "Add Another Volunteer" to submit batch requests.
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Step 4: Select Crew or Project</h3>
              <p className="text-gray-700 mb-2">
                Choose the trade team, crew, or project roster for the assignment.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Step 5: Add Comments (Optional)</h3>
              <p className="text-gray-700 mb-2">
                Provide any additional context or special instructions for the personnel team.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Step 6: Submit on Behalf Of (Optional)</h3>
              <p className="text-gray-700 mb-2">
                If you have permission, you can submit requests on behalf of another person. Enter their name and email to receive the completion notification.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Step 7: Submit</h3>
              <p className="text-gray-700">
                Click <strong>Submit Request</strong>. You'll see a confirmation message and receive an email when the request is completed.
              </p>
            </div>
          </div>
        </div>

        {/* Managing Requests */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 Managing Requests (Personnel Team)</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Viewing Requests</h3>
              <p className="text-gray-700 mb-2">
                Go to <strong>Crew Requests</strong> → <strong>Manage Requests</strong> to see all submitted requests.
              </p>
              <ul className="text-gray-700 ml-4 space-y-1">
                <li>• <strong>New:</strong> Just submitted, awaiting review</li>
                <li>• <strong>In Progress:</strong> Currently being processed</li>
                <li>• <strong>Completed:</strong> Finished and requestor notified</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Assigning Requests</h3>
              <p className="text-gray-700 mb-2">
                Use the <strong>"Assign to..."</strong> dropdown to assign a request to a personnel team member.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                <p className="text-sm text-blue-800">
                  <strong>✨ New:</strong> You can now see who each request is assigned to! Look for "Assigned to: [Name]" below each request.
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Completing Requests</h3>
              <ol className="text-gray-700 ml-4 space-y-2">
                <li>1. Click the <strong>Complete</strong> button on the request</li>
                <li>2. Add resolution notes (optional) explaining what was done</li>
                <li>3. ✅ Check <strong>"Send completion notification email"</strong> to notify the requestor</li>
                <li>4. Click <strong>Mark Complete</strong></li>
              </ol>
              <p className="text-gray-700 mt-2">
                The requestor will receive an email with the completion details if the notification box is checked.
              </p>
            </div>
          </div>
        </div>

        {/* CG Project Integration */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🔗 CG Project Integration</h2>
          <p className="text-gray-700 mb-4">
            The crew request page includes instructions for adding volunteers to your Construction Group Project system. Click <strong>"Open CG Project"</strong> to access the external system where you can:
          </p>
          <ul className="text-gray-700 ml-4 space-y-2">
            <li>• Add the volunteer to the required crew in the CG Project system</li>
            <li>• Adjust their skill level based on recent assessments</li>
            <li>• Assign them to the same crew that was requested</li>
          </ul>
        </div>

        {/* Common Questions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">❓ Common Questions</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Q: How long does it take to process a request?</h3>
              <p className="text-gray-700">
                Processing time varies based on the personnel team's workload. You'll receive an email notification when your request is completed.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Q: Can I submit multiple volunteers at once?</h3>
              <p className="text-gray-700">
                Yes! Click "Add Another Volunteer" to add multiple volunteers to the same request. They'll be grouped together for easier tracking.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Q: Who can submit requests?</h3>
              <p className="text-gray-700">
                All users can submit crew requests. Personnel Contacts and administrators can also submit requests on behalf of others.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Q: Can I cancel a request after submitting?</h3>
              <p className="text-gray-700">
                Contact your personnel team to cancel or modify a request. They can update the status or add notes to the request.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Q: What if I don't receive a completion email?</h3>
              <p className="text-gray-700">
                Check your spam folder first. If you still don't see it, the personnel team member may not have checked the notification box when completing the request. Contact them directly for an update.
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
              <span>Include the volunteer's BA ID when available for faster processing</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Add comments to provide context or special circumstances</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Use batch submissions for multiple volunteers going to the same crew</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Personnel team: Always check the email notification box when completing requests</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Assign requests to team members for better workload distribution</span>
            </li>
          </ul>
        </div>

        {/* Need Help */}
        <div className="bg-gray-100 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">📞 Need More Help?</h2>
          <div className="space-y-2 text-gray-700">
            <p>
              <Link href="/help" className="text-blue-600 hover:text-blue-800">
                ← Back to Help Center
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
