import { useAuth } from '@/providers/auth-context';
import { useUser } from '@/providers/user.context';
import React, { useState, useEffect } from 'react';
import NoTeamCoach from '../common/no-team/no-team-coach';

export function CoachDashboard() {
  const { user } = useAuth()
  const { userTeamStatus, currentTeam } = useUser()

  if (!currentTeam) {
    return <NoTeamCoach />
  }

  return (
    <div>
      <h1>Coach Dashboard</h1>
    </div>
  );
}