// src/app/api/lib/services/team.service.ts

import { Team } from '@/models/Team';
import { DBProviderFactory } from '../factories/DBFactory';
import { inject, injectable } from 'inversify';
import { DB_TYPES } from '../symbols/Symbols';

@injectable()
export class TeamService {
  private teamRepo;
  private teamCollection = 'teams';

  constructor(@inject(DB_TYPES.DBProviderFactory) private dbFactory: DBProviderFactory) {
    this.teamRepo = this.dbFactory.createDBProvider();
  }

  async listTeams(): Promise<Team[]> {
    return this.teamRepo.findAll(this.teamCollection);
  }

  async createTeam(data: Partial<Team>): Promise<Team> {
    // Add validation as needed
    return this.teamRepo.create(this.teamCollection, data);
  }

  async getTeamById(id: string): Promise<Team | null> {
    return this.teamRepo.findById(this.teamCollection, id);
  }

  async updateTeam(id: string, data: Partial<Team>): Promise<Team | null> {
    return this.teamRepo.update(this.teamCollection, id, data);
  }

  async deleteTeam(id: string): Promise<boolean> {
    return this.teamRepo.delete(this.teamCollection, id);
  }

  async getTeamsByOrganization(organizationId: string): Promise<Team[]> {
    try {
      // Get all teams and filter by organizationId
      const allTeams = await this.teamRepo.findAll(this.teamCollection);
      return allTeams.filter(team => team.organizationId === organizationId);
    } catch (error) {
      console.error('Error fetching teams by organization:', error);
      throw new Error('Failed to fetch teams by organization');
    }
  }

  async getTeamByCode(code: string): Promise<Team | null> {
    return this.teamRepo.findOne(this.teamCollection, { teamCode: code });
  }

  async getTeamMembers(teamId: string): Promise<any[]> {
    // TODO: Implement team members logic
    // This might need to interact with a separate TeamMember service
    return [];
  }
}