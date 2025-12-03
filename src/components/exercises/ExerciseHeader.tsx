'use client';

import React from 'react';
import { Plus } from 'lucide-react';

interface ExercisesHeaderProps {
  onAddExercise: () => void;
}

export function ExercisesHeader({ onAddExercise }: ExercisesHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Exercises Library</h1>
        <p className="text-gray-600 mt-1 md:mt-2 text-sm sm:text-base">
          Manage and organize your exercise database
        </p>
      </div>
      <button
        onClick={onAddExercise}
        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-full flex items-center gap-2 transition-colors sm:w-auto text-sm justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={true}
      >
        <Plus className="w-4 h-4" />
        Add Exercise
      </button>
    </div>
  );
}