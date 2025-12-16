import apiClient from '@/lib/axios-config';
import { Exercise, ExerciseResponse, ExerciseQueryParams } from '@/models/Exercise';
import { sessionStorageService } from '@/services/storage';
import { createDeduplicator } from "@/lib/api-utils";

// Cache configuration
const CACHE_KEYS = {
  EXERCISES_LIBRARY: 'exercises_library'
} as const;

const CACHE_TTL = {
  EXERCISES_LIBRARY: 30 * 60 * 1000, // 30 minutes
} as const;

const CACHE_COLLECTION = 'cache';

// Helper function to make API requests
const makeRequest = async <T>(endpoint: string): Promise<T> => {
  const response = await apiClient.get<T>(endpoint);
  return response.data;
};

// Helper function to build query strings
const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        searchParams.append(key, value.join(','));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

// Main exercise API object
export const exerciseApi = {
  // Get all exercises with caching
  getExercises: createDeduplicator(async (params: ExerciseQueryParams = {}): Promise<ExerciseResponse> => {
    const cacheKey = CACHE_KEYS.EXERCISES_LIBRARY;

    // Check cache first
    const cached = sessionStorageService.getItem<ExerciseResponse>(cacheKey, CACHE_COLLECTION);
    if (cached) {
      // Reset expiration when accessing cache
      sessionStorageService.setItem(cacheKey, cached, {
        ttl: CACHE_TTL.EXERCISES_LIBRARY,
        collection: CACHE_COLLECTION
      });
      return cached;
    }

    // Fetch from API
    const queryString = buildQueryString(params);
    const response = await makeRequest<ExerciseResponse>(`/exercises${queryString}`);

    // Cache the response
    sessionStorageService.setItem(cacheKey, response, {
      ttl: CACHE_TTL.EXERCISES_LIBRARY,
      collection: CACHE_COLLECTION
    });

    return response;
  }, {
    ttl: 2000,
    keyGenerator: (params) => JSON.stringify(params)
  }),

  // Get single exercise by ID with caching
  getExerciseById: createDeduplicator(async (id: string): Promise<Exercise> => {
    const cacheKey = CACHE_KEYS.EXERCISES_LIBRARY;

    // 1. Get cache with key EXERCISES_LIBRARY (contains all exercises)
    const cachedExercises = sessionStorageService.getItem<ExerciseResponse>(cacheKey, CACHE_COLLECTION);

    if (cachedExercises) {
      // 2. Filter all exercises from cache to find the specific id
      const exercise = cachedExercises.data.find(ex => ex.id === id);
      if (exercise) {
        // 3. If found, return the exercise
        return exercise;
      }
    }

    // 4. If not found, fetch using the API
    const response = await makeRequest<Exercise>(`/exercises/${id}`);

    // 5. Reset the EXERCISES_LIBRARY cache by calling getExercises (all of them) - no await
    exerciseApi.getExercises().catch(err =>
      console.warn('Failed to refresh exercises cache:', err)
    );

    // 6. Return the exercise fetched earlier by the id
    return response[0];
  }, { ttl: 2000 }),

  // Search exercises with caching
  async searchExercises(searchTerm: string): Promise<Exercise[]> {
    const cacheKey = CACHE_KEYS.EXERCISES_LIBRARY;

    // 1. Get cache with key EXERCISES_LIBRARY (contains all exercises)
    const cachedExercises = sessionStorageService.getItem<ExerciseResponse>(cacheKey, CACHE_COLLECTION);

    if (cachedExercises) {
      // 2. Filter all exercises from cache to find matches
      const filteredExercises = cachedExercises.data.filter(exercise =>
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );

      if (filteredExercises.length > 0) {
        // 3. If found, return the filtered exercises
        return filteredExercises;
      }
    }

    // 4. If not found, fetch using the API
    const queryString = buildQueryString({ q: searchTerm });
    const response = await makeRequest<Exercise[]>(`/exercises/search${queryString}`);

    // 5. Reset the EXERCISES_LIBRARY cache by calling getExercises (all of them) - no await
    exerciseApi.getExercises().catch(err =>
      console.warn('Failed to refresh exercises cache:', err)
    );

    // 6. Return the exercises fetched earlier
    return response;
  },

  // Get exercises by tags with caching
  async getExercisesByTags(tags: string[]): Promise<Exercise[]> {
    const cacheKey = CACHE_KEYS.EXERCISES_LIBRARY;

    // 1. Get cache with key EXERCISES_LIBRARY (contains all exercises)
    const cachedExercises = sessionStorageService.getItem<ExerciseResponse>(cacheKey, CACHE_COLLECTION);

    if (cachedExercises) {
      // 2. Filter all exercises from cache to find matches
      const filteredExercises = cachedExercises.data.filter(exercise =>
        tags.every(tag =>
          exercise.tags.some(exerciseTag =>
            exerciseTag.toLowerCase().includes(tag.toLowerCase())
          )
        )
      );

      if (filteredExercises.length > 0) {
        // 3. If found, return the filtered exercises
        return filteredExercises;
      }
    }

    // 4. If not found, fetch using the API
    const queryString = buildQueryString({ tags: tags.join(',') });
    const response = await makeRequest<Exercise[]>(`/exercises${queryString}`);

    // 5. Reset the EXERCISES_LIBRARY cache by calling getExercises (all of them) - no await
    exerciseApi.getExercises().catch(err =>
      console.warn('Failed to refresh exercises cache:', err)
    );

    // 6. Return the exercises fetched earlier
    return response;
  },

  // Get available filters with caching
  async getAvailableFilters(): Promise<{ availableTypes: string[]; availableTags: string[]; totalExercises: number }> {
    const cacheKey = CACHE_KEYS.EXERCISES_LIBRARY;

    // 1. Get cache with key EXERCISES_LIBRARY (contains all exercises)
    const cachedExercises = sessionStorageService.getItem<ExerciseResponse>(cacheKey, CACHE_COLLECTION);

    if (cachedExercises) {
      // 2. Extract filters from cached data
      const filters = cachedExercises.filters;
      if (filters) {
        // 3. If found, return the filters
        return filters;
      }
    }

    // 4. If not found, fetch using the API
    const response = await exerciseApi.getExercises({ limit: 1 });
    const filters = response.filters;

    // 5. Reset the EXERCISES_LIBRARY cache by calling getExercises (all of them) - no await
    exerciseApi.getExercises().catch(err =>
      console.warn('Failed to refresh exercises cache:', err)
    );

    // 6. Return the filters
    return filters;
  },

  // Convenience methods for common queries
  async getStrengthExercises(page: number = 1, limit: number = 20): Promise<ExerciseResponse> {
    return exerciseApi.getExercises({ type: 'strength', page, limit });
  },

  async getCardioExercises(page: number = 1, limit: number = 20): Promise<ExerciseResponse> {
    return exerciseApi.getExercises({ type: 'cardio', page, limit });
  },

  async getExercisesByTag(tag: string, page: number = 1, limit: number = 20): Promise<ExerciseResponse> {
    return exerciseApi.getExercises({ tags: tag, page, limit });
  },

  async getExercisesWithVideo(page: number = 1, limit: number = 20): Promise<ExerciseResponse> {
    return exerciseApi.getExercises({ hasVideo: true, page, limit });
  },

  async getExercisesWithAnimation(page: number = 1, limit: number = 20): Promise<ExerciseResponse> {
    return exerciseApi.getExercises({ hasAnimation: true, page, limit });
  },

  // Advanced search with multiple criteria
  async advancedSearch(criteria: {
    search?: string;
    type?: string;
    tags?: string[];
    hasVideo?: boolean;
    hasAnimation?: boolean;
    minMetrics?: number;
    page?: number;
    limit?: number;
    sort?: 'name' | 'type' | 'created';
    order?: 'asc' | 'desc';
  }): Promise<ExerciseResponse> {
    const params: ExerciseQueryParams = {
      ...criteria,
      tags: criteria.tags?.join(',')
    };
    return exerciseApi.getExercises(params);
  },

  // Cache management
  clearCache: () => {
    sessionStorageService.removeItem(CACHE_KEYS.EXERCISES_LIBRARY, CACHE_COLLECTION);
  },
  clearExerciseCache: () => {
    sessionStorageService.removeItem(CACHE_KEYS.EXERCISES_LIBRARY, CACHE_COLLECTION);
  },
  clearSearchCache: () => {
    sessionStorageService.removeItem(CACHE_KEYS.EXERCISES_LIBRARY, CACHE_COLLECTION);
  },

  // Get multiple exercises by their IDs
  async getExercisesByIds(exerciseIds: string[]): Promise<Exercise[]> {
    const cacheKey = CACHE_KEYS.EXERCISES_LIBRARY;

    // 1. Check if we have exercises in cache
    const cachedData = sessionStorageService.getItem<ExerciseResponse>(cacheKey, CACHE_COLLECTION);
    let foundExercises: Exercise[] = [];
    let missingIds: string[] = [...exerciseIds];

    if (cachedData && cachedData.data) {
      // 2. Filter exercises from cache
      foundExercises = cachedData.data.filter(exercise =>
        exerciseIds.includes(exercise.id)
      );

      // Calculate missing IDs
      const foundIds = foundExercises.map(e => e.id);
      missingIds = exerciseIds.filter(id => !foundIds.includes(id));

      // 3. If we found all exercises, return them
      if (missingIds.length === 0) {
        // Reset cache expiration on access
        sessionStorageService.setItem(cacheKey, cachedData, {
          ttl: CACHE_TTL.EXERCISES_LIBRARY,
          collection: CACHE_COLLECTION
        });
        return foundExercises;
      }
    }

    // 4. If there are missing IDs, fetch them specifically
    if (missingIds.length > 0) {
      try {
        // Use the buildQueryString to properly format the array parameter
        const queryString = buildQueryString({ ids: missingIds });
        // Assuming the backend supports filtering by multiple IDs via /exercises?ids=id1,id2
        // If not, we might need to make parallel requests or update the backend.
        // Based on typical patterns, let's try the query param approach first.
        const response = await makeRequest<ExerciseResponse>(`/exercises${queryString}`);

        if (response && response.data) {
          const newExercises = response.data;
          foundExercises = [...foundExercises, ...newExercises];

          // Update cache with new exercises if possible, or just return them
          // Merging into the paginated cache is tricky, so we might just return the combined list
          // and rely on individual lookups for future cache hits if we implemented a map-based cache.
          // For now, let's just return the combined list.
        }
      } catch (error) {
        console.error('Failed to fetch missing exercises:', error);
      }
    }

    // Sort the result to match the order of input IDs (optional but good for consistency)
    return exerciseIds.map(id => foundExercises.find(e => e.id === id)).filter(Boolean) as Exercise[];
  }
};

