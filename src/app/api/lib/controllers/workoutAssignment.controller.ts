import { CreateWorkoutAssignmentPayload, UpdateWorkoutAssignmentPayload, WorkoutAssignment } from '@/models/WorkoutAssignment';
import { Event } from '@/models';
import { WorkoutAssignmentService } from '../services/workoutAssignment.service';
import { EventManagementService } from '../services/eventManagement.service';
import { inject, injectable } from 'inversify';
import { WORKOUT_ASSIGNMENT_TYPES, EVENT_MANAGEMENT_TYPES } from '@/app/api/lib/symbols/Symbols';

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
    private readonly workoutAssignmentService: WorkoutAssignmentService,
    @inject(EVENT_MANAGEMENT_TYPES.EventManagementService)
    private readonly eventManagement: EventManagementService
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

  /**
   * Update assignment and its associated events
   */
  async updateAssignmentAndEvents(
    assignmentId: string,
    payload: {
      assignmentUpdates?: UpdateWorkoutAssignmentPayload;
      eventUpdates?: Partial<Event>;
      updateStrategy: 'all' | 'future_only' | 'unmodified_only';
      fromDate?: Date;
    }
  ): Promise<{ assignment: WorkoutAssignment; events: Event[] }> {
    try {
      if (!assignmentId) {
        throw new Error('Assignment ID is required');
      }

      if (!payload.assignmentUpdates && !payload.eventUpdates) {
        throw new Error('Either assignment updates or event updates must be provided');
      }

      const result = await this.workoutAssignmentService.updateAssignmentAndEvents(assignmentId, payload);
      return result;
    } catch (error) {
      console.error('Controller: Failed to update assignment and events:', error);
      throw error;
    }
  }

  /**
   * Update a single event
   */
  async updateSingleEvent(
    eventId: string,
    updates: Partial<Event>
  ): Promise<Event | null> {
    try {
      if (!eventId) {
        throw new Error('Event ID is required');
      }

      const updatedEvent = await this.eventManagement.updateSingleEvent(eventId, updates);
      return updatedEvent;
    } catch (error) {
      console.error('Controller: Failed to update single event:', error);
      throw error;
    }
  }

  /**
   * Get events for an assignment
   */
  async getAssignmentEvents(assignmentId: string): Promise<Event[]> {
    try {
      if (!assignmentId) {
        throw new Error('Assignment ID is required');
      }

      const events = await this.eventManagement.getEventsBySource(assignmentId, 'workout_assignment');
      return events;
    } catch (error) {
      console.error('Controller: Failed to get assignment events:', error);
      throw error;
    }
  }

  /**
   * Get event group information
   */
  async getEventGroupInfo(groupId: string): Promise<{
    groupId: string;
    totalEvents: number;
    modifiedEvents: number;
    unmodifiedEvents: number;
    futureEvents: number;
    pastEvents: number;
  } | null> {
    try {
      if (!groupId) {
        throw new Error('Group ID is required');
      }

      const groupInfo = await this.eventManagement.getEventGroupInfo(groupId);
      return groupInfo;
    } catch (error) {
      console.error('Controller: Failed to get event group info:', error);
      throw error;
    }
  }

  /**
   * Delete future events from a group
   */
  async deleteFutureEvents(
    groupId: string,
    fromDate?: Date
  ): Promise<{ deletedCount: number }> {
    try {
      if (!groupId) {
        throw new Error('Group ID is required');
      }

      const result = await this.eventManagement.deleteFutureEvents(groupId, fromDate);
      return result;
    } catch (error) {
      console.error('Controller: Failed to delete future events:', error);
      throw error;
    }
  }
}
