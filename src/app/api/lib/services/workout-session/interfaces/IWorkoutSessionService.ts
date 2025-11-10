import { WorkoutSession } from '@/models/WorkoutSession';

export interface IWorkoutSessionService {
  startSession(calendarEventId: string, athleteUserId: string): Promise<WorkoutSession>;
  getActiveSession(athleteUserId: string): Promise<WorkoutSession | null>;
  getSessionById(sessionId: string): Promise<WorkoutSession | null>;
  getSessionByEventId(calendarEventId: string): Promise<WorkoutSession | null>;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface ISessionValidator {
  validateCanStart(calendarEventId: string, athleteUserId: string): Promise<ValidationResult>;
}

export interface SessionAggregatedData {
  event: any;
  assignment: any;
  workout: any;
  exercises: any[];
  athlete: any;
  coach?: any;
}

export interface ISessionDataAggregator {
  aggregateSessionData(calendarEventId: string): Promise<SessionAggregatedData>;
}

export interface ResolvedPrescription {
  exerciseId: string;
  sets: Array<{
    setNumber: number;
    prescribed: Record<string, any>;
  }>;
}

export interface IPrescriptionResolver {
  resolvePrescriptions(
    assignment: any,
    workout: any,
    exercises: any[]
  ): ResolvedPrescription[];
}

export interface SessionInitializationInput {
  calendarEventId: string;
  athleteUserId: string;
  sessionData: SessionAggregatedData;
  resolvedPrescriptions: ResolvedPrescription[];
}

export interface ISessionInitializer {
  initialize(input: SessionInitializationInput): Promise<WorkoutSession>;
}

export interface ISessionEventBus {
  publish(eventName: string, payload: any): void;
}

