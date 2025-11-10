import { TeamMemberWithUser, Workout, Exercise, Event } from '@/models';

export interface WorkoutAssignmentData {
  selectedMembers: Partial<TeamMemberWithUser>[];
  selectedWorkout: Workout | null;
  scheduleConfig: {
    daysOfWeek: number[];
    numberOfWeeks: number;
    startDate: Date;
    endDate: Date;
    defaultStartTime: string;
    defaultEndTime: string;
  };
  exercisePrescriptions: {
    [exerciseId: string]: {
      isPrescribed: boolean;
      prescribedMetrics: { [metricId: string]: any };
    };
  };
  sessionType: 'individual' | 'coached';
  notes: string;
}

export interface WorkoutAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMembers: Partial<TeamMemberWithUser>[];
  availableMembers?: Partial<TeamMemberWithUser>[];
  onAddEvent: (event: Omit<Event, '_id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  organizationId?: string;
  teamId?: string;
  currentUserId?: string;
}

export interface ExerciseMetricPrescription {
  exerciseId: string;
  exerciseName: string;
  isPrescribed: boolean;
  defaultMetrics: { [key: string]: any };
  prescribedMetrics: { [key: string]: any };
  exercise: Exercise;
}

export type WizardStep = 'athletes' | 'workout' | 'prescriptions' | 'schedule' | 'review';

export interface CalendarDay {
  date: Date;
  dayNumber: number;
  hasEvent: boolean;
  isCurrentMonth: boolean;
}

export interface StepProps {
  assignmentData: WorkoutAssignmentData;
  onAssignmentDataChange: (data: Partial<WorkoutAssignmentData>) => void;
}

export interface AthletesStepProps extends StepProps {
  availableMembers: Partial<TeamMemberWithUser>[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export interface WorkoutStepProps extends StepProps {
  availableWorkouts: Workout[];
  isLoadingWorkouts: boolean;
}

export interface ScheduleStepProps extends StepProps {
  // Additional schedule-specific props can be added here
}

export interface ExercisePrescriptionStepProps extends StepProps {
  selectedWorkout: Workout | null;
}

export interface ReviewStepProps extends StepProps {
  exercisePrescriptions: ExerciseMetricPrescription[];
  isLoadingExercises: boolean;
  isAdvancedExpanded: boolean;
  onToggleAdvanced: () => void;
  onPrescriptionToggle: (exerciseId: string) => void;
  onMetricChange: (exerciseId: string, metricId: string, value: any) => void;
  totalEvents: number;
}
