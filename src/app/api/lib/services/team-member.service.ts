// src/app/api/lib/services/team-member.service.ts

import { TeamMember, TeamMemberWithUser } from '@/models';
import { DBProviderFactory } from '../factories/DBFactory';
import { inject, injectable } from 'inversify';
import { DB_TYPES } from '../symbols/Symbols';
import { ObjectId } from 'mongodb';

@injectable()
export class TeamMemberService {
  private teamMemberRepo;
  private collectionName = 'TeamMember';

  constructor(@inject(DB_TYPES.DBProviderFactory) private dbFactory: DBProviderFactory) {
    this.teamMemberRepo = this.dbFactory.createDBProvider();
  }

  async listTeamMembers(): Promise<TeamMember[]> {
    return this.teamMemberRepo.findAll(this.collectionName);
  }

  async createTeamMember(data: Partial<TeamMember>): Promise<TeamMember> {
    return this.teamMemberRepo.create(this.collectionName, data);
  }

  async getTeamMemberById(id: string): Promise<TeamMember | null> {
    const result = await this.teamMemberRepo.findQuery(this.collectionName, { _id: new ObjectId(id) });
    return result[0] as TeamMember;
  }

  async updateTeamMember(id: string, data: Partial<TeamMember>): Promise<TeamMember | null> {
    return this.teamMemberRepo.update(this.collectionName, id, data);
  }

  async deleteTeamMember(id: string): Promise<boolean> {
    return this.teamMemberRepo.delete(this.collectionName, id);
  }

  async getTeamMembersByTeam(teamId: string): Promise<TeamMemberWithUser[]> {
    // const allMembers = await this.teamMemberRepo.findAll(this.collectionName);
    // return allMembers.filter(member => member.teamId === teamId);
    const teamMembers = await this.teamMemberRepo.findWithPopulate('teammember',
      { teamId: 'team123' },
      {
        path: 'userId',
        from: 'User',
        foreignField: 'userId',
        select: ['name', 'email', 'profileImageUrl', 'userId'],
        as: 'user'
      }
    );
    return teamMembers;
  }

  async getTeamMembersByUser(userId: string): Promise<TeamMemberWithUser[]> {

    const members = await this.teamMemberRepo.findWithPopulate(
      this.collectionName,
      { userId },
      {
        path: 'userId',
        from: 'users',
        foreignField: 'userId',
        select: ['name', 'email', 'profileImageUrl'],
        as: 'user'
      }

    );
    return members;
  }

  async getTeamMembersByStatus(status: 'active' | 'inactive'): Promise<TeamMember[]> {
    const allMembers = await this.teamMemberRepo.findAll(this.collectionName);
    return allMembers.filter(member => member.status === status);
  }

  // Add this method to your TeamMemberService class

  private transformToTeamMemberWithUser(member: any): TeamMemberWithUser {
    return {
      ...member,
      user: {
        userId: member.userId.userId || member.userId,
        name: member.userId.name || 'Unknown User',
        profileImageUrl: member.userId.profileImageUrl
      }
    };
  }
}