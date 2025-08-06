// src/app/services-client/organizationApi.ts

import axios from "axios";
import { Organization } from "@/models/Organization";

const API_BASE = "/api/v1/organizations";

export const organizationApi = {
  // Get all organizations
  async getOrganizations(): Promise<Organization[]> {
    const res = await axios.get<Organization[]>(API_BASE);
    return res.data;
  },

  // Get a single organization by ID
  async getOrganization(id: string): Promise<Organization> {
    const res = await axios.get<Organization>(`${API_BASE}/${id}`);
    return res.data;
  },

  // Create a new organization
  async createOrganization(data: Partial<Organization>): Promise<Organization> {
    const res = await axios.post<Organization>(API_BASE, data);
    return res.data;
  },

  // Update an organization by ID
  async updateOrganization(id: string, data: Partial<Organization>): Promise<Organization> {
    const res = await axios.put<Organization>(`${API_BASE}/${id}`, data);
    return res.data;
  },

  // Delete an organization by ID
  async deleteOrganization(id: string): Promise<{ message: string }> {
    const res = await axios.delete<{ message: string }>(`${API_BASE}/${id}`);
    return res.data;
  },

  // Get teams for an organization
  async getOrganizationTeams(organizationId: string): Promise<any[]> {
    const res = await axios.get<any[]>(`${API_BASE}/${organizationId}/teams`);
    return res.data;
  },

  // Get members for an organization
  async getOrganizationMembers(organizationId: string): Promise<any[]> {
    const res = await axios.get<any[]>(`${API_BASE}/${organizationId}/members`);
    return res.data;
  },

  // Upload organization logo
  async uploadLogo(organizationId: string, file: File): Promise<{ logoUrl: string }> {
    const formData = new FormData();
    formData.append('logo', file);
    const res = await axios.post<{ logoUrl: string }>(`${API_BASE}/${organizationId}/logo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
};