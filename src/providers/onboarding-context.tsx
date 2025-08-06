// /contexts/onboarding-context.tsx
'use client';
import React, { useState, createContext, useContext, useEffect } from 'react';
import { useAuth } from './auth-context';
import { User } from '@/models/User';
import { Organization } from '@/models/Organization';
import { Team, TeamMember, TeamJoinRequest, TeamInvitation } from '@/models';
import { userApi } from '@/app/services-client/userApi';
import { teamApi } from '@/app/services-client/teamApi';
import { organizationApi } from '@/app/services-client/organizationApi';
import { teamMemberApi } from '@/app/services-client/teamMemberApi';
import { useRouter } from 'next/navigation';

// Type definitions
export type OnboardingContextType = {
  userData: Partial<User> | null;
  setUserData: (user: Partial<User> | null) => void;
  organizationData: Partial<Organization> | null;
  setOrganizationData: (organization: Partial<Organization> | null) => void;
  teamData: Partial<Team> | null;
  setTeamData: (team: Partial<Team> | null) => void;
  teamMemberData: Partial<TeamMember> | null;
  setTeamMemberData: (teamMember: Partial<TeamMember> | null) => void;
  joinRequestData: Partial<TeamJoinRequest> | null;
  setJoinRequestData: (joinRequest: Partial<TeamJoinRequest> | null) => void;
  teamToJoin: Team | null;
  setTeamToJoin: (team: Team | null) => void;
  handleFinish: () => Promise<void>;
};

// Create context
const OnboardingContext = createContext<OnboardingContextType | null>(null);

// Provider component
export const OnboardingProvider = ({ children }: { children: React.ReactNode }) => {
  const { userFromFirebase, setUser} = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState<Partial<User> | null>(null);
  
  const [organizationData, setOrganizationData] = useState<Partial<Organization> | null>(null);
  const [teamData, setTeamData] = useState<Partial<Team> | null>(null);
  const [teamMemberData, setTeamMemberData] = useState<Partial<TeamMember> | null>(null);
  const [joinRequestData, setJoinRequestData] = useState<Partial<TeamJoinRequest> | null>(null);
  const [teamToJoin, setTeamToJoin] = useState<Team | null>(null);

  useEffect(() => {
    if (userFromFirebase) {
      const userData: User = {
        userId: userFromFirebase.uid || "", // fallback to empty string if undefined
        name: userFromFirebase.displayName || "",
        email: userFromFirebase.email || "",
        profileImageUrl: userFromFirebase.photoURL || "",
        isAdmin: false,
        currentOrganizationId: null,
        createdAt: new Date(), // or another valid Date
        // add any other required User fields with defaults
      };

      setUserData(userData);
    }

  }, [userFromFirebase]);
  
  const handleFinish = async () => {
    try {
      console.log('Starting handleFinish with data:', {
        organizationData,
        teamData,
        userData,
        teamMemberData,
        joinRequestData
      });

      let createdUser: User | null = null;
      let createdOrganization: Organization | null = null;
      let createdTeam: Team | null = null;

      // 1. Create organization first (if exists)
      if (organizationData) {
        console.log('Creating organization:', organizationData);
        createdOrganization = await organizationApi.createOrganization(organizationData);
        console.log('Created organization:', createdOrganization);
      }

      // 2. Create team (if exists) - needs organizationId if organization was created
      if (teamData) {
        const teamDataWithOrg = {
          ...teamData,
          organizationId: createdOrganization?._id || teamData.organizationId
        };
        console.log('Creating team:', teamDataWithOrg);
        createdTeam = await teamApi.createTeam(teamDataWithOrg);
        console.log('Created team:', createdTeam);
      }

      // 3. Create user - needs organizationId and teamId if they exist
      if (userData) {
        const userDataWithRefs = {
          ...userData,
          currentOrganizationId: createdOrganization?._id || userData.currentOrganizationId
        };
        console.log('Creating user:', userDataWithRefs);
        createdUser = await userApi.createUser(userDataWithRefs);
        console.log('Created user:', createdUser);
      }

      // 4. Create team member (if exists) - needs teamId and userId
      if (teamMemberData && createdTeam && createdUser) {
        const teamMemberWithRefs = {
          ...teamMemberData,
          teamId: createdTeam._id,
          userId: createdUser.userId
        };
        console.log('Creating team member:', teamMemberWithRefs);
        const createdTeamMember = await teamMemberApi.createTeamMember(teamMemberWithRefs);
        console.log('Created team member:', createdTeamMember);
      } else {
        console.log('Skipping team member creation:', {
          hasTeamMemberData: !!teamMemberData,
          hasCreatedTeam: !!createdTeam,
          hasCreatedUser: !!createdUser
        });
      }

      // 5. Create join request (if exists) - needs teamId and userId
      if (joinRequestData && createdUser) {
        const joinRequestWithRefs = {
          ...joinRequestData,
          requestedBy: createdUser.userId
        };
        console.log('Creating join request:', joinRequestWithRefs);
        await teamApi.createJoinRequest(joinRequestWithRefs);
      }

      // 6. Update auth context with created user
      if (createdUser) {
        setUser(createdUser);
      }

      // 7. Navigate to dashboard
      router.push('/app/dashboard');

    } catch (error) {
      console.error('Error completing onboarding:', error);
      // Handle error (show toast, etc.)
    }
  };
  
  const value: OnboardingContextType = {
    userData,
    setUserData,
    organizationData,
    setOrganizationData,
    teamData,
    setTeamData,
    teamMemberData,
    setTeamMemberData,
    joinRequestData,
    setJoinRequestData,
    handleFinish,
    teamToJoin,
    setTeamToJoin,
  };
  
  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

// Custom hook
export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};