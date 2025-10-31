'use client';

import React from 'react';
import Image from 'next/image';
import { Exercise } from '@/models/Exercise';

interface WorkoutExerciseCardProps {
  exercise: Exercise | undefined;
  sets: string;
  reps: string;
}

export function WorkoutExerciseCard({ exercise, sets, reps }: WorkoutExerciseCardProps) {
  // Get exercise image - prefer image, then photoCover, then default
  const imageUrl = exercise?.image || exercise?.photoCover || '/assets/images/default_profile.png';
  const exerciseName = exercise?.name || 'Unknown Exercise';
  
  // Format sets and reps
  const setsRepsText = sets && reps ? `${sets} x ${reps}` : sets || reps || '';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
      <div className="flex items-center gap-4">
        {/* Left: Exercise Image */}
        <div className="relative w-16 h-16 rounded-full border border-purple-600 overflow-hidden flex-shrink-0">
          <Image
            src={imageUrl}
            alt={exerciseName}
            fill
            className="object-cover"
            sizes="40px"
            onError={(e) => {
              // Fallback to default image on error
              (e.target as HTMLImageElement).src = '/assets/images/default_profile.png';
            }}
          />
        </div>

        {/* Right: Exercise Details */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 mb-1 truncate">
            {exerciseName}
          </h3>
          {setsRepsText && (
            <p className="text-sm text-purple-500 font-medium">
              {setsRepsText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

