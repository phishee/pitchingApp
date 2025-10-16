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


