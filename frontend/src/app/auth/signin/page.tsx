import { Suspense } from 'react'
import Image from 'next/image'
import SignInForm from './SignInForm'

// Modern Next.js 15 App Router pattern
export default function SignInPage() {
  return (
    <div className="p-8 bg-white rounded-lg shadow-sm">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Image 
            src="/logo.svg" 
            alt="LDC Logo" 
            width={96} 
            height={96}
            priority
          />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Sign in to LDC Tools
        </h2>
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
