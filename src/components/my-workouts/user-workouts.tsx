'use client';

import React from 'react';
import { useLayout } from '@/providers/layout-context';
import { useOrganization } from '@/providers/organization-context';
import { useTeam } from '@/providers/team-context';
import { UserEventProvider } from '@/providers/user-event-context';
import { UserWorkoutsMobile } from './user-workouts-mobile';
import { UserWorkoutsDesktop } from './user-workouts-desktop';

export function UserWorkouts() {
  const { isMobile } = useLayout();
  const { currentOrganization } = useOrganization();
  const { currentTeamMember } = useTeam();

  // Get organization ID
  const organizationId = currentOrganization?._id;

  // Get user ID and member ID from currentTeamMember
  const userId = currentTeamMember?.userId;

  // Show error if required data is missing
  if (!organizationId || !userId) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="text-gray-600 text-center">
          <p className="font-semibold mb-2">Unable to load workouts</p>
          <p className="text-sm">
            {!organizationId && 'Organization not found. '}
            {!userId && 'User information not available.'}
          </p>
        </div>
      </div>
    );
  }

  // Wrap the appropriate view with the context provider
  return (
    <UserEventProvider organizationId={organizationId} userId={userId}>
      {isMobile ? <UserWorkoutsMobile /> : <UserWorkoutsDesktop />}
    </UserEventProvider>
  );
}
