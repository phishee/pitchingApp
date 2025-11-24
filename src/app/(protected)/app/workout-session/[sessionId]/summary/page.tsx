'use client';

import React from 'react';
import { SessionSummary } from '@/components/workout-session/session-summary';
import { useWorkoutSessionContext } from '@/providers/workout-session-context';

export default function WorkoutSummaryPage() {
  const { session } = useWorkoutSessionContext();

  if (!session.data) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <SessionSummary session={session.data} />
  );
}

