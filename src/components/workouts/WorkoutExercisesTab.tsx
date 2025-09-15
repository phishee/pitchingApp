import React from 'react';
import { ExerciseDetailCard } from './components/ExerciseDetailCard';
import { Workout } from '@/models/Workout';

interface WorkoutExercisesTabProps {
  workout: Workout;
  getExerciseDetails: (exerciseId: string) => any;
}

export function WorkoutExercisesTab({ workout, getExerciseDetails }: WorkoutExercisesTabProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Exercise Details</h3>
      <div className="space-y-4">
        {workout.flow.exercises.map((exercise: any, index: number) => {
          // const exerciseDetails = await getExerciseDetails(exercise._id);
          return (
            <ExerciseDetailCard
              key={index}
              exercise={exercise}
              exerciseDetails={exercise}
              index={index}
            />
          );
        })}
      </div>
    </div>
  );
}