import { Suspense } from 'react'
import SignInForm from './SignInForm'

// Modern Next.js 15 App Router pattern
export default function SignInPage() {
  return (
    <div className="p-8 bg-white rounded-lg shadow-sm">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Sign in to LDC Construction Tools
        </h2>
        <p className="text-gray-600">
          Region 01.12
        </p>
      </div>
      
      <Suspense fallback={
        <div className="space-y-4">
          <div className="animate-pulse bg-gray-200 h-10 rounded"></div>
          <div className="animate-pulse bg-gray-200 h-10 rounded"></div>
          <div className="animate-pulse bg-gray-200 h-10 rounded"></div>
        </div>
      }>
        <SignInForm />
      </Suspense>
    </div>
  )
}
