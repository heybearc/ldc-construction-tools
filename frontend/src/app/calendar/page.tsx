'use client'

import React from 'react'
import ProjectCalendar from '@/components/ProjectCalendar'

export default function CalendarPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Calendar</h1>
          <p className="mt-2 text-gray-600">
            Construction Group project scheduling and trade crew assignments
          </p>
        </div>
      </div>
      
      <ProjectCalendar />
    </div>
  )
}
