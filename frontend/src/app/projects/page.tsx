import React from 'react'
import ProjectsOverview from '@/components/ProjectsOverview'

export default function ProjectsPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="mt-2 text-gray-600">
            Construction projects and trade crew assignments
          </p>
        </div>
      </div>
      
      <ProjectsOverview />
    </div>
  )
}
