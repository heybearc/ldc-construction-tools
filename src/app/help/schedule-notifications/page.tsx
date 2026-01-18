'use client';

import Link from 'next/link';

export default function ScheduleNotificationsHelpPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
        <Link href="/help" className="hover:text-blue-600">Help Center</Link>
        <span>/</span>
        <span>Schedule Change Notifications</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📅 Schedule Change Notifications</h1>
        <p className="text-gray-600">
          Keep your team informed when project schedules are updated.
        </p>
      </div>

      {/* Overview */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-blue-900 mb-3">📋 Overview</h2>
        <p className="text-blue-800 mb-3">
          When you update a project schedule, you can now automatically notify everyone who needs to know:
        </p>
        <ul className="text-blue-800 space-y-2 ml-4">
          <li>• Send email notifications to specific roles</li>
          <li>• Create announcements visible to the team</li>
          <li>• Choose exactly who gets notified</li>
          <li>• Include a description of what changed</li>
        </ul>
      </div>

      {/* How to Use */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">🎯 How to Send Schedule Notifications</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Step-by-Step Guide</h3>
            <ol className="text-gray-700 ml-4 space-y-3">
              <li>
                <strong>1. Update Your Project Schedule</strong>
                <p className="text-gray-600 mt-1">Make your schedule changes as usual (add/edit/remove schedule entries).</p>
              </li>
              <li>
                <strong>2. Save Your Changes</strong>
                <p className="text-gray-600 mt-1">After saving, you'll see the Schedule Change Notification modal.</p>
              </li>
              <li>
                <strong>3. Describe What Changed</strong>
                <p className="text-gray-600 mt-1">Write a clear description of the changes (e.g., "Moved drywall installation from Week 3 to Week 4 due to material delays").</p>
              </li>
              <li>
                <strong>4. Choose to Send Notifications (Optional)</strong>
                <p className="text-gray-600 mt-1">Check the "Send email notifications" box if you want to notify people via email.</p>
              </li>
              <li>
                <strong>5. Select Who to Notify</strong>
                <p className="text-gray-600 mt-1">Check the boxes next to the roles that should be notified (e.g., Project Coordinator, Safety Coordinator, Crew Members).</p>
              </li>
              <li>
                <strong>6. Review Recipient Count</strong>
                <p className="text-gray-600 mt-1">The modal shows how many people will receive the notification.</p>
              </li>
              <li>
                <strong>7. Send</strong>
                <p className="text-gray-600 mt-1">Click "Create & Notify" to send the notifications and create the announcement.</p>
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* What Gets Sent */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">📧 What Recipients Receive</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Email Notification Includes:</h3>
            <ul className="text-gray-700 ml-4 space-y-2">
              <li>• Project name</li>
              <li>• Description of what changed</li>
              <li>• Schedule version name</li>
              <li>• Who made the change</li>
              <li>• Link to view the updated schedule</li>
              <li>• Their role on the project</li>
            </ul>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <p className="text-blue-900 font-medium mb-2">Example Email Subject:</p>
            <p className="text-blue-800">"Schedule Update: Kingdom Hall Construction - Riverside"</p>
          </div>
        </div>
      </div>

      {/* Who Gets Notified */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">👥 Who Gets Notified</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Role-Based Notifications</h3>
            <p className="text-gray-700 mb-3">
              You can select which roles to notify. Common roles include:
            </p>
            <ul className="text-gray-700 ml-4 space-y-1">
              <li>• Project Construction Coordinator (PCC)</li>
              <li>• Safety Coordinator (SC)</li>
              <li>• Trade Team Overseers (TTO)</li>
              <li>• Project Staffing Contact (PSC)</li>
              <li>• And any other project-specific roles</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Crew Members</h3>
            <p className="text-gray-700">
              All crew members assigned to the project are automatically included in notifications, regardless of role selection.
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              <strong>💡 Smart Filtering:</strong> The system automatically removes duplicate recipients, so if someone has multiple roles, they only get one email.
            </p>
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">✨ Best Practices</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Writing Good Change Descriptions</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-green-700 font-medium">✅ Good Example:</p>
                <p className="text-gray-700 italic">"Moved electrical rough-in from Week 2 to Week 3 due to delayed permit approval. All other trades remain on schedule."</p>
              </div>
              <div>
                <p className="text-red-700 font-medium">❌ Poor Example:</p>
                <p className="text-gray-700 italic">"Changed some dates"</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">When to Send Notifications</h3>
            <ul className="text-gray-700 ml-4 space-y-2">
              <li>• <strong>Always notify</strong> for major date changes</li>
              <li>• <strong>Always notify</strong> when work order changes</li>
              <li>• <strong>Consider notifying</strong> for minor adjustments</li>
              <li>• <strong>Skip notifications</strong> for typo fixes or formatting changes</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Choosing Recipients</h3>
            <ul className="text-gray-700 ml-4 space-y-2">
              <li>• Notify coordinators for all schedule changes</li>
              <li>• Notify specific trade teams if their work is affected</li>
              <li>• Notify safety coordinator if safety-related changes occur</li>
              <li>• Consider the impact - who needs to adjust their plans?</li>
            </ul>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">❓ Common Questions</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Can I skip sending notifications?</h3>
            <p className="text-gray-700">
              Yes! Simply leave the "Send email notifications" box unchecked. An announcement will still be created in the system, but no emails will be sent.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">What if I forget to send a notification?</h3>
            <p className="text-gray-700">
              You can always send a notification later by accessing the schedule notification feature again. Just describe what changed and select your recipients.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Can I see who was notified?</h3>
            <p className="text-gray-700">
              The modal shows you the recipient count before sending. After sending, the announcement is created in the system with the notification details.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">What if someone didn't receive the email?</h3>
            <p className="text-gray-700 mb-2">
              Common reasons:
            </p>
            <ul className="text-gray-700 ml-4 space-y-1">
              <li>• Email in spam folder</li>
              <li>• User doesn't have an email address in the system</li>
              <li>• User isn't assigned to the project in that role</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Who can send schedule notifications?</h3>
            <p className="text-gray-700">
              Anyone who can edit project schedules can send notifications. This typically includes Project Coordinators and Schedule Managers.
            </p>
          </div>
        </div>
      </div>

      {/* Related Help */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">📚 Related Help Topics</h2>
        <div className="space-y-2">
          <Link href="/help/projects" className="block text-blue-600 hover:text-blue-800">
            → Managing Projects
          </Link>
          <Link href="/help/schedules" className="block text-blue-600 hover:text-blue-800">
            → Project Schedules
          </Link>
          <Link href="/help" className="block text-blue-600 hover:text-blue-800">
            → Back to Help Center
          </Link>
        </div>
      </div>
    </div>
  );
}
