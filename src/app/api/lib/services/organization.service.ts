// src/app/api/lib/services/organization.service.ts

import { Organization } from '@/models/Organization';
import { Team } from '@/models/Team';
import { DBProviderFactory } from '../factories/DBFactory';
import { inject, injectable } from 'inversify';
import { DB_TYPES } from '../symbols/Symbols';

@injectable()
export class OrganizationService {
  private organizationRepo;
  private teamRepo;
  private organizationCollection = 'organizations';
  private teamCollection = 'teams';

  constructor(@inject(DB_TYPES.DBProviderFactory) private dbFactory: DBProviderFactory) {
    this.organizationRepo = this.dbFactory.createDBProvider();
    this.teamRepo = this.dbFactory.createDBProvider();
  }

  async listOrganizations(): Promise<Organization[]> {
    return this.organizationRepo.findAll(this.organizationCollection);
  }

  async createOrganization(data: Partial<Organization>): Promise<Organization> {
    // Add validation as needed
    return this.organizationRepo.create(this.organizationCollection, data);
  }

  async getOrganizationById(id: string): Promise<Organization | null> {
    return this.organizationRepo.findOne(this.organizationCollection, { _id: id });
  }

  async updateOrganization(id: string, data: Partial<Organization>): Promise<Organization | null> {
    return this.organizationRepo.update(this.organizationCollection, id, data);
  }

  async deleteOrganization(id: string): Promise<boolean> {
    return this.organizationRepo.delete(this.organizationCollection, id);
  }

  async getOrganizationsByCreator(createdBy: string): Promise<Organization[]> {
    // TODO: Implement filtering by creator
    const allOrganizations = await this.organizationRepo.findAll(this.organizationCollection);
    return allOrganizations.filter(org => org.createdBy === createdBy);
  }

  async getOrganizationTeams(organizationId: string): Promise<Team[]> {
    try {
      // Get all teams and filter by organizationId
      const allTeams = await this.teamRepo.findAll(this.teamCollection);
      return allTeams.filter((team: Team) => team.organizationId === organizationId);
    } catch (error) {
      console.error('Error fetching organization teams:', error);
      throw new Error('Failed to fetch organization teams');
    }
  }

  async getOrganizationMembers(organizationId: string): Promise<any[]> {
    // TODO: Implement organization members logic
    // This might need to interact with a separate TeamMember service
    return [];
  }

  async updateOrganizationLogo(organizationId: string, logoUrl: string): Promise<Organization | null> {
    return this.organizationRepo.update(this.organizationCollection, organizationId, { logoUrl });
  }
}