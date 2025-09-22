import dynamic from 'next/dynamic';

// Completely disable SSR for the entire signin page
const SignInPage = dynamic(() => import('./SignInClient'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-sm">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Loading Sign In...
          </h2>
          <div className="mt-4">
            <div className="animate-pulse bg-gray-200 h-4 w-32 mx-auto rounded"></div>
          </div>
        </div>
      </div>
    </div>
  ),
});

export default function SignIn() {
  return <SignInPage />;
}
