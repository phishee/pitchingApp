// src/app/services-client/organizationApi.ts

import apiClient from "@/lib/axios-config";
import { Organization } from "@/models/Organization";

import { sessionStorageService } from "@/services/storage";

const API_BASE = "/organizations";
const CACHE_COLLECTION = 'cache';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export const organizationApi = {
  // Get all organizations
  async getOrganizations(): Promise<Organization[]> {
    const res = await apiClient.get<Organization[]>(API_BASE);
    return res.data;
  },

  // Get a single organization by ID
  async getOrganization(id: string): Promise<Organization> {
    const cacheKey = `organization_${id}`;
    const cached = sessionStorageService.getItem<Organization>(cacheKey, CACHE_COLLECTION);

    if (cached) {
      // Reset expiration when accessing cache
      sessionStorageService.setItem(cacheKey, cached, {
        ttl: CACHE_TTL,
        collection: CACHE_COLLECTION
      });
      return cached;
    }

    const res = await apiClient.get<Organization>(`${API_BASE}/${id}`);

    sessionStorageService.setItem(cacheKey, res.data, {
      ttl: CACHE_TTL,
      collection: CACHE_COLLECTION
    });

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

    // Update cache
    const cacheKey = `organization_${id}`;
    sessionStorageService.setItem(cacheKey, res.data, {
      ttl: CACHE_TTL,
      collection: CACHE_COLLECTION
    });

    return res.data;
  },

  // Delete an organization by ID
  async deleteOrganization(id: string): Promise<{ message: string }> {
    const res = await apiClient.delete<{ message: string }>(`${API_BASE}/${id}`);

    // Clear cache
    const cacheKey = `organization_${id}`;
    sessionStorageService.removeItem(cacheKey, CACHE_COLLECTION);

    return res.data;
  },

  // Get teams for an organization
  async getOrganizationTeams(organizationId: string): Promise<any[]> {
    const cacheKey = `organization_teams_${organizationId}`;
    const cached = sessionStorageService.getItem<any[]>(cacheKey, CACHE_COLLECTION);

    if (cached) {
      // Reset expiration when accessing cache
      sessionStorageService.setItem(cacheKey, cached, {
        ttl: CACHE_TTL,
        collection: CACHE_COLLECTION
      });
      return cached;
    }

    const res = await apiClient.get<any[]>(`${API_BASE}/${organizationId}/teams`);

    sessionStorageService.setItem(cacheKey, res.data, {
      ttl: CACHE_TTL,
      collection: CACHE_COLLECTION
    });

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