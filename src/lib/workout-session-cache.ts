import { WorkoutSession } from '@/models/WorkoutSession';
import { WorkoutAssignment } from '@/models/WorkoutAssignment';
import { Workout } from '@/models/Workout';
import { Exercise } from '@/models';
import { Event } from '@/models/Calendar';

const WORKOUT_SESSION_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const CACHE_KEY_PREFIX = 'workout-session-data-';

export interface CachedWorkoutData {
  session?: WorkoutSession;
  assignment?: WorkoutAssignment;
  workout?: Workout;
  exercises?: Exercise[];
  event?: Event;
  timestamp: number;
  isActiveSession?: boolean; // Flag if we're currently in workout-session
}

/**
 * Cache utility for workout session data with smart TTL:
 * - 5-minute TTL when not in active workout session
 * - Persistent (no TTL) when in active workout session
 * - Auto-resets to 5-minute TTL when leaving workout session
 */
export const workoutSessionCache = {
  /**
   * Store workout session data in sessionStorage
   * @param sessionId - The workout session ID
   * @param data - The data to cache (without timestamp and isActiveSession)
   * @param isActiveSession - Whether we're currently in an active workout session
   */
  set(
    sessionId: string,
    data: Omit<CachedWorkoutData, 'timestamp' | 'isActiveSession'>,
    isActiveSession: boolean = false
  ): void {
    if (typeof window === 'undefined') return;

    const cacheKey = `${CACHE_KEY_PREFIX}${sessionId}`;
    const cacheData: CachedWorkoutData = {
      ...data,
      timestamp: Date.now(),
      isActiveSession,
    };

    try {
      sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to cache workout session data:', error);
    }
  },

  /**
   * Get cached workout session data with smart TTL logic
   * @param sessionId - The workout session ID
   * @param isCurrentlyActive - Whether we're currently on workout-session pages
   * @returns Cached data or null if not found/expired
   */
  get(sessionId: string, isCurrentlyActive: boolean = false): CachedWorkoutData | null {
    if (typeof window === 'undefined') return null;

    const cacheKey = `${CACHE_KEY_PREFIX}${sessionId}`;
    const cached = sessionStorage.getItem(cacheKey);

    if (!cached) return null;

    try {
      const data: CachedWorkoutData = JSON.parse(cached);
      const age = Date.now() - data.timestamp;

      // If currently on workout-session page, always return cache (persistent)
      if (isCurrentlyActive) {
        return data;
      }

      // If was active session but we're not anymore, reset timestamp and apply TTL
      if (data.isActiveSession && !isCurrentlyActive) {
        // Reset to current time so 5-min TTL starts now
        data.timestamp = Date.now();
        data.isActiveSession = false;
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify(data));
        } catch (error) {
          console.warn('Failed to update cache timestamp:', error);
        }
        return data;
      }

      // If not active, apply 5-minute TTL
      if (age > WORKOUT_SESSION_CACHE_TTL) {
        sessionStorage.removeItem(cacheKey);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Failed to parse cached workout session data:', error);
      sessionStorage.removeItem(cacheKey);
      return null;
    }
  },

  /**
   * Update specific data in cache while keeping it alive
   * @param sessionId - The workout session ID
   * @param updates - Partial data to update
   */
  update(sessionId: string, updates: Partial<CachedWorkoutData>): void {
    if (typeof window === 'undefined') return;

    const existing = this.get(sessionId, true);
    if (existing) {
      this.set(
        sessionId,
        {
          ...existing,
          ...updates,
        },
        true // Keep as active session
      );
    }
  },

  /**
   * Clear cache for a specific session
   * @param sessionId - The workout session ID
   */
  clear(sessionId: string): void {
    if (typeof window === 'undefined') return;

    const cacheKey = `${CACHE_KEY_PREFIX}${sessionId}`;
    try {
      sessionStorage.removeItem(cacheKey);
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  },

  /**
   * Reset all active session flags (call when leaving workout-session pages)
   */
  resetActiveSessions(): void {
    if (typeof window === 'undefined') return;

    try {
      const keys = Object.keys(sessionStorage);
      keys.forEach((key) => {
        if (key.startsWith(CACHE_KEY_PREFIX)) {
          const cached = sessionStorage.getItem(key);
          if (cached) {
            try {
              const data: CachedWorkoutData = JSON.parse(cached);
              if (data.isActiveSession) {
                // Reset to inactive and update timestamp
                data.isActiveSession = false;
                data.timestamp = Date.now();
                sessionStorage.setItem(key, JSON.stringify(data));
              }
            } catch (error) {
              // Skip invalid cache entries
            }
          }
        }
      });
    } catch (error) {
      console.warn('Failed to reset active sessions:', error);
    }
  },
};





