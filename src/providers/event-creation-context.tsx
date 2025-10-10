// contexts/event-creation-context.tsx

'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Event, EventType, EventStatus, EventVisibility, EventDetails, UserInfo, WorkoutEventDetails, GamedayEventDetails, AssessmentEventDetails, CoachingSessionEventDetails } from '@/models';
import { RecurrenceConfig } from '@/models/Calendar';
import { WorkoutExercise } from '@/models/Workout';

// ==================== TYPES ====================

// BaseEventData extends Event but without the fields we don't need during creation
export interface BaseEventData extends Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'details'> {
    // Override details to be partial during creation
    details: Partial<EventDetails>;
  }

// Event creation data structure
export interface EventCreationData {
  eventData: Partial<BaseEventData>;
  targetAthletes?: UserInfo[];
}

interface EventCreationContextValue {
  // Event creation data
  eventCreationData: EventCreationData;
  
  // Update functions
  updateEventData: (updates: Partial<BaseEventData>) => void;
  updateParticipants: (updates: Partial<BaseEventData['participants']>) => void;
  updateTargetAthletes: (athletes: UserInfo[]) => void;
  updateRecurrence: (recurrence: RecurrenceConfig) => void;
  
  // Type-aware detail updates
  updateDetailsData: <T extends EventDetails>(
    updates: Partial<T>, 
    eventType: EventType
  ) => void;
  
  // Type-specific update functions for better DX
  updateWorkoutDetails: (updates: Partial<WorkoutEventDetails>) => void;
  updateGamedayDetails: (updates: Partial<GamedayEventDetails>) => void;
  updateAssessmentDetails: (updates: Partial<AssessmentEventDetails>) => void;
  updateCoachingSessionDetails: (updates: Partial<CoachingSessionEventDetails>) => void;
  
  // Workout-specific helper functions
  setWorkoutAndPrescriptions: (workoutId: string, workoutExercises: WorkoutExercise[]) => void;
  updateExercisePrescription: (exerciseId: string, updates: {
    prescribedMetrics?: { [key: string]: any };
    notes?: string;
  }) => void;
  
  // Build complete event data
  buildCompleteEventData: () => BaseEventData | undefined;
  
  // Validation
  isEventDataValid: () => boolean;
  getValidationErrors: () => string[];
  
  
  // Organization/Team context
  organizationId: string;
  teamId: string;
  currentUserId: string;
  
  // Generation - returns the API payload structure
  generateEventCreationPayload: () => { eventData: BaseEventData; targetAthletes?: UserInfo[] };

}

// ==================== CONTEXT ====================

const EventCreationContext = createContext<EventCreationContextValue | undefined>(undefined);

// ==================== PROVIDER ====================

interface EventCreationProviderProps {
  children: ReactNode;
  organizationId: string;
  teamId: string;
  currentUserId: string;
  initialEventType?: EventType;
}

const createInitialEventData = (type: EventType = 'workout'): Partial<BaseEventData> => ({
  type,
  organizationId: '',
  teamId: '',
  title: '',
  description: '',
  startTime: new Date(),
  endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours later
  location: undefined,
  coverPhotoUrl: undefined,
  participants: {
    athletes: [],
    coaches: [],
    required: [],
    optional: []
  },
  recurrence: {
    pattern: 'none',
    interval: 1
  },
  sourceAssignmentId: '',
  sequenceNumber: 1,
  totalInSequence: 1,
  status: 'scheduled',
  visibility: 'team_only',
  createdBy: { userId: '', memberId: '' },
  details: {} as EventDetails
});

const createInitialEventCreationData = (type: EventType = 'workout'): EventCreationData => ({
  eventData: createInitialEventData(type),
  targetAthletes: undefined
});

