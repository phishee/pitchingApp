'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUser } from './user.context';
import { organizationApi } from '@/app/services-client/organizationApi';
import { facilityApi } from '@/app/services-client/facilityApi';
import { Organization } from '@/models/Organization';
import { Team } from '@/models/Team';
import { Facility } from '@/models/Facility';

interface OrganizationContextType {
  currentOrganization: Organization | null;
  currentTeam: Team | null;
  setCurrentOrganization: (org: Organization | null) => void;
  setCurrentTeam: (team: Team | null) => void;
  organizations: Organization[];
  teams: Team[];
  organizationTeams: Team[];
  facilities: Facility[];
  organizationFacilities: Facility[];
  setOrganizations: (orgs: Organization[]) => void;
  setTeams: (teams: Team[]) => void;
  setOrganizationTeams: (teams: Team[]) => void;
  setFacilities: (facilities: Facility[]) => void;
  setOrganizationFacilities: (facilities: Facility[]) => void;
  loadOrganizationTeams: () => Promise<void>;
  loadOrganizationFacilities: () => Promise<void>;
  refreshOrganizationData: () => Promise<void>;
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
  const [organizationTeams, setOrganizationTeams] = useState<Team[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [organizationFacilities, setOrganizationFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load organization data when user changes
  const loadOrganizationData = useCallback(async () => {
    if (!user?.currentOrganizationId) {
      setCurrentOrganization(null);
      setCurrentTeam(null);
      setOrganizations([]);
      setTeams([]);
      setOrganizationTeams([]);
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

      // Load teams for the current organization directly (avoid circular dependency)
      const teams = await organizationApi.getOrganizationTeams(organization._id);
      setOrganizationTeams(teams);

    } catch (err) {
      console.error('Error loading organization data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load organization data');
      setCurrentOrganization(null);
      setOrganizationTeams([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.currentOrganizationId]);

  // Load organization teams
  const loadOrganizationTeams = useCallback(async () => {
    if (!currentOrganization?._id) {
      setOrganizationTeams([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const teams = await organizationApi.getOrganizationTeams(currentOrganization._id);
      setOrganizationTeams(teams);
    } catch (err) {
      console.error('Error loading organization teams:', err);
      setError(err instanceof Error ? err.message : 'Failed to load organization teams');
      setOrganizationTeams([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentOrganization?._id]);

  // Load organization facilities
  const loadOrganizationFacilities = useCallback(async () => {
    if (!currentOrganization?._id || typeof currentOrganization._id !== 'string') {
      setOrganizationFacilities([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const facilities = await facilityApi.getFacilitiesByOrganization(currentOrganization._id);
      setOrganizationFacilities(facilities);
    } catch (err) {
      console.error('Error loading organization facilities:', err);
      setError(err instanceof Error ? err.message : 'Failed to load organization facilities');
      setOrganizationFacilities([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentOrganization?._id]);

  // Refresh all organization data
  const refreshOrganizationData = useCallback(async () => {
    if (!user?.currentOrganizationId) return;
    
    try {
      setIsLoading(true);
      setError(null);

      // Refresh organization data
      const organization = await organizationApi.getOrganization(user.currentOrganizationId);
      setCurrentOrganization(organization);

      // Refresh teams for the current organization
      const teams = await organizationApi.getOrganizationTeams(organization._id);
      setOrganizationTeams(teams);

      // Refresh facilities for the current organization
      const facilities = await facilityApi.getFacilitiesByOrganization(organization._id);
      setOrganizationFacilities(facilities);

    } catch (err) {
      console.error('Error refreshing organization data:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh organization data');
    } finally {
      setIsLoading(false);
    }
  }, [user?.currentOrganizationId]);

  // Load organization data when user changes
  useEffect(() => {
    loadOrganizationData();
  }, [loadOrganizationData]);

  // Load organization teams when current organization changes
  useEffect(() => {
    loadOrganizationTeams();
  }, [loadOrganizationTeams]);

  // Load organization facilities when current organization changes
  useEffect(() => {
    loadOrganizationFacilities();
  }, [loadOrganizationFacilities]);

  // Clear data when user logs out
  useEffect(() => {
    if (!user) {
      setCurrentOrganization(null);
      setCurrentTeam(null);
      setOrganizations([]);
      setTeams([]);
      setOrganizationTeams([]);
      setFacilities([]);
      setOrganizationFacilities([]);
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
    organizationTeams,
    facilities,
    organizationFacilities,
    setOrganizations,
    setTeams,
    setOrganizationTeams,
    setFacilities,
    setOrganizationFacilities,
    loadOrganizationTeams,
    loadOrganizationFacilities,
    refreshOrganizationData,
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