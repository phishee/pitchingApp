import apiClient from '@/lib/axios-config';
import { Workout, WorkoutResponse, WorkoutQueryParams } from '@/models/Workout';
import { useCache } from '@/hooks/useCache';

// Cache configuration
const CACHE_KEYS = {
  WORKOUTS_LIBRARY: 'workouts_library'
} as const;

const CACHE_TTL = {
  WORKOUTS_LIBRARY: 30 * 60 * 1000, // 30 minutes
} as const;

// Helper function to make API requests
const makeRequest = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
  if (options?.method === 'POST') {
    const response = await apiClient.post<T>(endpoint, JSON.parse(options.body as string));
    return response.data;
  } else if (options?.method === 'PUT') {
    const response = await apiClient.put<T>(endpoint, JSON.parse(options.body as string));
    return response.data;
  } else if (options?.method === 'PATCH') {
    const response = await apiClient.patch<T>(endpoint, JSON.parse(options.body as string));
    return response.data;
  } else if (options?.method === 'DELETE') {
    await apiClient.delete(endpoint);
    return {} as T;
  } else {
    const response = await apiClient.get<T>(endpoint);
    return response.data;
  }
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

// Helper function to get cache key
const getCacheKey = (): string => {
  return CACHE_KEYS.WORKOUTS_LIBRARY;
};

// Create cache instance
let cacheInstance: ReturnType<typeof useCache> | null = null;

const getCache = () => {
  if (!cacheInstance) {
    cacheInstance = {
      get: (key: string) => {
        try {
          const cached = sessionStorage.getItem(key);
          if (!cached) return null;
          const { data, expiresAt } = JSON.parse(cached);
          if (expiresAt && Date.now() > expiresAt) {
            sessionStorage.removeItem(key);
            return null;
          }
          return data;
        } catch {
          return null;
        }
      },
      set: (key: string, data: any, options?: { ttl?: number }) => {
        try {
          const cacheItem = {
            data,
            timestamp: Date.now(),
            expiresAt: options?.ttl ? Date.now() + options.ttl : undefined
          };
          sessionStorage.setItem(key, JSON.stringify(cacheItem));
        } catch (error) {
          console.warn('Failed to cache data:', error);
        }
      },
      has: (key: string) => {
        try {
          const cached = sessionStorage.getItem(key);
          if (!cached) return false;
          const { expiresAt } = JSON.parse(cached);
          return expiresAt ? Date.now() < expiresAt : true;
        } catch {
          return false;
        }
      },
      delete: (key: string) => {
        try {
          sessionStorage.removeItem(key);
        } catch (error) {
          console.warn('Failed to delete cache:', error);
        }
      },
      clear: () => {
        try {
          const keys = Object.keys(sessionStorage);
          keys.forEach(key => {
            if (key.includes('workouts') || key.includes('workout_')) {
              sessionStorage.removeItem(key);
            }
          });
        } catch (error) {
          console.warn('Failed to clear cache:', error);
        }
      },
      keys: () => {
        try {
          return Object.keys(sessionStorage).filter(key => 
            key.includes('workouts') || key.includes('workout_')
          );
        } catch {
          return [];
        }
      },
      isExpired: (key: string) => {
        try {
          const cached = sessionStorage.getItem(key);
          if (!cached) return true;
          const { expiresAt } = JSON.parse(cached);
          return expiresAt ? Date.now() > expiresAt : false;
        } catch {
          return true;
        }
      },
      getWithTTL: (key: string) => {
        try {
          const cached = sessionStorage.getItem(key);
          if (!cached) return { data: null, ttl: null };
          const { data, expiresAt } = JSON.parse(cached);
          const ttl = expiresAt ? Math.max(0, expiresAt - Date.now()) : null;
          return { data, ttl };
        } catch {
          return { data: null, ttl: null };
        }
      },
      size: () => {
        try {
          const keys = Object.keys(sessionStorage).filter(key => 
            key.includes('workouts') || key.includes('workout_')
          );
          return keys.length;
        } catch {
          return 0;
        }
      }
    };
  }
  return cacheInstance;
};

