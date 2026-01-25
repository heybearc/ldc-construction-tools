// Type definitions for trade-teams
export interface TradeTeamsConfig {
  apiBaseUrl: string;
  version: string;
}

export interface TradeTeam {
  id: number;
  name: string;
  description: string;
  icon: string;
  crew_count: number;
  created_at: string;
  updated_at: string;
}

export interface TradeCrew {
  id: number;
  name: string;
  description: string;
  trade_team_id: number;
  trade_team_name: string;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
}

export interface TradeTeamsModule {
  initialize(config: TradeTeamsConfig): Promise<void>;
  getVersion(): string;
}

export interface TradeTeamsStats {
  total_teams: number;
  total_crews: number;
  active_crews: number;
  inactive_crews: number;
}
