'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from './user.context';
import { Team, TeamMemberWithUser, TeamJoinRequestWithTeamUserInfo, TeamInvitationWithTeamUserInfo } from '@/models';
import { teamMemberApi } from '@/app/services-client/teamMemberApi';
import { teamApi } from '@/app/services-client/teamApi';
import { teamInvitationApi } from '@/app/services-client/teamInvitationApi';

export type UserTeamStatus = 'no-team' | 'pending-request' | 'pending-invitation' | 'team-member';

interface TeamState {
  userTeamStatus: UserTeamStatus;
  currentUserPendingInvitations: Partial<TeamInvitationWithTeamUserInfo>[] | null;
  pendingJoinRequest: Partial<TeamJoinRequestWithTeamUserInfo> | null;
  teamToJoin: Team | null;
  currentTeam: Team | null;
  currentTeamMember: Partial<TeamMemberWithUser> | null;
  teamMembers: Partial<TeamMemberWithUser>[];
  teamInvitations: Partial<TeamInvitationWithTeamUserInfo>[];
  teamRequests: Partial<TeamJoinRequestWithTeamUserInfo>[];
  allTeams: Team[];
  allTeamMembers: Partial<TeamMemberWithUser>[];
  isLoading: boolean;
  error: string;
}

interface TeamContextType extends TeamState {
  loadTeamData: () => Promise<void>;
  refreshTeamData: () => Promise<void>;
  joinTeam: (teamCode: string) => Promise<void>;
  acceptInvitation: (invitationId: string, teamId: string) => Promise<void>;
  rejectInvitation: (invitationId: string, teamId: string) => Promise<void>;
  searchTeamByCode: (code: string) => Promise<void>;
  leaveTeam: () => Promise<void>;
  switchTeam: (teamId: string) => Promise<void>;
  sendTeamInvitations: (invitations: Partial<TeamInvitationWithTeamUserInfo>[]) => Promise<TeamInvitationWithTeamUserInfo[]>;
  clearError: () => void;
  loadTeamMembers: (teamId?: string) => Promise<void>;
  loadTeamRequests: (teamId?: string) => Promise<void>;
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
  
