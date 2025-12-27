'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Wrench, 
  Calendar, 
  FolderOpen, 
  Settings, 
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  UserPlus
} from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalVolunteers: 0,
    totalTeams: 0,
    activeProjects: 0,
    upcomingEvents: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      let volunteerCount = 0;
      let teamCount = 0;
      let projectCount = 0;

      // Fetch volunteers data
      try {
        const volunteersRes = await fetch('/api/v1/volunteers');
        if (volunteersRes.ok) {
          const volunteers = await volunteersRes.json();
          volunteerCount = volunteers.length || 0;
        }
      } catch (error) {
        console.error('Error fetching volunteers:', error);
      }

      // Fetch trade teams data
      try {
        const teamsRes = await fetch('/api/v1/trade-teams');
        if (teamsRes.ok) {
          const teams = await teamsRes.json();
          teamCount = teams.length || 0;
        }
      } catch (error) {
        console.error('Error fetching trade teams:', error);
      }

      // Fetch projects data
      try {
        const projectsRes = await fetch('/api/v1/projects');
        if (projectsRes.ok) {
          const projects = await projectsRes.json();
          // Count only active projects
          projectCount = projects.filter((p: any) => p.isActive && p.status === 'ACTIVE').length || 0;
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      }

      setStats({
        totalVolunteers: volunteerCount,
        totalTeams: teamCount,
        activeProjects: projectCount,
        upcomingEvents: 0  // Will be populated when calendar is implemented
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Submit Crew Request',
      description: 'Add volunteers to crews or project rosters',
      href: '/crew-request',
      icon: UserPlus,
      color: 'bg-indigo-500'
    },
    {
      title: 'Trade Teams',
      description: 'Manage construction trade teams and crews',
      href: '/trade-teams',
      icon: Wrench,
      color: 'bg-blue-500'
    },
    {
      title: 'Volunteers',
      description: 'Personnel directory and volunteer management',
      href: '/volunteers',
      icon: Users,
      color: 'bg-green-500'
    },
    {
      title: 'Projects',
      description: 'Project management and assignments',
      href: '/projects',
      icon: FolderOpen,
      color: 'bg-purple-500'
    },
    {
      title: 'Calendar',
      description: 'Schedule and event management',
      href: '/calendar',
      icon: Calendar,
      color: 'bg-orange-500'
    },
    {
      title: 'Admin',
      description: 'System administration and settings',
      href: '/admin',
      icon: Settings,
      color: 'bg-gray-500'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Welcome Section */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome to LDC Tools
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Construction Group coordination and trade team management for Region 01.12
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Volunteers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalVolunteers}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Wrench className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Trade Teams</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTeams}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FolderOpen className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeProjects}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcomingEvents}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 block"
                >
                  <div className="flex items-center mb-4">
                    <div className={`${action.color} p-3 rounded-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="ml-4 text-lg font-semibold text-gray-900">
                      {action.title}
                    </h3>
                  </div>
                  <p className="text-gray-600">{action.description}</p>
                </Link>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
