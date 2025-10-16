import { CreateWorkoutAssignmentPayload, UpdateWorkoutAssignmentPayload, WorkoutAssignment } from '@/models/WorkoutAssignment';
import { Event, RecurrenceConfig } from '@/models';
import { MongoDBProvider } from '@/app/api/lib/providers/mongoDb.provider';
import { EventGeneratorService } from './eventGenerator.service';
import { EventManagementService } from './eventManagement.service';
import { inject, injectable } from 'inversify';
import { ObjectId } from 'mongodb';
import { DB_TYPES, EVENT_MANAGEMENT_TYPES } from '../symbols/Symbols';

export interface CreateAssignmentResult {
  assignments: WorkoutAssignment[];
  events: Event[];
  totalCreated: number;
}

export interface GetAssignmentsFilters {
  organizationId: string;
  teamId: string;
  athleteId?: string;
  workoutId?: string;
  active?: boolean;
}

@injectable()
export class WorkoutAssignmentService {
  private readonly collectionName = 'workout_assignments';

  constructor(
    @inject(DB_TYPES.MongoDBProvider)
    private readonly mongoProvider: MongoDBProvider,
    @inject(EVENT_MANAGEMENT_TYPES.EventGeneratorService)
    private readonly eventGenerator: EventGeneratorService,
    @inject(EVENT_MANAGEMENT_TYPES.EventManagementService)
    private readonly eventManagement: EventManagementService
  ) {}

  async createAssignmentWithEvents(payload: CreateWorkoutAssignmentPayload): Promise<CreateAssignmentResult> {
    try {
      return await this.mongoProvider.withTransaction(async (session) => {
        // Generate unique assignment group ID for tracking
        const assignmentGroupId = this.eventGenerator.generateGroupId();
        
        // Create assignment for the single athlete (as per current interface)
        const assignment = await this.mongoProvider.create(this.collectionName, {
          ...payload,
          active: true,
          totalEventsGenerated: 0,
          lastEventDate: undefined
        });

        // Generate events using the new EventGeneratorService
        const events = await this.eventGenerator.generateWorkoutEvents(assignment, {
          groupId: assignmentGroupId,
          sourceId: assignment._id.toString(),
          sourceType: 'workout_assignment',
          createdBy: payload.coachInfo,
          organizationId: payload.organizationId,
          teamId: payload.teamId,
          workoutData: payload.workoutData
        });

        // Update assignment with event generation stats
        const updatedAssignment = await this.mongoProvider.update(this.collectionName, assignment._id.toString(), {
          totalEventsGenerated: events.length,
          lastEventDate: events.length > 0 ? events[events.length - 1].startTime : undefined
        });

        return {
          assignments: [updatedAssignment],
          events,
          totalCreated: events.length
        };
      });
    } catch (error) {
      console.error('Service: Failed to create assignment with events:', error);
      throw error;
    }
  }

  async createAssignmentsForMultipleAthletes(
    basePayload: Omit<CreateWorkoutAssignmentPayload, 'athleteInfo'>,
    athletes: Array<{ userId: string; memberId: string; name?: string; email?: string }>
  ): Promise<CreateAssignmentResult> {
    try {
      return await this.mongoProvider.withTransaction(async (session) => {
        const assignments: WorkoutAssignment[] = [];
        const allEvents: Event[] = [];

        // Create separate assignment for each athlete
        for (const athlete of athletes) {
          // Generate unique group ID for each athlete's assignment and events
          const athleteGroupId = this.eventGenerator.generateGroupId();
          
          const assignmentPayload: CreateWorkoutAssignmentPayload = {
            ...basePayload,
            athleteInfo: athlete
          };

          // Create assignment for this athlete
          const assignment = await this.mongoProvider.create(this.collectionName, {
            ...assignmentPayload,
            active: true,
            totalEventsGenerated: 0,
            lastEventDate: undefined
          });

          // Generate events for this assignment using the new EventGeneratorService
          const events = await this.eventGenerator.generateWorkoutEvents(assignment, {
            groupId: athleteGroupId, // Each athlete gets their own groupId
            sourceId: assignment._id.toString(),
            sourceType: 'workout_assignment',
            createdBy: basePayload.coachInfo,
            organizationId: basePayload.organizationId,
            teamId: basePayload.teamId,
            workoutData: basePayload.workoutData
          });

          // Update assignment with event generation stats
          const updatedAssignment = await this.mongoProvider.update(this.collectionName, assignment._id.toString(), {
            totalEventsGenerated: events.length,
            lastEventDate: events.length > 0 ? events[events.length - 1].startTime : undefined
          });

          assignments.push(updatedAssignment);
          allEvents.push(...events);
        }

        return {
          assignments,
          events: allEvents,
          totalCreated: allEvents.length
        };
      });
    } catch (error) {
      console.error('Service: Failed to create assignments for multiple athletes:', error);
      throw error;
    }
  }

