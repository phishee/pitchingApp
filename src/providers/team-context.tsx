'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUser } from './user.context';
import { Team, TeamMember, TeamInvitation, TeamJoinRequest } from '@/models';
import { teamMemberApi } from '@/app/services-client/teamMemberApi';
import { teamApi } from '@/app/services-client/teamApi';
import { usePathname } from 'next/navigation';

export type UserTeamStatus = 'no-team' | 'pending-request' | 'pending-invitation' | 'team-member';

interface TeamContextType {
  // Team state
  userTeamStatus: UserTeamStatus;
  currentTeam: Team | null;
  currentTeamMember: TeamMember | null;
  allTeams: Team[]; // All teams the user is part of (for coaches)
  allTeamMembers: TeamMember[]; // All team memberships (for coaches)
  pendingInvitation: TeamInvitation | null;
  pendingJoinRequest: TeamJoinRequest | null;
  teamToJoin: Team | null;
  setPendingJoinRequest: (joinRequest: TeamJoinRequest | null) => void;
  
  // Team actions
  loadTeamData: () => Promise<void>;
  joinTeam: (teamCode: string) => Promise<void>;
  acceptInvitation: (invitationId: string) => Promise<void>;
  rejectInvitation: (invitationId: string) => Promise<void>;
  searchTeamByCode: (code: string) => Promise<void>;
  leaveTeam: () => Promise<void>;
  switchTeam: (teamId: string) => Promise<void>; // Switch current team (for coaches)
  
  // State management
  isLoading: boolean;
  error: string;
  clearError: () => void;
}

const TeamContext = createContext<TeamContextType | null>(null);

export const TeamProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();
  const pathname = usePathname();
  
  const [userTeamStatus, setUserTeamStatus] = useState<UserTeamStatus>('no-team');
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [currentTeamMember, setCurrentTeamMember] = useState<TeamMember | null>(null);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [allTeamMembers, setAllTeamMembers] = useState<TeamMember[]>([]);
  const [pendingInvitation, setPendingInvitation] = useState<TeamInvitation | null>(null);
  const [pendingJoinRequest, setPendingJoinRequest] = useState<TeamJoinRequest | null>(null);
  const [teamToJoin, setTeamToJoin] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTeamData = useCallback(async () => {
    if (!user?.userId) return;

    try {
      setIsLoading(true);
      setError('');

      // Get all team memberships for the user
      const teamMembers = await teamMemberApi.getTeamMembersByUser(user.userId);
      const activeTeamMembers = teamMembers?.filter(member => member.status === 'active') || [];
      
      if (activeTeamMembers.length > 0) {
        setAllTeamMembers(activeTeamMembers);
        
        // Load all teams for the user
        const teams = await Promise.all(
          activeTeamMembers.map(async (member) => {
            try {
              return await teamApi.getTeam(member.teamId);
            } catch (error) {
              console.error(`Error loading team ${member.teamId}:`, error);
              return null;
            }
          })
        );
        
        const validTeams = teams.filter(team => team !== null) as Team[];
        setAllTeams(validTeams);
        
        if (user.role === 'athlete') {
          // Athletes can only have one active team
          const athleteTeam = validTeams[0];
          const athleteMember = activeTeamMembers[0];
          
          if (athleteTeam && athleteMember) {
            setCurrentTeam(athleteTeam);
            setCurrentTeamMember(athleteMember);
            setUserTeamStatus('team-member');
            return;
          }
        } else if (user.role === 'coach') {
          // Coaches can have multiple teams - set the first one as current
          const coachTeam = validTeams[0];
          const coachMember = activeTeamMembers[0];
          
          if (coachTeam && coachMember) {
            setCurrentTeam(coachTeam);
            setCurrentTeamMember(coachMember);
            setUserTeamStatus('team-member');
            return;
          }
        }
      }

      // Check for pending join requests
      try {
        const joinRequests = await teamApi.getJoinRequestsByUser(user.userId);
        const pendingRequest = joinRequests?.find(request => request.status === 'pending');
        
        if (pendingRequest) {
          setPendingJoinRequest(pendingRequest);
          setUserTeamStatus('pending-request');
          return;
        }
      } catch (error) {
        console.error('Error loading join requests:', error);
        // Continue to next step if join requests fail
      }

      // Check for pending invitations
      // ... invitation logic ...

      setUserTeamStatus('no-team');
    } catch (error) {
      console.error('Error loading team data:', error);
      setError('Failed to load team data');
    } finally {
      setIsLoading(false);
    }
  }, [user?.userId]);

  useEffect(() => {
    if (user?.userId) {
      loadTeamData();
    }
  }, [user?.userId, loadTeamData]); // Only run when user changes or on mount

  const switchTeam = async (teamId: string) => {
    if (!user || user.role !== 'coach') return;

    try {
      setIsLoading(true);
      setError('');

      // Find the team member record for this team
      const teamMember = allTeamMembers.find(member => member.teamId === teamId);
      if (!teamMember) {
        throw new Error('Team member not found');
      }

      // Find the team
      const team = allTeams.find(t => t._id === teamId);
      if (!team) {
        throw new Error('Team not found');
      }

      // Switch to this team
      setCurrentTeam(team);
      setCurrentTeamMember(teamMember);
      
    } catch (error) {
      console.error('Error switching team:', error);
      setError('Failed to switch team');
    } finally {
      setIsLoading(false);
    }
  };

  const joinTeam = async (teamCode: string) => {
    // ... join team logic ...
  };

  const acceptInvitation = async (invitationId: string) => {
    // ... accept invitation logic ...
  };

  const rejectInvitation = async (invitationId: string) => {
    // ... reject invitation logic ...
  };

  const searchTeamByCode = async (code: string) => {
    const team = await teamApi.getTeamByCode(code);
    setTeamToJoin(team);
  };

  const leaveTeam = async () => {
    // ... leave team logic ...
  };

  const clearError = () => setError('');

  // Add this to your existing TeamProvider, keep everything else unchanged

  // ADD THIS - Reset function
  const resetTeamState = () => {
    setUserTeamStatus('no-team');
    setCurrentTeam(null);
    setCurrentTeamMember(null);
    setAllTeams([]);
    setAllTeamMembers([]);
    setPendingInvitation(null);
    setPendingJoinRequest(null);
    setTeamToJoin(null);
    setIsLoading(true); // Change from false to true
    setError('');
  };

  // ADD THIS - Listen for logout event
  useEffect(() => {
    const handleLogout = () => {
      resetTeamState();
    };

    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  // ADD THIS - Also reset when user becomes null (backup)
  useEffect(() => {
    if (!user) {
      resetTeamState();
    }
  }, [user]);

  // ... keep all your existing loadTeamData, functions, context value, etc. exactly the same

  return (
    <TeamContext.Provider value={{
      userTeamStatus,
      currentTeam,
      currentTeamMember,
      allTeams,
      allTeamMembers,
      pendingInvitation,
      pendingJoinRequest,
      teamToJoin,
      loadTeamData,
      joinTeam,
      acceptInvitation,
      rejectInvitation,
      searchTeamByCode,
      switchTeam,
      leaveTeam,
      isLoading,
      error,
      clearError,
      setPendingJoinRequest,
    }}>
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
