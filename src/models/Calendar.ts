import { UserInfo } from "./User";

// ===== BASE TYPES =====

export type EventType = 'workout' | 'gameday' | 'assessment' | 'coaching_session';
export type EventStatus = 'scheduled' | 'in_progress' | 'completed' | 'abandoned' | 'skipped' | 'cancelled';
export type EventVisibility = 'public' | 'private' | 'team_only';
export type CalendarView = 'month' | 'week' | 'day' | 'agenda';

// export interface UserInfo {
//   userId: string;
//   memberId: string;
// }

export interface WorkingHours {
  start: string; // "09:00"
  end: string;   // "17:00"
}

export interface DayAvailability {
  available: boolean;
  hours?: WorkingHours;
}

// ===== BOOKING TYPES (NEW) =====

export type BookingStatus = 
  | 'pending'      // Awaiting coach response
  | 'approved'     // Coach confirmed
  | 'rejected'     // Coach declined
  | 'cancelled'    // Cancelled after approval
  | 'completed';   // Event finished

export interface BookingSummary {
  status: BookingStatus;
  coachName?: string;      // For quick display in calendar
  coachId?: string;        // For quick filtering
  lastUpdated: Date;
}

// ===== EVENT DETAILS (DISCRIMINATED UNION) =====

export interface WorkoutEventDetails {
  type: 'workout';
  
  // Workout selection
  workoutId: string;
  
  // Exercise prescriptions (modified from workout defaults)
  exercisePrescriptions?: {
    [exerciseId: string]: {
      prescribedMetrics: { [key: string]: any };
      notes?: string;
      isModified: boolean;
    };
  };
  
  // Session details
  sessionType: 'individual' | 'group' | 'team';
  estimatedDuration?: number;
  equipment?: string[];
  notes?: string;
}

export interface GamedayEventDetails {
  type: 'gameday';
  opponent: string;
  venue: 'home' | 'away';
  gameType: 'scrimmage' | 'league' | 'tournament' | 'playoff';
  uniformRequirements?: string;
  arrivalTime?: Date;
  warmupStart?: Date;
  gameNumber?: string;
  livestreamUrl?: string;
  roster: {
    starters: string[];
    bench: string[];
    injured: string[];
  };
}

export interface AssessmentEventDetails {
  type: 'assessment';
  assessmentType: 'bullpen' | 'batting_practice' | 'fitness_test' | 'skill_evaluation';
  evaluators: UserInfo[];
  metrics: string[];
  equipment: string[];
  isRecorded: boolean;
  followUpRequired: boolean;
  assessmentTemplate?: string;
}

export interface CoachingSessionEventDetails {
  type: 'coaching_session';
  sessionType: 'one_on_one' | 'small_group' | 'position_specific';
  focus: string[];
  relatedWorkoutSessionId?: string;
  goals: string[];
  materials: string[];
  sessionFormat: 'in_person' | 'virtual' | 'film_review';
  preparationNotes: string;
  followUpActions: string[];
}

export type EventDetails = 
  | WorkoutEventDetails 
  | GamedayEventDetails 
  | AssessmentEventDetails 
  | CoachingSessionEventDetails;

// ===== MAIN EVENT MODEL (UPDATED) =====

export interface Event {
  id: string;
  groupId: string;
  type: EventType;
  organizationId: string;
  teamId: string;
  
  // Calendar Properties
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  coverPhotoUrl?: string;
  
  // Participants
  participants: {
    athletes: UserInfo[];
    coaches: UserInfo[];
    required: string[];  // userIds who must attend
    optional: string[];  // userIds who can attend
  };

  // Recurrence
  recurrence: RecurrenceConfig;
  
  // Bulk operation tracking
  sourceAssignmentId: string;
  sequenceNumber: number;
  totalInSequence: number;
  
  // Status & Metadata
  status: EventStatus;
  visibility: EventVisibility;
  createdBy: UserInfo;
  createdAt: Date;
  updatedAt: Date;
  
  // Type-specific data
  details: EventDetails;
  
