'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { workoutApi } from '@/app/services-client/workoutApi';
import { Workout } from '@/models/Workout';
import { Exercise } from '@/models';
import { exerciseApi } from '@/app/services-client/exerciseApi';

interface WorkoutContextType {
  // State
  workout: Workout | null;
  loading: boolean;
  error: string | null;
  isEditing: boolean;
  isDirty: boolean;
  selectedExercises: Exercise[]; // Add this line
  
  // Actions
  createWorkout: (workoutData: Partial<Workout>, organizationId: string) => Promise<void>;
  updateWorkout: (workoutId: string, workoutData: Partial<Workout>, organizationId: string) => Promise<void>;
  loadWorkout: (workoutId: string, organizationId: string) => Promise<void>;
  setWorkout: (workout: Partial<Workout> | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setIsDirty: (isDirty: boolean) => void;
  clearWorkout: () => void;
  
  // Form helpers
  updateWorkoutField: (field: string, value: any) => void;
  addExercise: (exercise: Exercise) => void;
  removeExercise: (exerciseId: string) => void;
  updateExercise: (exerciseId: string, field: string, value: any) => void;
  reorderExercises: (fromIndex: number, toIndex: number) => void;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

interface WorkoutProviderProps {
  children: ReactNode;
  workoutId?: string; // For editing mode
  organizationId: string;
}

export function WorkoutProvider({ children, workoutId, organizationId }: WorkoutProviderProps) {
  const [workout, setWorkoutState] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const isEditing = !!workoutId;

  // Add useEffect to watch workout changes
  useEffect(() => {
    if (workout) {
      console.log('Workout updated:', {
        id: workout.id,
        name: workout.name,
        exerciseCount: workout.flow?.exercises?.length || 0,
        isDirty,
        isEditing
      });
      
      // You can add other side effects here:
      // - Validation
      // - Auto-save (debounced)
      // - Analytics tracking
      // - Form state management
    }
  }, [
    workout?.id, 
    workout?.name, 
    workout?.description, 
    workout?.flow?.exercises?.length,
    workout?.flow?.questionnaires?.length,
    workout?.flow?.warmup?.length,
    isDirty, 
    isEditing
  ]);

  // Load workout data if in editing mode
  useEffect(() => {
    if (workoutId && organizationId) {
      loadWorkout(workoutId, organizationId);
    }
  }, [workoutId, organizationId]);

  // Add this function to load selected exercises
  const loadSelectedExercises = async (exerciseIds: string[]) => {
    if (exerciseIds.length === 0) return;
    
    try {
      const exercises = await exerciseApi.getExercisesByIds(exerciseIds);
      setSelectedExercises(exercises);
    } catch (error) {
      console.error('Failed to load exercise details:', error);
    }
  };

  // Add useEffect to load exercises when workout changes
  useEffect(() => {
    if (workout?.flow?.exercises) {
      const exerciseIds = workout.flow.exercises.map(ex => ex.exercise_id);
      loadSelectedExercises(exerciseIds);
    }
  }, [workout?.flow?.exercises]);

  const createWorkout = async (workoutData: Partial<Workout>, orgId: string) => {
    try {
      setLoading(true);
      setError(null);

      // create the flow exercises with the selected exercises ids
      const flowExercises = selectedExercises.map(ex => ({ exercise_id: ex.id }));
      
      // Ensure required fields are present
      const workoutToCreate: Omit<Workout, 'id'> = {
        name: workoutData.name || '',
        description: workoutData.description || '',
        tags: workoutData.tags || [],
        coverImage: workoutData.coverImage || '',
        organizationId: orgId,
        teamIds: workoutData.teamIds || [],
        createdBy: {
          userId: 'current-user-id', // TODO: Get from auth context
          memberId: 'current-member-id' // TODO: Get from auth context
        },
        updatedBy: {
          userId: 'current-user-id', // TODO: Get from auth context
          memberId: 'current-member-id' // TODO: Get from auth context
        },
        flow: {
          questionnaires: [],
          warmup: [],
          exercises: flowExercises
        }
      };
      
      const createdWorkout = await workoutApi.createWorkout(workoutToCreate, orgId);
      setWorkoutState(createdWorkout);
      setIsDirty(false);
    } catch (err) {
      console.error('Failed to create workout:', err);
      setError(err instanceof Error ? err.message : 'Failed to create workout');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateWorkout = async (id: string, workoutData: Partial<Workout>, orgId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedWorkout = await workoutApi.updateWorkout(id, orgId, workoutData);
      setWorkoutState(updatedWorkout);
      setIsDirty(false);
    } catch (err) {
      console.error('Failed to update workout:', err);
      setError(err instanceof Error ? err.message : 'Failed to update workout');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loadWorkout = async (id: string, orgId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const workoutData = await workoutApi.getWorkoutById(id, orgId);
      setWorkoutState(workoutData);
      setIsDirty(false);
    } catch (err) {
      console.error('Failed to load workout:', err);
      setError(err instanceof Error ? err.message : 'Failed to load workout');
    } finally {
      setLoading(false);
    }
  };

  const setWorkout = (newWorkout: Partial<Workout> | null) => {
    if (newWorkout) {
      setWorkoutState(prev => prev ? { ...prev, ...newWorkout } : newWorkout as Workout);
      setIsDirty(true);
    } else {
      setWorkoutState(null);
      setIsDirty(false);
    }
  };

  const clearWorkout = () => {
    setWorkoutState(null);
    setError(null);
    setIsDirty(false);
  };

  // Form helper methods
  const updateWorkoutField = (field: string, value: any) => {
    setWorkoutState(prev => prev ? { ...prev, [field]: value } : null);
    setIsDirty(true);
  };

  const addExercise = (exercise: any) => {
    setWorkoutState(prev => {
      if (!prev) return null;
      
      const exerciseWithConfig = {
        ...exercise,
        sets: 3,
        reps: 10,
        duration: 60,
        rest: 30
      };
      
      return {
        ...prev,
        flow: {
          ...prev.flow,
          exercises: [...prev.flow.exercises, exerciseWithConfig]
        }
      };
    });
    setIsDirty(true);
  };

  // const addExercise = (exercise: any) => {
  //   // Add to selectedExercises with default config
  //   setSelectedExercises(prev => {
  //     // Check if exercise already exists
  //     const exists = prev.some(ex => ex.id === exercise.id);
  //     if (exists) return prev;
      
  //     // Add exercise with default config
  //     const exerciseWithConfig = {
  //       ...exercise,
  //       sets: 3,
  //       reps: 10,
  //       duration: 60,
  //       rest: 30
  //     };
      
  //     return [...prev, exerciseWithConfig];
  //   });
    
  //   // Update workout flow with just the ID
  //   setWorkoutState(prev => {
  //     if (!prev) return null;
      
  //     return {
  //       ...prev,
  //       flow: {
  //         ...prev.flow,
  //         exercises: [...prev.flow.exercises, { exercise_id: exercise.id }]
  //       }
  //     };
  //   });
    
  //   setIsDirty(true);
  // };

  const removeExercise = (exerciseId: string) => {
    setWorkoutState(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        flow: {
          ...prev.flow,
          exercises: prev.flow.exercises.filter((ex: any) => ex.exercise_id !== exerciseId)
        }
      };
    });
    setIsDirty(true);
  };

  const updateExercise = (exerciseId: string, field: string, value: any) => {
    setWorkoutState(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        flow: {
          ...prev.flow,
          exercises: prev.flow.exercises.map((ex: any) =>
            ex.exercise_id === exerciseId ? { ...ex, [field]: value } : ex
          )
        }
      };
    });
    setIsDirty(true);
  };

  const reorderExercises = (fromIndex: number, toIndex: number) => {
    setWorkoutState(prev => {
      if (!prev) return null;
      
      const exercises = [...prev.flow.exercises];
      const [movedExercise] = exercises.splice(fromIndex, 1);
      exercises.splice(toIndex, 0, movedExercise);
      
      return {
        ...prev,
        flow: {
          ...prev.flow,
          exercises
        }
      };
    });
    setIsDirty(true);
  };

  const contextValue: WorkoutContextType = {
    // State
    workout,
    loading,
    error,
    isEditing,
    isDirty,
    selectedExercises, // Use the state instead of workout?.flow?.exercises
    
    // Actions
    createWorkout,
    updateWorkout,
    loadWorkout,
    setWorkout,
    setLoading,
    setError,
    setIsDirty,
    clearWorkout,
    
    // Form helpers
    updateWorkoutField,
    addExercise,
    removeExercise,
    updateExercise,
    reorderExercises,
  };

  return (
    <WorkoutContext.Provider value={contextValue}>
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
}