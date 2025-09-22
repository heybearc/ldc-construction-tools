import { Suspense } from 'react';
import SignInForm from './SignInForm';

export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-sm">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Sign in to LDC Construction Tools
          </h2>
          <p className="text-gray-600">
            Region 01.12
          </p>
        </div>
        
        <Suspense fallback={<div className="animate-pulse bg-gray-200 h-32 rounded"></div>}>
          <SignInForm />
        </Suspense>
      </div>
    </div>
  );
}
