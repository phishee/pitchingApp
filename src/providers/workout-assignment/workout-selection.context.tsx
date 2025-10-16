'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Workout } from '@/models';

interface WorkoutSelectionState {
  selectedWorkout: Workout | null;
}

interface WorkoutSelectionContextType {
  state: WorkoutSelectionState;
  selectWorkout: (workout: Workout) => void;
  clearWorkout: () => void;
}

const WorkoutSelectionContext = createContext<WorkoutSelectionContextType | undefined>(undefined);

export function WorkoutSelectionProvider({ children }: { children: ReactNode }) {
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

  const selectWorkout = (workout: Workout) => setSelectedWorkout(workout);
  const clearWorkout = () => setSelectedWorkout(null);

  return (
    <WorkoutSelectionContext.Provider value={{
      state: { selectedWorkout },
      selectWorkout,
      clearWorkout
    }}>
      {children}
    </WorkoutSelectionContext.Provider>
  );
}

export const useWorkoutSelection = () => {
  const context = useContext(WorkoutSelectionContext);
  if (!context) {
    throw new Error('useWorkoutSelection must be used within WorkoutSelectionProvider');
  }
  return context;
};


