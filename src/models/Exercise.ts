import { ExerciseMetric } from "./Metric";
export interface Exercise {
  id: string;
  type: "exercise_template";
  version: string;
  image?: string;
  photoCover?: string;
  name: string;
  description: string;
  exercise_type: string;
  tags: string[];
  owner: string;

  instructions: {
    text?: string[];
    video?: string; // URL
    animationPicture?: string;
  };

  structure: string | "sets";

  settings: {
    sets_counting: boolean;
    reps_counting: boolean;
  };

  metrics: ExerciseMetric[];

  rpe?: {
    type: string;
    range: string;
    description: string;
  };

}

// Query parameters interface
export interface ExerciseQueryParams {
  search?: string;
  name?: string;
  type?: string;
  tags?: string;
  page?: number;
  limit?: number;
  sort?: 'name' | 'type' | 'created';
  order?: 'asc' | 'desc';
  owner?: string;
  hasVideo?: boolean;
  hasAnimation?: boolean;
  minMetrics?: number;
}

// Response interface
export interface ExerciseResponse {
  data: Exercise[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    availableTypes: string[];
    availableTags: string[];
    totalExercises: number;
  };
  query: ExerciseQueryParams;
}
