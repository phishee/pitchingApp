import { CreateWorkoutAssignmentPayload, UpdateWorkoutAssignmentPayload, WorkoutAssignment } from '@/models/WorkoutAssignment';
import { Event } from '@/models';

class WorkoutAssignmentApi {
  private baseUrl = '/api/v1/workout-assignments';

  async create(payload: CreateWorkoutAssignmentPayload): Promise<{ assignment: WorkoutAssignment; events: Event[] }> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create workout assignment');
    }

    return response.json();
  }

  async get(assignmentId: string): Promise<WorkoutAssignment> {
    const response = await fetch(`${this.baseUrl}/${assignmentId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch assignment');
    }
    
    return response.json();
  }

  async update(
    assignmentId: string,
    updates: UpdateWorkoutAssignmentPayload
  ): Promise<{ assignment: WorkoutAssignment; updatedEvents: Event[] }> {
    const response = await fetch(`${this.baseUrl}/${assignmentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      throw new Error('Failed to update assignment');
    }

    return response.json();
  }

  async delete(assignmentId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${assignmentId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to delete assignment');
    }
  }

  async getEvents(assignmentId: string): Promise<Event[]> {
    const response = await fetch(`${this.baseUrl}/${assignmentId}/events`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch assignment events');
    }
    
    return response.json();
  }

  async getByAthlete(
    athleteUserId: string,
    options?: { active?: boolean }
  ): Promise<WorkoutAssignment[]> {
    const params = new URLSearchParams({
      athleteUserId,
      ...(options?.active !== undefined && { active: String(options.active) })
    });

    const response = await fetch(`${this.baseUrl}?${params}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch assignments');
    }
    
    return response.json();
  }
}

export const workoutAssignmentApi = new WorkoutAssignmentApi();


