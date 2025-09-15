'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { WorkoutProvider } from '@/providers/workout-context';
import { WorkoutForm } from '@/components/workout-library/creation/WorkoutForm';

export default function EditWorkoutPage() {
  const params = useParams();
  const workoutId = params.id as string;
  
  // TODO: Get organizationId from context or props
  const organizationId = 'org_001';

  return (
    <WorkoutProvider workoutId={workoutId} organizationId={organizationId}>
      <WorkoutForm />
    </WorkoutProvider>
  );
}