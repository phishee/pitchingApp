import { UserProfile } from "./User";

export interface Team {
  _id: string;
  name: string;
  logoUrl?: string;
  teamCode: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  organizationId: string;
}

// Original TeamMember (for database storage)
export interface TeamMember {
  _id: string;
  teamId: string;
  userId: string; 
  status: 'active' | 'inactive';
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  role?: 'coach' | 'athlete';
}

// Populated TeamMember (for API responses with user data)
export interface PopulatedTeamMember {
  _id: string;
  teamId: string;
  user: {
    userId: string;
    name: string;
    profileImageUrl?: string;
  };
  status: 'active' | 'inactive';
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  role?: 'coach' | 'athlete';
}

// Union type for flexibility
export type TeamMemberWithUser = TeamMember | PopulatedTeamMember;

export interface TeamInvitation { // invite a user to a team
  _id: string;
  teamId: string;
  invitedUserId: string;
  invitedBy: string; 
  invitedAt: Date;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  respondedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamJoinRequest { // request to join a team
  _id: string;
  teamId: string;
  requestedBy: string; 
  requestedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy: string | null; 
  reviewedAt: Date | null;
  message: string | null; 
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamJoinRequestWithTeamUserInfo extends TeamJoinRequest {
  user: {
    userId: string;
    name: string;
    profileImageUrl?: string;
  };
  team: {
    name: string;
    logoUrl?: string;
  };
}

