// src/app/api/lib/services/team.service.ts

import { Team } from '@/models/Team';
import { DBProviderFactory } from '../factories/DBFactory';
import { inject, injectable } from 'inversify';
import { DB_TYPES } from '../symbols/Symbols';
import { ObjectId } from 'mongodb';

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

  async getTeamsByUser(userId: string): Promise<{ team: Team; member: any }[]> {
    try {
      // 1. Get all team memberships for the user
      const teamMembers = await this.teamRepo.findQuery('TeamMember', { userId, status: 'active' });

      if (!teamMembers || teamMembers.length === 0) {
        return [];
      }

      // 2. Extract team IDs
      const teamIds = teamMembers.map((member: any) => member.teamId);

      // 3. Fetch all teams in one query
      // Ensure IDs are ObjectIds for the $in query
      const objectIds = teamIds.map((id: string) => {
        try {
          return new ObjectId(id);
        } catch (e) {
          console.error('Invalid ObjectId:', id);
          return null;
        }
      }).filter((id: any) => id !== null);

      const teams = await this.teamRepo.findQuery(this.teamCollection, {
        _id: { $in: objectIds }
      });

      // 4. Map back to include membership details
      return teams.map((team: Team) => {
        const member = teamMembers.find((m: any) => m.teamId === team._id?.toString());
        return { team, member };
      });
    } catch (error) {
      console.error('Error fetching teams by user:', error);
      throw new Error('Failed to fetch user teams');
    }
  }

  async getTeamMembers(teamId: string): Promise<any[]> {
    // TODO: Implement team members logic
    // This might need to interact with a separate TeamMember service
    return [];
  }
}