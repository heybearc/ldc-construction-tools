// React components for trade-teams
import React, { useState, useEffect } from 'react';
import { TradeTeam, TradeCrew, TradeTeamsStats } from './types';
import { TradeTeamsAPI } from './api';

export interface TradeTeamsProps {
  className?: string;
  apiBaseUrl: string;
}

export const TradeTeamsDashboard: React.FC<TradeTeamsProps> = ({ className, apiBaseUrl }) => {
  const [teams, setTeams] = useState<TradeTeam[]>([]);
  const [stats, setStats] = useState<TradeTeamsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const api = new TradeTeamsAPI({ apiBaseUrl, version: '1.0.0' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [teamsData, statsData] = await Promise.all([
          api.getTradeTeams(),
          api.getTradeTeamsStats()
        ]);
        setTeams(teamsData);
        setStats(statsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load trade teams');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiBaseUrl]);

  if (loading) {
    return (
      <div className={`${className} flex justify-center items-center p-8`}>
        <div className="text-lg">Loading trade teams...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} p-8`}>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Trade Teams Dashboard</h2>
        
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-100 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800">Total Teams</h3>
              <p className="text-2xl font-bold text-blue-900">{stats.total_teams}</p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">Total Crews</h3>
              <p className="text-2xl font-bold text-green-900">{stats.total_crews}</p>
            </div>
            <div className="bg-yellow-100 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-800">Active Crews</h3>
              <p className="text-2xl font-bold text-yellow-900">{stats.active_crews}</p>
            </div>
            <div className="bg-red-100 p-4 rounded-lg">
              <h3 className="font-semibold text-red-800">Inactive Crews</h3>
              <p className="text-2xl font-bold text-red-900">{stats.inactive_crews}</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {teams.map((team) => (
          <TradeTeamCard key={team.id} team={team} apiBaseUrl={apiBaseUrl} />
        ))}
      </div>
    </div>
  );
};

export interface TradeTeamCardProps {
  team: TradeTeam;
  apiBaseUrl: string;
}

export const TradeTeamCard: React.FC<TradeTeamCardProps> = ({ team, apiBaseUrl }) => {
  const [crews, setCrews] = useState<TradeCrew[]>([]);
  const [showCrews, setShowCrews] = useState(false);
  const [loading, setLoading] = useState(false);

  const api = new TradeTeamsAPI({ apiBaseUrl, version: '1.0.0' });

  const handleShowCrews = async () => {
    if (!showCrews && crews.length === 0) {
      setLoading(true);
      try {
        const crewsData = await api.getTradeCrews(team.id);
        setCrews(crewsData);
      } catch (err) {
        console.error('Failed to load crews:', err);
      } finally {
        setLoading(false);
      }
    }
    setShowCrews(!showCrews);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-center mb-2">
          <span className="text-2xl mr-2">{team.icon}</span>
          <h3 className="text-lg font-semibold">{team.name}</h3>
        </div>
        <p className="text-gray-600 text-sm mb-3">{team.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">{team.crew_count} crews</span>
          <button
            onClick={handleShowCrews}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            disabled={loading}
          >
            {loading ? 'Loading...' : showCrews ? 'Hide Crews' : 'Show Crews'}
          </button>
        </div>
        
        {showCrews && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="font-medium mb-2">Crews:</h4>
            <div className="space-y-2">
              {crews.map((crew) => (
                <div key={crew.id} className="text-sm">
                  <div className="flex justify-between items-center">
                    <span>{crew.name}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      crew.status === 'active' ? 'bg-green-100 text-green-800' :
                      crew.status === 'inactive' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {crew.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
