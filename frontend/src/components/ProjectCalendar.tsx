'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, ChevronLeft, ChevronRight, Plus, Users, MapPin, Clock, Filter } from 'lucide-react'
import { apiClient, ProjectSummary, ProjectAssignmentSummary } from '@/lib/api'

interface CalendarEvent {
  id: string
  title: string
  date: Date
  type: 'project' | 'assignment' | 'milestone'
  project?: ProjectSummary
  assignment?: ProjectAssignmentSummary
  description?: string
  location?: string
  phase?: string
  status: string
}

export default function ProjectCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')
  const [filterType, setFilterType] = useState<'all' | 'project' | 'assignment' | 'milestone'>('all')

  useEffect(() => {
    loadCalendarData()
  }, [])

  const loadCalendarData = async () => {
    try {
      setLoading(true)
      const projectsData = await apiClient.getProjects()
      setProjects(projectsData)
      
      // Generate calendar events from projects and assignments
      const calendarEvents: CalendarEvent[] = []
      
      for (const project of projectsData) {
        // Add project start date as event
        if (project.start_date) {
          calendarEvents.push({
            id: `project-${project.id}`,
            title: `${project.name} - Start`,
            date: new Date(project.start_date),
            type: 'project',
            project,
            description: `Project start: ${project.name}`,
            location: project.location,
            phase: project.current_phase,
            status: project.status
          })
        }
        
        // Add project end date as milestone
        if (project.end_date) {
          calendarEvents.push({
            id: `milestone-${project.id}`,
            title: `${project.name} - Completion`,
            date: new Date(project.end_date),
            type: 'milestone',
            project,
            description: `Project completion: ${project.name}`,
            location: project.location,
            phase: project.current_phase,
            status: project.status
          })
        }
        
        // Load project assignments
        try {
          const assignments = await apiClient.getProjectAssignments(project.id)
          for (const assignment of assignments) {
            if (assignment.start_date) {
              calendarEvents.push({
                id: `assignment-${assignment.id}`,
                title: `${assignment.trade_crew_name} - ${project.name}`,
                date: new Date(assignment.start_date),
                type: 'assignment',
                project,
                assignment,
                description: assignment.role_description || `${assignment.trade_crew_name} assignment`,
                location: project.location,
                phase: assignment.phase,
                status: assignment.status
              })
            }
          }
        } catch (err) {
          console.warn(`Failed to load assignments for project ${project.id}:`, err)
        }
      }
      
      setEvents(calendarEvents)
    } catch (err) {
      setError('Failed to load calendar data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate.toDateString() === date.toDateString() &&
             (filterType === 'all' || event.type === filterType)
    })
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'project': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'assignment': return 'bg-green-100 text-green-800 border-green-200'
      case 'milestone': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-500'
      case 'planning': return 'bg-yellow-500'
      case 'completed': return 'bg-blue-500'
      case 'on hold': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-32 border border-gray-200"></div>)
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const dayEvents = getEventsForDate(date)
      const isToday = date.toDateString() === new Date().toDateString()
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString()
      
      days.push(
        <div
          key={day}
          className={`h-32 border border-gray-200 p-1 cursor-pointer hover:bg-gray-50 ${
            isToday ? 'bg-blue-50 border-blue-300' : ''
          } ${isSelected ? 'bg-primary-50 border-primary-300' : ''}`}
          onClick={() => setSelectedDate(date)}
        >
          <div className="flex justify-between items-start mb-1">
            <span className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
              {day}
            </span>
            {dayEvents.length > 0 && (
              <span className="text-xs bg-primary-100 text-primary-800 px-1 rounded">
                {dayEvents.length}
              </span>
            )}
          </div>
          <div className="space-y-1">
            {dayEvents.slice(0, 2).map(event => (
              <div
                key={event.id}
                className={`text-xs p-1 rounded border ${getEventTypeColor(event.type)} truncate`}
                title={event.description}
              >
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-1 ${getStatusColor(event.status)}`}></div>
                  {event.title}
                </div>
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-gray-500 px-1">
                +{dayEvents.length - 2} more
              </div>
            )}
          </div>
        </div>
      )
    }
    
    return days
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
                onClick={loadCalendarData}
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
      {/* Calendar Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-semibold text-gray-900">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="input-field text-sm"
          >
            <option value="all">All Events</option>
            <option value="project">Projects</option>
            <option value="assignment">Assignments</option>
            <option value="milestone">Milestones</option>
          </select>
          
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-md p-1">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === 'month' ? 'bg-white shadow-sm' : 'text-gray-600'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === 'week' ? 'bg-white shadow-sm' : 'text-gray-600'
              }`}
            >
              Week
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Calendar Header */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-700">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Body */}
        <div className="grid grid-cols-7">
          {renderCalendarGrid()}
        </div>
      </div>

      {/* Event Details Sidebar */}
      {selectedDate && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Events for {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
          
          <div className="space-y-4">
            {getEventsForDate(selectedDate).map(event => (
              <div key={event.id} className={`p-4 rounded-lg border ${getEventTypeColor(event.type)}`}>
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{event.title}</h4>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.type)}`}>
                    {event.type}
                  </span>
                </div>
                
                {event.description && (
                  <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                )}
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  {event.location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {event.location}
                    </div>
                  )}
                  {event.phase && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {event.phase}
                    </div>
                  )}
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-1 ${getStatusColor(event.status)}`}></div>
                    {event.status}
                  </div>
                </div>
                
                {event.assignment?.overseer_name && (
                  <div className="mt-2 p-2 bg-white bg-opacity-50 rounded">
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 mr-1" />
                      <span className="font-medium">TCO: {event.assignment.overseer_name}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {getEventsForDate(selectedDate).length === 0 && (
              <p className="text-gray-500 text-center py-8">
                No events scheduled for this date
              </p>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Legend</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded mr-2"></div>
            <span className="text-sm text-gray-700">Project Events</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-100 border border-green-200 rounded mr-2"></div>
            <span className="text-sm text-gray-700">Trade Crew Assignments</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-purple-100 border border-purple-200 rounded mr-2"></div>
            <span className="text-sm text-gray-700">Project Milestones</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Status Indicators</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-700">Active</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-700">Planning</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-700">Completed</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-700">On Hold</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
