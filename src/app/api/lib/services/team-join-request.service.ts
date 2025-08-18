// src/app/api/lib/services/team-join-request.service.ts

import { TeamJoinRequest, TeamJoinRequestWithTeamUserInfo } from '@/models';
import { DBProviderFactory } from '../factories/DBFactory';
import { inject, injectable } from 'inversify';
import { DB_TYPES } from '../symbols/Symbols';

@injectable()
export class TeamJoinRequestService {
  private joinRequestRepo;
  private collectionName = 'teamJoinRequests';

  constructor(@inject(DB_TYPES.DBProviderFactory) private dbFactory: DBProviderFactory) {
    this.joinRequestRepo = this.dbFactory.createDBProvider();
  }

  async createJoinRequest(data: Partial<TeamJoinRequest>): Promise<TeamJoinRequest> {
    return this.joinRequestRepo.create(this.collectionName, data);
  }

  async getJoinRequestById(id: string): Promise<TeamJoinRequest | null> {
    // return await this.joinRequestRepo.findOne(this.collectionName, { _id: id });
    return await this.joinRequestRepo.findById(this.collectionName, id);
  }

  async updateJoinRequest(id: string, data: Partial<TeamJoinRequest>): Promise<TeamJoinRequest | null> {
    return this.joinRequestRepo.update(this.collectionName, id, data);
  }

  async deleteJoinRequest(id: string): Promise<boolean> {
    return this.joinRequestRepo.delete(this.collectionName, id);
  }

  async getJoinRequestsByTeam(teamId: string): Promise<TeamJoinRequestWithTeamUserInfo[]> {
    const allRequests = await this.joinRequestRepo.findWithPopulate(this.collectionName, { teamId, status: 'pending' }, 
      [
        {
          path: 'requestedBy',
          from: 'users',
          foreignField: 'userId',
          select: ['name', 'email', 'profileImageUrl'],
          as: 'user'
        }
      ]
    );
    return allRequests;
  }

  async getJoinRequestsByUser(userId: string): Promise<TeamJoinRequestWithTeamUserInfo[]> {
    // const pendingRequest = await this.joinRequestRepo.findQuery(this.collectionName, { requestedBy: userId, status: 'pending' });
    // return pendingRequest;
    const pendingRequest = await this.joinRequestRepo.findWithPopulate(this.collectionName, { requestedBy: userId, status: 'pending' }, 
      [
        {
          path: 'teamId',
          from: 'teams',
          foreignField: '_id',
          select: ['name', 'description', 'logoUrl'],
          as: 'team'
        },
        {
          path: 'requestedBy',
          from: 'users',
          foreignField: 'userId',
          select: ['name', 'email', 'profileImageUrl'],
          as: 'user'
        }
      ]
    );
    return pendingRequest;
  }

  async getJoinRequestsByStatus(status: 'pending' | 'approved' | 'rejected'): Promise<TeamJoinRequest[]> {
    const allRequests = await this.joinRequestRepo.findAll(this.collectionName);
    return allRequests.filter(req => req.status === status);
  }

  async approveJoinRequest(id: string): Promise<TeamJoinRequest | null> {
    const updatedRequest = await this.joinRequestRepo.update(this.collectionName, id, { 
      status: 'approved', 
      approvedAt: new Date() 
    });

    return updatedRequest;
  }

  async rejectJoinRequest(id: string, data: { comment?: string; rejectedBy?: string }): Promise<TeamJoinRequest | null> {
    return this.joinRequestRepo.update(this.collectionName, id, { 
      status: 'rejected', 
      rejectedAt: new Date(),
      comment: data.comment || null,
      rejectedBy: data.rejectedBy || null
    });
  }
}