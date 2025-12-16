'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import OversightSection from '@/components/oversight/OversightSection';
import { TRADE_CREW_OVERSIGHT_CONFIG } from '@/lib/oversight-types';
import { 
  Users, ArrowLeft, Edit, CheckCircle, AlertCircle, 
  FileText, Calendar, Tag
} from 'lucide-react';

interface Crew {
  id: string;
  name: string;
  description: string | null;
  scopeOfWork: string | null;
  isRequired: boolean;
  status: string;
  isActive: boolean;
  tradeTeam: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function CrewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.id as string;
  const crewId = params.crewId as string;

  const [crew, setCrew] = useState<Crew | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableUsers, setAvailableUsers] = useState<Array<{id: string; name: string | null; email: string}>>([]);

  useEffect(() => {
    if (teamId && crewId) {
      fetchCrew();
      fetchUsers();
    }
  }, [teamId, crewId]);

  const fetchCrew = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/v1/trade-teams/${teamId}/crews/${crewId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Crew not found');
        }
        throw new Error('Failed to fetch crew');
      }

      const data = await response.json();
      setCrew(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load crew');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/v1/volunteers');
      if (res.ok) {
        const data = await res.json();
        setAvailableUsers(data.volunteers || []);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !crew) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" />
          <h3 className="font-medium text-lg">{error || 'Crew not found'}</h3>
          <Link
            href={`/trade-teams/${teamId}`}
            className="mt-4 inline-flex items-center text-red-700 hover:text-red-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Trade Team
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <Link
              href={`/trade-teams/${teamId}`}
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to {crew.tradeTeam?.name || 'Trade Team'}
            </Link>
            
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  {crew.name}
                  <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    crew.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {crew.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    crew.isRequired ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {crew.isRequired ? 'Required' : 'Optional'}
                  </span>
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Part of {crew.tradeTeam?.name} Trade Team
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Crew Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-gray-500" />
            Crew Details
          </h2>
          
          <div className="space-y-4">
            {crew.description && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                <p className="mt-1 text-gray-900">{crew.description}</p>
              </div>
            )}
            
            {crew.scopeOfWork && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Scope of Work</h3>
                <p className="mt-1 text-gray-900">{crew.scopeOfWork}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <h3 className="text-sm font-medium text-gray-500 flex items-center">
                  <Tag className="h-4 w-4 mr-1" />
                  Status
                </h3>
                <p className="mt-1 text-gray-900 capitalize">{crew.status?.toLowerCase() || 'Active'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Created
                </h3>
                <p className="mt-1 text-gray-900">
                  {new Date(crew.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Crew Oversight Section */}
        <OversightSection
          title="Crew Leadership"
          entityId={crewId}
          apiBasePath={`/api/v1/trade-teams/${teamId}/crews/${crewId}/oversight`}
          roleConfig={TRADE_CREW_OVERSIGHT_CONFIG}
          roleOrder={['TCO', 'TCOA', 'TC_SUPPORT']}
          availableUsers={availableUsers}
        />
      </div>
    </div>
  );
}
