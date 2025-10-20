// src/services-client/facilityApi.ts

import apiClient from "@/lib/axios-config";
import { Facility } from "@/models";

const API_BASE = "/facilities";

export const facilityApi = {
  // Get all facilities
  async getFacilities(): Promise<Facility[]> {
    const res = await apiClient.get<Facility[]>(API_BASE);
    return res.data;
  },

  // Get a single facility by ID
  async getFacility(id: string): Promise<Facility> {
    const res = await apiClient.get<Facility>(`${API_BASE}/${id}`);
    return res.data;
  },

  // Create a new facility
  async createFacility(data: Partial<Facility>): Promise<Facility> {
    const res = await apiClient.post<Facility>(API_BASE, data);
    return res.data;
  },

  // Update a facility by ID
  async updateFacility(id: string, data: Partial<Facility>): Promise<Facility> {
    const res = await apiClient.put<Facility>(`${API_BASE}/${id}`, data);
    return res.data;
  },

  // Delete a facility by ID
  async deleteFacility(id: string): Promise<{ message: string }> {
    const res = await apiClient.delete<{ message: string }>(`${API_BASE}/${id}`);
    return res.data;
  },

  // Get facilities by organization
  async getFacilitiesByOrganization(organizationId: string): Promise<Facility[]> {
    const res = await apiClient.get<Facility[]>(`${API_BASE}/organization/${organizationId}`);
    return res.data;
  },

  // Get public facilities (no authentication required)
  async getPublicFacilities(): Promise<Facility[]> {
    const res = await apiClient.get<Facility[]>(`${API_BASE}/public`);
    return res.data;
  },

  // Get bookable facilities
  async getBookableFacilities(): Promise<Facility[]> {
    const res = await apiClient.get<Facility[]>(`${API_BASE}/bookable`);
    return res.data;
  },

  // Search facilities by term
  async searchFacilities(searchTerm: string): Promise<Facility[]> {
    const res = await apiClient.get<Facility[]>(`${API_BASE}/search?q=${encodeURIComponent(searchTerm)}`);
    return res.data;
  },

  // Get facilities by type
  async getFacilitiesByType(type: Facility['type']): Promise<Facility[]> {
    const res = await apiClient.get<Facility[]>(`${API_BASE}/type/${type}`);
    return res.data;
  },

  // Get facilities with specific amenities
  async getFacilitiesWithAmenities(amenities: string[]): Promise<Facility[]> {
    const res = await apiClient.get<Facility[]>(`${API_BASE}/amenities?amenities=${amenities.join(',')}`);
    return res.data;
  }
};
