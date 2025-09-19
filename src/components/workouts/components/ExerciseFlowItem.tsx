import React from 'react';
import { formatTagName } from '@/lib/workoutUtils';
import { Exercise, WorkoutExercise } from '@/models';

interface ExerciseFlowItemProps {
  workoutExercise: WorkoutExercise;
  exerciseDetails: Exercise;
  index: number;
}

export function ExerciseFlowItem({ workoutExercise, exerciseDetails, index }: ExerciseFlowItemProps) {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
        {index + 1}
      </div>
      <div className="flex-1">
        <div className="font-medium text-gray-900">
          {exerciseDetails?.name || workoutExercise.exercise_id}
        </div>
        <div className="text-sm text-gray-600">
          {exerciseDetails?.exercise_type ? formatTagName(exerciseDetails.exercise_type) : 'Exercise'}
        </div>
      </div>
      <div className="text-sm text-gray-500">
        ~15 min
      </div>
    </div>
  );
}
