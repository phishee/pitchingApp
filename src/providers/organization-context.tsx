'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Organization {
  id: string;
  name: string;
  // Add other organization properties as needed
}

interface Team {
  id: string;
  name: string;
  organizationId: string;
  // Add other team properties as needed
}

interface OrganizationContextType {
  currentOrganization: Organization | null;
  currentTeam: Team | null;
  setCurrentOrganization: (org: Organization | null) => void;
  setCurrentTeam: (team: Team | null) => void;
  organizations: Organization[];
  teams: Team[];
  setOrganizations: (orgs: Organization[]) => void;
  setTeams: (teams: Team[]) => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  const value = {
    currentOrganization,
    currentTeam,
    setCurrentOrganization,
    setCurrentTeam,
    organizations,
    teams,
    setOrganizations,
    setTeams,
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