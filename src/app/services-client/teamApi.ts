// src/services/teamApi.ts

import axios from "axios";
import { Team, TeamJoinRequest, TeamInvitation } from "@/models";


const API_BASE = "/api/v1/teams";
// const JOIN_REQUEST_BASE = "/api/v1/teams/join-request";

export const teamApi = {
  // Get all teams
  async getTeams(): Promise<Team[]> {
    const res = await axios.get<Team[]>(API_BASE);
    return res.data;
  },

  // Get a single team by ID
  async getTeam(id: string): Promise<Team> {
    const res = await axios.get<Team>(`${API_BASE}/${id}`);
    return res.data;
  },

  // Create a new team
  async createTeam(data: Partial<Team>): Promise<Team> {
    const res = await axios.post<Team>(API_BASE, data);
    return res.data;
  },

  // Update a team by ID
  async updateTeam(id: string, data: Partial<Team>): Promise<Team> {
    const res = await axios.put<Team>(`${API_BASE}/${id}`, data);
    return res.data;
  },

  // Delete a team by ID
  async deleteTeam(id: string): Promise<{ message: string }> {
    const res = await axios.delete<{ message: string }>(`${API_BASE}/${id}`);
    return res.data;
  },

  // Search team by code
  async getTeamByCode(code: string): Promise<Team | null> {
    try {
      const res = await axios.get<Team>(`${API_BASE}/code/${code}`);
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
    const res = await axios.post<TeamJoinRequest>(`${API_BASE}/${data.teamId}/join-requests`, data);
    return res.data;
  },

  async getJoinRequestByUser(userId: string): Promise<TeamJoinRequest | null> {
    const res = await axios.get<TeamJoinRequest>(`${API_BASE}/join-requests/user/${userId}`);
    return res.data;
  },

  async deleteJoinRequest(id: string, teamId: string): Promise<{ message: string }> {
    const res = await axios.delete<{ message: string }>(`${API_BASE}/${teamId}/join-requests/${id}`);
    return res.data;
  },




  // Accept an invitation
  async acceptInvitation(id: string): Promise<{ message: string }> {
    const res = await axios.post<{ message: string }>(`${API_BASE}/${id}/accept`);
    return res.data;
  },

  async getJoinRequestsByUser(userId: string): Promise<TeamJoinRequest[]> {
    const res = await axios.get<TeamJoinRequest[]>(`${API_BASE}/join-request/user/${userId}`);
    return res.data;
  },

  async getInvitationsByUser(userId: string): Promise<TeamInvitation[]> {
    const res = await axios.get<TeamInvitation[]>(`${API_BASE}/invitations/user/${userId}`);
    return res.data;
  },

  async rejectInvitation(id: string): Promise<{ message: string }> {
    const res = await axios.post<{ message: string }>(`${API_BASE}/${id}/reject`);
    return res.data;
  }
};