  async getAssignments(filters: GetAssignmentsFilters): Promise<WorkoutAssignment[]> {
    try {
      const mongoFilters: any = {
        organizationId: filters.organizationId,
        teamId: filters.teamId
      };

      if (filters.athleteId) {
        mongoFilters['athleteInfo.userId'] = filters.athleteId;
      }

      if (filters.workoutId) {
        mongoFilters.workoutId = filters.workoutId;
      }

      if (filters.active !== undefined) {
        mongoFilters.active = filters.active;
      }

      const results = await this.mongoProvider.findQuery(this.collectionName, mongoFilters);
      return results as WorkoutAssignment[];
    } catch (error) {
      console.error('Service: Failed to get assignments:', error);
      throw error;
    }
  }

  async getAssignmentById(id: string): Promise<WorkoutAssignment | null> {
    try {
      const assignment = await this.mongoProvider.findById(this.collectionName, id);
      return assignment as WorkoutAssignment | null;
    } catch (error) {
      console.error('Service: Failed to get assignment by ID:', error);
      throw error;
    }
  }

  async updateAssignment(id: string, payload: UpdateWorkoutAssignmentPayload): Promise<WorkoutAssignment> {
    try {
      const updatedAssignment = await this.mongoProvider.update(this.collectionName, id, {
        ...payload,
        updatedAt: new Date()
      });
      return updatedAssignment as WorkoutAssignment;
    } catch (error) {
      console.error('Service: Failed to update assignment:', error);
      throw error;
    }
  }

  async deleteAssignment(id: string): Promise<void> {
    try {
      await this.mongoProvider.withTransaction(async (session) => {
        // First, delete associated events using the new EventManagementService
        const events = await this.eventManagement.getEventsBySource(id, 'workout_assignment');
        if (events.length > 0) {
          const groupIds = [...new Set(events.map(e => e.groupId))];
          for (const groupId of groupIds) {
            await this.eventManagement.deleteEventGroup(groupId);
          }
        }
        
        // Then delete the assignment
        await this.mongoProvider.delete(this.collectionName, id);
      });
    } catch (error) {
      console.error('Service: Failed to delete assignment:', error);
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
      return await this.mongoProvider.withTransaction(async (session) => {
        // Update the assignment if provided
        let updatedAssignment: WorkoutAssignment | null = null;
        if (payload.assignmentUpdates) {
          updatedAssignment = await this.updateAssignment(assignmentId, payload.assignmentUpdates);
        } else {
          updatedAssignment = await this.getAssignmentById(assignmentId);
        }

        if (!updatedAssignment) {
          throw new Error('Assignment not found');
        }

        // Update associated events if provided
        let updatedEvents: Event[] = [];
        if (payload.eventUpdates) {
          // Get events for this assignment
          const events = await this.eventManagement.getEventsBySource(assignmentId, 'workout_assignment');
          
          if (events.length > 0) {
            // Update events based on strategy
            const groupIds = [...new Set(events.map(e => e.groupId))];
            
            for (const groupId of groupIds) {
              const result = await this.eventManagement.updateEventGroup(
                groupId,
                payload.eventUpdates,
                {
                  skipModified: payload.updateStrategy === 'unmodified_only',
                  updateStrategy: payload.updateStrategy,
                  fromDate: payload.fromDate
                }
              );
              updatedEvents.push(...result.events);
            }
          }
        }

        return {
          assignment: updatedAssignment,
          events: updatedEvents
        };
      });
    } catch (error) {
      console.error('Service: Failed to update assignment and events:', error);
      throw error;
    }
  }
}
