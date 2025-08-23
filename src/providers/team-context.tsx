'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from './user.context';
import { Team, TeamInvitation, TeamMemberWithUser, TeamJoinRequestWithTeamUserInfo, TeamInvitationWithTeamUserInfo } from '@/models';
import { teamMemberApi } from '@/app/services-client/teamMemberApi';
import { teamApi } from '@/app/services-client/teamApi';
import { teamInvitationApi } from '@/app/services-client/teamInvitationApi';

export type UserTeamStatus = 'no-team' | 'pending-request' | 'pending-invitation' | 'team-member';

interface TeamState {
  // User team status
  userTeamStatus: UserTeamStatus;
  currentUserPendingInvitations: Partial<TeamInvitationWithTeamUserInfo>[] | null;
  pendingJoinRequest: Partial<TeamJoinRequestWithTeamUserInfo> | null;
  teamToJoin: Team | null;

  // Current team
  currentTeam: Team | null;
  currentTeamMember: Partial<TeamMemberWithUser> | null;
  teamMembers: Partial<TeamMemberWithUser>[];
  teamInvitations: Partial<TeamInvitationWithTeamUserInfo>[];
  teamRequests: Partial<TeamJoinRequestWithTeamUserInfo>[];

  // All teams (for coaches)
  allTeams: Team[];
  allTeamMembers: Partial<TeamMemberWithUser>[];

  // Loading states
  isLoading: boolean;
  error: string;
}

interface TeamContextType extends TeamState {
  // Actions
  loadTeamData: () => Promise<void>;
  joinTeam: (teamCode: string) => Promise<void>;
  acceptInvitation: (invitationId: string, teamId: string) => Promise<void>;
  rejectInvitation: (invitationId: string, teamId: string) => Promise<void>;
  searchTeamByCode: (code: string) => Promise<void>;
  leaveTeam: () => Promise<void>;
  switchTeam: (teamId: string) => Promise<void>;
  sendTeamInvitations: (invitations: Partial<TeamInvitationWithTeamUserInfo>[]) => Promise<TeamInvitationWithTeamUserInfo[]>;
  clearError: () => void;
  
  // Team data loading functions
  loadTeamMembers: (teamId?: string) => Promise<void>;
  loadTeamRequests: (teamId?: string) => Promise<void>;
  
  // State setters (only expose what's needed)
  setPendingJoinRequest: (joinRequest: Partial<TeamJoinRequestWithTeamUserInfo> | null) => void;
  setCurrentUserPendingInvitations: (invitations: Partial<TeamInvitationWithTeamUserInfo>[] | null) => void;
}

const TeamContext = createContext<TeamContextType | null>(null);

const initialState: TeamState = {
  userTeamStatus: 'no-team',
  currentUserPendingInvitations: null,
  pendingJoinRequest: null,
  teamToJoin: null,
  currentTeam: null,
  currentTeamMember: null,
  teamMembers: [],
  teamInvitations: [],
  teamRequests: [],
  allTeams: [],
  allTeamMembers: [],
  isLoading: true,
  error: '',
};

