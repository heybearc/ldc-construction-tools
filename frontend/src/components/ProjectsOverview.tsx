'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { apiClient, ProjectSummary, ProjectAssignmentSummary } from '@/lib/api'
import ProjectModal from './ProjectModal'

export default function ProjectsOverview() {
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [selectedProject, setSelectedProject] = useState<number | null>(null)
  const [assignments, setAssignments] = useState<ProjectAssignmentSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState<ProjectSummary | null>(null)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const data = await apiClient.getProjects()
      setProjects(data)
    } catch (err) {
      setError('Failed to load projects')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadProjectAssignments = async (projectId: number) => {
    try {
      const data = await apiClient.getProjectAssignments(projectId)
      setAssignments(data)
      setSelectedProject(projectId)
    } catch (err) {
      setError('Failed to load project assignments')
      console.error(err)
    }
  }

  const handleAddProject = () => {
    setEditingProject(null)
    setShowModal(true)
  }

  const handleEditProject = (project: ProjectSummary) => {
    setEditingProject(project)
    setShowModal(true)
  }

  const handleDeleteProject = async (projectId: number) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return
    }

    console.log('🗑️ Starting project deletion...');
    console.log('📊 Project ID:', projectId);

    try {
      console.log('🌐 Calling apiClient.deleteProject...');
      await apiClient.deleteProject(projectId)
      console.log('✅ Project deletion successful');
      
      console.log('🔄 Reloading projects list...');
      await loadProjects()
      
      if (selectedProject === projectId) {
        setSelectedProject(null)
        setAssignments([])
        console.log('🧹 Cleared selected project and assignments');
      }
    } catch (err) {
      console.error('❌ Project deletion failed:', err);
      console.error('❌ Error details:', {
        name: (err as Error).name,
        message: (err as Error).message,
        stack: (err as Error).stack
      });
      setError(`Failed to delete project: ${(err as Error).message}`)
    }
  }

  const handleModalSave = async () => {
    await loadProjects()
  }

  const handleExportProject = async (projectId: number) => {
    try {
      const blob = await apiClient.exportProject(projectId)
      const project = projects.find(p => p.id === projectId)
      const filename = `LDC_Project_${project?.name?.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError('Failed to export project')
      console.error(err)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'planning': return 'badge-yellow'
      case 'active': return 'badge-blue'
      case 'completed': return 'badge-green'
      case 'on hold': return 'badge-red'
      default: return 'badge-blue'
    }
  }

  const getPhaseColor = (phase: string) => {
    const phaseColors: Record<string, string> = {
      'site preparation/clearing': 'bg-orange-100 text-orange-800',
      'construction mobilization/temp services': 'bg-purple-100 text-purple-800',
      'site work': 'bg-yellow-100 text-yellow-800',
      'structural': 'bg-blue-100 text-blue-800',
      'rough-in': 'bg-green-100 text-green-800',
      'finishes': 'bg-indigo-100 text-indigo-800',
      'construction final prep': 'bg-gray-100 text-gray-800'
    }
    return phaseColors[phase?.toLowerCase()] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={loadProjects}
                className="btn-primary text-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Project Management</h2>
          <p className="text-gray-600">Manage construction projects and assignments</p>
        </div>
        <button
          onClick={handleAddProject}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects List */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Projects</h2>
          <div className="space-y-3">
            {projects.length > 0 ? projects.map((project) => (
              <div
                key={project.id}
                className={`p-4 rounded-md cursor-pointer transition-colors ${
                  selectedProject === project.id
                    ? 'bg-primary-50 border border-primary-200'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => loadProjectAssignments(project.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">{project.name}</h3>
                    {project.project_number && (
                      <p className="text-sm text-gray-600">#{project.project_number}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`badge ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                    <div className="flex space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditProject(project)
                        }}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Edit Project"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteProject(project.id)
                        }}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete Project"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleExportProject(project.id)
                        }}
                        className="text-green-600 hover:text-green-800 text-sm p-1"
                        title="Export Project"
                      >
                        📊
                      </button>
                    </div>
                  </div>
                </div>
                
                {project.location && (
                  <p className="text-sm text-gray-600 mb-1">📍 {project.location}</p>
                )}
                
                {project.current_phase && (
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPhaseColor(project.current_phase)}`}>
                    {project.current_phase}
                  </span>
                )}

                {/* Project URLs */}
                {(project.jw_sharepoint_url || project.builder_assistant_url) && (
                  <div className="mt-2 flex space-x-2">
                    {project.jw_sharepoint_url && (
                      <a
                        href={project.jw_sharepoint_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        📁 JW SharePoint
                      </a>
                    )}
                    {project.builder_assistant_url && (
                      <a
                        href={project.builder_assistant_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        🔧 Builder Assistant
                      </a>
                    )}
                  </div>
                )}
                
                <div className="mt-2 flex justify-between text-sm text-gray-500">
                  <span>{project.active_assignments} active assignments</span>
                  {project.start_date && (
                    <span>Started: {new Date(project.start_date).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            )) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No projects found</p>
                <button
                  onClick={handleAddProject}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Create your first project
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Project Assignments */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Trade Crew Assignments
            {selectedProject && (
              <span className="text-sm font-normal text-gray-600 ml-2">
                ({projects.find(p => p.id === selectedProject)?.name})
              </span>
            )}
          </h2>
          {selectedProject ? (
            <div className="space-y-3">
              {assignments.length > 0 ? (
                assignments.map((assignment) => (
                  <div key={assignment.id} className="p-3 bg-gray-50 rounded-md">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900">{assignment.trade_crew_name}</h3>
                        <p className="text-sm text-gray-600">{assignment.trade_team_name}</p>
                      </div>
                      <span className={`badge ${getStatusColor(assignment.status)}`}>
                        {assignment.status}
                      </span>
                    </div>
                    
                    {assignment.role_description && (
                      <p className="text-sm text-gray-700 mb-2">{assignment.role_description}</p>
                    )}
                    
                    {assignment.phase && (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mb-2 ${getPhaseColor(assignment.phase)}`}>
                        {assignment.phase}
                      </span>
                    )}
                    
                    {assignment.overseer_name && (
                      <div className="mt-2 p-2 bg-white rounded border">
                        <p className="text-sm font-medium text-primary-700">
                          Trade Crew Overseer: {assignment.overseer_name}
                        </p>
                        {assignment.overseer_phone && (
                          <p className="text-sm text-gray-600">📞 {assignment.overseer_phone}</p>
                        )}
                        {assignment.overseer_email && (
                          <p className="text-sm text-gray-600">✉️ {assignment.overseer_email}</p>
                        )}
                      </div>
                    )}
                    
                    {(assignment.start_date || assignment.end_date) && (
                      <div className="mt-2 text-sm text-gray-500">
                        {assignment.start_date && (
                          <span>Start: {new Date(assignment.start_date).toLocaleDateString()}</span>
                        )}
                        {assignment.start_date && assignment.end_date && <span> • </span>}
                        {assignment.end_date && (
                          <span>End: {new Date(assignment.end_date).toLocaleDateString()}</span>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No trade crew assignments for this project
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Select a project to view trade crew assignments
            </p>
          )}
        </div>
      </div>

      <ProjectModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleModalSave}
        project={editingProject}
      />
    </div>
  )
}
