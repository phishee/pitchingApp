import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Edit3, Target, Clock } from 'lucide-react';
import { getWorkoutIcon, getWorkoutColor, formatTagName } from '@/lib/workoutLibraryUtils';

interface WorkoutCardProps {
  workout: any;
  onView: (workoutId: string) => void;
  onEdit: (workoutId: string) => void;
  onAssign: (workoutId: string) => void;
  actionLabel?: string;
  ActionIcon?: React.ElementType;
}

export function WorkoutCard({
  workout,
  onView,
  onEdit,
  onAssign,
  actionLabel = 'Assign',
  ActionIcon = Plus
}: WorkoutCardProps) {
  const WorkoutIcon = getWorkoutIcon(workout.tags);
  const workoutColor = getWorkoutColor(workout.tags);

  return (
    <Card
      className="group relative overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white cursor-pointer h-full flex flex-col"
      onClick={() => onView(workout.id)}
    >
      {/* Cover Image */}
      <div className="relative h-32 overflow-hidden flex-shrink-0">
        <img
          src={workout.coverImage}
          alt={workout.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Overlay with workout type */}
        <div className="absolute top-2 left-2">
          <Badge
            variant="secondary"
            className={`${workoutColor} border-0 font-medium text-xs px-2 py-1 shadow-sm`}
          >
            {formatTagName(workout.tags[0])}
          </Badge>
        </div>

        {/* Action buttons overlay */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 bg-white/90 hover:bg-white shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              onView(workout.id);
            }}
          >
            <Eye className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 bg-white/90 hover:bg-white shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(workout.id);
            }}
          >
            <Edit3 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-4 space-y-3 flex-1 flex flex-col">
        {/* Title and Icon */}
        <div className="flex items-start gap-2">
          <div className={`p-2 rounded-lg ${workoutColor.split(' ')[1]} bg-opacity-20 flex-shrink-0`}>
            <WorkoutIcon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
              {workout.name}
            </h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-xs leading-relaxed line-clamp-2">
          {workout.description}
        </p>

        {/* Quick Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Target className="w-3 h-3" />
            <span>{workout.flow.exercises.length} exercises</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>~{workout.flow.exercises.length * 15}m</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-auto">
          {workout.tags.slice(1, 3).map(tag => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
            >
              {formatTagName(tag)}
            </span>
          ))}
          {workout.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-md">
              +{workout.tags.length - 3}
            </span>
          )}
        </div>

        {/* Action Button */}
        <Button
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs font-medium py-2 shadow-sm hover:shadow-md transition-all duration-200 mt-auto rounded-full mt-4"
          onClick={(e) => {
            e.stopPropagation();
            onAssign(workout.id);
          }}
        >
          <ActionIcon className="w-3 h-3 mr-1" />
          {actionLabel}
        </Button>
      </CardContent>

      {/* Hover border effect */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-200 rounded-lg transition-colors duration-200 pointer-events-none"></div>
    </Card>
  );
}