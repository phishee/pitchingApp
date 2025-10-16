'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { WorkoutExercise } from '@/models';

interface PrescriptionData {
  prescribedMetrics: Record<string, any>;
  notes: string;
  isModified: boolean;
}

interface ExercisePrescriptionState {
  prescriptions: Record<string, PrescriptionData>;
}

interface ExercisePrescriptionContextType {
  state: ExercisePrescriptionState;
  initializePrescriptions: (exercises: WorkoutExercise[]) => void;
  updatePrescription: (exerciseId: string, updates: Partial<PrescriptionData>) => void;
  resetPrescriptions: () => void;
  resetExercise: (exerciseId: string, defaultMetrics: Record<string, any>) => void;
}

const ExercisePrescriptionContext = createContext<ExercisePrescriptionContextType | undefined>(undefined);

export function ExercisePrescriptionProvider({ children }: { children: ReactNode }) {
  const [prescriptions, setPrescriptions] = useState<Record<string, PrescriptionData>>({});

  const initializePrescriptions = useCallback((exercises: WorkoutExercise[]) => {
    const initialPrescriptions: Record<string, PrescriptionData> = {};
    
    exercises.forEach(exercise => {
      initialPrescriptions[exercise.exercise_id] = {
        prescribedMetrics: { ...exercise.default_Metrics },
        notes: '',
        isModified: false
      };
    });
    
    setPrescriptions(initialPrescriptions);
  }, []);

  const updatePrescription = useCallback((exerciseId: string, updates: Partial<PrescriptionData>) => {
    setPrescriptions(prev => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        ...updates,
        isModified: true
      }
    }));
  }, []);

  const resetExercise = useCallback((exerciseId: string, defaultMetrics: Record<string, any>) => {
    setPrescriptions(prev => ({
      ...prev,
      [exerciseId]: {
        prescribedMetrics: { ...defaultMetrics },
        notes: '',
        isModified: false
      }
    }));
  }, []);

  const resetPrescriptions = useCallback(() => {
    setPrescriptions({});
  }, []);

  return (
    <ExercisePrescriptionContext.Provider value={{
      state: { prescriptions },
      initializePrescriptions,
      updatePrescription,
      resetPrescriptions,
      resetExercise
    }}>
      {children}
    </ExercisePrescriptionContext.Provider>
  );
}

export const useExercisePrescription = () => {
  const context = useContext(ExercisePrescriptionContext);
  if (!context) {
    throw new Error('useExercisePrescription must be used within ExercisePrescriptionProvider');
  }
  return context;
};


