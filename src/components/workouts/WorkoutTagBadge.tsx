import React from 'react';
import { getWorkoutColor, formatTagName } from '@/lib/workoutUtils';

interface WorkoutTagBadgeProps {
  tag: string;
  variant?: 'primary' | 'secondary';
}

export function WorkoutTagBadge({ tag, variant = 'secondary' }: WorkoutTagBadgeProps) {
  const primaryColor = getWorkoutColor([tag]);
  
  if (variant === 'primary') {
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${primaryColor}`}>
        {formatTagName(tag)}
      </span>
    );
  }

  return (
    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
      {formatTagName(tag)}
    </span>
  );
}