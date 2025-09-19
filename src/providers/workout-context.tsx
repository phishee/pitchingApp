'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { workoutApi } from '@/app/services-client/workoutApi';
import { Workout, WorkoutUser, WorkoutExercise } from '@/models/Workout';
import { Exercise } from '@/models';
import { exerciseApi } from '@/app/services-client/exerciseApi';
import { useUser } from './user.context';
import { useTeam } from './team-context';


interface WorkoutContextType {
  // Core workout metadata
  workoutMetadata: {
    id: string | null;
    name: string;
    description: string;
    coverImage: string;
    tags: string[];
  };
  
  // Flow-specific data
  workoutFlow: {
    exercises: Array<WorkoutExercise>;
    questionnaires: string[];
    warmup: string[];
  };
  
  // Organization and permissions
  workoutPermissions: {
    organizationId: string;
    teamIds: string[];
    createdBy: WorkoutUser;
    updatedBy: WorkoutUser;
  };
  
  // UI state
  uiState: {
    loading: boolean;
    error: string | null;
    isEditing: boolean;
    isDirty: boolean;
  };
  
  // Exercise management
  exerciseState: {
    selectedExercises: Exercise[];
    availableExercises: Exercise[];
  };
  
  // Add organization info
  organizationId: string;
  
  // Actions (add these back)
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
  addExercise: (exerciseWithConfig: WorkoutExercise, exercise: Exercise) => void;
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
  const { user } = useUser();
  const { currentTeamMember } = useTeam();

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
      const flowExercises = selectedExercises.map(ex => ({ exercise_id: ex.id, default_Metrics: { sets: 3, reps: 10, duration: 60, rest: 30 } }));
      
