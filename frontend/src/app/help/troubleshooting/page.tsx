import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth-config'
import HelpLayout from '@/components/HelpLayout'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function TroubleshootingHelpPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <HelpLayout title="Troubleshooting">
      <div className="max-w-4xl mx-auto">
        <nav className="mb-6 text-sm">
          <Link href="/help" className="text-blue-600 hover:text-blue-800">Help Center</Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-600">Troubleshooting</span>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">🔧 Troubleshooting</h1>

        <div className="prose prose-lg max-w-none">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-blue-900 mt-0 mb-3">Quick Help</h2>
            <p className="text-blue-800 mb-0">
              Find solutions to common issues. If you can't find what you're looking for, use the <Link href="/help/feedback" className="text-blue-600 underline">Send Feedback</Link> feature to report the problem.
            </p>
          </div>

          <h2>🔐 Login Issues</h2>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
            <h4 className="font-semibold text-red-900 mt-0">Problem: Can't log in</h4>
            <p className="text-red-800 mb-2"><strong>Possible causes:</strong></p>
            <ul className="text-red-700 mb-0">
              <li>Incorrect email or password</li>
              <li>Account not yet activated</li>
              <li>Account has been deactivated</li>
            </ul>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 my-4">
            <h4 className="font-semibold text-green-900 mt-0">Solution:</h4>
            <ol className="text-green-700 mb-0">
              <li>Double-check your email address for typos</li>
              <li>Use the correct password (case-sensitive)</li>
              <li>Check if you received an invitation email</li>
              <li>Contact your administrator if problems persist</li>
            </ol>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
            <h4 className="font-semibold text-red-900 mt-0">Problem: Session expired unexpectedly</h4>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 my-4">
            <h4 className="font-semibold text-green-900 mt-0">Solution:</h4>
            <ol className="text-green-700 mb-0">
              <li>Sessions expire after 24 hours of inactivity</li>
              <li>Simply log in again</li>
              <li>Check if you're using a private/incognito browser (sessions don't persist)</li>
            </ol>
          </div>

          <h2>🌐 Page Loading Issues</h2>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
            <h4 className="font-semibold text-red-900 mt-0">Problem: Page won't load or shows error</h4>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 my-4">
            <h4 className="font-semibold text-green-900 mt-0">Solution:</h4>
            <ol className="text-green-700 mb-0">
              <li><strong>Refresh the page</strong> - Press F5 or click the refresh button</li>
              <li><strong>Clear browser cache</strong> - Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)</li>
              <li><strong>Try a different browser</strong> - Chrome, Firefox, Safari, or Edge</li>
              <li><strong>Check your internet connection</strong></li>
              <li><strong>Wait a few minutes</strong> - The server may be updating</li>
            </ol>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
            <h4 className="font-semibold text-red-900 mt-0">Problem: Page looks broken or unstyled</h4>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 my-4">
            <h4 className="font-semibold text-green-900 mt-0">Solution:</h4>
            <ol className="text-green-700 mb-0">
              <li>Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)</li>
              <li>Clear your browser cache completely</li>
              <li>Disable browser extensions temporarily</li>
              <li>Try incognito/private mode</li>
            </ol>
          </div>

          <h2>📝 Data Entry Issues</h2>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
            <h4 className="font-semibold text-red-900 mt-0">Problem: Can't save changes</h4>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 my-4">
            <h4 className="font-semibold text-green-900 mt-0">Solution:</h4>
            <ol className="text-green-700 mb-0">
              <li>Check for required fields (marked with *)</li>
              <li>Look for validation error messages</li>
              <li>Ensure you have permission to edit</li>
              <li>Check your internet connection</li>
              <li>Try refreshing and entering data again</li>
            </ol>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
            <h4 className="font-semibold text-red-900 mt-0">Problem: Data not appearing after save</h4>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 my-4">
            <h4 className="font-semibold text-green-900 mt-0">Solution:</h4>
            <ol className="text-green-700 mb-0">
              <li>Refresh the page</li>
              <li>Check if filters are hiding the data</li>
              <li>Clear any search terms</li>
              <li>Check the correct section/tab</li>
            </ol>
          </div>

          <h2>🔍 Search and Filter Issues</h2>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
            <h4 className="font-semibold text-red-900 mt-0">Problem: Can't find expected results</h4>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 my-4">
            <h4 className="font-semibold text-green-900 mt-0">Solution:</h4>
            <ol className="text-green-700 mb-0">
              <li>Check spelling of search terms</li>
              <li>Try partial names (first or last name only)</li>
              <li>Clear all filters and try again</li>
              <li>Check if viewing "Active" only vs "All"</li>
              <li>Verify the data exists in the system</li>
            </ol>
          </div>

          <h2>📧 Email Issues</h2>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
            <h4 className="font-semibold text-red-900 mt-0">Problem: Not receiving invitation emails</h4>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 my-4">
            <h4 className="font-semibold text-green-900 mt-0">Solution:</h4>
            <ol className="text-green-700 mb-0">
              <li>Check your spam/junk folder</li>
              <li>Verify the email address is correct</li>
              <li>Ask admin to resend the invitation</li>
              <li>Add ldctools.com to your safe senders list</li>
            </ol>
          </div>

          <h2>🖥️ Browser Compatibility</h2>
          
          <div className="bg-gray-50 rounded-lg p-4 my-4">
            <h4 className="font-semibold text-gray-900 mt-0">Supported Browsers</h4>
            <ul className="mb-0">
              <li>✅ Google Chrome (recommended)</li>
              <li>✅ Mozilla Firefox</li>
              <li>✅ Apple Safari</li>
              <li>✅ Microsoft Edge</li>
              <li>❌ Internet Explorer (not supported)</li>
            </ul>
          </div>

          <p><strong>Tip:</strong> Always use the latest version of your browser for best performance.</p>

          <h2>📱 Mobile Device Issues</h2>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-4">
            <h4 className="font-semibold text-yellow-900 mt-0">Note about Mobile</h4>
            <p className="text-yellow-700 mb-0">LDC Tools is optimized for desktop use. While it works on mobile devices, some features may be easier to use on a larger screen.</p>
          </div>

          <h2>🆘 Still Need Help?</h2>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 my-4">
            <h4 className="font-semibold text-blue-900 mt-0">Before Contacting Support</h4>
            <p className="text-blue-700 mb-2">Please gather this information:</p>
            <ul className="text-blue-700 mb-0">
              <li>What you were trying to do</li>
              <li>What happened (error message if any)</li>
              <li>What browser you're using</li>
              <li>Screenshots if possible</li>
            </ul>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 my-8">
            <h3 className="text-lg font-semibold text-gray-900 mt-0 mb-3">💡 Get More Help</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/help/feedback" className="text-blue-600 hover:text-blue-800">
                💡 Send Feedback / Report Bug
              </Link>
              <Link href="/help/authentication" className="text-blue-600 hover:text-blue-800">
                🔐 Login & Security Help
              </Link>
              <Link href="/help/getting-started" className="text-blue-600 hover:text-blue-800">
                🚀 Getting Started Guide
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
