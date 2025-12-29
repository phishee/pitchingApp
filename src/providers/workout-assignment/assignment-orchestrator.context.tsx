'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CreateWorkoutAssignmentPayload, WorkoutAssignment } from '@/models/WorkoutAssignment';
import { Event } from '@/models';
import { workoutAssignmentService } from '@/app/services-client/workoutAssignmentService';
import { AthleteSelectionProvider, useAthleteSelection } from './athlete-selection.context';
import { WorkoutSelectionProvider, useWorkoutSelection } from './workout-selection.context';
import { ExercisePrescriptionProvider, useExercisePrescription } from './exercise-prescription.context';
import { ScheduleConfigProvider, useScheduleConfig } from './schedule-config.context';

interface AssignmentOrchestratorState {
  isSubmitting: boolean;
  error: string | null;
}

interface CreateAssignmentResult {
  success: boolean;
  assignment: WorkoutAssignment;
  events: Event[];
  totalCreated: number;
}

interface AssignmentOrchestratorContextType {
  state: AssignmentOrchestratorState;
  createAssignment: () => Promise<CreateAssignmentResult>;
  isValid: () => boolean;
  getTotalEvents: () => number;
  getValidationErrors: () => string[];
}

const OrchestratorContext = createContext<AssignmentOrchestratorContextType | undefined>(undefined);

interface OrchestratorProviderProps {
  children: ReactNode;
  organizationId: string;
  teamId: string;
  currentUserId: string;
}

export function AssignmentOrchestratorProvider({
  children,
  organizationId,
  teamId,
  currentUserId
}: OrchestratorProviderProps) {
  return (
    <AthleteSelectionProvider>
      <WorkoutSelectionProvider>
        <ExercisePrescriptionProvider>
          <ScheduleConfigProvider>
            <OrchestratorLogic
              organizationId={organizationId}
              teamId={teamId}
              currentUserId={currentUserId}
            >
              {children}
            </OrchestratorLogic>
          </ScheduleConfigProvider>
        </ExercisePrescriptionProvider>
      </WorkoutSelectionProvider>
    </AthleteSelectionProvider>
  );
}

