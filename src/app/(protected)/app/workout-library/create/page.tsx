'use client';

import React from 'react';
import { WorkoutProvider } from '@/providers/workout-context';
import { WorkoutForm } from '@/components/workout-library/creation/WorkoutForm';

export default function CreateWorkoutPage() {
  // TODO: Get organizationId from context or props
  const organizationId = 'org_001';

  return (
    <WorkoutProvider organizationId={organizationId}>
      <WorkoutForm />
    </WorkoutProvider>
  );
}