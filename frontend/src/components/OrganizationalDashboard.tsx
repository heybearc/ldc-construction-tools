import React from "react";
import { Users, Building, MapPin, Calendar } from "lucide-react";

export default function OrganizationalDashboard() {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <Building className="mr-3 h-8 w-8 text-blue-600" />
          LDC Construction Tools - Region 01.12
        </h2>
        <p className="text-gray-600 mb-6">
          Personnel Contact assistance system for construction group coordination and trade team management.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-600">Trade Teams</p>
                <p className="text-2xl font-bold text-blue-900">12</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-green-600">Active Projects</p>
                <p className="text-2xl font-bold text-green-900">8</p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-600">Volunteers</p>
                <p className="text-2xl font-bold text-purple-900">156</p>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-orange-600">Upcoming Events</p>
                <p className="text-2xl font-bold text-orange-900">3</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/admin" className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center">
              <Users className="h-6 w-6 text-blue-600 mr-3" />
              <span className="font-medium text-gray-900">System Administration</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Manage users, roles, and system configuration</p>
          </a>
          
          <a href="/projects" className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center">
              <Building className="h-6 w-6 text-green-600 mr-3" />
              <span className="font-medium text-gray-900">Project Management</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">View and manage construction projects</p>
          </a>
          
          <a href="/volunteers" className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center">
              <Users className="h-6 w-6 text-purple-600 mr-3" />
              <span className="font-medium text-gray-900">Volunteer Coordination</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Manage volunteer assignments and schedules</p>
          </a>
        </div>
      </div>
    </div>
  );
}
