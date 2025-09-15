import React from 'react';
import { Target, FileText } from 'lucide-react';
import { getWorkoutColor, formatTagName } from '@/lib/workoutUtils';

interface ExerciseDetailCardProps {
  exercise: any;
  exerciseDetails: any;
  index: number;
}

export function ExerciseDetailCard({ exercise, exerciseDetails, index }: ExerciseDetailCardProps) {
  if (!exerciseDetails) return null;

  // Handle case where exercise_type might be undefined
  const exerciseType = exerciseDetails.exercise_type || 'unknown';
  const exerciseColor = getWorkoutColor([exerciseType]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
          {exerciseDetails.image ? (
            <img
              src={exerciseDetails.image}
              alt={exerciseDetails.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <Target className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-lg font-semibold text-gray-900">
              {index + 1}. {exerciseDetails.name}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${exerciseColor}`}>
              {formatTagName(exerciseType)}
            </span>
          </div>
          
          <p className="text-gray-600 mb-3">{exerciseDetails.description}</p>
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Target className="w-4 h-4" />
              <span>{exerciseDetails.metrics?.length || 0} metrics</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              <span>{exerciseDetails.instructions?.text?.length || 0} steps</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

