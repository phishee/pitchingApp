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