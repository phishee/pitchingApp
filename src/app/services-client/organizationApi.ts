// src/app/services-client/organizationApi.ts

import apiClient from "@/lib/axios-config";
import { Organization } from "@/models/Organization";

const API_BASE = "/organizations";

export const organizationApi = {
  // Get all organizations
  async getOrganizations(): Promise<Organization[]> {
    const res = await apiClient.get<Organization[]>(API_BASE);
    return res.data;
  },

  // Get a single organization by ID
  async getOrganization(id: string): Promise<Organization> {
    const res = await apiClient.get<Organization>(`${API_BASE}/${id}`);
    return res.data;
  },

  // Create a new organization
  async createOrganization(data: Partial<Organization>): Promise<Organization> {
    const res = await apiClient.post<Organization>(API_BASE, data);
    return res.data;
  },

  // Update an organization by ID
  async updateOrganization(id: string, data: Partial<Organization>): Promise<Organization> {
    const res = await apiClient.put<Organization>(`${API_BASE}/${id}`, data);
    return res.data;
  },

  // Delete an organization by ID
  async deleteOrganization(id: string): Promise<{ message: string }> {
    const res = await apiClient.delete<{ message: string }>(`${API_BASE}/${id}`);
    return res.data;
  },

  // Get teams for an organization
  async getOrganizationTeams(organizationId: string): Promise<any[]> {
    const res = await apiClient.get<any[]>(`${API_BASE}/${organizationId}/teams`);
    return res.data;
  },

  // Get members for an organization
  async getOrganizationMembers(organizationId: string): Promise<any[]> {
    const res = await apiClient.get<any[]>(`${API_BASE}/${organizationId}/members`);
    return res.data;
  },

  // Upload organization logo
  async uploadLogo(organizationId: string, file: File): Promise<{ logoUrl: string }> {
    const formData = new FormData();
    formData.append('logo', file);
    const res = await apiClient.post<{ logoUrl: string }>(`${API_BASE}/${organizationId}/logo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
};