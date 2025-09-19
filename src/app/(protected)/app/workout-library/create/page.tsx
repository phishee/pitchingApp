'use client';

import React from 'react';
import { WorkoutProvider } from '@/providers/workout-context';
import { WorkoutForm } from '@/components/workout-library/creation/WorkoutForm';
import { useOrganization } from '@/providers/organization-context';

export default function CreateWorkoutPage() {
  const { currentOrganization } = useOrganization();
  // TODO: Get organizationId from context or props
  const organizationId = currentOrganization?._id;

  return (
    <WorkoutProvider organizationId={organizationId}>
      <WorkoutForm />
    </WorkoutProvider>
  );
}