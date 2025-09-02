import React from 'react';
import { BookOpen } from 'lucide-react';
import { WorkoutCard } from './components/WorkoutCard';
import { EmptyState } from './components/EmptyState';

interface WorkoutTemplatesSectionProps {
  workouts: any[];
  onViewWorkout: (workoutId: string) => void;
  onEditWorkout: (workoutId: string) => void;
  onAssignWorkout: (workoutId: string) => void;
}

export function WorkoutTemplatesSection({ 
  workouts, 
  onViewWorkout, 
  onEditWorkout, 
  onAssignWorkout 
}: WorkoutTemplatesSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Workout Templates
          <span className="text-sm font-normal text-gray-500 ml-2">
            ({workouts.length} workouts)
          </span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {workouts.map((workout) => (
          <WorkoutCard
            key={workout.id}
            workout={workout}
            onView={onViewWorkout}
            onEdit={onEditWorkout}
            onAssign={onAssignWorkout}
          />
        ))}
      </div>

      {workouts.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title="No workouts found"
          description="Try adjusting your search or filters to find what you're looking for"
        />
      )}
    </div>
  );
}