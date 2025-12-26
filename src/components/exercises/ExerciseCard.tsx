'use client';

import React from 'react';
import { Edit3 } from 'lucide-react';
import { Exercise } from '@/models/Exercise';
import { getTypeIcon, getTypeColor } from '@/lib/exerciseUtils';

interface ExerciseCardProps {
  exercise: Exercise;
  onClick: (exercise: Exercise) => void;
  onEdit: (exercise: Exercise) => void;
}

export function ExerciseCard({ exercise, onClick, onEdit }: ExerciseCardProps) {
  const TypeIcon = getTypeIcon(exercise.exercise_type);

  return (
    <div
      className="flex items-center gap-5 md:gap-8 p-5 md:p-8 bg-white rounded-2xl hover:shadow-xl transition-all duration-200 cursor-pointer rounded-2xl"
      style={{
        boxShadow: '0 -2px 8px -2px rgba(0, 0, 0, 0.1), 0 4px 12px -2px rgba(0, 0, 0, 0.15)'
      }}
      onClick={() => onClick(exercise)}
    >
      {/* Exercise Image */}
      <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
        {exercise.image ? (
          <img
            src={exercise.image}
            alt={exercise.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <TypeIcon className="w-8 h-8 md:w-10 md:h-10 text-gray-500" />
          </div>
        )}
      </div>

      {/* Exercise Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-base md:text-lg text-gray-900 truncate">{exercise.name}</h4>
            <p className="text-xs md:text-sm text-gray-600 mb-2 line-clamp-2">{exercise.description}</p>
            <div className="flex items-center gap-1 md:gap-2 flex-wrap">
              <span className={`text-xs px-2 py-1 rounded-md font-medium ${getTypeColor(exercise.exercise_type)}`}>
                {exercise.exercise_type}
              </span>
              {(exercise.tags || []).slice(0, 2).map((tag, index) => (
                <span key={index} className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded-md">
                  {tag}
                </span>
              ))}
              {(exercise.tags || []).length > 2 && (
                <span className="text-xs text-gray-500">+{(exercise.tags || []).length - 2} more</span>
              )}
            </div>
          </div>

          {/* Edit Button - Only for user-owned exercises */}
          {/* {exercise.owner !== "system" && (
            <button 
              className="bg-gray-50 text-gray-700 px-2 md:px-3 py-1 rounded-lg text-xs md:text-sm hover:bg-gray-100 transition-all duration-200 flex items-center gap-1 flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(exercise);
              }}
            >
              <Edit3 className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Edit</span>
            </button>
          )} */}
        </div>
      </div>
    </div>
  );
}