import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import AuthProvider from '../components/AuthProvider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LDC Construction Tools',
  description: 'Construction Group coordination and trade team management for LDC Region 01.12',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b border-gray-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                  <div className="flex items-center">
                    <h1 className="text-2xl font-bold text-gray-900">
                      LDC Construction Tools
                    </h1>
                    <span className="ml-2 text-sm text-gray-500">
                      Region 01.12
                    </span>
                  </div>
                  <nav className="flex space-x-8">
                    <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium">
                      Trade Teams
                    </Link>
                    <Link href="/projects" className="text-gray-700 hover:text-blue-600 font-medium">
                      Projects
                    </Link>
                    <Link href="/calendar" className="text-gray-700 hover:text-blue-600 font-medium">
                      Calendar
                    </Link>
                    <Link href="/volunteers" className="text-gray-700 hover:text-blue-600 font-medium">
                      Volunteers
                    </Link>
                    <Link href="/admin" className="text-gray-700 hover:text-blue-600 font-medium">
                      Admin
                    </Link>
                  </nav>
                </div>
              </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
