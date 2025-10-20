// src/app/api/lib/services/facility.service.ts

import { Facility } from '@/models/Facility';
import { DBProviderFactory } from '../factories/DBFactory';
import { inject, injectable } from 'inversify';
import { DB_TYPES } from '../symbols/Symbols';

@injectable()
export class FacilityService {
  private facilityRepo;
  private facilityCollection = 'facilities';

  constructor(@inject(DB_TYPES.DBProviderFactory) private dbFactory: DBProviderFactory) {
    this.facilityRepo = this.dbFactory.createDBProvider();
  }

  async listFacilities(): Promise<Facility[]> {
    return this.facilityRepo.findAll(this.facilityCollection);
  }

  async createFacility(data: Partial<Facility>): Promise<Facility> {
    // Add validation as needed
    return this.facilityRepo.create(this.facilityCollection, data);
  }

  async getFacilityById(id: string): Promise<Facility | null> {
    return this.facilityRepo.findById(this.facilityCollection, id);
  }

  async updateFacility(id: string, data: Partial<Facility>): Promise<Facility | null> {
    return this.facilityRepo.update(this.facilityCollection, id, data);
  }

  async deleteFacility(id: string): Promise<boolean> {
    return this.facilityRepo.delete(this.facilityCollection, id);
  }

  async getFacilitiesByOrganization(organizationId: string): Promise<Facility[]> {
    try {
      return this.facilityRepo.findQuery(this.facilityCollection, { organizationId });
    } catch (error) {
      console.error('Error fetching facilities by organization:', error);
      throw new Error('Failed to fetch facilities by organization');
    }
  }

  async getPublicFacilities(): Promise<Facility[]> {
    try {
      return this.facilityRepo.findQuery(this.facilityCollection, { public: true, status: 'active' });
    } catch (error) {
      console.error('Error fetching public facilities:', error);
      throw new Error('Failed to fetch public facilities');
    }
  }

  async getBookableFacilities(): Promise<Facility[]> {
    try {
      return this.facilityRepo.findQuery(this.facilityCollection, { isBookable: true, status: 'active' });
    } catch (error) {
      console.error('Error fetching bookable facilities:', error);
      throw new Error('Failed to fetch bookable facilities');
    }
  }

  async getFacilitiesByType(type: Facility['type']): Promise<Facility[]> {
    try {
      return this.facilityRepo.findQuery(this.facilityCollection, { type, status: 'active' });
    } catch (error) {
      console.error('Error fetching facilities by type:', error);
      throw new Error('Failed to fetch facilities by type');
    }
  }

  async searchFacilities(searchTerm: string): Promise<Facility[]> {
    try {
      const allFacilities = await this.facilityRepo.findAll(this.facilityCollection);
      const searchLower = searchTerm.toLowerCase();
      
      return allFacilities.filter(facility => 
        facility.name.toLowerCase().includes(searchLower) ||
        (facility.description && facility.description.toLowerCase().includes(searchLower)) ||
        (facility.address && facility.address.toLowerCase().includes(searchLower))
      );
    } catch (error) {
      console.error('Error searching facilities:', error);
      throw new Error('Failed to search facilities');
    }
  }

  async getFacilitiesWithAmenities(amenities: string[]): Promise<Facility[]> {
    try {
      const allFacilities = await this.facilityRepo.findAll(this.facilityCollection);
      
      return allFacilities.filter(facility => 
        facility.amenities && amenities.every(amenity => facility.amenities!.includes(amenity))
      );
    } catch (error) {
      console.error('Error fetching facilities with amenities:', error);
      throw new Error('Failed to fetch facilities with amenities');
    }
  }
}
