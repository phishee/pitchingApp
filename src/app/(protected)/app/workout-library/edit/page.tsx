'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { WorkoutForm } from '@/components/workout-library/creation/WorkoutForm';
import { fakeWorkouts } from '@/data/fakeExercises';

export default function EditWorkoutPage() {
  const params = useParams();
  const router = useRouter();
  const [workoutData, setWorkoutData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      const foundWorkout = fakeWorkouts.find(w => w.id === params.id);
      if (foundWorkout) {
        setWorkoutData(foundWorkout);
      } else {
        router.push('/app/workout-library');
      }
      setLoading(false);
    }
  }, [params.id, router]);

  const handleSave = (updatedData: any) => {
    console.log('Updating workout:', updatedData);
    // TODO: Implement update logic
    router.push('/app/workout-library');
  };

  const handleCancel = () => {
    router.push('/app/workout-library');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading workout...</p>
        </div>
      </div>
    );
  }

  if (!workoutData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Workout not found</p>
        </div>
      </div>
    );
  }

  return (
    <WorkoutForm
      mode="edit"
      initialData={workoutData}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}