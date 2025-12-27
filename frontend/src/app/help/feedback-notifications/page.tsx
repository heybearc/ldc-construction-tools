'use client';

import Link from 'next/link';

export default function FeedbackNotificationsHelpPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
        <Link href="/help" className="hover:text-blue-600">Help Center</Link>
        <span>/</span>
        <span>Feedback Notifications</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🔔 Feedback Notifications</h1>
        <p className="text-gray-600">
          Stay updated on your feedback with email notifications and in-app alerts.
        </p>
      </div>

      {/* Overview */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-blue-900 mb-3">📋 What's New</h2>
        <p className="text-blue-800 mb-3">
          We've added a comprehensive notification system to keep you informed about your feedback:
        </p>
        <ul className="text-blue-800 space-y-2 ml-4">
          <li>• <strong>Email Notifications</strong> when your feedback status changes</li>
          <li>• <strong>Email Notifications</strong> when admins comment on your feedback</li>
          <li>• <strong>In-App Banner Alerts</strong> for recent updates</li>
          <li>• <strong>Screenshot Paste</strong> directly into feedback forms</li>
        </ul>
      </div>

      {/* Email Notifications */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">📧 Email Notifications</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Status Change Notifications</h3>
            <p className="text-gray-700 mb-3">
              You'll receive an email whenever an admin changes the status of your feedback:
            </p>
            <ul className="text-gray-700 ml-4 space-y-2">
              <li>• <strong>NEW → IN_PROGRESS:</strong> Your feedback is being reviewed</li>
              <li>• <strong>IN_PROGRESS → RESOLVED:</strong> Your issue has been fixed</li>
              <li>• <strong>RESOLVED → CLOSED:</strong> The fix is complete and verified</li>
            </ul>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-3">
              <p className="text-sm text-gray-700">
                <strong>What you'll see:</strong> The email shows the old status, new status, and includes a link to view your feedback.
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Comment Notifications</h3>
            <p className="text-gray-700 mb-3">
              When an admin adds a comment to your feedback, you'll get an email with:
            </p>
            <ul className="text-gray-700 ml-4 space-y-2">
              <li>• The admin's name who commented</li>
              <li>• The full text of their comment</li>
              <li>• A link to view and reply to the feedback</li>
            </ul>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
              <p className="text-sm text-green-800">
                <strong>💡 Tip:</strong> You won't receive an email if you comment on your own feedback.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* In-App Banner */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">🔔 In-App Banner Alerts</h2>
        
        <p className="text-gray-700 mb-4">
          A blue notification banner appears at the top of the page when you have feedback updates:
        </p>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">🔔</span>
            <div>
              <p className="text-blue-900 font-medium">Example: Admin commented on your feedback: "Bug in crew request form"</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">What You'll See</h3>
            <ul className="text-gray-700 ml-4 space-y-2">
              <li>• Bell icon (🔔) to indicate a notification</li>
              <li>• Description of what changed</li>
              <li>• "View Feedback" link to see details</li>
              <li>• X button to dismiss the notification</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">How It Works</h3>
            <ul className="text-gray-700 ml-4 space-y-2">
              <li>• Checks for updates every 5 minutes automatically</li>
              <li>• Shows status changes and new comments</li>
              <li>• Dismissed notifications stay hidden (saved in your browser)</li>
              <li>• Appears on all pages when you have updates</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Screenshot Paste */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">📸 Paste Screenshots Directly</h2>
        
        <p className="text-gray-700 mb-4">
          You can now paste screenshots directly into feedback forms without saving them first!
        </p>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">How to Use</h3>
            <ol className="text-gray-700 ml-4 space-y-2">
              <li>1. Take a screenshot (Cmd+Shift+4 on Mac, Windows+Shift+S on Windows)</li>
              <li>2. Click in the Description field of the feedback form</li>
              <li>3. Press <strong>Ctrl+V</strong> (Windows) or <strong>Cmd+V</strong> (Mac)</li>
              <li>4. Your screenshot appears in a preview grid below the description</li>
            </ol>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Features</h3>
            <ul className="text-gray-700 ml-4 space-y-2">
              <li>• Paste multiple screenshots</li>
              <li>• See previews of all pasted images</li>
              <li>• Remove unwanted screenshots with the X button</li>
              <li>• Screenshots are automatically included in your feedback</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Note:</strong> Screenshots are embedded in your feedback description. Make sure they don't contain sensitive information!
            </p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">❓ Common Questions</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Can I turn off email notifications?</h3>
            <p className="text-gray-700">
              Currently, email notifications are sent automatically when your feedback is updated. This ensures you never miss important updates about issues you've reported.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Why didn't I receive an email?</h3>
            <p className="text-gray-700 mb-2">
              Check these common reasons:
            </p>
            <ul className="text-gray-700 ml-4 space-y-1">
              <li>• Email may be in your spam folder</li>
              <li>• Status didn't actually change (admin clicked save without changes)</li>
              <li>• You commented on your own feedback (no self-notifications)</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">How do I dismiss the banner notification?</h3>
            <p className="text-gray-700">
              Click the X button on the right side of the banner. It will stay dismissed until you have new updates.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Can I paste screenshots from my phone?</h3>
            <p className="text-gray-700">
              Screenshot paste works best on desktop computers. On mobile devices, you can still attach images using the file upload option (if available).
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Where can I see all my feedback?</h3>
            <p className="text-gray-700">
              Click <strong>Help → My Feedback</strong> in the navigation menu to see all feedback you've submitted and their current status.
            </p>
          </div>
        </div>
      </div>

      {/* Related Help */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">📚 Related Help Topics</h2>
        <div className="space-y-2">
          <Link href="/help/feedback" className="block text-blue-600 hover:text-blue-800">
            → How to Submit Feedback
          </Link>
          <Link href="/help/my-feedback" className="block text-blue-600 hover:text-blue-800">
            → View My Feedback
          </Link>
          <Link href="/help" className="block text-blue-600 hover:text-blue-800">
            → Back to Help Center
          </Link>
        </div>
      </div>
    </div>
  );
}
