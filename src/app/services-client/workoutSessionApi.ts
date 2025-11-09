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
}

export const workoutSessionApi = new WorkoutSessionApi();

