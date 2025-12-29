import { UserInfo } from "./User";

// ===== BASE TYPES =====

export type EventType = 'workout' | 'gameday' | 'assessment' | 'coaching_session' | 'bullpen' | 'drill';
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

// ===== EVENT DETAILS (REMOVED - NO LONGER NEEDED) =====
// Delete lines 44-106 (all the EventDetails interfaces)

// ===== MAIN EVENT MODEL =====

export interface Event {
  _id?: string; // MongoDB _id - unique per event instance
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
  coverPhotoUrl?: string;

  // Participants
  participants: {
    athletes: UserInfo[];
    coaches: UserInfo[];
    required: string[]; // userIds who must attend
    optional: string[]; // userIds who can attend
  };

  // Reference to source (foreign key approach)
  sourceId: string; // FK to WorkoutAssignment | GameSchedule | AssessmentPlan | CoachingBooking
  sourceType: 'workout_assignment' | 'game_schedule' | 'assessment' | 'coaching_session';

  // Event instance tracking
  sequenceNumber: number; // 1st occurrence, 2nd occurrence, etc.
  totalInSequence: number; // Total events in this group
  isModified: boolean; // Track if individually changed

  // Status & Metadata
  status: EventStatus;
  visibility: EventVisibility;
  createdBy: UserInfo;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecurrenceConfig {
  pattern: 'daily' | 'weekly' | 'monthly' | 'none';
  interval: number;

  // Start date for the recurrence
  startDate?: Date;

  // For weekly recurrence
  daysOfWeek?: number[];

  // For monthly recurrence - choose ONE:
  weekOfMonth?: number[];  // Week-based: "1st Monday"
  dayOfMonth?: number;     // Date-based: "15th of month"

  // Termination
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
  _id?: string; // Event._id
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
  coverPhotoUrl?: string;

  // Quick access to common details without fetching full event
  workoutType?: string; // "Upper Body Strength"
  opponent?: string; // For games
  assessmentType?: string; // "Bullpen Assessment"

  // New fields for card redesign
  sourceType?: 'workout_assignment' | 'game_schedule' | 'assessment' | 'coaching_session';
  assignees?: UserInfo[];

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

export type DayOfWeek = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

export interface RepetitionConfig {
  pattern: 'none' | 'daily' | 'weekly' | 'custom';
  startDate: Date;
  endDate?: Date;
  occurrences?: number;
  interval?: number; // Every N days/weeks
  numberOfWeeks?: number;
  daysOfWeek?: DayOfWeek[];
  timeOverrides?: {
    dayOfWeek: DayOfWeek;
    startTime?: string;
    endTime?: string;
  }[];
}

export type EventTemplate = Omit<Event, '_id' | 'groupId' | 'startTime' | 'endTime' | 'sequenceNumber' | 'totalInSequence' | 'createdAt' | 'updatedAt' | 'participants'> & {
  participants?: Partial<Event['participants']>;
};

export type CreateEventRequest =
  | {
    creationType: 'simple';
    event: Omit<Event, '_id' | 'createdAt' | 'updatedAt'>;
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

// ===== TYPE GUARDS (REMOVED - NO LONGER NEEDED) =====
// Delete lines 219-234 (all the type guard functions)

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
  },
  bullpen: {
    scheduled: '#FF5722', // Deep Orange
    in_progress: '#E64A19',
    completed: '#BF360C',
    cancelled: '#757575'
  },
  drill: {
    scheduled: '#009688', // Teal
    in_progress: '#00796B',
    completed: '#004D40',
    cancelled: '#757575'
  }
} as const;

export const BOOKING_ADVANCE_HOURS = 24; // Minimum hours in advance for booking

export const DEFAULT_EVENT_DURATION = 60; // Default duration in minutes

export const MAX_BULK_UPDATE_EVENTS = 100; // Safety limit for bulk operations