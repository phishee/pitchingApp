'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './auth-context';
import { Team, TeamMember, TeamInvitation, TeamJoinRequest } from '@/models';
import { teamMemberApi } from '@/app/services-client/teamMemberApi';

// import { teamJoinRequestApi } from '@/app/services-client/teamJoinRequestApi';
import { teamApi } from '@/app/services-client/teamApi';

export type UserTeamStatus = 'no-team' | 'pending-request' | 'pending-invitation' | 'team-member';

interface UserContextType {
  // User's team status and data
  userTeamStatus: UserTeamStatus;
  currentTeam: Team | null;
  currentTeamMember: TeamMember | null;
  pendingInvitation: TeamInvitation | null;
  pendingJoinRequest: TeamJoinRequest | null;
  teamToJoin: Team | null;
  setTeamToJoin: (team: Team | null) => void;
  searchTeamByCode: (code: string) => Promise<void>;
  // Loading and error states
  isLoading: boolean;
  error: string;

  // setters
  setPendingJoinRequest: (joinRequest: TeamJoinRequest | null) => void;
  
  // Actions
  loadUserData: () => Promise<void>;
  joinTeam: (teamCode: string) => Promise<void>;
  acceptInvitation: (invitationId: string) => Promise<void>;
  rejectInvitation: (invitationId: string) => Promise<void>;

  clearError: () => void;
}

// Create context
const UserContext = createContext<UserContextType | null>(null);

// Provider component
export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  
  // State
  const [userTeamStatus, setUserTeamStatus] = useState<UserTeamStatus>('no-team');
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [teamToJoin, setTeamToJoin] = useState<Team | null>(null);
  const [currentTeamMember, setCurrentTeamMember] = useState<TeamMember | null>(null);
  const [pendingInvitation, setPendingInvitation] = useState<TeamInvitation | null>(null);
  const [pendingJoinRequest, setPendingJoinRequest] = useState<TeamJoinRequest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Load user data on mount and when user changes
  useEffect(() => {
    if (user?.userId) {
      loadUserData();
    }
  }, [user]);

  const searchTeamByCode = async (code: string) => {
    const team = await teamApi.getTeamByCode(code);
    setTeamToJoin(team);
  }

  const loadUserData = async () => {
    if (!user?.userId) return;

    try {
      setIsLoading(true);
      setError('');

      // Step 1: Check if user has an active team member record
      const teamMembers = await teamMemberApi.getTeamMembersByUser(user.userId);
      const activeTeamMember = teamMembers?.find(member => member.status === 'active');
      
      if (activeTeamMember) {
        // User is a team member - load team info
        try {
          const team = await teamApi.getTeam(activeTeamMember.teamId);
          setCurrentTeam(team);
          setCurrentTeamMember(activeTeamMember);
          setUserTeamStatus('team-member');
          
          // Clear other states
          setPendingInvitation(null);
          setPendingJoinRequest(null);
          return;
        } catch (error) {
          console.error('Error loading team info:', error);
          // If team loading fails, continue to next step
        }
      }

      // Step 2: Check if user has sent a join request
      const joinRequests = await teamApi.getJoinRequestsByUser(user.userId);
      const pendingRequest = joinRequests?.find(request => request.status === 'pending');
      
      if (pendingRequest) {
        setPendingJoinRequest(pendingRequest);
        setUserTeamStatus('pending-request');
        
        // Clear other states
        setCurrentTeam(null);
        setCurrentTeamMember(null);
        setPendingInvitation(null);
        return;
      }

      // Step 3: Check if user has a pending invitation
      const invitations = await teamApi.getInvitationsByUser(user.userId);
      const pendingInvite = invitations?.find(invitation => invitation.status === 'pending');
      
      if (pendingInvite) {
        setPendingInvitation(pendingInvite);
        setUserTeamStatus('pending-invitation');
        
        // Clear other states
        setCurrentTeam(null);
        setCurrentTeamMember(null);
        setPendingJoinRequest(null);
        return;
      }

      // No team, no pending requests, no pending invitations
      setUserTeamStatus('no-team');
      setCurrentTeam(null);
      setCurrentTeamMember(null);
      setPendingInvitation(null);
      setPendingJoinRequest(null);

    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Failed to load user data');
    } finally {
      setIsLoading(false);
    }
  };

  const joinTeam = async () => {
    if (!user?.userId || !teamToJoin) {
      setError('No team selected to join');
      return;
    }
  
    try {
      setIsLoading(true);
      setError('');
  
      // Create join request using teamToJoin
      const joinRequest = await teamApi.createJoinRequest({
        teamId: teamToJoin._id,
        requestedBy: user.userId,
        requestedAt: new Date(),
        status: 'pending',
        reviewedBy: null,
        reviewedAt: null,
        message: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });
  
      // Update local state
      setPendingJoinRequest(joinRequest);
      setUserTeamStatus('pending-request');
      
      // Clear other states
      setCurrentTeam(null);
      setCurrentTeamMember(null);
      setPendingInvitation(null);
  
    } catch (error) {
      console.error('Error joining team:', error);
      setError('Failed to send join request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const acceptInvitation = async (invitationId: string) => {
    if (!user?.userId) return;

    try {
      setIsLoading(true);
      setError('');

      // Accept the invitation
      await teamApi.acceptInvitation(invitationId);
      
      // Create team member record
      const teamMember = await teamMemberApi.createTeamMember({
        teamId: pendingInvitation!.teamId,
        userId: user.userId,
        status: 'active',
        joinedAt: new Date(),
        role: 'athlete',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Reload data to get updated state
      await loadUserData();

    } catch (error) {
      console.error('Error accepting invitation:', error);
      setError('Failed to accept invitation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const rejectInvitation = async (invitationId: string) => {
    try {
      setIsLoading(true);
      setError('');

      await teamApi.rejectInvitation(invitationId);
      
      // Update local state
      setPendingInvitation(null);
      setUserTeamStatus('no-team');

    } catch (error) {
      console.error('Error rejecting invitation:', error);
      setError('Failed to reject invitation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError('');
  };

  const value: UserContextType = {
    userTeamStatus,
    currentTeam,
    currentTeamMember,
    pendingInvitation,
    pendingJoinRequest,
    teamToJoin,
    setTeamToJoin,
    searchTeamByCode,
    isLoading,
    error,
    loadUserData,
    joinTeam,
    acceptInvitation,
    rejectInvitation,
    clearError,
    setPendingJoinRequest
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};