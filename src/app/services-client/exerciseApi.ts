import { Exercise, ExerciseResponse, ExerciseQueryParams } from '@/models/Exercise';
import { useCache } from '@/hooks/useCache';

// Cache configuration
const CACHE_KEYS = {
  EXERCISES_LIBRARY: 'exercises_library'
} as const;

const CACHE_TTL = {
  EXERCISES_LIBRARY: 30 * 60 * 1000, // 30 minutes
} as const;

// Helper function to make API requests
const makeRequest = async <T>(endpoint: string): Promise<T> => {
  const response = await fetch(`/api/v1${endpoint}`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }
  
  return response.json();
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

// Helper function to get cache key - simplified
const getCacheKey = (): string => {
  return CACHE_KEYS.EXERCISES_LIBRARY;
};

// Create cache instance
let cacheInstance: ReturnType<typeof useCache> | null = null;

const getCache = () => {
  if (!cacheInstance) {
    // This is a workaround since we can't use hooks outside components
    // In a real app, you might want to use a different caching strategy
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
            if (key.includes('exercises_library')) {
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
            key.includes('exercises_library')
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
            key.includes('exercises_library')
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

// Main exercise API object
export const exerciseApi = {
  // Get all exercises with caching
  async getExercises(params: ExerciseQueryParams = {}): Promise<ExerciseResponse> {
    const cache = getCache();
    const cacheKey = getCacheKey();
    
    // Check cache first
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey) as ExerciseResponse | null;
      if (cached) {
        // Reset expiration when accessing cache
        cache.set(cacheKey, cached, { ttl: CACHE_TTL.EXERCISES_LIBRARY });
        return cached;
      }
    }
    
    // Fetch from API
    const queryString = buildQueryString(params);
    const response = await makeRequest<ExerciseResponse>(`/exercises${queryString}`);
    
    // Cache the response with single key
    cache.set(cacheKey, response, { ttl: CACHE_TTL.EXERCISES_LIBRARY });
    
    return response;
  },

  // Get single exercise by ID with caching
  async getExerciseById(id: string): Promise<Exercise> {
    const cache = getCache();
    const exercisesCacheKey = getCacheKey();
    
    // 1. Get cache with key EXERCISES_LIBRARY (contains all exercises)
    if (cache.has(exercisesCacheKey)) {
      const cachedExercises = cache.get(exercisesCacheKey) as ExerciseResponse | null;
      if (cachedExercises) {
        // 2. Filter all exercises from cache to find the specific id
        const exercise = cachedExercises.data.find(ex => ex.id === id);
        if (exercise) {
          // 3. If found, return the exercise
          return exercise;
        }
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
  },

  // Search exercises with caching
  async searchExercises(searchTerm: string): Promise<Exercise[]> {
    const cache = getCache();
    const exercisesCacheKey = getCacheKey();
    
    // 1. Get cache with key EXERCISES_LIBRARY (contains all exercises)
    if (cache.has(exercisesCacheKey)) {
      const cachedExercises = cache.get(exercisesCacheKey) as ExerciseResponse | null;
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
    const cache = getCache();
    const exercisesCacheKey = getCacheKey();
    
    // 1. Get cache with key EXERCISES_LIBRARY (contains all exercises)
    if (cache.has(exercisesCacheKey)) {
      const cachedExercises = cache.get(exercisesCacheKey) as ExerciseResponse | null;
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
    const cache = getCache();
    const exercisesCacheKey = getCacheKey();
    
    // 1. Get cache with key EXERCISES_LIBRARY (contains all exercises)
    if (cache.has(exercisesCacheKey)) {
      const cachedExercises = cache.get(exercisesCacheKey) as ExerciseResponse | null;
      if (cachedExercises) {
        // 2. Extract filters from cached data
        const filters = cachedExercises.filters;
        if (filters) {
          // 3. If found, return the filters
          return filters;
        }
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

  // Cache management - updated to use single key
  clearCache: () => {
    const cache = getCache();
    cache.delete(CACHE_KEYS.EXERCISES_LIBRARY);
  },
  clearExerciseCache: () => {
    const cache = getCache();
    cache.delete(CACHE_KEYS.EXERCISES_LIBRARY);
  },
  clearSearchCache: () => {
    const cache = getCache();
    cache.delete(CACHE_KEYS.EXERCISES_LIBRARY);
  },

  // Get multiple exercises by their IDs
  async getExercisesByIds(exerciseIds: string[]): Promise<Exercise[]> {
    const cache = getCache();
    const cacheKey = getCacheKey();
    
    // 1. Check if we have exercises in cache
    const cachedData = cache.get(cacheKey) as ExerciseResponse | null;
    
    if (cachedData && cachedData.data) {
      // 2. Filter exercises from cache
      const foundExercises = cachedData.data.filter(exercise => 
        exerciseIds.includes(exercise.id)
      );
      
      // 3. If we found all exercises, return them
      if (foundExercises.length === exerciseIds.length) {
        // Reset cache expiration on access
        cache.set(cacheKey, cachedData, { ttl: CACHE_TTL.EXERCISES_LIBRARY });
        return foundExercises;
      }
    }
    
    // 4. If not all found in cache, refresh cache by calling getExercises
    console.log('Some exercises not in cache, refreshing...');
    await this.getExercises({});
    
    // 5. Get the refreshed cache and filter
    const refreshedCache = cache.get(cacheKey) as ExerciseResponse | null;
    if (refreshedCache && refreshedCache.data) {
      return refreshedCache.data.filter(exercise => 
        exerciseIds.includes(exercise.id)
      );
    }
    
    // 6. If still not found, return empty array
    console.warn('Some exercises not found:', exerciseIds);
    return [];
  }
};

