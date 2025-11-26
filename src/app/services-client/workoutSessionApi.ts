import apiClient from '@/lib/axios-config';
import { WorkoutSession } from '@/models/WorkoutSession';

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

    return response.data;
  }

  async updateSession(sessionId: string, updates: Partial<WorkoutSession>): Promise<WorkoutSession> {
    const response = await apiClient.patch<WorkoutSession>(
      `${this.baseUrl}/${sessionId}`,
      updates
    );
    return response.data;
  }
}

export const workoutSessionApi = new WorkoutSessionApi();

