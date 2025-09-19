import React, { useState, useEffect } from 'react';
import { ExerciseDetailCard } from './components/ExerciseDetailCard';
import { Workout, Exercise } from '@/models';
import { exerciseApi } from '@/app/services-client/exerciseApi';

interface WorkoutExercisesTabProps {
  workout: Workout;
}

export function WorkoutExercisesTab({ workout }: WorkoutExercisesTabProps) {
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllExercises();
  }, []);

  const loadAllExercises = async () => {
    try {
      const response = await exerciseApi.getExercises();
      setAllExercises(response.data);
    } catch (error) {
      console.error('Failed to load exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get exercise details by ID
  const getExerciseById = (exerciseId: string) => {
    return allExercises.find(ex => ex.id === exerciseId);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Exercise Details</h3>
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Loading exercises...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Exercise Details</h3>
      <div className="space-y-4">
        {workout.flow.exercises.map((workoutExercise, index: number) => {
          const exerciseDetails = getExerciseById(workoutExercise.exercise_id);
          
          if (!exerciseDetails) {
            return null; // Skip if exercise details not found
          }

          return (
            <ExerciseDetailCard
              key={workoutExercise.exercise_id}
              workoutExercise={workoutExercise} // WorkoutExercise from flow
              exerciseDetails={exerciseDetails} // Full Exercise object
              index={index}
            />
          );
        })}
      </div>
    </div>
  );
}