export function EventCreationProvider({
  children,
  organizationId,
  teamId,
  currentUserId,
  initialEventType
}: EventCreationProviderProps) {
  const [eventCreationData, setEventCreationData] = useState<EventCreationData>(() => 
    createInitialEventCreationData(initialEventType)
  );

  const updateEventData = useCallback((updates: Partial<BaseEventData>) => {
    setEventCreationData(prev => ({
      ...prev,
      eventData: { ...prev.eventData, ...updates }
    }));
  }, []);

  const updateParticipants = useCallback((updates: Partial<BaseEventData['participants']>) => {
    setEventCreationData(prev => ({
      ...prev,
      eventData: {
        ...prev.eventData,
        participants: { ...prev.eventData.participants!, ...updates }
      }
    }));
  }, []);

  const updateTargetAthletes = useCallback((athletes: UserInfo[]) => {
    setEventCreationData(prev => ({ 
      ...prev, 
      targetAthletes: athletes.length > 0 ? athletes : undefined 
    }));
  }, []);

  const updateRecurrence = useCallback((recurrence: RecurrenceConfig) => {
    setEventCreationData(prev => ({
      ...prev,
      eventData: { ...prev.eventData, recurrence }
    }));
  }, []);

  // Type-aware detail updates
  const updateDetailsData = useCallback(<T extends EventDetails>(
    updates: Partial<T>, 
    eventType: EventType
  ) => {
    setEventCreationData(prev => ({
      ...prev,
      eventData: {
        ...prev.eventData,
        details: {
          ...prev.eventData.details,
          type: eventType,
          ...updates
        } as Partial<EventDetails>
      }
    }));
  }, []);

  // Type-specific update functions
  const updateWorkoutDetails = useCallback((updates: Partial<WorkoutEventDetails>) => {
    updateDetailsData(updates, 'workout');
  }, [updateDetailsData]);

  const updateGamedayDetails = useCallback((updates: Partial<GamedayEventDetails>) => {
    updateDetailsData(updates, 'gameday');
  }, [updateDetailsData]);

  const updateAssessmentDetails = useCallback((updates: Partial<AssessmentEventDetails>) => {
    updateDetailsData(updates, 'assessment');
  }, [updateDetailsData]);

  const updateCoachingSessionDetails = useCallback((updates: Partial<CoachingSessionEventDetails>) => {
    updateDetailsData(updates, 'coaching_session');
  }, [updateDetailsData]);

  // Workout-specific helper functions
  const setWorkoutAndPrescriptions = useCallback((workoutId: string, workoutExercises: WorkoutExercise[]) => {
    const exercisePrescriptions: WorkoutEventDetails['exercisePrescriptions'] = {};
    
    // Initialize prescriptions with workout defaults
    workoutExercises.forEach(exercise => {
      exercisePrescriptions[exercise.exercise_id] = {
        prescribedMetrics: { ...exercise.default_Metrics }, // Start with workout defaults
        notes: '',
        isModified: false
      };
    });
    
    updateWorkoutDetails({
      workoutId,
      exercisePrescriptions
    });
  }, [updateWorkoutDetails]);

  const updateExercisePrescription = useCallback((exerciseId: string, updates: {
    prescribedMetrics?: { [key: string]: any };
    notes?: string;
  }) => {
    const currentDetails = eventCreationData.eventData.details as Partial<WorkoutEventDetails>;
    const currentPrescriptions = currentDetails?.exercisePrescriptions || {};
    
    const updatedPrescriptions = {
      ...currentPrescriptions,
      [exerciseId]: {
        ...currentPrescriptions[exerciseId],
        ...updates,
        isModified: true // Mark as modified
      }
    };
    
    updateWorkoutDetails({
      exercisePrescriptions: updatedPrescriptions
    });
  }, [eventCreationData.eventData.details, updateWorkoutDetails]);

  // Build complete details from partial data
  const buildCompleteDetails = useCallback((): EventDetails | undefined => {
    if (!eventCreationData.eventData.type || !eventCreationData.eventData.details) return undefined;

    const baseDetails = {
      type: eventCreationData.eventData.type,
      ...eventCreationData.eventData.details
    };

    // Add default values based on event type
    switch (eventCreationData.eventData.type) {
      case 'workout':
        return {
          type: 'workout',
          workoutId: '',
          exercisePrescriptions: {},
          sessionType: 'individual',
          estimatedDuration: 60,
          equipment: [],
          notes: '',
          ...baseDetails
        } as WorkoutEventDetails;

      case 'gameday':
        return {
          type: 'gameday',
          opponent: '',
          venue: 'home',
          gameType: 'scrimmage',
          roster: {
            starters: [],
            bench: [],
            injured: []
          },
          ...baseDetails
        } as GamedayEventDetails;

      case 'assessment':
        return {
          type: 'assessment',
          assessmentType: 'bullpen',
          evaluators: [],
          metrics: [],
          equipment: [],
          isRecorded: false,
          followUpRequired: false,
          ...baseDetails
        } as AssessmentEventDetails;

      case 'coaching_session':
        return {
          type: 'coaching_session',
          sessionType: 'one_on_one',
          focus: [],
          goals: [],
          materials: [],
          sessionFormat: 'in_person',
          preparationNotes: '',
          followUpActions: [],
          ...baseDetails
        } as CoachingSessionEventDetails;

      default:
        return undefined;
    }
  }, [eventCreationData.eventData.type, eventCreationData.eventData.details]);

  // Build complete event data
  const buildCompleteEventData = useCallback((): BaseEventData | undefined => {
    if (!eventCreationData.eventData.type) return undefined;

    const baseEvent = {
      ...eventCreationData.eventData,
      organizationId,
      teamId,
      createdBy: { userId: currentUserId, memberId: 'member-id' }, // TODO: Get actual memberId
      sourceAssignmentId: `${eventCreationData.eventData.type}-${Date.now()}`,
      sequenceNumber: 1,
      totalInSequence: 1,
    } as BaseEventData;

    // Build complete details based on event type
    const completeDetails = buildCompleteDetails();
    if (!completeDetails) return undefined;

    return {
      ...baseEvent,
      details: completeDetails
    };
  }, [eventCreationData.eventData, organizationId, teamId, currentUserId, buildCompleteDetails]);

  const isEventDataValid = useCallback((): boolean => {
    const { eventData, targetAthletes } = eventCreationData;
    
    if (!eventData.type) return false;
    if (!eventData.title || eventData.title.trim() === '') return false;
    if (!eventData.startTime || !eventData.endTime) return false;
    if (eventData.endTime <= eventData.startTime) return false;
    
    // Check for athletes - either in participants or targetAthletes
    const hasAthletes = (eventData.participants?.athletes?.length > 0) || 
                       (targetAthletes?.length > 0);
    if (!hasAthletes) return false;
    
    if (!eventData.details) return false;
    
    // Recurrence validation
    if (eventData.recurrence && eventData.recurrence.pattern !== 'none') {
      if (eventData.recurrence.pattern === 'weekly' && (!eventData.recurrence.daysOfWeek || eventData.recurrence.daysOfWeek.length === 0)) {
        return false;
      }
      if (eventData.recurrence.pattern === 'monthly') {
        if (eventData.recurrence.weekOfMonth && (!eventData.recurrence.daysOfWeek || eventData.recurrence.daysOfWeek.length === 0)) {
          return false;
        }
        if (!eventData.recurrence.weekOfMonth && eventData.recurrence.dayOfMonth === undefined) {
          return false;
        }
      }
      if (!eventData.recurrence.endDate && !eventData.recurrence.occurrences) {
        return false;
      }
    }
    
    return true;
  }, [eventCreationData]);


  const getValidationErrors = useCallback((): string[] => {
    const { eventData, targetAthletes } = eventCreationData;
    const errors: string[] = [];
    
    if (!eventData.type) errors.push('Event type is required');
    if (!eventData.title || eventData.title.trim() === '') errors.push('Title is required');
    if (!eventData.startTime) errors.push('Start time is required');
    if (!eventData.endTime) errors.push('End time is required');
    if (eventData.endTime && eventData.startTime && eventData.endTime <= eventData.startTime) {
      errors.push('End time must be after start time');
    }
    
    // Check for athletes - either in participants or targetAthletes
    const hasAthletes = (eventData.participants?.athletes?.length > 0) || 
                       (targetAthletes?.length > 0);
    if (!hasAthletes) {
      errors.push('At least one athlete is required');
    }
    
    if (!eventData.details) errors.push('Event details are required');
    
    if (eventData.recurrence && eventData.recurrence.pattern !== 'none') {
      if (eventData.recurrence.pattern === 'weekly' && (!eventData.recurrence.daysOfWeek || eventData.recurrence.daysOfWeek.length === 0)) {
        errors.push('Weekly recurrence requires at least one day selected');
      }
      if (!eventData.recurrence.endDate && !eventData.recurrence.occurrences) {
        errors.push('Recurrence must have an end date or occurrence count');
      }
    }
    
    return errors;
  }, [eventCreationData]);

 

  // Generate event creation payload for API
  const generateEventCreationPayload = useCallback((): { eventData: BaseEventData; targetAthletes?: UserInfo[] } => {
    if (!isEventDataValid()) {
      throw new Error('Event data is not valid');
    }

    const completeEventData = buildCompleteEventData();
    if (!completeEventData) {
      throw new Error('Could not build complete event data');
    }

    return {
      eventData: completeEventData,
      targetAthletes: eventCreationData.targetAthletes
    };
  }, [eventCreationData, isEventDataValid, buildCompleteEventData]);

  const value: EventCreationContextValue = {
    eventCreationData,
    updateEventData,
    updateParticipants,
    updateTargetAthletes,
    updateRecurrence,
    updateDetailsData,
    updateWorkoutDetails,
    updateGamedayDetails,
    updateAssessmentDetails,
    updateCoachingSessionDetails,
    setWorkoutAndPrescriptions,
    updateExercisePrescription,
    buildCompleteEventData,
    isEventDataValid,
    getValidationErrors,
    organizationId,
    teamId,
    currentUserId,
    generateEventCreationPayload
  };

  return (
    <EventCreationContext.Provider value={value}>
      {children}
    </EventCreationContext.Provider>
  );
}

