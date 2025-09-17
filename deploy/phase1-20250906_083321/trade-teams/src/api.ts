// API layer for trade-teams
import { TradeTeamsConfig, TradeTeam, TradeCrew, TradeTeamsStats } from './types';

export class TradeTeamsAPI {
  private config: TradeTeamsConfig;

  constructor(config: TradeTeamsConfig) {
    this.config = config;
  }

  async getTradeTeams(): Promise<TradeTeam[]> {
    const response = await fetch(`${this.config.apiBaseUrl}/api/v1/trade-teams`);
    if (!response.ok) {
      throw new Error(`Failed to fetch trade teams: ${response.statusText}`);
    }
    return response.json();
  }

  async getTradeTeam(id: number): Promise<TradeTeam> {
    const response = await fetch(`${this.config.apiBaseUrl}/api/v1/trade-teams/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch trade team: ${response.statusText}`);
    }
    return response.json();
  }

  async getTradeCrews(teamId: number): Promise<TradeCrew[]> {
    const response = await fetch(`${this.config.apiBaseUrl}/api/v1/trade-teams/${teamId}/crews`);
    if (!response.ok) {
      throw new Error(`Failed to fetch trade crews: ${response.statusText}`);
    }
    return response.json();
  }

  async getTradeTeamsStats(): Promise<TradeTeamsStats> {
    const response = await fetch(`${this.config.apiBaseUrl}/api/v1/trade-teams/stats`);
    if (!response.ok) {
      throw new Error(`Failed to fetch trade teams stats: ${response.statusText}`);
    }
    return response.json();
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/api/v1/trade-teams/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}
