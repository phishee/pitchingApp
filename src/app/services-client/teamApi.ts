// src/services/teamApi.ts

import apiClient from "@/lib/axios-config";
import { Team, TeamJoinRequest, TeamInvitation } from "@/models";
import { createDeduplicator } from "@/lib/api-utils";


import { sessionStorageService } from "@/services/storage";

const API_BASE = "/teams";
const CACHE_COLLECTION = 'cache';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export const teamApi = {
  // Get all teams
  async getTeams(): Promise<Team[]> {
    const res = await apiClient.get<Team[]>(API_BASE);
    return res.data;
  },

  // Get a single team by ID ---------- Deduplicator
  getTeam: createDeduplicator(async (id: string): Promise<Team> => {
    const cacheKey = `team_${id}`;
    const cached = sessionStorageService.getItem<Team>(cacheKey, CACHE_COLLECTION);

    if (cached) {
      // Reset expiration when accessing cache
      sessionStorageService.setItem(cacheKey, cached, {
        ttl: CACHE_TTL,
        collection: CACHE_COLLECTION
      });
      return cached;
    }

    const res = await apiClient.get<Team>(`${API_BASE}/${id}`);

    sessionStorageService.setItem(cacheKey, res.data, {
      ttl: CACHE_TTL,
      collection: CACHE_COLLECTION
    });

    return res.data;
  }, { ttl: 2000 }),

  // Create a new team
  async createTeam(data: Partial<Team>): Promise<Team> {
    const res = await apiClient.post<Team>(API_BASE, data);
    return res.data;
  },

  // Update a team by ID
  async updateTeam(id: string, data: Partial<Team>): Promise<Team> {
    const res = await apiClient.put<Team>(`${API_BASE}/${id}`, data);

    // Update cache
    const cacheKey = `team_${id}`;
    sessionStorageService.setItem(cacheKey, res.data, {
      ttl: CACHE_TTL,
      collection: CACHE_COLLECTION
    });

    return res.data;
  },

  // Delete a team by ID
  async deleteTeam(id: string): Promise<{ message: string }> {
    const res = await apiClient.delete<{ message: string }>(`${API_BASE}/${id}`);
    return res.data;
  },

  // Search team by code
  async getTeamByCode(code: string): Promise<Team | null> {
    try {
      const res = await apiClient.get<Team>(`${API_BASE}/code/${code}`);
      return res.data;
    } catch (err: any) {
      if (err.response && err.response.status === 404) {
        return null;
      }
      throw err;
    }
  },

  // Create a join request
  async createJoinRequest(data: Partial<TeamJoinRequest>): Promise<TeamJoinRequest> {
    const res = await apiClient.post<TeamJoinRequest>(`${API_BASE}/${data.teamId}/join-requests`, data);
    return res.data;
  },

  async getJoinRequestByUser(userId: string): Promise<TeamJoinRequest | null> {
    const res = await apiClient.get<TeamJoinRequest>(`${API_BASE}/join-requests/user/${userId}`);
    return res.data;
  },

  async deleteJoinRequest(id: string, teamId: string): Promise<{ message: string }> {
    const res = await apiClient.delete<{ message: string }>(`${API_BASE}/${teamId}/join-requests/${id}`);
    return res.data;
  },




  // Accept an invitation
  async acceptInvitation(id: string): Promise<{ message: string }> {
    const res = await apiClient.post<{ message: string }>(`${API_BASE}/${id}/accept`);
    return res.data;
  },

  async getJoinRequestsByUser(userId: string): Promise<TeamJoinRequest[]> {
    const res = await apiClient.get<TeamJoinRequest[]>(`${API_BASE}/join-request/user/${userId}`);
    return res.data;
  },

  async getInvitationsByUser(userId: string): Promise<TeamInvitation[]> {
    const res = await apiClient.get<TeamInvitation[]>(`${API_BASE}/invitations/user/${userId}`);
    return res.data;
  },

  async rejectInvitation(id: string): Promise<{ message: string }> {
    const res = await apiClient.post<{ message: string }>(`${API_BASE}/${id}/reject`);
    return res.data;
  }
};