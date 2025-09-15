export interface WorkoutFlow {
  questionnaires: string[];
  warmup: string[];
  exercises: Array<{ exercise_id: string }>;
}

export interface WorkoutUser {
  userId: string;
  memberId: string;
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