import apiClient from '@/lib/axios-config';
import { WorkoutSession } from '@/models/WorkoutSession';
import { WorkoutAssignment } from '@/models/WorkoutAssignment';
import { Workout } from '@/models/Workout';
import { Exercise } from '@/models';
import { Event } from '@/models/Calendar';
import { sessionStorageService } from '@/services/storage';

const WORKOUT_SESSION_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const CACHE_COLLECTION = 'workout_session';

export interface CachedWorkoutData {
  session?: WorkoutSession;
  assignment?: WorkoutAssignment;
  workout?: Workout;
  exercises?: Exercise[];
  event?: Event;
  timestamp: number;
  isActiveSession?: boolean; // Flag if we're currently in workout-session
}

class WorkoutSessionApi {
  private readonly baseUrl = '/workout-sessions';

  async startSession(calendarEventId: string): Promise<WorkoutSession | null> {
    const response = await apiClient.post<WorkoutSession | null>(
      `${this.baseUrl}/start`,
      { calendarEventId }
    );

    return response.data;
  }

  async getSession(sessionId: string): Promise<WorkoutSession | null> {
    try {
      const response = await apiClient.get<WorkoutSession>(
        `${this.baseUrl}/${sessionId}`
      );
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async getSessionByEventId(eventId: string): Promise<WorkoutSession | null> {
    try {
      const response = await apiClient.get<WorkoutSession>(
        `${this.baseUrl}/by-event/${eventId}`
      );

      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async updateSessionProgress(sessionId: string, progress: Partial<WorkoutSession['progress']>): Promise<WorkoutSession> {
    const response = await apiClient.patch<WorkoutSession>(
      `${this.baseUrl}/${sessionId}/progress`,
      { progress }
    );

    // Update cache if exists
    this.updateCache(sessionId, { session: response.data });

    return response.data;
  }

  async updateSession(sessionId: string, updates: Partial<WorkoutSession>): Promise<WorkoutSession> {
    const response = await apiClient.patch<WorkoutSession>(
      `${this.baseUrl}/${sessionId}`,
      updates
    );

    // Update cache if exists
    this.updateCache(sessionId, { session: response.data });

    return response.data;
  }

  // --- Cache Management Methods ---

  /**
   * Store workout session data in sessionStorage
   */
  setCache(
    sessionId: string,
    data: Omit<CachedWorkoutData, 'timestamp' | 'isActiveSession'>,
    isActiveSession: boolean = false
  ): void {
    const cacheData: CachedWorkoutData = {
      ...data,
      timestamp: Date.now(),
      isActiveSession,
    };
    sessionStorageService.setItem(sessionId, cacheData, { collection: CACHE_COLLECTION });
  }

  /**
   * Get cached workout session data with smart TTL logic
   */
  getCache(sessionId: string, isCurrentlyActive: boolean = false): CachedWorkoutData | null {
    const data = sessionStorageService.getItem<CachedWorkoutData>(sessionId, CACHE_COLLECTION);

    if (!data) return null;

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
      sessionStorageService.setItem(sessionId, data, { collection: CACHE_COLLECTION });
      return data;
    }

    // If not active, apply 5-minute TTL
    if (age > WORKOUT_SESSION_CACHE_TTL) {
      sessionStorageService.removeItem(sessionId, CACHE_COLLECTION);
      return null;
    }

    return data;
  }

  /**
   * Update specific data in cache while keeping it alive
   */
  updateCache(sessionId: string, updates: Partial<CachedWorkoutData>): void {
    const existing = this.getCache(sessionId, true);
    if (existing) {
      this.setCache(
        sessionId,
        {
          ...existing,
          ...updates,
        },
        true // Keep as active session
      );
    }
  }

  /**
   * Clear cache for a specific session
   */
  clearCache(sessionId: string): void {
    sessionStorageService.removeItem(sessionId, CACHE_COLLECTION);
  }

  /**
   * Reset all active session flags (call when leaving workout-session pages)
   */
  resetActiveSessions(): void {
    if (typeof window === 'undefined') return;

    const prefix = 'workout_session:'; // Based on CACHE_COLLECTION
    // We need to iterate keys. Since StorageService doesn't expose raw iteration easily yet,
    // we'll access sessionStorage directly for iteration but use service for get/set to ensure consistency.
    // Ideally StorageService should expose `getKeys(collection)`.

    try {
      const keys = Object.keys(sessionStorage);
      keys.forEach((key) => {
        if (key.startsWith(prefix)) {
          const sessionId = key.substring(prefix.length);
          const data = sessionStorageService.getItem<CachedWorkoutData>(sessionId, CACHE_COLLECTION);

          if (data && data.isActiveSession) {
            data.isActiveSession = false;
            data.timestamp = Date.now();
            sessionStorageService.setItem(sessionId, data, { collection: CACHE_COLLECTION });
          }
        }
      });
    } catch (e) {
      console.warn('Error resetting active sessions', e);
    }
  }
}

export const workoutSessionApi = new WorkoutSessionApi();

