'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { WorkoutForm } from '@/components/workout-library/creation/WorkoutForm';

export default function CreateWorkoutPage() {
  const router = useRouter();

  const handleSave = (workoutData: any) => {
    console.log('Creating workout:', workoutData);
    // TODO: Implement create logic
    router.push('/app/workout-library');
  };

  const handleCancel = () => {
    router.push('/app/workout-library');
  };

  return (
    <WorkoutForm
      mode="create"
      initialData={null}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}