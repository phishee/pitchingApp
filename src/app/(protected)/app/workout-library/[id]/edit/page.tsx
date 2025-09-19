'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { WorkoutProvider } from '@/providers/workout-context';
import { WorkoutForm } from '@/components/workout-library/creation/WorkoutForm';
import { useOrganization } from '@/providers/organization-context';

export default function EditWorkoutPage() {
  const params = useParams();
  const workoutId = params.id as string;
  const { currentOrganization } = useOrganization();
  
  // TODO: Get organizationId from context or props
  const organizationId = currentOrganization?._id;

  return (
    <WorkoutProvider workoutId={workoutId} organizationId={organizationId}>
      <WorkoutForm />
    </WorkoutProvider>
  );
}