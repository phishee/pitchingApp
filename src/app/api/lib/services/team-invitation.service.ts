// src/app/api/lib/services/team-invitation.service.ts

import { TeamInvitation } from '@/models';
import { DBProviderFactory } from '../factories/DBFactory';
import { inject, injectable } from 'inversify';
import { DB_TYPES } from '../symbols/Symbols';

@injectable()
export class TeamInvitationService {
  private invitationRepo;
  private collectionName = 'teamInvitations';

  constructor(@inject(DB_TYPES.DBProviderFactory) private dbFactory: DBProviderFactory) {
    this.invitationRepo = this.dbFactory.createDBProvider();
  }

  async createInvitation(data: Partial<TeamInvitation>): Promise<TeamInvitation> {
    return this.invitationRepo.create(this.collectionName, data);
  }

  async getInvitationById(id: string): Promise<TeamInvitation | null> {
    return this.invitationRepo.findOne(this.collectionName, { _id: id });
  }

  async updateInvitation(id: string, data: Partial<TeamInvitation>): Promise<TeamInvitation | null> {
    return this.invitationRepo.update(this.collectionName, id, data);
  }

  async deleteInvitation(id: string): Promise<boolean> {
    return this.invitationRepo.delete(this.collectionName, id);
  }

  async getInvitationsByTeam(teamId: string): Promise<TeamInvitation[]> {
    const allInvitations = await this.invitationRepo.findAll(this.collectionName);
    return allInvitations.filter(inv => inv.teamId === teamId);
  }

  async getInvitationsByUser(userId: string): Promise<TeamInvitation[]> {
    const allInvitations = await this.invitationRepo.findAll(this.collectionName);
    return allInvitations.filter(inv => inv.userId === userId);
  }

  async getInvitationsByStatus(status: 'pending' | 'accepted' | 'rejected'): Promise<TeamInvitation[]> {
    const allInvitations = await this.invitationRepo.findAll(this.collectionName);
    return allInvitations.filter(inv => inv.status === status);
  }

  async acceptInvitation(id: string): Promise<TeamInvitation | null> {
    return this.invitationRepo.update(this.collectionName, id, { 
      status: 'accepted', 
      acceptedAt: new Date() 
    });
  }

  async rejectInvitation(id: string): Promise<TeamInvitation | null> {
    return this.invitationRepo.update(this.collectionName, id, { 
      status: 'rejected', 
      rejectedAt: new Date() 
    });
  }
}