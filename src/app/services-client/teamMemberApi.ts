// src/app/services-client/teamMemberApi.ts

import axios from "axios";
import { TeamInvitation, TeamJoinRequestWithTeamUserInfo, TeamMember, TeamInvitationWithTeamUserInfo } from "@/models";

const TAEM_MEMBER_API_BASE = "/api/v1/team-members";
const TEAM_INVITATION_API_BASE = "/api/v1/team-invitations";
const TEAM_REQUEST_API_BASE = "/api/v1/team-requests";
const TEAM_API_BASE = "/api/v1/teams";

export const teamMemberApi = {
  // Get all team members
  async getTeamMembers(): Promise<TeamMember[]> {
    const res = await axios.get<TeamMember[]>(TAEM_MEMBER_API_BASE);
    return res.data;
  },

  // Get a single team member by ID
  async getTeamMember(id: string): Promise<TeamMember> {
    const res = await axios.get<TeamMember>(`${TAEM_MEMBER_API_BASE}/${id}`);
    return res.data;
  },

  // Create a new team member
  async createTeamMember(data: Partial<TeamMember>): Promise<TeamMember> {
    const res = await axios.post<TeamMember>(TAEM_MEMBER_API_BASE, data);
    return res.data;
  },

  // Update a team member by ID
  async updateTeamMember(id: string, data: Partial<TeamMember>): Promise<TeamMember> {
    const res = await axios.put<TeamMember>(`${TAEM_MEMBER_API_BASE}/${id}`, data);
    return res.data;
  },

  // Delete a team member by ID
  async deleteTeamMember(id: string): Promise<{ message: string }> {
    const res = await axios.delete<{ message: string }>(`${TAEM_MEMBER_API_BASE}/${id}`);
    return res.data;
  },

  // Get all team members for a specific team
  async getTeamMembersByTeam(teamId: string): Promise<TeamMember[]> {
    const res = await axios.get<TeamMember[]>(`${TAEM_MEMBER_API_BASE}/team/${teamId}`);
    return res.data;
  },

  // Get all team members for a specific user
  async getTeamMembersByUser(userId: string): Promise<TeamMember[]> {
    const res = await axios.get<TeamMember[]>(`${TAEM_MEMBER_API_BASE}/user/${userId}`);
    return res.data;
  },

  // Get team members by status
  async getTeamMembersByStatus(status: 'active' | 'inactive'): Promise<TeamMember[]> {
    const res = await axios.get<TeamMember[]>(`${TAEM_MEMBER_API_BASE}/status/${status}`);
    return res.data;
  },

  // Get team invitations by team ID
  async getTeamInvitationsByTeam(teamId: string): Promise<TeamInvitationWithTeamUserInfo[]> {
    const res = await axios.get<TeamInvitationWithTeamUserInfo[]>(`${TEAM_API_BASE}/${teamId}/invitations`);
    return res.data;
  },

  // Get team requests by team ID
  async getTeamRequestsByTeam(teamId: string): Promise<TeamJoinRequestWithTeamUserInfo[]> {
    const res = await axios.get<TeamJoinRequestWithTeamUserInfo[]>(`${TEAM_API_BASE}/${teamId}/join-requests`);
    return res.data;
  },

  // accept team request by id
  async acceptTeamRequest(requestId: string, teamId: string): Promise<TeamJoinRequestWithTeamUserInfo> {
    const res = await axios.put<TeamJoinRequestWithTeamUserInfo>(`${TEAM_API_BASE}/${teamId}/join-requests/${requestId}/approve`);
    return res.data;
  },

  // reject team request by id
  async rejectTeamRequest(id: string, data: { comment?: string; rejectedBy?: string }): Promise<TeamJoinRequestWithTeamUserInfo> {
    const res = await axios.put<TeamJoinRequestWithTeamUserInfo>(
      `${TEAM_API_BASE}/${id}/join-requests/${id}/reject`,
      data
    );
    return res.data;
  },
};