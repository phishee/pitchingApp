import React from 'react';
import { FlowSection } from './components/FlowSection';
import { ExerciseFlowItem } from './components/ExerciseFlowItem';

interface WorkoutFlowTabProps {
  workout: any;
  getExerciseDetails: (exerciseId: string) => any;
}

export function WorkoutFlowTab({ workout, getExerciseDetails }: WorkoutFlowTabProps) {
  return (
    <div className="space-y-6">
      {/* Questionnaires */}
      <FlowSection
        type="questionnaires"
        items={workout.flow.questionnaires}
        title="Pre-Workout Questionnaires"
      />

      {/* Warmup */}
      <FlowSection
        type="warmup"
        items={workout.flow.warmup}
        title="Warmup Routine"
      />

      {/* Exercise Flow */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Exercise Sequence</h3>
        <div className="space-y-3">
          {workout.flow.exercises.map((exercise: any, index: number) => {
            const exerciseDetails = getExerciseDetails(exercise.exercise_id);
            return (
              <ExerciseFlowItem
                key={index}
                exercise={exercise}
                exerciseDetails={exerciseDetails}
                index={index}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

