'use client';

import React, {
  createContext,
  useContext,
  useMemo,
  ReactNode,
} from 'react';

import { WorkoutSession, WorkoutSessionStep } from '@/models/WorkoutSession';
import { WorkoutAssignment } from '@/models/WorkoutAssignment';
import { Workout, WorkoutExercise } from '@/models/Workout';
import { Exercise } from '@/models';

import { useSessionData, AsyncDataState } from './hooks/useSessionData';
import { useAssignmentData } from './hooks/useAssignmentData';
import { useWorkoutData } from './hooks/useWorkoutData';
import { useExercisesData } from './hooks/useExercisesData';
import { useSessionCompletion, WorkoutCompletionSection } from './hooks/useSessionCompletion';

type LoadingState = 'idle' | 'loading' | 'loaded' | 'error';

// Props accepted by the WorkoutSessionProvider component
interface WorkoutSessionProviderProps {
  children: ReactNode;
  sessionId?: string;
  calendarEventId?: string;
  assignmentId?: string;
  organizationId?: string;
}

// Slice describing session data, status, and operations
interface WorkoutSessionSection extends AsyncDataState<WorkoutSession> {
  refresh: () => Promise<WorkoutSession | null>;
  setSession: (value: WorkoutSession | null) => void;
  updateProgress: (nextStep: WorkoutSessionStep) => Promise<WorkoutSession | null>;
}

// Slice describing workout assignment data and helpers
interface WorkoutAssignmentSection extends AsyncDataState<WorkoutAssignment> {
  refresh: () => Promise<WorkoutAssignment | null>;
  setAssignment: (value: WorkoutAssignment | null) => void;
}

// Slice for the workout definition used to drive the flow
interface WorkoutDefinitionSection extends AsyncDataState<Workout> {
  flowExercises: WorkoutExercise[];
  refresh: () => Promise<Workout | null>;
  setWorkout: (value: Workout | null) => void;
}

// Slice exposing resolved exercise records and lookup helpers
interface WorkoutExercisesSection {
  list: Exercise[];
  status: LoadingState;
  error: string | null;
  activeExerciseId: string | null;
  setActiveExerciseId: (exerciseId: string | null) => void;
  refresh: () => Promise<Exercise[]>;
  metricsByExercise: Record<string, WorkoutExercise['default_Metrics']>;
}

// Slice for UI-centric state such as current step and loading flag
interface WorkoutSessionUiSection {
  currentStep: WorkoutSessionStep | null;
  setCurrentStep: (step: WorkoutSessionStep | null) => void;
  isInitializing: boolean;
}

interface WorkoutSessionContextValue {
  session: WorkoutSessionSection;
  assignment: WorkoutAssignmentSection;
  workout: WorkoutDefinitionSection;
  exercises: WorkoutExercisesSection;
  ui: WorkoutSessionUiSection;
  completion: WorkoutCompletionSection;
}

const WorkoutSessionContext = createContext<WorkoutSessionContextValue | undefined>(
  undefined
);

