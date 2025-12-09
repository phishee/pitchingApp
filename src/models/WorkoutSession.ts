import { MetricValue } from "./Metric";
import { UserInfo } from "./User";
import { RPEValue, RPEResult, RPEConfig } from "./RPE";
import { WorkoutFlow } from "./Workout";

export interface WorkoutSession {
  _id: string;

  // ==========================================
  // CORE IDENTITY
  // ==========================================
  organizationId: string;
  teamId?: string;
  workoutAssignmentId: string;  // FK → WorkoutAssignment
  calendarEventId: string;       // FK → Calendar Event
  workoutId: string;          // FK → Workout

  // ==========================================
  // PARTICIPANTS (Denormalized for AI)
  // ==========================================
  athleteInfo: UserInfo & {
    name: string;
    email: string;
  };

  coachInfo?: UserInfo & {
    name: string;
  };

  // ==========================================
  // WORKOUT SNAPSHOT (Immutable at creation)
  // ==========================================
  workout: {
    workoutId: string;
    name: string;
    description: string;
    coverImage?: string;
    tags: string[];
    rpe?: RPEConfig;
    flow?: WorkoutFlow;
  };

  // ==========================================
  // TIMING
  // ==========================================
  scheduledDate: Date;           // Date only from calendar
  actualStartTime?: Date;        // When clicked "Start Workout"
  actualEndTime?: Date;          // When clicked "Finish Workout"
  durationMinutes?: number;      // Computed: (end - start) / 60

  // ==========================================
  // STATUS
  // ==========================================
  status: 'scheduled' | 'in_progress' | 'completed' | 'abandoned' | 'skipped';

  statusReason?: {
    reason: 'injury' | 'illness' | 'schedule_conflict' | 'fatigue' | 'other';
    note?: string;                // Freeform explanation
  };

  // ==========================================
  // EXERCISE PERFORMANCE
  // ==========================================
  exercises: WorkoutSessionExercise[];

  // ==========================================
  // SESSION-LEVEL SUMMARY (Computed on save)
  // ==========================================
  summary: {
    // Completion
    totalExercises: number;
    completedExercises: number;
    totalSets: number;
    completedSets: number;
    compliancePercent: number;    // (completedSets / totalSets) * 100

    // Volume (if strength workout)
    totalVolumeLifted?: number;   // Sum of all set volumes
    averageIntensityPercent?: number; // Avg % of prescribed weight

    // RPE
    sessionRPE: number;           // 1-10, REQUIRED on completion (Kept as number for backward compatibility, use rpeResult for full data)
    sessionRpe?: RPEValue;        // New structured RPE value
    averageExerciseRPE: number;   // Mean of all exercise RPEs
  };



  // ==========================================
  // PROGRESSION (vs Last Same Workout)
  // ==========================================
  progression?: {
    lastSessionId?: string;
    lastSessionDate?: Date;
    daysSinceLastSession?: number;

    volumeChangeLbs?: number;     // +50, -20
    volumeChangePercent?: number; // +5%, -10%
    rpeChange?: number;           // +1, -2
    trend: 'improving' | 'plateauing' | 'regressing' | 'first_session';
  };

  // ==========================================
  // FLAGS (Auto-computed)
  // ==========================================
  flags: {
    highRPE: boolean;             // sessionRPE >= 9
    lowCompliance: boolean;       // compliancePercent < 70%
    volumeSpike: boolean;         // >20% increase
    shortRestPeriod: boolean;     // <2 days since last
    possibleOvertraining: boolean; // Composite flag
  };

  // ==========================================
  // NOTES
  // ==========================================
  athleteNotes?: string;          // Freeform text
  coachNotes?: string;            // Freeform text

  // ==========================================
  // METADATA
  // ==========================================
  createdAt: Date;
  updatedAt: Date;
  createdBy: {
    userId: string;
    role: 'athlete' | 'coach' | 'system';
  };

  // ==========================================
  // WORKFLOW PROGRESS
  // ==========================================
  progress: {
    currentStep: WorkoutSessionStep;
    stepName?: string;      // e.g., 'exercises', 'rpe'
    positionId?: string;    // e.g., exerciseId
    currentUrl?: string;    // Full relative URL
    updatedAt: Date;
  };
}

export type WorkoutSessionStep =
  | 'pre_workout_questionnaire'
  | 'exercises'
  | 'rpe'
  | 'post_workout_questionnaire'
  | 'questionnaire'
  | 'summary';

// ==========================================
// EXERCISE DETAIL
// ==========================================
export interface WorkoutSessionExercise {
  exerciseId: string;

  // Denormalized for AI/display (snapshot at creation)
  exerciseName: string;
  exerciseType: string;           // "strength" | "conditioning" | "skill"
  exerciseImage?: string;

  // Exercise-level RPE (REQUIRED after completing exercise)
  exerciseRPE?: number;           // 1-10 (Legacy/Simple)
  exerciseRpe?: RPEValue;         // New structured RPE
  exerciseNotes?: string;

  // Sets data
  sets: WorkoutSessionSet[];

  // Exercise summary (computed on save)
  summary: {
    totalSets: number;
    completedSets: number;
    compliancePercent: number;
    totalVolumeLifted?: number;   // If applicable
  };
}

// ==========================================
// SET DETAIL
// ==========================================
export interface WorkoutSessionSet {
  setNumber: number;              // 1, 2, 3...
  status: 'pending' | 'completed' | 'skipped';
  isAdded?: boolean;              // Flag for user-added sets

  // Prescription (copied from WorkoutAssignment)
  prescribed: {
    [metricId: string]: MetricValue;  // e.g., { weight: 135, reps: 10 }
  };

  // Actual performance (logged by athlete)
  performed?: {
    [metricId: string]: MetricValue;  // e.g., { weight: 135, reps: 8 }
  };

  // Computed on save (if applicable)
  computed?: {
    volume?: number;              // weight × reps
    deviationPercent?: number;    // % deviation from prescription
  };
}