      // Ensure required fields are present
      const workoutToCreate: Omit<Workout, 'id'> = {
        name: workoutData.name || '',
        description: workoutData.description || '',
        tags: workoutData.tags || [],
        coverImage: workoutData.coverImage || '',
        organizationId: orgId,
        teamIds: workoutData.teamIds || [],
        createdBy: {
          userId: user?.userId,
          memberId: currentTeamMember?._id
        },
        updatedBy: {
          userId: user?.userId,
          memberId: currentTeamMember?._id
        },
        flow: workoutData.flow
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
      
      // Ensure required fields are present for the API
      const workoutToUpdate: Partial<Workout> = {
        ...workoutData,
        organizationId: orgId,
        updatedBy: {
          userId: user?.userId || '',
          memberId: currentTeamMember?._id || ''
        }
      };
      
      const updatedWorkout = await workoutApi.updateWorkout(id, orgId, workoutToUpdate);
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

  const addExercise = (exerciseWithConfig: WorkoutExercise, exercise: Exercise) => {
    setWorkoutState(prev => {
      if (!prev) return null;
      
      // const exerciseWithConfig = {
      //   ...exercise,
      //   default_Metrics: {
      //     sets: 3,
      //   reps: 10,
      //   duration: 60,
      //   rest: 30
      // };
      
      return {
        ...prev,
        flow: {
          ...prev.flow,
          exercises: [...prev.flow.exercises, exerciseWithConfig]
        }
      };
    });
    setSelectedExercises(prev => [...prev, exercise]);
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
    setSelectedExercises(prev => prev.filter(ex => ex.id !== exerciseId));
    setIsDirty(true);
  };


  // ****************************************************************
  const updateExercise = (exerciseId: string, field: string, value: any) => {
    setWorkoutState(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        flow: {
          ...prev.flow,
          exercises: prev.flow.exercises.map((ex: any) =>
            ex.exercise_id === exerciseId 
              ? { 
                  ...ex, 
                  default_Metrics: {
                    ...ex.default_Metrics,
                    [field]: value
                  }
                } 
              : ex
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
    // Core workout metadata
    workoutMetadata: {
      id: workout?.id || null,
      name: workout?.name || '',
      description: workout?.description || '',
      coverImage: workout?.coverImage || '',
      tags: workout?.tags || [],
    },
    
    // Flow-specific data
    workoutFlow: {
      exercises: workout?.flow?.exercises || [],
      questionnaires: workout?.flow?.questionnaires || [],
      warmup: workout?.flow?.warmup || [],
    },
    
    // Organization and permissions
    workoutPermissions: {
      organizationId: workout?.organizationId || '',
      teamIds: workout?.teamIds || [],
      createdBy: workout?.createdBy || { userId: '', memberId: '' },
      updatedBy: workout?.updatedBy || { userId: '', memberId: '' },
    },
    
    // UI state
    uiState: {
      loading,
      error,
      isEditing,
      isDirty,
    },
    
    // Exercise management
    exerciseState: {
      selectedExercises,
      availableExercises: [], // This will need to be populated from the exerciseApi
    },
    
    // Add organization info
    organizationId,
    
    // Actions (add these back)
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

// Helper hooks for specific concerns
export function useWorkoutMetadata() {
  const { workoutMetadata, updateWorkoutField } = useWorkout();
  return { 
    workoutMetadata, 
    updateWorkoutField,
    // Convenience methods for common metadata updates
    updateName: (name: string) => updateWorkoutField('name', name),
    updateDescription: (description: string) => updateWorkoutField('description', description),
    updateTags: (tags: string[]) => updateWorkoutField('tags', tags),
    updateCoverImage: (coverImage: string) => updateWorkoutField('coverImage', coverImage),
  };
}

export function useWorkoutFlow() {
  const { workoutFlow, addExercise, removeExercise, updateExercise, reorderExercises, updateWorkoutField } = useWorkout();
  return { 
    workoutFlow, 
    addExercise, 
    removeExercise, 
    updateExercise, 
    reorderExercises,
    // Convenience methods for flow updates
    updateQuestionnaires: (questionnaires: string[]) => updateWorkoutField('flow', { ...workoutFlow, questionnaires }),
    updateWarmup: (warmup: string[]) => updateWorkoutField('flow', { ...workoutFlow, warmup }),
    addQuestionnaire: (questionnaire: string) => {
      if (!workoutFlow.questionnaires.includes(questionnaire)) {
        updateWorkoutField('flow', { 
          ...workoutFlow, 
          questionnaires: [...workoutFlow.questionnaires, questionnaire] 
        });
      }
    },
    removeQuestionnaire: (questionnaire: string) => {
      updateWorkoutField('flow', { 
        ...workoutFlow, 
        questionnaires: workoutFlow.questionnaires.filter(q => q !== questionnaire) 
      });
    },
    addWarmup: (warmup: string) => {
      if (!workoutFlow.warmup.includes(warmup)) {
        updateWorkoutField('flow', { 
          ...workoutFlow, 
          warmup: [...workoutFlow.warmup, warmup] 
        });
      }
    },
    removeWarmup: (warmup: string) => {
      updateWorkoutField('flow', { 
        ...workoutFlow, 
        warmup: workoutFlow.warmup.filter(w => w !== warmup) 
      });
    },
  };
}

export function useWorkoutUI() {
  const { uiState, setLoading, setError, setIsDirty } = useWorkout();
  return { 
    ...uiState, 
    setLoading, 
    setError, 
    setIsDirty 
  };
}

export function useWorkoutExercises() {
  const { exerciseState, addExercise, removeExercise, updateExercise, reorderExercises } = useWorkout();
  return { 
    ...exerciseState, 
    addExercise, 
    removeExercise, 
    updateExercise, 
    reorderExercises 
  };
}

export function useWorkoutPermissions() {
  const { workoutPermissions } = useWorkout();
  return { workoutPermissions };
}

export function useWorkoutActions() {
  const { 
    createWorkout, 
    updateWorkout, 
    loadWorkout, 
    setWorkout, 
    clearWorkout 
  } = useWorkout();
  return { 
    createWorkout, 
    updateWorkout, 
    loadWorkout, 
    setWorkout, 
    clearWorkout 
  };
}

// Add this helper hook
export function useWorkoutOrganization() {
  const { organizationId } = useWorkout();
  return { organizationId };
}