// ==================== HOOK ====================

export function useEventCreation() {
  const context = useContext(EventCreationContext);
  if (context === undefined) {
    throw new Error('useEventCreation must be used within an EventCreationProvider');
  }
  return context;
}

// ==================== HELPER HOOKS ====================

export function useEventCreationData() {
  const { eventCreationData } = useEventCreation();
  return eventCreationData;
}

export function useEventCreationActions() {
  const { 
    updateEventData, 
    updateParticipants, 
    updateTargetAthletes,
    updateRecurrence, 
    updateDetailsData,
    updateWorkoutDetails,
    updateGamedayDetails,
    updateAssessmentDetails,
    updateCoachingSessionDetails,
    setWorkoutAndPrescriptions,
    updateExercisePrescription,
    buildCompleteEventData,
    generateEventCreationPayload
  } = useEventCreation();
  return { 
    updateEventData, 
    updateParticipants, 
    updateTargetAthletes,
    updateRecurrence, 
    updateDetailsData,
    updateWorkoutDetails,
    updateGamedayDetails,
    updateAssessmentDetails,
    updateCoachingSessionDetails,
    setWorkoutAndPrescriptions,
    updateExercisePrescription,
    buildCompleteEventData,
    generateEventCreationPayload
  };
}

export function useEventCreationValidation() {
  const { isEventDataValid, getValidationErrors } = useEventCreation();
  return { isEventDataValid, getValidationErrors };
}

