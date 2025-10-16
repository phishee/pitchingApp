import { UserInfo } from "./User";
import { RecurrenceConfig } from "./Calendar";

export interface WorkoutAssignment {
  _id: string;
  organizationId: string;
  teamId: string;
  workoutId: string;
  
  athleteInfo: UserInfo;
  coachInfo: UserInfo;
  
  recurrence: RecurrenceConfig;
  startDate: Date;
  endDate?: Date;
  defaultTimeSlot: { start: string; end: string };
  
  prescriptions: Record<string, {
    prescribedMetrics: Record<string, any>;
    notes: string;
    isModified: boolean;
  }>;
  
  sessionType: 'individual' | 'coached';
  scheduledCoach?: UserInfo;
  notes: string;
  
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  totalEventsGenerated: number;
  lastEventDate?: Date;
}

export interface CreateWorkoutAssignmentPayload {
  organizationId: string;
  teamId: string;
  workoutId: string;
  athleteInfo: UserInfo;
  coachInfo: UserInfo;
  recurrence: RecurrenceConfig;
  startDate: Date;
  endDate?: Date;
  defaultTimeSlot: { start: string; end: string };
  prescriptions: Record<string, any>;
  sessionType: 'individual' | 'coached';
  scheduledCoach?: UserInfo;
  notes: string;
}

export interface UpdateWorkoutAssignmentPayload {
  prescriptions?: Record<string, any>;
  sessionType?: 'individual' | 'coached';
  notes?: string;
  active?: boolean;
  updateStrategy?: 'all_future' | 'only_unstarted' | 'from_date';
  fromDate?: Date;
}


