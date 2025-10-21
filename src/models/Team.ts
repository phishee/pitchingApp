import { User } from "./User";

export interface TeamColor {
  primary: string;    // Main color (e.g., "#3B82F6")
  secondary: string;  // Lighter version (e.g., "#DBEAFE")
}

export interface Team {
  _id: string;
  name: string;
  logoUrl?: string;
  teamCode: string;
  description: string;
  color?: TeamColor;
  createdAt: Date;
  updatedAt: Date;
  organizationId: string;
  facilityId?: string;
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
  programIds?: string[];
}

// Populated TeamMember (for API responses with user data)
export interface PopulatedTeamMember extends TeamMember {
  user?: Partial<User>;
  team?: Partial<Team>;
}

// Union type for flexibility
export type TeamMemberWithUser = TeamMember | PopulatedTeamMember;

export interface TeamInvitation { // invite a user to a team
  _id: string;
  teamId: string;
  invitedUserId?: string;
  invitedEmail: string;
  role?: 'coach' | 'athlete';
  comment?: string;
  invitedBy: string; 
  invitedAt: Date;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  respondedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamInvitationWithTeamUserInfo extends TeamInvitation {
  user?: Partial<User>;
  team?: Partial<Team>;
  invitedByUser?: Partial<User>;
}

export interface TeamJoinRequest { // request to join a team
  _id: string;
  teamId: string;
  requestedBy: string; 
  requestedAt: Date;
  role?: 'coach' | 'athlete';
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string | null; 
  reviewedAt?: Date | null;
  comment?: string | null; 
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamJoinRequestWithTeamUserInfo extends TeamJoinRequest {
  user?: Partial<User>;
  team?: Partial<Team>;
}