// ==================== SPECIALIZED HOOKS ====================

export function useWorkoutEventCreation() {
  const context = useEventCreation();
  
  return {
    ...context,
    workoutDetails: context.eventCreationData.eventData.details as Partial<WorkoutEventDetails> | undefined,
    updateWorkoutDetails: context.updateWorkoutDetails,
    setWorkoutAndPrescriptions: context.setWorkoutAndPrescriptions,
    updateExercisePrescription: context.updateExercisePrescription,
    buildWorkoutDetails: () => context.buildCompleteEventData()?.details as WorkoutEventDetails | undefined
  };
}

export function useGamedayEventCreation() {
  const context = useEventCreation();
  
  return {
    ...context,
    gamedayDetails: context.eventCreationData.eventData.details as Partial<GamedayEventDetails> | undefined,
    updateGamedayDetails: context.updateGamedayDetails,
    buildGamedayDetails: () => context.buildCompleteEventData()?.details as GamedayEventDetails | undefined
  };
}

export function useAssessmentEventCreation() {
  const context = useEventCreation();
  
  return {
    ...context,
    assessmentDetails: context.eventCreationData.eventData.details as Partial<AssessmentEventDetails> | undefined,
    updateAssessmentDetails: context.updateAssessmentDetails,
    buildAssessmentDetails: () => context.buildCompleteEventData()?.details as AssessmentEventDetails | undefined
  };
}

