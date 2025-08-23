
import axios from "axios";
import { TeamInvitation } from "@/models";

const API_BASE = "/api/v1/teams";

export const teamInvitationApi = {
  // Create a new invitation
  async createInvitation(teamId: string, data: Partial<TeamInvitation>): Promise<TeamInvitation> {
    const res = await axios.post<TeamInvitation>(`${API_BASE}/${teamId}/invitations`, data);
    return res.data;
  },

  // Get invitations by team
  async getInvitationsByTeam(teamId: string): Promise<TeamInvitation[]> {
    const res = await axios.get<TeamInvitation[]>(`${API_BASE}/${teamId}/invitations`);
    return res.data;
  },

  // Get invitation by ID
  async getInvitationById(teamId: string, invitationId: string): Promise<TeamInvitation> {
    const res = await axios.get<TeamInvitation>(`${API_BASE}/${teamId}/invitations/${invitationId}`);
    return res.data;
  },

  // Get invitations by user ID
  async getInvitationsByUser(userId: string): Promise<TeamInvitation[]> {
    const res = await axios.get<TeamInvitation[]>(`/api/v1/invitations/user/${userId}`);
    return res.data;
  },

  // Update invitation
  async updateInvitation(teamId: string, invitationId: string, data: Partial<TeamInvitation>): Promise<TeamInvitation> {
    const res = await axios.put<TeamInvitation>(`${API_BASE}/${teamId}/invitations/${invitationId}`, data);
    return res.data;
  },

  // Delete invitation
  async deleteInvitation(teamId: string, invitationId: string): Promise<{ message: string }> {
    const res = await axios.delete<{ message: string }>(`${API_BASE}/${teamId}/invitations/${invitationId}`);
    return res.data;
  },

  // Accept invitation
  async acceptInvitation(teamId: string, invitationId: string): Promise<TeamInvitation> {
    const res = await axios.post<TeamInvitation>(`${API_BASE}/${teamId}/invitations/${invitationId}/accept`);
    return res.data;
  },

  // Reject invitation
  async rejectInvitation(teamId: string, invitationId: string): Promise<TeamInvitation> {
    const res = await axios.post<TeamInvitation>(`${API_BASE}/${teamId}/invitations/${invitationId}/reject`);
    return res.data;
  },
};

