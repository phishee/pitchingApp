'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUser } from './user.context';
import { organizationApi } from '@/app/services-client/organizationApi';
import { Organization } from '@/models/Organization';
import { Team } from '@/models/Team';

interface OrganizationContextType {
  currentOrganization: Organization | null;
  currentTeam: Team | null;
  setCurrentOrganization: (org: Organization | null) => void;
  setCurrentTeam: (team: Team | null) => void;
  organizations: Organization[];
  teams: Team[];
  setOrganizations: (orgs: Organization[]) => void;
  setTeams: (teams: Team[]) => void;
  isLoading: boolean;
  error: string | null;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load organization data when user changes
  const loadOrganizationData = useCallback(async () => {
    if (!user?.currentOrganizationId) {
      setCurrentOrganization(null);
      setCurrentTeam(null);
      setOrganizations([]);
      setTeams([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Load the current organization
      const organization = await organizationApi.getOrganization(user.currentOrganizationId);
      setCurrentOrganization(organization);

      // Load all organizations for the user (if needed)
      const allOrganizations = await organizationApi.getOrganizations();
      setOrganizations(allOrganizations);

      // TODO: Load teams for the current organization
      // This would require a team API call based on the organization ID
      // setTeams(teams);

    } catch (err) {
      console.error('Error loading organization data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load organization data');
      setCurrentOrganization(null);
    } finally {
      setIsLoading(false);
    }
  }, [user?.currentOrganizationId]);

  // Load organization data when user changes
  useEffect(() => {
    loadOrganizationData();
  }, [loadOrganizationData]);

  // Clear data when user logs out
  useEffect(() => {
    if (!user) {
      setCurrentOrganization(null);
      setCurrentTeam(null);
      setOrganizations([]);
      setTeams([]);
      setError(null);
    }
  }, [user]);

  const value: OrganizationContextType = {
    currentOrganization,
    currentTeam,
    setCurrentOrganization,
    setCurrentTeam,
    organizations,
    teams,
    setOrganizations,
    setTeams,
    isLoading,
    error,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
} 