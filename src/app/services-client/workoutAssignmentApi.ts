import apiClient from '@/lib/axios-config';
import { CreateWorkoutAssignmentPayload, UpdateWorkoutAssignmentPayload, WorkoutAssignment } from '@/models/WorkoutAssignment';
import { Event } from '@/models';

class WorkoutAssignmentApi {
  private baseUrl = '/workout-assignments';

  async create(payload: CreateWorkoutAssignmentPayload): Promise<{ assignment: WorkoutAssignment; events: Event[] }> {
    const response = await apiClient.post<{ assignment: WorkoutAssignment; events: Event[] }>(this.baseUrl, payload);
    return response.data;
  }

  async get(assignmentId: string): Promise<WorkoutAssignment> {
    const response = await apiClient.get<WorkoutAssignment>(`${this.baseUrl}/${assignmentId}`);
    return response.data;
  }

  async update(
    assignmentId: string,
    updates: UpdateWorkoutAssignmentPayload
  ): Promise<{ assignment: WorkoutAssignment; updatedEvents: Event[] }> {
    const response = await apiClient.patch<{ assignment: WorkoutAssignment; updatedEvents: Event[] }>(`${this.baseUrl}/${assignmentId}`, updates);
    return response.data;
  }

  async delete(assignmentId: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${assignmentId}`);
  }

  async getEvents(assignmentId: string): Promise<Event[]> {
    const response = await apiClient.get<Event[]>(`${this.baseUrl}/${assignmentId}/events`);
    return response.data;
  }

  async getByAthlete(
    athleteUserId: string,
    options?: { active?: boolean }
  ): Promise<WorkoutAssignment[]> {
    const params = new URLSearchParams({
      athleteUserId,
      ...(options?.active !== undefined && { active: String(options.active) })
    });

    const response = await apiClient.get<WorkoutAssignment[]>(`${this.baseUrl}?${params}`);
    return response.data;
  }
}

export const workoutAssignmentApi = new WorkoutAssignmentApi();