  // ✅ NEW: Booking Integration
  bookingId?: string;              // Reference to Bookings collection
  bookingSummary?: BookingSummary; // Denormalized for quick access
}

export interface RecurrenceConfig {
  pattern: 'daily' | 'weekly' | 'monthly' | 'none';
  interval: number;
  startDate?: Date;
  daysOfWeek?: number[];
  weekOfMonth?: number[];
  dayOfMonth?: number;
  endDate?: Date;
  occurrences?: number;
  exceptions?: Date[];
}

// ===== CALENDAR MODELS =====

export interface Calendar {
  _id: string;
  userId: string;
  organizationId: string;
  teamId?: string;
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
  id: string;
  groupId: string;
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
  color: string;
  location?: string;
  coverPhotoUrl?: string;
  
  // Quick access to common details
  workoutType?: string;
  opponent?: string;
  assessmentType?: string;
  
  // ✅ NEW: Booking summary for calendar view
  bookingSummary?: BookingSummary;
}

export interface CalendarDay {
  date: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
  fullDate: Date;
  dayOfWeek: string;
  isAvailable: boolean;
}

// ===== REQUEST/RESPONSE TYPES =====

export type DayOfWeek = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

export interface RepetitionConfig {
  pattern: 'none' | 'daily' | 'weekly' | 'custom';
  startDate: Date;
  endDate?: Date;
  occurrences?: number;
  interval?: number;
  numberOfWeeks?: number;
  daysOfWeek?: DayOfWeek[];
  timeOverrides?: {
    dayOfWeek: DayOfWeek;
    startTime?: string;
    endTime?: string;
  }[];
}

export type EventTemplate = Omit<Event, 'id' | 'groupId' | 'startTime' | 'endTime' | 'sequenceNumber' | 'totalInSequence' | 'createdAt' | 'updatedAt' | 'participants'> & {
  participants?: Partial<Event['participants']>;
};

export type CreateEventRequest = 
  | {
      creationType: 'simple';
      event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>;
    }
  | {
      creationType: 'repeated-single-user';
      eventTemplate: EventTemplate;
      repetitionConfig: RepetitionConfig;
      participant: UserInfo;
    }
  | {
      creationType: 'repeated-multiple-users';
      eventTemplate: EventTemplate;
      repetitionConfig: RepetitionConfig;
      participants: UserInfo[];
    };

export interface CreateEventResponse {
  success: boolean;
  events: Event[];
  message: string;
}

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

// ✅ UPDATED: Booking request types
export interface BookCoachRequest {
  coachId?: string;  // Specific coach or null for any available
  message?: string;
}

export interface BookingResponseRequest {
  approved: boolean;
  message?: string;
  proposedTime?: Date;  // If coach wants to reschedule
}

export interface BulkEventUpdateRequest {
  title?: string;
  description?: string;
  startTime?: Date;
  endTime?: Date;
  location?: string;
  prescriptions?: any;
  notes?: string;
}

export interface EventGroupCancelRequest {
  reason: string;
  cancelFutureOnly?: boolean;
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
  bookingStatus?: BookingStatus;  // ✅ NEW: Filter by booking status
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
  code: 'ADVANCE_NOTICE' | 'COACH_UNAVAILABLE' | 'ALREADY_BOOKED' | 'UNAUTHORIZED' | 'LATE_CANCELLATION' | 'RATE_LIMIT_EXCEEDED';
  
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

// ✅ NEW: Helper to check if event is bookable
export function isBookable(event: Event): boolean {
  // Event must be in future and not already completed/cancelled
  if (event.startTime < new Date()) return false;
  if (event.status === 'completed' || event.status === 'cancelled') return false;
  
  // Check if already has approved booking
  if (event.bookingSummary?.status === 'approved') return false;
  
  return true;
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

export const BOOKING_ADVANCE_HOURS = 24;
export const BOOKING_CANCELLATION_HOURS = 12;
export const DEFAULT_EVENT_DURATION = 60;
export const MAX_BULK_UPDATE_EVENTS = 100;