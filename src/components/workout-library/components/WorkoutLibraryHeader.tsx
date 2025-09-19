import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface WorkoutLibraryHeaderProps {
  onCreateWorkout: () => void;
}

export function WorkoutLibraryHeader({ onCreateWorkout }: WorkoutLibraryHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Workout Library</h1>
        <p className="text-gray-600 mt-2">Create and manage workout templates</p>
      </div>
      <Button className="bg-blue-600 hover:bg-blue-700 rounded-full" onClick={onCreateWorkout}>
        <Plus className="w-4 h-4 mr-2" />
        Create Workout
      </Button>
    </div>
  );
}