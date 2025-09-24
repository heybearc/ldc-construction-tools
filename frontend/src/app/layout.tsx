import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import AuthProvider from '../components/AuthProvider'
import ConditionalLayout from '../components/ConditionalLayout'
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
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </AuthProvider>
      </body>
    </html>
  )
}
