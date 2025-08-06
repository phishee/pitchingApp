// src/app/api/lib/services/team-member.service.ts

import { TeamMember } from '@/models';
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

  async getTeamMembersByTeam(teamId: string): Promise<TeamMember[]> {
    const allMembers = await this.teamMemberRepo.findAll(this.collectionName);
    return allMembers.filter(member => member.teamId === teamId);
  }

  async getTeamMembersByUser(userId: string): Promise<TeamMember[]> {
    const allMembers = await this.teamMemberRepo.findAll(this.collectionName);
    return allMembers.filter(member => member.userId === userId);
  }

  async getTeamMembersByStatus(status: 'active' | 'inactive'): Promise<TeamMember[]> {
    const allMembers = await this.teamMemberRepo.findAll(this.collectionName);
    return allMembers.filter(member => member.status === status);
  }
}