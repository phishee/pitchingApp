import React from 'react';
import { User, Clock, Users } from 'lucide-react';
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
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-100">
      {/* Cover Image */}
      <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200">
        <img
          src={workout.coverImage}
          alt={workout.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="absolute top-4 left-4">
          <WorkoutTagBadge tag={workout.tags[0]} variant="primary" />
        </div>
        <div className="absolute bottom-4 right-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1 text-xs font-medium text-gray-700">
            <Clock className="w-3 h-3" />
            <span>~{Math.round(workout.flow.exercises.length * 15)} min</span>
          </div>
        </div>
      </div>

      {/* Workout Info */}
      <div className="p-6">
        {/* Header with icon and creator */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${workoutColor.split(' ')[1]} bg-opacity-10`}>
              <WorkoutIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{workout.name}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  {workout.createdByUser?.profileImageUrl ? (
                    <img
                      src={workout.createdByUser.profileImageUrl}
                      alt={workout.createdByUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-3 h-3 text-gray-400" />
                  )}
                </div>
                <span>by {workout.createdByUser?.name || 'Unknown User'}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Description */}
        <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">{workout.description}</p>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {workout.tags.slice(0, 3).map((tag: string, index: number) => (
            <WorkoutTagBadge key={index} tag={tag} />
          ))}
          {workout.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
              +{workout.tags.length - 3} more
            </span>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {workout.flow.exercises.length}
            </div>
            <div className="text-xs text-gray-500 font-medium">Exercises</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {workout.teamIds.length}
            </div>
            <div className="text-xs text-gray-500 font-medium">Teams</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {workout.flow.questionnaires.length + workout.flow.warmup.length}
            </div>
            <div className="text-xs text-gray-500 font-medium">Extras</div>
          </div>
        </div>
      </div>
    </div>
  );
}