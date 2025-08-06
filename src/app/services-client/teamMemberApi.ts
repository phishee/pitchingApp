// src/app/services-client/teamMemberApi.ts

import axios from "axios";
import { TeamMember } from "@/models";

const API_BASE = "/api/v1/team-members";

export const teamMemberApi = {
  // Get all team members
  async getTeamMembers(): Promise<TeamMember[]> {
    const res = await axios.get<TeamMember[]>(API_BASE);
    return res.data;
  },

  // Get a single team member by ID
  async getTeamMember(id: string): Promise<TeamMember> {
    const res = await axios.get<TeamMember>(`${API_BASE}/${id}`);
    return res.data;
  },

  // Create a new team member
  async createTeamMember(data: Partial<TeamMember>): Promise<TeamMember> {
    const res = await axios.post<TeamMember>(API_BASE, data);
    return res.data;
  },

  // Update a team member by ID
  async updateTeamMember(id: string, data: Partial<TeamMember>): Promise<TeamMember> {
    const res = await axios.put<TeamMember>(`${API_BASE}/${id}`, data);
    return res.data;
  },

  // Delete a team member by ID
  async deleteTeamMember(id: string): Promise<{ message: string }> {
    const res = await axios.delete<{ message: string }>(`${API_BASE}/${id}`);
    return res.data;
  },

  // Get all team members for a specific team
  async getTeamMembersByTeam(teamId: string): Promise<TeamMember[]> {
    const res = await axios.get<TeamMember[]>(`${API_BASE}/team/${teamId}`);
    return res.data;
  },

  // Get all team members for a specific user
  async getTeamMembersByUser(userId: string): Promise<TeamMember[]> {
    const res = await axios.get<TeamMember[]>(`${API_BASE}/user/${userId}`);
    return res.data;
  },

  // Get team members by status
  async getTeamMembersByStatus(status: 'active' | 'inactive'): Promise<TeamMember[]> {
    const res = await axios.get<TeamMember[]>(`${API_BASE}/status/${status}`);
    return res.data;
  },
};