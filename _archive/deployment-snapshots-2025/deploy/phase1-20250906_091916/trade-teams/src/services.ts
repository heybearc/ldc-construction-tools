// Service layer for trade-teams
import { TradeTeamsAPI } from './api';
import { TradeTeamsConfig, TradeTeam, TradeCrew, TradeTeamsStats } from './types';

export class TradeTeamsService {
  private api: TradeTeamsAPI;

  constructor(config: TradeTeamsConfig) {
    this.api = new TradeTeamsAPI(config);
  }

  async initialize(): Promise<void> {
    const isHealthy = await this.api.healthCheck();
    if (!isHealthy) {
      throw new Error('Trade Teams service is not available');
    }
  }

  async getAllTradeTeams(): Promise<TradeTeam[]> {
    return this.api.getTradeTeams();
  }

  async getTradeTeamById(id: number): Promise<TradeTeam> {
    return this.api.getTradeTeam(id);
  }

  async getCrewsByTeamId(teamId: number): Promise<TradeCrew[]> {
    return this.api.getTradeCrews(teamId);
  }

  async getStats(): Promise<TradeTeamsStats> {
    return this.api.getTradeTeamsStats();
  }

  async searchTeams(query: string): Promise<TradeTeam[]> {
    const teams = await this.getAllTradeTeams();
    return teams.filter(team => 
      team.name.toLowerCase().includes(query.toLowerCase()) ||
      team.description.toLowerCase().includes(query.toLowerCase())
    );
  }

  async getTeamsByIcon(icon: string): Promise<TradeTeam[]> {
    const teams = await this.getAllTradeTeams();
    return teams.filter(team => team.icon === icon);
  }

  async getActiveCrews(): Promise<TradeCrew[]> {
    const teams = await this.getAllTradeTeams();
    const allCrews: TradeCrew[] = [];
    
    for (const team of teams) {
      const crews = await this.getCrewsByTeamId(team.id);
      allCrews.push(...crews.filter(crew => crew.status === 'active'));
    }
    
    return allCrews;
  }
}
