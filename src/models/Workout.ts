import { ExerciseMetric, MetricValue } from "./Metric";
import { RPEConfig } from "./RPE";

export interface WorkoutFlow {
  questionnaires: string[];
  warmup: string[];
  exercises: Array<WorkoutExercise>;
  rpe?: RPEConfig;
}

export interface WorkoutExercise {
  exercise_id: string;
  default_Metrics: { [metricId: string]: MetricValue };
}

export interface WorkoutUser {
  userId: string;
  memberId: string;
}

// Extended user profile for workout context
export interface WorkoutUserProfile {
  userId: string;
  name: string;
  email: string;
  profileImageUrl?: string;
}

export interface Workout {
  id: string;
  coverImage: string;
  organizationId: string;
  teamIds: string[];
  createdBy: WorkoutUser;
  updatedBy: WorkoutUser;
  name: string;
  description: string;
  flow: WorkoutFlow;
  tags: string[];
  duration?: number;
}

// Extended workout with user information
export interface WorkoutWithUser extends Workout {
  createdByUser?: WorkoutUserProfile;
  updatedByUser?: WorkoutUserProfile;
}

// Query parameters interface
export interface WorkoutQueryParams {
  search?: string;
  name?: string;
  organizationId?: string;
  teamId?: string;
  createdBy?: string;
  tags?: string;
  page?: number;
  limit?: number;
  sort?: 'name' | 'created' | 'updated';
  order?: 'asc' | 'desc';
}

// Response interface
export interface WorkoutResponse {
  data: Workout[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    availableTags: string[];
    totalWorkouts: number;
  };
  query: WorkoutQueryParams;
}

// Extended response interface with user information
export interface WorkoutResponseWithUser {
  data: WorkoutWithUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    availableTags: string[];
    totalWorkouts: number;
  };
  query: WorkoutQueryParams;
}