// =============================
// Provider Component
// =============================
export function WorkoutSessionProvider({
  children,
  sessionId,
  calendarEventId,
  assignmentId,
  organizationId,
}: WorkoutSessionProviderProps) {
  // 1. Session Data
  const {
    sessionState,
    setSessionState,
    currentStep,
    setCurrentStep,
    refreshSession,
    updateSessionProgress,
  } = useSessionData({ sessionId, calendarEventId });

  // 2. Assignment Data
  const { assignmentState, setAssignmentState, fetchAssignment } = useAssignmentData({
    sessionId,
    assignmentId,
    workoutAssignmentIdFromSession: sessionState.data?.workoutAssignmentId,
  });

  // 3. Workout Data
  const { workoutState, setWorkoutState, fetchWorkout } = useWorkoutData({
    sessionId,
    organizationId,
    workoutIdFromSession: sessionState.data?.workoutId,
    workoutIdFromWorkout: sessionState.data?.workout?.workoutId,
    orgIdFromSession: sessionState.data?.organizationId,
    orgIdFromAssignment: assignmentState.data?.organizationId,
  });

  // 4. Exercises Data
  const {
    exercises,
    exercisesStatus,
    exercisesError,
    activeExerciseId,
    setActiveExerciseId,
    fetchExercises,
    metricsByExercise,
  } = useExercisesData({
    sessionId,
    workoutExercises: workoutState.data?.flow?.exercises ?? [],
    workoutId: workoutState.data?.id,
  });

  // 5. Completion Logic
  const completion = useSessionCompletion({
    sessionData: sessionState.data,
    workoutExercises: workoutState.data?.flow?.exercises ?? [],
    exercises,
  });

  // Determines whether initial data hydration is still in-flight
  const isInitializing = useMemo(() => {
    const states: AsyncDataState<unknown>[] = [
      sessionState,
      assignmentState,
      workoutState,
    ];

    const asyncLoading = states.some((state) => state.status === 'loading' && !state.data);
    const exercisesLoading = exercisesStatus === 'loading' && exercises.length === 0;

    return asyncLoading || exercisesLoading;
  }, [assignmentState, exercises.length, exercisesStatus, sessionState, workoutState]);

  // Aggregates all provider sub-slices into a single memoized value
  const value = useMemo<WorkoutSessionContextValue>(
    () => ({
      session: {
        ...sessionState,
        refresh: refreshSession,
        setSession: (value) =>
          setSessionState({ data: value, status: value ? 'loaded' : 'idle', error: null }),
        updateProgress: updateSessionProgress,
      },
      assignment: {
        ...assignmentState,
        refresh: async () => {
          const targetAssignmentId = assignmentId ?? sessionState.data?.workoutAssignmentId;
          return targetAssignmentId ? fetchAssignment(targetAssignmentId) : null;
        },
        setAssignment: (value) =>
          setAssignmentState({ data: value, status: value ? 'loaded' : 'idle', error: null }),
      },
      workout: {
        ...workoutState,
        flowExercises: workoutState.data?.flow?.exercises ?? [],
        refresh: async () => {
          const workoutId = sessionState.data?.workoutId ?? sessionState.data?.workout?.workoutId;
          const orgId =
            organizationId ?? sessionState.data?.organizationId ?? assignmentState.data?.organizationId;
          return workoutId ? fetchWorkout({ workoutId, orgId }) : null;
        },
        setWorkout: (value) =>
          setWorkoutState({ data: value, status: value ? 'loaded' : 'idle', error: null }),
      },
      exercises: {
        list: exercises,
        status: exercisesStatus,
        error: exercisesError,
        activeExerciseId,
        setActiveExerciseId,
        refresh: async () => {
          const workoutExercises = workoutState.data?.flow?.exercises ?? [];
          const exerciseIds = workoutExercises.map((exercise) => exercise.exercise_id);
          return fetchExercises(exerciseIds);
        },
        metricsByExercise,
      },
      ui: {
        currentStep,
        setCurrentStep,
        isInitializing,
      },
      completion,
    }),
    [
      activeExerciseId,
      assignmentId,
      assignmentState,
      exercises,
      exercisesError,
      exercisesStatus,
      completion,
      fetchAssignment,
      fetchExercises,
      fetchWorkout,
      isInitializing,
      organizationId,
      refreshSession,
      sessionState,
      updateSessionProgress,
      workoutState,
      metricsByExercise,
      setSessionState,
      setAssignmentState,
      setWorkoutState,
      currentStep,
      setActiveExerciseId,
      setCurrentStep,
    ]
  );

  return (
    <WorkoutSessionContext.Provider value={value}>
      {children}
    </WorkoutSessionContext.Provider>
  );
}

// Helper to access entire context
export function useWorkoutSessionContext() {
  const context = useContext(WorkoutSessionContext);
  if (!context) {
    throw new Error(
      'useWorkoutSessionContext must be used within a WorkoutSessionProvider'
    );
  }
  return context;
}

// Convenience hook: session slice (data + actions)
export function useWorkoutSession() {
  return useWorkoutSessionContext().session;
}

// Convenience hook: assignment slice
export function useWorkoutSessionAssignment() {
  return useWorkoutSessionContext().assignment;
}

// Convenience hook: workout definition slice
export function useWorkoutDefinition() {
  return useWorkoutSessionContext().workout;
}

// Convenience hook: exercise state slice
export function useWorkoutSessionExercises() {
  return useWorkoutSessionContext().exercises;
}

// Convenience hook: UI slice
export function useWorkoutSessionUi() {
  return useWorkoutSessionContext().ui;
}
