import { WorkoutSession, WorkoutSessionStep } from '@/models/WorkoutSession';
import { WorkoutAssignment } from '@/models/WorkoutAssignment';
import { Workout, WorkoutExercise } from '@/models/Workout';
import { Exercise } from '@/models';

export type LoadingState = 'idle' | 'loading' | 'loaded' | 'error';

export interface AsyncDataState<T> {
    data: T | null;
    status: LoadingState;
    error: string | null;
}

export interface WorkoutSessionSection extends AsyncDataState<WorkoutSession> {
    refresh: () => Promise<WorkoutSession | null>;
    setSession: (value: WorkoutSession | null) => void;
    updateProgress: (nextStep: WorkoutSessionStep) => Promise<WorkoutSession | null>;
}

export interface WorkoutAssignmentSection extends AsyncDataState<WorkoutAssignment> {
    refresh: () => Promise<WorkoutAssignment | null>;
    setAssignment: (value: WorkoutAssignment | null) => void;
}

export interface WorkoutDefinitionSection extends AsyncDataState<Workout> {
    flowExercises: WorkoutExercise[];
    refresh: () => Promise<Workout | null>;
    setWorkout: (value: Workout | null) => void;
}

export interface WorkoutExercisesSection {
    list: Exercise[];
    status: LoadingState;
    error: string | null;
    activeExerciseId: string | null;
    setActiveExerciseId: (exerciseId: string | null) => void;
    refresh: () => Promise<Exercise[]>;
    metricsByExercise: Record<string, WorkoutExercise['default_Metrics']>;
}

export interface WorkoutSessionUiSection {
    currentStep: WorkoutSessionStep | null;
    setCurrentStep: (step: WorkoutSessionStep | null) => void;
    isInitializing: boolean;
}

export interface WorkoutCompletionSection {
    totalRequiredSets: number;
    completedSets: number;
    completionPercentage: number;
    exerciseCompletionStatus: Record<string, boolean>;
    isExerciseComplete: (exerciseId: string) => boolean;
    hasPendingSets: (exerciseId: string) => boolean;
}

export interface WorkoutSessionContextValue {
    session: WorkoutSessionSection;
    assignment: WorkoutAssignmentSection;
    workout: WorkoutDefinitionSection;
    exercises: WorkoutExercisesSection;
    ui: WorkoutSessionUiSection;
    completion: WorkoutCompletionSection;
}
