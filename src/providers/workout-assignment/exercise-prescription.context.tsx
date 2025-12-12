'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { WorkoutExercise } from '@/models';

interface PrescriptionData {
  prescribedMetrics: Record<string, any>;
  prescribedMetrics_sets?: Array<{
    setNumber: number;
    metrics: Record<string, any>;
  }>;
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
  resetExercise: (exerciseId: string, defaultMetrics: Record<string, any>, defaultMetricsSets?: Array<{ setNumber: number; metrics: Record<string, any> }>) => void;
}

const ExercisePrescriptionContext = createContext<ExercisePrescriptionContextType | undefined>(undefined);

export function ExercisePrescriptionProvider({ children }: { children: ReactNode }) {
  const [prescriptions, setPrescriptions] = useState<Record<string, PrescriptionData>>({});

  const initializePrescriptions = useCallback((exercises: WorkoutExercise[]) => {
    const initialPrescriptions: Record<string, PrescriptionData> = {};

    exercises.forEach(exercise => {
      initialPrescriptions[exercise.exercise_id] = {
        prescribedMetrics: { ...exercise.default_Metrics },
        prescribedMetrics_sets: exercise.default_Metrics_sets
          ? exercise.default_Metrics_sets.map(s => ({ ...s, metrics: { ...s.metrics } }))
          : undefined,
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

  const resetExercise = useCallback((exerciseId: string, defaultMetrics: Record<string, any>, defaultMetricsSets?: Array<{ setNumber: number; metrics: Record<string, any> }>) => {
    setPrescriptions(prev => ({
      ...prev,
      [exerciseId]: {
        prescribedMetrics: { ...defaultMetrics },
        prescribedMetrics_sets: defaultMetricsSets
          ? defaultMetricsSets.map(s => ({ ...s, metrics: { ...s.metrics } }))
          : undefined,
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


