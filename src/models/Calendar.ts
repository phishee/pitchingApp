// ===== BASE TYPES =====

export type EventType = 'workout' | 'gameday' | 'assessment' | 'coaching_session';
export type EventStatus = 'scheduled' | 'in_progress' | 'completed' | 'abandoned' | 'skipped' | 'cancelled';
export type EventVisibility = 'public' | 'private' | 'team_only';
export type CalendarView = 'month' | 'week' | 'day' | 'agenda';

export interface UserInfo {
  userId: string;
  memberId: string;
}

export interface RecurrenceConfig {
  type: 'none' | 'daily' | 'weekly' | 'monthly';
  interval: number;
  endDate?: Date;
}

export interface WorkingHours {
  start: string; // "09:00"
  end: string;   // "17:00"
}

export interface DayAvailability {
  available: boolean;
  hours?: WorkingHours;
}

// ===== EVENT DETAILS (DISCRIMINATED UNION) =====

export interface WorkoutEventDetails {
  type: 'workout';
  workoutAssignmentId: string;
  workoutSessionId?: string; // Set when workout starts
  sessionType: 'individual' | 'coached';
  bookingInfo: {
    isBookingRequested: boolean;
    requestedCoach?: UserInfo;
    requestStatus: 'none' | 'pending' | 'approved' | 'rejected' | 'cancelled';
    requestedAt?: Date;
    approvedAt?: Date;
    rejectedAt?: Date;
    rejectedReason?: string;
    cancelledAt?: Date;
    cancelledReason?: string;
  };
  estimatedDuration: number; // minutes
  equipment: string[];
  notes: string;
}

export interface GamedayEventDetails {
  type: 'gameday';
  opponent: string;
  venue: 'home' | 'away';
  gameType: 'scrimmage' | 'league' | 'tournament' | 'playoff';
  uniformRequirements?: string;
  arrivalTime?: Date;
  warmupStart?: Date;
  gameNumber?: string; // for tournaments
  livestreamUrl?: string;
  roster: {
    starters: string[]; // userIds
    bench: string[];    // userIds
    injured: string[];  // userIds
  };
}

export interface AssessmentEventDetails {
  type: 'assessment';
  assessmentType: 'bullpen' | 'batting_practice' | 'fitness_test' | 'skill_evaluation';
  evaluators: UserInfo[]; // coaches doing the assessment
  metrics: string[]; // what's being measured
  equipment: string[];
  isRecorded: boolean; // video/data recording
  followUpRequired: boolean;
  assessmentTemplate?: string; // reference to assessment template
}

export interface CoachingSessionEventDetails {
  type: 'coaching_session';
  sessionType: 'one_on_one' | 'small_group' | 'position_specific';
  focus: string[]; // e.g., ["pitching_mechanics", "mental_game"]
  relatedWorkoutSessionId?: string; // if tied to a workout
  goals: string[];
  materials: string[]; // video, documents, etc.
  sessionFormat: 'in_person' | 'virtual' | 'film_review';
  preparationNotes: string;
  followUpActions: string[];
}

export type EventDetails = 
  | WorkoutEventDetails 
  | GamedayEventDetails 
  | AssessmentEventDetails 
  | CoachingSessionEventDetails;

// ===== MAIN EVENT MODEL =====

export interface Event {
  id: string; // MongoDB _id - unique per event instance
  groupId: string; // Groups related events for bulk operations
  type: EventType;
  organizationId: string;
  teamId: string;
  
  // Calendar Properties
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  coverPhotoUrl?: string; // Fix typo: was "corverPhotoUrl"
  
  // Participants
  participants: {
    athletes: UserInfo[];
    coaches: UserInfo[];
    required: string[]; // userIds who must attend
    optional: string[]; // userIds who can attend
  };
  
  // Bulk operation tracking
  sourceAssignmentId: string; // Links to WorkoutAssignment, GameSchedule, etc.
  sequenceNumber: number; // 1st occurrence, 2nd occurrence, etc.
  totalInSequence: number; // Total events in this group
  
  // Status & Metadata
  status: EventStatus;
  visibility: EventVisibility;
  createdBy: UserInfo;
  createdAt: Date;
  updatedAt: Date;
  
  // Type-specific data
  details: EventDetails;
}

// ===== CALENDAR MODELS =====

