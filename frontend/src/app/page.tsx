import React from 'react'
import TradeTeamsOverview from '@/components/TradeTeamsOverview'

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trade Teams Overview</h1>
          <p className="mt-2 text-gray-600">
            Construction Group 01.12 organizational structure and crew management
          </p>
        </div>
      </div>
      
      <TradeTeamsOverview />
    </div>
  )
}
