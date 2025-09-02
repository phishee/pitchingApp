import React from 'react';
import { getWorkoutIcon, getWorkoutColor } from '@/lib/workoutUtils';
import { WorkoutTagBadge } from './WorkoutTagBadge';
import { WorkoutStatCard } from './components/WorkoutStatCard';

interface WorkoutCoverCardProps {
  workout: any;
}

export function WorkoutCoverCard({ workout }: WorkoutCoverCardProps) {
  const WorkoutIcon = getWorkoutIcon(workout.tags);
  const workoutColor = getWorkoutColor(workout.tags);

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Cover Image */}
      <div className="relative aspect-video bg-gray-100">
        <img
          src={workout.coverImage}
          alt={workout.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 left-4">
          <WorkoutTagBadge tag={workout.tags[0]} variant="primary" />
        </div>
      </div>

      {/* Workout Info */}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-lg ${workoutColor.split(' ')[1]} bg-opacity-20`}>
            <WorkoutIcon className="w-5 h-5" />
          </div>
          <div className="text-sm text-gray-500">
            Created by {workout.createdBy.userId}
          </div>
        </div>
        
        <p className="text-gray-700 mb-4">{workout.description}</p>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {workout.tags.map((tag: string, index: number) => (
            <WorkoutTagBadge key={index} tag={tag} />
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
          <WorkoutStatCard 
            value={workout.flow.exercises.length} 
            label="Exercises" 
            color="blue" 
          />
          <WorkoutStatCard 
            value={workout.teamIds.length} 
            label="Teams" 
            color="green" 
          />
        </div>
      </div>
    </div>
  );
}