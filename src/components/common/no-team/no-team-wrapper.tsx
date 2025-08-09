// src/components/common/no-team-wrapper.tsx
'use client';

import React, { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useTeam } from '@/providers/team-context';
import { useUser } from '@/providers/user.context';
// import NoTeamAthlete  from '@/app/components/common/no-team/no-team-athlete';
import NoTeamAthlete from './no-team-athlete';
// import NoTeamCoach  from '@/app/components/common/no-team/no-team-coach';
import NoTeamCoach from './no-team-coach';

interface NoTeamWrapperProps {
  children: React.ReactNode;
  excludePages?: string[];
  excludePatterns?: string[];
  showForAdmins?: boolean;
}

export default function NoTeamWrapper({ 
  children, 
  excludePages = [], 
  excludePatterns = [],
  showForAdmins = true
}: NoTeamWrapperProps) {
  const pathname = usePathname();
  const { currentTeamMember } = useTeam();
  const { user } = useUser();

  // Check if current page should be excluded
  const isExcluded = useMemo(() => {
    // Check exact page matches
    if (excludePages.includes(pathname)) {
      return true;
    }

    // Check pattern matches
    return excludePatterns.some(pattern => {
      if (pattern.endsWith('/*')) {
        const basePattern = pattern.slice(0, -2);
        return pathname.startsWith(basePattern);
      }
      return pathname === pattern;
    });
  }, [pathname, excludePages, excludePatterns]);

  // Check if user is admin
  // const isAdmin = user?.isAdmin || user?.role === 'admin';
  const isAdmin = user?.isAdmin;

  // Determine what to render
  const shouldShowNoTeam = useMemo(() => {
    
    // Always show content for admins if showForAdmins is true
    if (isAdmin && showForAdmins) {
      return false;
    }

    // Show content if page is excluded
    if (isExcluded) {
      return false;
    }

    // Show content if user has an active team member
    if (currentTeamMember) {
      return false;
    }

    // Show NoTeam component if no team member
    return true;
  }, [isAdmin, showForAdmins, isExcluded, currentTeamMember]);

  // Render NoTeam component based on user role
  const renderNoTeamComponent = () => {
    if (isAdmin) {
      return children;
    }

    switch (user?.role) {
      case 'athlete':
        return <NoTeamAthlete />;
      case 'coach':
        return <NoTeamCoach />;
      default:
        return <div>No Team</div>;
    }
  };

  if (shouldShowNoTeam) {
    return renderNoTeamComponent();
  }

  return <>{children}</>;
}