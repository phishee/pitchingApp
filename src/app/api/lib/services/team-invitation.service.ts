// src/app/api/lib/services/team-invitation.service.ts

import { TeamInvitation, TeamInvitationWithTeamUserInfo } from '@/models';
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

  async getInvitationsByTeam(teamId: string): Promise<TeamInvitationWithTeamUserInfo[]> {
    try {
      const allInvitations = await this.invitationRepo.findWithPopulate(this.collectionName, {
        teamId: teamId,
        status: 'pending'
      },
        [{
          path: 'teamId',
          from: 'teams',
          foreignField: '_id',
          select: ['name', 'logoUrl'],
          as: 'team'
        },
        {
          path: 'invitedUserId',
          from: 'users',
          foreignField: 'userId',
          select: ['name', 'email', 'profileImageUrl'],
          as: 'user'
        },
        {
          path: 'invitedBy',
          from: 'users',
          foreignField: 'userId',
          select: ['name', 'email', 'profileImageUrl'],
          as: 'invitedByUser'
        }
      ]
      );
      return allInvitations;
    } catch (error) {
      console.error('Error getting invitations by team:', error);
      throw error;
    }
  }

  async getInvitationsByUser(userId: string): Promise<TeamInvitationWithTeamUserInfo[]> {
    try {
      const allCurrentUserInvitations = await this.invitationRepo.findWithPopulate(this.collectionName, {
        $and: [
          { invitedUserId: userId },
          { status: 'pending' }
        ]
      },
        [{
          path: 'teamId',
          from: 'teams',
          foreignField: '_id',
          select: ['name', 'logoUrl'],
          as: 'team'
        },
        {
          path: 'invitedUserId',
          from: 'users',
          foreignField: 'userId',
          select: ['name', 'email', 'profileImageUrl'],
          as: 'user'
        },
        {
          path: 'invitedBy',
          from: 'users',
          foreignField: 'userId',
          select: ['name', 'email', 'profileImageUrl'],
          as: 'invitedByUser'
        }
      ]
      );
      return allCurrentUserInvitations;
    } catch (error) {
      console.error('Error getting invitations by user:', error);
      throw error;
    }
  }

  async getInvitationsByStatus(status: 'pending' | 'accepted' | 'rejected'): Promise<TeamInvitation[]> {
    const allInvitations = await this.invitationRepo.findAll(this.collectionName);
    return allInvitations.filter(inv => inv.status === status);
  }

  async acceptInvitation(id: string): Promise<TeamInvitation | null> {
    return await this.invitationRepo.update(this.collectionName, id, {
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