export interface Calendar {
  _id: string;
  userId: string;
  organizationId: string;
  teamId?: string; // Can be null for coaches who work with multiple teams
  timezone: string;
  preferences: {
    defaultView: CalendarView;
    workingHours: WorkingHours;
    availability: {
      monday: DayAvailability;
      tuesday: DayAvailability;
      wednesday: DayAvailability;
      thursday: DayAvailability;
      friday: DayAvailability;
      saturday: DayAvailability;
      sunday: DayAvailability;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CalendarEvent {
  id: string; // Event.id
  groupId: string; // Event.groupId for bulk operations
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  type: EventType;
  status: EventStatus;
  participants: {
    role: 'athlete' | 'coach' | 'observer';
    isRequired: boolean;
    attendanceStatus?: 'attending' | 'not_attending' | 'maybe';
  };
  color: string; // Type-specific or user-defined
  location?: string;
  coverPhotoUrl?: string; // Add this line
  
  // Quick access to common details without fetching full event
  workoutType?: string; // "Upper Body Strength"
  opponent?: string; // For games
  assessmentType?: string; // "Bullpen Assessment"
  
  // Booking info for workouts
  isBookable?: boolean;
  bookingStatus?: 'none' | 'pending' | 'approved' | 'rejected' | 'cancelled';
}

export interface CalendarDay {
  date: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
  fullDate: Date;
  dayOfWeek: string; // "Monday", "Tuesday", etc.
  isAvailable: boolean; // Based on user availability settings
}

// ===== REQUEST/RESPONSE TYPES =====

export interface CreateWorkoutEventRequest {
  workoutAssignmentId: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  estimatedDuration?: number;
  equipment?: string[];
  notes?: string;
}

export interface BookCoachingRequest {
  coachId: string;
  message?: string;
}

export interface CoachingResponseRequest {
  approved: boolean;
  reason?: string; // Required if rejected
}

export interface BulkEventUpdateRequest {
  title?: string;
  description?: string;
  startTime?: Date;
  endTime?: Date;
  location?: string;
  prescriptions?: any; // Workout-specific prescriptions
  notes?: string;
}

export interface EventGroupCancelRequest {
  reason: string;
  cancelFutureOnly?: boolean; // Default: true
}

// ===== UTILITY TYPES =====

export interface EventConflict {
  eventId: string;
  title: string;
  startTime: Date;
  endTime: Date;
  type: EventType;
}

export interface CoachAvailability {
  userId: string;
  name: string;
  email: string;
  isAvailable: boolean;
  conflicts: EventConflict[];
  nextAvailableSlot?: Date;
}

export interface CalendarFilter {
  types?: EventType[];
  statuses?: EventStatus[];
  startDate?: Date;
  endDate?: Date;
  athleteIds?: string[];
  coachIds?: string[];
}

// ===== ERROR TYPES =====

export class ConflictError extends Error {
  conflicts: EventConflict[];
  
  constructor(message: string, conflicts: EventConflict[]) {
    super(message);
    this.name = 'ConflictError';
    this.conflicts = conflicts;
  }
}

export class BookingError extends Error {
  code: 'ADVANCE_NOTICE' | 'COACH_UNAVAILABLE' | 'ALREADY_BOOKED' | 'UNAUTHORIZED';
  
  constructor(message: string, code: BookingError['code']) {
    super(message);
    this.name = 'BookingError';
    this.code = code;
  }
}

// ===== TYPE GUARDS =====

export function isWorkoutEvent(event: Event): event is Event & { details: WorkoutEventDetails } {
  return event.type === 'workout';
}

export function isGamedayEvent(event: Event): event is Event & { details: GamedayEventDetails } {
  return event.type === 'gameday';
}

export function isAssessmentEvent(event: Event): event is Event & { details: AssessmentEventDetails } {
  return event.type === 'assessment';
}

export function isCoachingSessionEvent(event: Event): event is Event & { details: CoachingSessionEventDetails } {
  return event.type === 'coaching_session';
}

// ===== CONSTANTS =====

export const EVENT_COLORS = {
  workout: {
    scheduled: '#4CAF50',
    in_progress: '#FF9800',
    completed: '#2196F3',
    abandoned: '#9E9E9E',
    skipped: '#F44336',
    cancelled: '#757575'
  },
  gameday: {
    scheduled: '#E91E63',
    in_progress: '#FF5722',
    completed: '#3F51B5',
    cancelled: '#757575'
  },
  assessment: {
    scheduled: '#9C27B0',
    in_progress: '#FF9800',
    completed: '#673AB7',
    cancelled: '#757575'
  },
  coaching_session: {
    scheduled: '#00BCD4',
    in_progress: '#009688',
    completed: '#4CAF50',
    cancelled: '#757575'
  }
} as const;

export const BOOKING_ADVANCE_HOURS = 24; // Minimum hours in advance for booking

export const DEFAULT_EVENT_DURATION = 60; // Default duration in minutes

export const MAX_BULK_UPDATE_EVENTS = 100; // Safety limit for bulk operations