// src/app/api/v1/users/user.service.ts

import { User } from '@/models/User';
import { DBProviderFactory } from '../factories/DBFactory'; // Adjust the import path as needed
import { inject, injectable } from 'inversify';
import { DB_TYPES } from '../symbols/Symbols';

@injectable()
export class UserService {
  private userRepo;
  private userCollection = 'users';

  constructor(@inject(DB_TYPES.DBProviderFactory) private dbFactory: DBProviderFactory) {
    this.userRepo = this.dbFactory.createDBProvider();
  }

  async listUsers(): Promise<User[]> {
    return this.userRepo.findAll(this.userCollection);
  }

  async createUser(data: Partial<User>): Promise<User> {
    // Add validation as needed
    return this.userRepo.create(this.userCollection, data);
  }

  async getUserByUserId(id: string): Promise<User | null> {
    return this.userRepo.findOne(this.userCollection, { userId: id });
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | null> {
    return this.userRepo.update(this.userCollection, id, data);
  }

  async updateUserOrganization(userId: string, organizationId: string): Promise<User | null> {
    try {
      const user = await this.getUserByUserId(userId);
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }
      
      if (!user._id) {
        throw new Error(`User _id is null or undefined for userId: ${userId}`);
      }
      
      return await this.userRepo.update(this.userCollection, user._id, {
        currentOrganizationId: organizationId
      });
    } catch (error) {
      console.error('Error updating user organization:', error);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.userRepo.delete(this.userCollection, id);
  }

  async searchUsersByEmail(email: string): Promise<Partial<User>[]> {
    try {
      const users = await this.userRepo.findQuery(this.userCollection, { email: { $regex: email, $options: 'i' } });
      return users;
    } catch (error) {
      console.error('Error searching users by email:', error);
      throw error;
    }
  }

  async getUsersByOrganization(organizationId: string, filters?: {
    role?: 'coach' | 'athlete' | 'admin';
    teamId?: string;
    search?: string;
    status?: 'active' | 'inactive';
  }): Promise<User[]> {
    try {
      let query: any = { currentOrganizationId: organizationId };

      // Apply role filter
      if (filters?.role) {
        if (filters.role === 'admin') {
          query.isAdmin = true;
        } else {
          query.role = filters.role;
        }
      }

      // Apply search filter
      if (filters?.search) {
        query.$or = [
          { name: { $regex: filters.search, $options: 'i' } },
          { email: { $regex: filters.search, $options: 'i' } }
        ];
      }

      const users = await this.userRepo.findQuery(this.userCollection, query);
      
      // If teamId filter is provided, we need to filter users by team membership
      if (filters?.teamId) {
        // This would require a more complex query involving team members
        // For now, we'll return all users and filter on the client side
        // TODO: Implement proper team-based filtering in the database
      }

      return users;
    } catch (error) {
      console.error('Error getting users by organization:', error);
      throw error;
    }
  }

  async getUsersWithTeamInfo(organizationId: string, filters?: {
    role?: 'coach' | 'athlete' | 'admin';
    teamId?: string;
    search?: string;
    status?: 'active' | 'inactive';
  }): Promise<any[]> {
    try {
      // Get users by organization
      const users = await this.getUsersByOrganization(organizationId, filters);
      
      // Get all team members for the organization to populate team info
      // This is a simplified approach - in production, you'd want to optimize this
      const teamMembers = await this.userRepo.findQuery('teamMembers', {});
      
      // Map users with their team memberships
      const usersWithTeamInfo = users.map(user => {
        const memberships = teamMembers.filter(member => 
          member.userId === user.userId && member.status === 'active'
        );
        
        return {
          ...user,
          teamMemberships: memberships.map(membership => ({
            teamId: membership.teamId,
            role: membership.role,
            status: membership.status
          }))
        };
      });

      return usersWithTeamInfo;
    } catch (error) {
      console.error('Error getting users with team info:', error);
      throw error;
    }
  }
}