export function useCoachingSessionEventCreation() {
  const context = useEventCreation();
  
  return {
    ...context,
    coachingSessionDetails: context.eventCreationData.eventData.details as Partial<CoachingSessionEventDetails> | undefined,
    updateCoachingSessionDetails: context.updateCoachingSessionDetails,
    buildCoachingSessionDetails: () => context.buildCompleteEventData()?.details as CoachingSessionEventDetails | undefined
  };
}

// ==================== UTILITIES ====================

function calculateOccurrences(config: RecurrenceConfig, startDate: Date): Date[] {
  if (config.pattern === 'none') return [startDate];

  const occurrences: Date[] = [];
  const maxCount = config.occurrences || 100;
  const endDate = config.endDate;
  let currentDate = new Date(startDate);
  currentDate.setHours(0, 0, 0, 0);

  const addOccurrence = (date: Date) => {
    const dateToAdd = new Date(date);
    const isException = config.exceptions?.some(
      ex => ex.toISOString().split('T')[0] === dateToAdd.toISOString().split('T')[0]
    );
    if (!isException) {
      occurrences.push(new Date(dateToAdd));
    }
  };

  if (config.pattern === 'daily') {
    while (occurrences.length < maxCount) {
      if (endDate && currentDate > endDate) break;
      addOccurrence(currentDate);
      currentDate = new Date(currentDate.setDate(currentDate.getDate() + config.interval));
    }
  }

  if (config.pattern === 'weekly' && config.daysOfWeek?.length) {
    let weekCount = 0;
    while (occurrences.length < maxCount) {
      if (endDate && currentDate > endDate) break;
      
      const weekStart = new Date(startDate);
      weekStart.setDate(startDate.getDate() + (weekCount * 7 * config.interval));
      
      config.daysOfWeek.forEach(dayIndex => {
        const date = new Date(weekStart);
        const dayDiff = (dayIndex - weekStart.getDay() + 7) % 7;
        date.setDate(weekStart.getDate() + dayDiff);
        
        if (date >= startDate && (!endDate || date <= endDate)) {
          if (occurrences.length < maxCount) {
            addOccurrence(date);
          }
        }
      });
      
      weekCount++;
      if (weekCount > 500) break;
    }
  }

  if (config.pattern === 'monthly') {
    let monthCount = 0;
    
    while (occurrences.length < maxCount) {
      const targetDate = new Date(startDate);
      targetDate.setMonth(startDate.getMonth() + (monthCount * config.interval));
      
      if (endDate && targetDate > endDate) break;
      
      if (config.weekOfMonth && config.daysOfWeek?.length) {
        config.weekOfMonth.forEach(weekNum => {
          const date = getNthWeekdayOfMonth(
            targetDate.getFullYear(),
            targetDate.getMonth(),
            config.daysOfWeek![0],
            weekNum
          );
          
          if (date && date >= startDate && (!endDate || date <= endDate)) {
            if (occurrences.length < maxCount) {
              addOccurrence(date);
            }
          }
        });
      } else if (config.dayOfMonth !== undefined) {
        const date = new Date(
          targetDate.getFullYear(),
          targetDate.getMonth(),
          config.dayOfMonth === -1 
            ? new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).getDate()
            : Math.min(config.dayOfMonth, new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).getDate())
        );
        
        if (date >= startDate && (!endDate || date <= endDate)) {
          addOccurrence(date);
        }
      }
      
      monthCount++;
      if (monthCount > 120) break;
    }
  }

  return occurrences.sort((a, b) => a.getTime() - b.getTime()).slice(0, maxCount);
}

function getNthWeekdayOfMonth(
  year: number,
  month: number,
  dayOfWeek: number,
  weekNumber: number
): Date | null {
  if (weekNumber === -1) {
    const lastDay = new Date(year, month + 1, 0);
    const lastDayOfWeek = lastDay.getDay();
    const daysBack = (lastDayOfWeek - dayOfWeek + 7) % 7;
    return new Date(year, month, lastDay.getDate() - daysBack);
  }

  const firstDay = new Date(year, month, 1);
  const firstDayOfWeek = firstDay.getDay();
  const daysUntilTarget = (dayOfWeek - firstDayOfWeek + 7) % 7;
  const targetDate = new Date(year, month, 1 + daysUntilTarget + (weekNumber - 1) * 7);

  if (targetDate.getMonth() !== month) return null;
  return targetDate;
}