export const TeamProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();
  const [state, setState] = useState<TeamState>(initialState);
  
  // Use ref to track if data is being loaded to prevent duplicate calls
  const loadingRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);

  // Centralized state updater
  const updateState = useCallback((updates: Partial<TeamState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Helper function to load team-specific data
  const loadTeamSpecificData = useCallback(async (teamId: string) => {
    try {
      const [members, invitations, requests] = await Promise.all([
        teamMemberApi.getTeamMembersByTeam(teamId).catch(() => []),
        teamMemberApi.getTeamInvitationsByTeam(teamId).catch(() => []),
        teamMemberApi.getTeamRequestsByTeam(teamId).catch(() => [])
      ]);

      updateState({
        teamMembers: members,
        teamInvitations: invitations,
        teamRequests: requests,
      });
    } catch (error) {
      console.error('Error loading team specific data:', error);
    }
  }, [updateState]);

  // Load user's pending invitations
  const loadUserInvitations = useCallback(async (userId: string) => {
    try {
      const invitations = await teamInvitationApi.getInvitationsByUser(userId);
      const pendingInvitations = invitations?.filter(inv => inv.status === 'pending') || [];
      
      updateState({ 
        currentUserPendingInvitations: pendingInvitations,
        userTeamStatus: pendingInvitations.length > 0 ? 'pending-invitation' : 'no-team'
      });
    } catch (error) {
      console.error('Error loading user invitations:', error);
    }
  }, [updateState]);

  // Load team members for a specific team
  const loadTeamMembers = useCallback(async (teamId?: string) => {
    const targetTeamId = teamId || state.currentTeam?._id;
    if (!targetTeamId) return;

    try {
      const members = await teamMemberApi.getTeamMembersByTeam(targetTeamId);
      updateState({ teamMembers: members });
    } catch (error) {
      console.error('Error loading team members:', error);
    }
  }, [state.currentTeam, updateState]);

  // Load team requests for a specific team
  const loadTeamRequests = useCallback(async (teamId?: string) => {
    const targetTeamId = teamId || state.currentTeam?._id;
    if (!targetTeamId) return;

    try {
      const requests = await teamMemberApi.getTeamRequestsByTeam(targetTeamId);
      updateState({ teamRequests: requests });
    } catch (error) {
      console.error('Error loading team requests:', error);
    }
  }, [state.currentTeam, updateState]);

  // Main data loading function
  const loadTeamData = useCallback(async () => {
    if (!user?.userId || loadingRef.current) return;

    // Prevent duplicate calls
    loadingRef.current = true;
    
    try {
      updateState({ isLoading: true, error: '' });

      // Get all team memberships for the user
      const teamMembers = await teamMemberApi.getTeamMembersByUser(user.userId);
      const activeTeamMembers = teamMembers?.filter(member => member.status === 'active') || [];

      if (activeTeamMembers.length > 0) {
        // Load all teams for active memberships
        const teamPromises = activeTeamMembers.map(member => 
          teamApi.getTeam(member.teamId).catch(error => {
            console.error(`Error loading team ${member.teamId}:`, error);
            return null;
          })
        );

        const teams = await Promise.all(teamPromises);
        const validTeams = teams.filter(Boolean) as Team[];

        updateState({
          allTeams: validTeams,
          allTeamMembers: activeTeamMembers,
        });

        // Set current team based on user role
        const currentTeam = validTeams[0];
        const currentTeamMember = activeTeamMembers[0];

        if (currentTeam && currentTeamMember) {
          updateState({
            currentTeam,
            currentTeamMember,
            userTeamStatus: 'team-member',
          });

          // Load team-specific data
          await loadTeamSpecificData(currentTeam._id);
          return;
        }
      }

      // Check for pending join requests
      try {
        const joinRequests = await teamApi.getJoinRequestsByUser(user.userId);
        const pendingRequest = joinRequests?.find(request => request.status === 'pending');

        if (pendingRequest) {
          updateState({
            pendingJoinRequest: pendingRequest,
            userTeamStatus: 'pending-request',
          });
          return;
        }
      } catch (error) {
        console.error('Error loading join requests:', error);
      }

      // Check for pending invitations
      await loadUserInvitations(user.userId);

    } catch (error) {
      console.error('Error loading team data:', error);
      updateState({ error: 'Failed to load team data' });
    } finally {
      updateState({ isLoading: false });
      loadingRef.current = false;
    }
  }, [user?.userId, updateState, loadTeamSpecificData, loadUserInvitations]);

  // Switch team (for coaches)
  const switchTeam = useCallback(async (teamId: string) => {
    if (!user || user.role !== 'coach') return;

    try {
      updateState({ isLoading: true, error: '' });

      const teamMember = state.allTeamMembers.find(member => member.teamId === teamId);
      const team = state.allTeams.find(t => t._id === teamId);

      if (!teamMember || !team) {
        throw new Error('Team or team member not found');
      }

      updateState({
        currentTeam: team,
        currentTeamMember: teamMember,
      });

      await loadTeamSpecificData(teamId);
    } catch (error) {
      console.error('Error switching team:', error);
      updateState({ error: 'Failed to switch team' });
    } finally {
      updateState({ isLoading: false });
    }
  }, [user, state.allTeamMembers, state.allTeams, updateState, loadTeamSpecificData]);

  // Send team invitations
  const sendTeamInvitations = useCallback(async (invitations: Partial<TeamInvitation>[]): Promise<TeamInvitationWithTeamUserInfo[]> => {
    if (!state.currentTeam?._id) {
      throw new Error('No current team selected');
    }

    try {
      const createdInvitations = await Promise.all(
        invitations.map(invitation => {
          const invitationData = {
            ...invitation,
            teamId: state.currentTeam!._id,
            invitedAt: new Date(),
            status: 'pending' as const,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          return teamInvitationApi.createInvitation(state.currentTeam!._id, invitationData);
        })
      );

      // Refresh team invitations to get the latest data with user info
      const refreshedInvitations = await teamMemberApi.getTeamInvitationsByTeam(state.currentTeam._id);
      
      // Update local state with refreshed data
      updateState({
        teamInvitations: refreshedInvitations,
      });

      return createdInvitations;
    } catch (error) {
      console.error('Error sending team invitations:', error);
      throw error;
    }
  }, [state.currentTeam, updateState]);

  // Placeholder functions for incomplete implementations
  const joinTeam = useCallback(async (teamCode: string) => {
    // TODO: Implement join team logic
  }, []);

  const acceptInvitation = useCallback(async (invitationId: string, teamId: string) => {
    if (!teamId) {
      throw new Error('No current team selected');
    }

    try {
      updateState({ isLoading: true, error: '' });

      // Accept the invitation
      await teamInvitationApi.acceptInvitation(teamId, invitationId);

      // Remove the accepted invitation from pending invitations
      if (state.currentUserPendingInvitations) {
        const updatedPendingInvitations = state.currentUserPendingInvitations.filter(
          inv => inv._id !== invitationId
        );
        
        updateState({ 
          currentUserPendingInvitations: updatedPendingInvitations.length > 0 
            ? updatedPendingInvitations 
            : null 
        });
      }

      // Refresh team data to get the new member and updated invitations
      await loadTeamData();

    } catch (error) {
      console.error('Error accepting invitation:', error);
      updateState({ error: 'Failed to accept invitation' });
      throw error;
    } finally {
      updateState({ isLoading: false });
    }
  }, [state.currentTeam, updateState, loadTeamData, loadTeamSpecificData]);

  const rejectInvitation = useCallback(async (invitationId: string, teamId: string) => {
    if (!teamId) {
      throw new Error('No current team selected');
    }

    try {
      updateState({ isLoading: true, error: '' });

      // Reject the invitation
      await teamInvitationApi.rejectInvitation(teamId, invitationId);

      // Remove the rejected invitation from pending invitations
      if (state.currentUserPendingInvitations) {
        const updatedPendingInvitations = state.currentUserPendingInvitations.filter(
          inv => inv._id !== invitationId
        );
        
        updateState({ 
          currentUserPendingInvitations: updatedPendingInvitations.length > 0 
            ? updatedPendingInvitations 
            : null 
        });
      }

      // Refresh team data to get the updated invitations
      await loadTeamData();

    } catch (error) {
      console.error('Error rejecting invitation:', error);
      updateState({ error: 'Failed to reject invitation' });
      throw error;
    } finally {
      updateState({ isLoading: false });
    }
  }, [state.currentUserPendingInvitations, updateState, loadTeamData]);

  const searchTeamByCode = useCallback(async (code: string) => {
    try {
      const team = await teamApi.getTeamByCode(code);
      updateState({ teamToJoin: team });
    } catch (error) {
      console.error('Error searching team by code:', error);
      updateState({ error: 'Team not found' });
    }
  }, [updateState]);

  const leaveTeam = useCallback(async () => {
    // TODO: Implement leave team logic
  }, []);

  const clearError = useCallback(() => {
    updateState({ error: '' });
  }, [updateState]);

  // Reset state helper
  const resetState = useCallback(() => {
    setState(initialState);
    loadingRef.current = false;
    lastUserIdRef.current = null;
  }, []);

  // Effect for user changes - only reload if user actually changed
  useEffect(() => {
    if (user?.userId && user.userId !== lastUserIdRef.current) {
      lastUserIdRef.current = user.userId;
      loadTeamData();
    } else if (!user) {
      resetState();
    }
  }, [user?.userId, loadTeamData, resetState]);

  // Logout event listener
  useEffect(() => {
    const handleLogout = () => resetState();
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [resetState]);

  // Simple setters for external state updates
  const setPendingJoinRequest = useCallback((joinRequest: Partial<TeamJoinRequestWithTeamUserInfo> | null) => {
    updateState({ pendingJoinRequest: joinRequest });
  }, [updateState]);

  const setCurrentUserPendingInvitations = useCallback((invitations: Partial<TeamInvitationWithTeamUserInfo>[] | null) => {
    updateState({ currentUserPendingInvitations: invitations });
  }, [updateState]);

  const contextValue: TeamContextType = {
    ...state,
    loadTeamData,
    joinTeam,
    acceptInvitation,
    rejectInvitation,
    searchTeamByCode,
    switchTeam,
    leaveTeam,
    sendTeamInvitations,
    clearError,
    loadTeamMembers,
    loadTeamRequests,
    setPendingJoinRequest,
    setCurrentUserPendingInvitations,
  };

  return (
    <TeamContext.Provider value={contextValue}>
      {children}
    </TeamContext.Provider>
  );
};

export const useTeam = () => {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeam must be used within TeamProvider');
  }
  return context;
};