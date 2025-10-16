import { CreateWorkoutAssignmentPayload, UpdateWorkoutAssignmentPayload, WorkoutAssignment } from '@/models/WorkoutAssignment';
import { Event } from '@/models';
import { WorkoutAssignmentService } from '../services/workoutAssignment.service';
import { inject, injectable } from 'inversify';
import { WORKOUT_ASSIGNMENT_TYPES } from '@/app/api/lib/symbols/Symbols';

export interface GetAssignmentsFilters {
  organizationId: string;
  teamId: string;
  athleteId?: string;
}

export interface CreateAssignmentResult {
  assignments: WorkoutAssignment[];
  events: Event[];
  totalCreated: number;
}

@injectable()
export class WorkoutAssignmentController {
  constructor(
    @inject(WORKOUT_ASSIGNMENT_TYPES.WorkoutAssignmentService)
    private readonly workoutAssignmentService: WorkoutAssignmentService
  ) {}

  async createAssignment(payload: CreateWorkoutAssignmentPayload): Promise<CreateAssignmentResult> {
    try {
      // Validate required fields
      if (!payload.organizationId || !payload.teamId || !payload.workoutId || !payload.athleteInfo) {
        throw new Error('Missing required fields: organizationId, teamId, workoutId, and athleteInfo are required');
      }

      if (!payload.recurrence || !payload.startDate) {
        throw new Error('Recurrence configuration and start date are required');
      }

      // Create assignment and generate events
      const result = await this.workoutAssignmentService.createAssignmentWithEvents(payload);
      
      return result;
    } catch (error) {
      console.error('Controller: Failed to create workout assignment:', error);
      throw error;
    }
  }

  async createAssignmentsForMultipleAthletes(
    basePayload: Omit<CreateWorkoutAssignmentPayload, 'athleteInfo'>,
    athletes: Array<{ userId: string; memberId: string; name?: string; email?: string }>
  ): Promise<CreateAssignmentResult> {
    try {
      // Validate required fields
      if (!basePayload.organizationId || !basePayload.teamId || !basePayload.workoutId) {
        throw new Error('Missing required fields: organizationId, teamId, and workoutId are required');
      }

      if (!basePayload.recurrence || !basePayload.startDate) {
        throw new Error('Recurrence configuration and start date are required');
      }

      if (!athletes || athletes.length === 0) {
        throw new Error('At least one athlete must be provided');
      }

      // Create assignments for all athletes
      const result = await this.workoutAssignmentService.createAssignmentsForMultipleAthletes(basePayload, athletes);
      
      return result;
    } catch (error) {
      console.error('Controller: Failed to create workout assignments for multiple athletes:', error);
      throw error;
    }
  }

  async getAssignments(filters: GetAssignmentsFilters): Promise<WorkoutAssignment[]> {
    try {
      const assignments = await this.workoutAssignmentService.getAssignments(filters);
      return assignments;
    } catch (error) {
      console.error('Controller: Failed to get workout assignments:', error);
      throw error;
    }
  }

  async getAssignmentById(id: string): Promise<WorkoutAssignment | null> {
    try {
      if (!id) {
        throw new Error('Assignment ID is required');
      }

      const assignment = await this.workoutAssignmentService.getAssignmentById(id);
      return assignment;
    } catch (error) {
      console.error('Controller: Failed to get workout assignment by ID:', error);
      throw error;
    }
  }

  async updateAssignment(id: string, payload: UpdateWorkoutAssignmentPayload): Promise<WorkoutAssignment> {
    try {
      if (!id) {
        throw new Error('Assignment ID is required');
      }

      const updatedAssignment = await this.workoutAssignmentService.updateAssignment(id, payload);
      return updatedAssignment;
    } catch (error) {
      console.error('Controller: Failed to update workout assignment:', error);
      throw error;
    }
  }

  async deleteAssignment(id: string): Promise<void> {
    try {
      if (!id) {
        throw new Error('Assignment ID is required');
      }

      await this.workoutAssignmentService.deleteAssignment(id);
    } catch (error) {
      console.error('Controller: Failed to delete workout assignment:', error);
      throw error;
    }
  }
}