// Main workout API object
export const workoutApi = {
  // Get all workouts with caching
  async getWorkouts(params: WorkoutQueryParams = {}, organizationId: string): Promise<WorkoutResponse> {
    const cache = getCache();
    const cacheKey = getCacheKey();
    
    // Check cache first
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey) as WorkoutResponse | null;
      if (cached) {
        // Reset expiration when accessing cache
        cache.set(cacheKey, cached, { ttl: CACHE_TTL.WORKOUTS_LIBRARY });
        return cached;
      }
    }
    
    // Fetch from API
    const queryParams = { ...params, organizationId };
    const queryString = buildQueryString(queryParams);
    const response = await makeRequest<WorkoutResponse>(`/workouts${queryString}`);
    
    // Cache the response with single key
    cache.set(cacheKey, response, { ttl: CACHE_TTL.WORKOUTS_LIBRARY });
    
    return response;
  },

  // Get single workout by ID
  async getWorkoutById(id: string, organizationId: string): Promise<Workout> {
    const cache = getCache();
    const workoutsCacheKey = getCacheKey();
    
    // 1. Get cache with key WORKOUTS_LIBRARY (contains all workouts)
    if (cache.has(workoutsCacheKey)) {
      const cachedWorkouts = cache.get(workoutsCacheKey) as WorkoutResponse | null;
      if (cachedWorkouts) {
        // 2. Filter all workouts from cache to find the specific id
        const workout = cachedWorkouts.data.find(workout => workout.id === id);
        if (workout) {
          // 3. If found, return the workout
          return workout;
        }
      }
    }
    
    // 4. If not found, fetch using the API
    const queryString = buildQueryString({ organizationId });
    const response = await makeRequest<Workout>(`/workouts/${id}${queryString}`);
    
    // 5. Reset the WORKOUTS_LIBRARY cache by calling getWorkouts (all of them) - no await
    workoutApi.getWorkouts({}, organizationId).catch(err => 
      console.warn('Failed to refresh workouts cache:', err)
    );
    
    // 6. Return the workout fetched earlier by the id
    return response;
  },

  // Create a new workout
  async createWorkout(workoutData: Omit<Workout, 'id'>, organizationId: string): Promise<Workout> {
    try {
      const response = await makeRequest<Workout>('/workouts', {
        method: 'POST',
        body: JSON.stringify(workoutData)
      });

      // Clear cache after creating
      const cache = getCache();
      cache.delete(getCacheKey());

      return response;
    } catch (error) {
      console.error('Failed to create workout:', error);
      throw error;
    }
  },

  // Update a workout
  async updateWorkout(id: string, organizationId: string, workoutData: Partial<Workout>): Promise<Workout> {
    try {
      const queryString = buildQueryString({ organizationId });
      const response = await makeRequest<Workout>(`/workouts/${id}${queryString}`, {
        method: 'PUT',
        body: JSON.stringify(workoutData)
      });

      // Clear cache after updating
      const cache = getCache();
      cache.delete(getCacheKey());

      return response;
    } catch (error) {
      console.error('Failed to update workout:', error);
      throw error;
    }
  },

  // Delete a workout
  async deleteWorkout(id: string, organizationId: string): Promise<{ message: string; id: string }> {
    try {
      const queryString = buildQueryString({ organizationId });
      const response = await makeRequest<{ message: string; id: string }>(`/workouts/${id}${queryString}`, {
        method: 'DELETE'
      });

      // Clear cache after deleting
      const cache = getCache();
      cache.delete(getCacheKey());

      return response;
    } catch (error) {
      console.error('Failed to delete workout:', error);
      throw error;
    }
  },

  // Convenience methods for common queries
  async getWorkoutsByOrganization(organizationId: string, page: number = 1, limit: number = 20): Promise<WorkoutResponse> {
    return workoutApi.getWorkouts({ organizationId, page, limit }, organizationId);
  },

  async getWorkoutsByTeam(teamId: string, organizationId: string, page: number = 1, limit: number = 20): Promise<WorkoutResponse> {
    return workoutApi.getWorkouts({ teamId, organizationId, page, limit }, organizationId);
  },

  async getWorkoutsByCreator(createdBy: string, organizationId: string, page: number = 1, limit: number = 20): Promise<WorkoutResponse> {
    return workoutApi.getWorkouts({ createdBy, organizationId, page, limit }, organizationId);
  },

  async searchWorkouts(searchTerm: string, organizationId: string, page: number = 1, limit: number = 20): Promise<WorkoutResponse> {
    return workoutApi.getWorkouts({ search: searchTerm, organizationId, page, limit }, organizationId);
  },

  // Cache management
  clearCache: () => {
    const cache = getCache();
    cache.delete(CACHE_KEYS.WORKOUTS_LIBRARY);
  },
  clearWorkoutCache: () => {
    const cache = getCache();
    cache.delete(CACHE_KEYS.WORKOUTS_LIBRARY);
  }
};