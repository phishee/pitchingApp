import { CreateWorkoutAssignmentPayload, WorkoutAssignment } from '@/models/WorkoutAssignment';
import { Event } from '@/models';
import { workoutAssignmentApi } from './workoutAssignmentApi';

class WorkoutAssignmentService {
  /**
   * Creates a workout assignment and generates calendar events
   * Backend handles recurrence expansion
   */
  async createAssignment(
    payload: CreateWorkoutAssignmentPayload
  ): Promise<{ assignment: WorkoutAssignment; events: Event[] }> {
    // Single API call - backend creates both assignment and events
    return await workoutAssignmentApi.create(payload);
  }

  /**
   * Creates workout assignments for multiple athletes
   * Each athlete gets their own assignment and events
   */
  async createAssignmentsForMultipleAthletes(
    basePayload: Omit<CreateWorkoutAssignmentPayload, 'athleteInfo'>,
    athletes: Array<{ userId: string; memberId: string; name?: string; email?: string }>
  ): Promise<{ assignments: WorkoutAssignment[]; events: Event[]; totalCreated: number }> {
    // Single API call - backend creates assignments and events for all athletes
    const payload = { ...basePayload, athletes } as any;
    const response = await workoutAssignmentApi.create(payload);
    
    // The API returns different formats for single vs multiple athletes
    // For multiple athletes, it returns { assignments, events, totalCreated }
    if ('assignments' in response) {
      return response as unknown as { assignments: WorkoutAssignment[]; events: Event[]; totalCreated: number };
    } else {
      // Fallback: if somehow single athlete format is returned, convert it
      return {
        assignments: [response.assignment],
        events: response.events,
        totalCreated: response.events.length
      };
    }
  }

  /**
   * Updates an assignment and optionally updates future events
   */
  async updateAssignment(
    assignmentId: string,
    updates: any
  ) {
    return await workoutAssignmentApi.update(assignmentId, updates);
  }

  /**
   * Pauses an assignment
   */
  async pauseAssignment(assignmentId: string): Promise<WorkoutAssignment> {
    const result = await workoutAssignmentApi.update(assignmentId, { active: false });
    return result.assignment;
  }

  /**
   * Resumes an assignment
   */
  async resumeAssignment(assignmentId: string): Promise<WorkoutAssignment> {
    const result = await workoutAssignmentApi.update(assignmentId, { active: true });
    return result.assignment;
  }

  /**
   * Deletes assignment and all future events
   */
  async deleteAssignment(assignmentId: string): Promise<void> {
    await workoutAssignmentApi.delete(assignmentId);
  }
}

export const workoutAssignmentService = new WorkoutAssignmentService();