function OrchestratorLogic({
  children,
  organizationId,
  teamId,
  currentUserId
}: OrchestratorProviderProps) {
  const { state: athleteState } = useAthleteSelection();
  const { state: workoutState } = useWorkoutSelection();
  const { state: prescriptionState } = useExercisePrescription();
  const { state: scheduleState } = useScheduleConfig();

  const [state, setState] = useState<AssignmentOrchestratorState>({
    isSubmitting: false,
    error: null
  });

  // ==================== VALIDATION ====================

  const isValid = useCallback((): boolean => {
    return (
      athleteState.selectedAthletes.length > 0 &&
      workoutState.selectedWorkout !== null &&
      scheduleState.recurrenceConfig.pattern !== 'none' &&
      scheduleState.recurrenceConfig.startDate !== undefined &&
      (scheduleState.recurrenceConfig.pattern !== 'weekly' ||
        (scheduleState.recurrenceConfig.daysOfWeek && scheduleState.recurrenceConfig.daysOfWeek.length > 0))
    );
  }, [athleteState, workoutState, scheduleState]);

  const getValidationErrors = useCallback((): string[] => {
    const errors: string[] = [];

    if (athleteState.selectedAthletes.length === 0) {
      errors.push('At least one athlete must be selected');
    }
    if (!workoutState.selectedWorkout) {
      errors.push('A workout must be selected');
    }
    if (scheduleState.recurrenceConfig.pattern === 'none') {
      errors.push('Schedule must be configured');
    }
    if (!scheduleState.recurrenceConfig.startDate) {
      errors.push('Start date is required');
    }
    if (scheduleState.recurrenceConfig.pattern === 'weekly' &&
      (!scheduleState.recurrenceConfig.daysOfWeek || scheduleState.recurrenceConfig.daysOfWeek.length === 0)) {
      errors.push('At least one day of the week must be selected for weekly recurrence');
    }

    return errors;
  }, [athleteState, workoutState, scheduleState]);

  // ==================== BUILD PAYLOAD ====================

  const buildPayload = useCallback((): CreateWorkoutAssignmentPayload | { athletes: any[];[key: string]: any } => {
    if (!isValid()) {
      throw new Error('Cannot build payload: validation failed');
    }

    const selectedWorkout = workoutState.selectedWorkout!;
    const isMultipleAthletes = athleteState.selectedAthletes.length > 1;

    // Base payload (common to both single and multiple athlete scenarios)
    const basePayload = {
      organizationId,
      teamId,
      workoutId: selectedWorkout.id,
      coachInfo: { userId: currentUserId, memberId: 'TODO' }, // TODO: Get actual memberId
      recurrence: scheduleState.recurrenceConfig,
      startDate: scheduleState.recurrenceConfig.startDate!,
      endDate: scheduleState.recurrenceConfig.endDate,
      defaultTimeSlot: {
        start: scheduleState.defaultStartTime,
        end: scheduleState.defaultEndTime
      },
      prescriptions: prescriptionState.prescriptions,
      sessionType: scheduleState.sessionType,
      scheduledCoach: scheduleState.sessionType === 'coached'
        ? { userId: currentUserId, memberId: 'TODO' }
        : undefined,
      notes: scheduleState.notes,

      // Add workout data for event generation
      workoutData: {
        name: selectedWorkout.name,
        description: selectedWorkout.description,
        coverImage: selectedWorkout.coverImage,
        sessionType: selectedWorkout.sessionType
      }
    };

    if (isMultipleAthletes) {
      // Multiple athletes: return format expected by createAssignmentsForMultipleAthletes
      return {
        ...basePayload,
        athletes: athleteState.selectedAthletes
      };
    } else {
      // Single athlete: return format expected by createAssignment
      return {
        ...basePayload,
        athleteInfo: athleteState.selectedAthletes[0]
      };
    }
  }, [
    organizationId,
    teamId,
    currentUserId,
    athleteState,
    workoutState,
    prescriptionState,
    scheduleState,
    isValid
  ]);

  // ==================== CREATE ASSIGNMENT ====================

  const createAssignment = useCallback(async (): Promise<CreateAssignmentResult> => {
    if (!isValid()) {
      const errors = getValidationErrors();
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    setState(prev => ({ ...prev, isSubmitting: true, error: null }));

    try {
      const payload = buildPayload();
      const isMultipleAthletes = athleteState.selectedAthletes.length > 1;

      let result;

      if (isMultipleAthletes) {
        // Multiple athletes: use the multiple athlete endpoint
        const { athletes, ...basePayload } = payload as { athletes: any[];[key: string]: any };
        result = await workoutAssignmentService.createAssignmentsForMultipleAthletes(
          basePayload as Omit<CreateWorkoutAssignmentPayload, 'athleteInfo'>,
          athletes
        );
      } else {
        // Single athlete: use the single athlete endpoint
        result = await workoutAssignmentService.createAssignment(payload as CreateWorkoutAssignmentPayload);
      }

      setState(prev => ({
        ...prev,
        isSubmitting: false
      }));

      return {
        success: true,
        assignment: isMultipleAthletes ? result.assignments[0] : result.assignment, // For compatibility, return first assignment
        events: result.events,
        totalCreated: result.totalCreated || result.events.length
      };

    } catch (error) {
      console.error('Failed to create assignment:', error);

      setState(prev => ({
        ...prev,
        isSubmitting: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));

      throw error;
    }
  }, [isValid, getValidationErrors, buildPayload, athleteState.selectedAthletes.length]);

  // ==================== TOTAL EVENTS CALCULATION ====================

  const getTotalEvents = useCallback((): number => {
    const athleteCount = athleteState.selectedAthletes.length;

    // If no athletes selected, return 0
    if (athleteCount === 0) return 0;

    const { recurrenceConfig } = scheduleState;

    // One-time event
    if (recurrenceConfig.pattern === 'none') {
      return athleteCount;
    }

    // For weekly pattern, calculate based on occurrences (not days * occurrences)
    if (recurrenceConfig.pattern === 'weekly') {
      const daysCount = recurrenceConfig.daysOfWeek?.length || 0;
      if (daysCount === 0) return 0; // No days selected yet

      const occurrences = recurrenceConfig.occurrences || 12;
      return athleteCount * occurrences;
    }

    // Default calculation for other patterns
    const occurrences = recurrenceConfig.occurrences || 12;
    return athleteCount * occurrences;
  }, [athleteState, scheduleState]);

  // ==================== CONTEXT VALUE ====================

  const value: AssignmentOrchestratorContextType = {
    state,
    createAssignment,
    isValid,
    getTotalEvents,
    getValidationErrors
  };

  return (
    <OrchestratorContext.Provider value={value}>
      {children}
    </OrchestratorContext.Provider>
  );
}

export const useAssignmentOrchestrator = () => {
  const context = useContext(OrchestratorContext);
  if (!context) {
    throw new Error('useAssignmentOrchestrator must be used within AssignmentOrchestratorProvider');
  }
  return context;
};