  // Use refs to prevent duplicate calls and track loading state
  const loadingRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);
  const isExecutingRef = useRef(false);

  // Centralized state updater - stable reference
  const updateState = useCallback((updates: Partial<TeamState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Helper functions that don't depend on state directly
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

  // Main data loading function - now with proper dependencies
  const loadTeamData = useCallback(async () => {
    if (!user?.userId || loadingRef.current) return;

    loadingRef.current = true;
    
    try {
      updateState({ isLoading: true, error: '' });

      const teamMembers = await teamMemberApi.getTeamMembersByUser(user.userId);
      const activeTeamMembers = teamMembers?.filter(member => member.status === 'active') || [];

      if (activeTeamMembers.length > 0) {
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

        const currentTeam = validTeams[0];
        const currentTeamMember = activeTeamMembers[0];

        if (currentTeam && currentTeamMember) {
          updateState({
            currentTeam,
            currentTeamMember,
            userTeamStatus: 'team-member',
          });

          await loadTeamSpecificData(currentTeam._id);
          return;
        }
      }

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

      await loadUserInvitations(user.userId);

    } catch (error) {
      console.error('Error loading team data:', error);
      updateState({ error: 'Failed to load team data' });
    } finally {
      updateState({ isLoading: false });
      loadingRef.current = false;
    }
  }, [user?.userId, updateState, loadTeamSpecificData, loadUserInvitations]);

  // Load team members - use current state via function parameter
  const loadTeamMembers = useCallback(async (teamId?: string) => {
    // Get current state at call time, don't depend on it
    setState(currentState => {
      const targetTeamId = teamId || currentState.currentTeam?._id;
      if (!targetTeamId) return currentState;

      teamMemberApi.getTeamMembersByTeam(targetTeamId)
        .then(members => {
          setState(prevState => ({ ...prevState, teamMembers: members }));
        })
        .catch(error => {
          console.error('Error loading team members:', error);
        });

      return currentState;
    });
  }, []);

  // Load team requests - use current state via function parameter  
  const loadTeamRequests = useCallback(async (teamId?: string) => {
    setState(currentState => {
      const targetTeamId = teamId || currentState.currentTeam?._id;
      if (!targetTeamId) return currentState;

      teamMemberApi.getTeamRequestsByTeam(targetTeamId)
        .then(requests => {
          setState(prevState => ({ ...prevState, teamRequests: requests }));
        })
        .catch(error => {
          console.error('Error loading team requests:', error);
        });

      return currentState;
    });
  }, []);

  const switchTeam = useCallback(async (teamId: string) => {
    if (!user || user.role !== 'coach') return;

    setState(currentState => {
      const teamMember = currentState.allTeamMembers.find(member => member.teamId === teamId);
      const team = currentState.allTeams.find(t => t._id === teamId);

      if (!teamMember || !team) {
        console.error('Team or team member not found');
        return { ...currentState, error: 'Failed to switch team' };
      }

      // Load team specific data for the new team
      loadTeamSpecificData(teamId);

      return {
        ...currentState,
        currentTeam: team,
        currentTeamMember: teamMember,
        isLoading: false,
        error: ''
      };
    });
  }, [user, loadTeamSpecificData]);

  const sendTeamInvitations = useCallback(async (invitations: Partial<TeamInvitationWithTeamUserInfo>[]): Promise<TeamInvitationWithTeamUserInfo[]> => {
    // Add a guard to prevent duplicate calls
    if (isExecutingRef.current) {
      console.log('⚠️ sendTeamInvitations already executing, skipping duplicate call');
      return Promise.resolve([]);
    }
    
    isExecutingRef.current = true;
    
    try {
      console.log('🚀 sendTeamInvitations called with:', invitations.length, 'invitations');
      
      return new Promise((resolve, reject) => {
        setState(currentState => {
          if (!currentState.currentTeam?._id) {
            reject(new Error('No current team selected'));
            return currentState;
          }

          const teamId = currentState.currentTeam._id;
          console.log('🏗️ TeamContext: Creating invitations for team:', teamId);

          Promise.all(
            invitations.map(invitation => {
              console.log('📝 TeamContext: Creating invitation for:', invitation.invitedEmail || invitation.invitedUserId);
              const invitationData = {
                ...invitation,
                teamId,
                invitedAt: new Date(),
                status: 'pending' as const,
                createdAt: new Date(),
                updatedAt: new Date(),
              };
              return teamInvitationApi.createInvitation(teamId, invitationData);
            })
          )
          .then(async (createdInvitations) => {
            console.log('✅ TeamContext: All invitations created:', createdInvitations.length);
            // Refresh team invitations
            const refreshedInvitations = await teamMemberApi.getTeamInvitationsByTeam(teamId);
            setState(prevState => ({
              ...prevState,
              teamInvitations: refreshedInvitations,
            }));
            resolve(createdInvitations);
          })
          .catch(error => {
            console.error('❌ Error creating invitations:', error);
            reject(error);
          });

          return currentState;
        });
      });
    } finally {
      isExecutingRef.current = false;
    }
  }, []);

  const acceptInvitation = useCallback(async (invitationId: string, teamId: string) => {
    if (!teamId) {
      throw new Error('No team ID provided');
    }

    try {
      updateState({ isLoading: true, error: '' });

      await teamInvitationApi.acceptInvitation(teamId, invitationId);

      // Update pending invitations immediately
      setState(currentState => {
        const updatedPendingInvitations = currentState.currentUserPendingInvitations?.filter(
          inv => inv._id !== invitationId
        ) || [];
        
        return {
          ...currentState,
          currentUserPendingInvitations: updatedPendingInvitations.length > 0 
            ? updatedPendingInvitations 
            : null
        };
      });

      // Reload team data to reflect the new membership
      await loadTeamData();

    } catch (error) {
      console.error('Error accepting invitation:', error);
      updateState({ error: 'Failed to accept invitation' });
      throw error;
    } finally {
      updateState({ isLoading: false });
    }
  }, [updateState, loadTeamData]);

  const rejectInvitation = useCallback(async (invitationId: string, teamId: string) => {
    if (!teamId) {
      throw new Error('No team ID provided');
    }

    try {
      updateState({ isLoading: true, error: '' });

      await teamInvitationApi.rejectInvitation(teamId, invitationId);

      // Update pending invitations immediately
      setState(currentState => {
        const updatedPendingInvitations = currentState.currentUserPendingInvitations?.filter(
          inv => inv._id !== invitationId
        ) || [];
        
        return {
          ...currentState,
          currentUserPendingInvitations: updatedPendingInvitations.length > 0 
            ? updatedPendingInvitations 
            : null
        };
      });

    } catch (error) {
      console.error('Error rejecting invitation:', error);
      updateState({ error: 'Failed to reject invitation' });
      throw error;
    } finally {
      updateState({ isLoading: false });
    }
  }, [updateState]);

  // Other functions remain the same but with stable references
  const joinTeam = useCallback(async (teamCode: string) => {
    // TODO: Implement join team logic
  }, []);

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

  // Refresh team data (force reload)
  const refreshTeamData = useCallback(async () => {
    loadingRef.current = false; // Reset loading flag to allow refresh
    await loadTeamData();
  }, [loadTeamData]);

  const setPendingJoinRequest = useCallback((joinRequest: Partial<TeamJoinRequestWithTeamUserInfo> | null) => {
    updateState({ pendingJoinRequest: joinRequest });
  }, [updateState]);

  const setCurrentUserPendingInvitations = useCallback((invitations: Partial<TeamInvitationWithTeamUserInfo>[] | null) => {
    updateState({ currentUserPendingInvitations: invitations });
  }, [updateState]);

  // Reset state helper - stable reference
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
    } else if (!user && lastUserIdRef.current !== null) {
      lastUserIdRef.current = null;
      resetState();
    }
  }, [user?.userId, loadTeamData, resetState]);

  // Logout event listener
  useEffect(() => {
    const handleLogout = () => resetState();
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [resetState]);

  const contextValue: TeamContextType = {
    ...state,
    loadTeamData,
    refreshTeamData,
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