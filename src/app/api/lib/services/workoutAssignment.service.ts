import { CreateWorkoutAssignmentPayload, UpdateWorkoutAssignmentPayload, WorkoutAssignment } from '@/models/WorkoutAssignment';
import { Event, RecurrenceConfig } from '@/models';
import { MongoDBProvider } from '@/app/api/lib/providers/mongoDb.provider';
import { inject, injectable } from 'inversify';
import { ObjectId } from 'mongodb';
import { DB_TYPES } from '../symbols/Symbols';

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
    @inject(DB_TYPES.MongoDBProvider)  // Use the symbol instead of string
    private readonly mongoProvider: MongoDBProvider
  ) {}

  async createAssignmentWithEvents(payload: CreateWorkoutAssignmentPayload): Promise<CreateAssignmentResult> {
    try {
      // Generate unique assignment group ID for tracking
      const assignmentGroupId = new ObjectId().toString();
      
      // Create assignment for the single athlete (as per current interface)
      const assignment = await this.mongoProvider.create(this.collectionName, {
        ...payload,
        active: true,
        totalEventsGenerated: 0,
        lastEventDate: undefined
      });

      // Generate events based on recurrence pattern
      const events = await this.generateEventsFromAssignment(assignment, assignmentGroupId);

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
      const assignmentGroupId = new ObjectId().toString();
      const assignments: WorkoutAssignment[] = [];
      const allEvents: Event[] = [];

      // Create separate assignment for each athlete
      for (const athlete of athletes) {
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

        // Generate events for this assignment
        const events = await this.generateEventsFromAssignment(assignment, assignmentGroupId);

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
      // First, delete associated events
      await this.mongoProvider.deleteMany('events', { 'detailsId': id });
      
      // Then delete the assignment
      await this.mongoProvider.delete(this.collectionName, id);
    } catch (error) {
      console.error('Service: Failed to delete assignment:', error);
      throw error;
    }
  }

  private async generateEventsFromAssignment(assignment: WorkoutAssignment, groupId: string): Promise<Event[]> {
    try {
      const events: Event[] = [];
      const { recurrence, startDate, endDate, defaultTimeSlot } = assignment;
      
      if (recurrence.pattern === 'none') {
        // Single event
        const event = this.createEventFromAssignment(assignment, startDate, groupId, 1, 1);
        events.push(event);
      } else if (recurrence.pattern === 'weekly') {
        // Weekly recurrence
        const weeklyEvents = this.generateWeeklyEvents(assignment, groupId);
        events.push(...weeklyEvents);
      } else {
        // Other patterns (daily, monthly, etc.)
        const recurringEvents = this.generateRecurringEvents(assignment, groupId);
        events.push(...recurringEvents);
      }

      // Save all events to database
      if (events.length > 0) {
        await this.mongoProvider.bulkInsert('events', events);
      }

      return events;
    } catch (error) {
      console.error('Service: Failed to generate events from assignment:', error);
      throw error;
    }
  }

  private createEventFromAssignment(
    assignment: WorkoutAssignment, 
    eventDate: Date, 
    groupId: string, 
    sequenceNumber: number, 
    totalInSequence: number
  ): Event {
    const startTime = new Date(eventDate);
    startTime.setHours(
      parseInt(assignment.defaultTimeSlot.start.split(':')[0]),
      parseInt(assignment.defaultTimeSlot.start.split(':')[1])
    );

    const endTime = new Date(eventDate);
    endTime.setHours(
      parseInt(assignment.defaultTimeSlot.end.split(':')[0]),
      parseInt(assignment.defaultTimeSlot.end.split(':')[1])
    );

    return {
      id: new ObjectId().toString(),
      groupId,
      type: 'workout',
      organizationId: assignment.organizationId,
      teamId: assignment.teamId,
      title: `Workout Assignment`,
      description: `Assigned workout for ${assignment.athleteInfo.userId}`,
      startTime,
      endTime,
      participants: {
        athletes: [assignment.athleteInfo],
        coaches: assignment.scheduledCoach ? [assignment.scheduledCoach] : [],
        required: [assignment.athleteInfo.userId],
        optional: []
      },
      recurrence: assignment.recurrence,
      detailsId: assignment._id.toString(),
      sequenceNumber,
      totalInSequence,
      status: 'scheduled',
      visibility: 'team_only',
      createdBy: assignment.coachInfo,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private generateWeeklyEvents(assignment: WorkoutAssignment, groupId: string): Event[] {
    const events: Event[] = [];
    const { recurrence, startDate, endDate } = assignment;
    const daysOfWeek = recurrence.daysOfWeek || [];
    const occurrences = recurrence.occurrences || 12;

    if (daysOfWeek.length === 0) {
      return events;
    }

    let currentDate = new Date(startDate);
    let eventCount = 0;

    // Find the first occurrence of the first selected day
    while (currentDate.getDay() !== daysOfWeek[0] && eventCount < 365) {
      currentDate.setDate(currentDate.getDate() + 1);
      eventCount++;
    }

    const totalEvents = daysOfWeek.length * occurrences;
    let sequenceNumber = 1;

    for (let week = 0; week < occurrences; week++) {
      for (const dayOfWeek of daysOfWeek) {
        if (sequenceNumber > totalEvents) break;

        // Set to the correct day of the week
        const eventDate = new Date(currentDate);
        const daysToAdd = (dayOfWeek - currentDate.getDay() + 7) % 7;
        eventDate.setDate(currentDate.getDate() + daysToAdd);

        // Check if we've exceeded the end date
        if (endDate && eventDate > endDate) {
          break;
        }

        const event = this.createEventFromAssignment(assignment, eventDate, groupId, sequenceNumber, totalEvents);
        events.push(event);
        sequenceNumber++;
      }

      // Move to next week
      currentDate.setDate(currentDate.getDate() + 7);
    }

    return events;
  }

  private generateRecurringEvents(assignment: WorkoutAssignment, groupId: string): Event[] {
    const events: Event[] = [];
    const { recurrence, startDate, endDate } = assignment;
    const interval = recurrence.interval || 1;
    const occurrences = recurrence.occurrences || 12;

    let currentDate = new Date(startDate);
    let sequenceNumber = 1;

    for (let i = 0; i < occurrences; i++) {
      // Check if we've exceeded the end date
      if (endDate && currentDate > endDate) {
        break;
      }

      const event = this.createEventFromAssignment(assignment, currentDate, groupId, sequenceNumber, occurrences);
      events.push(event);

      // Move to next occurrence based on pattern
      if (recurrence.pattern === 'daily') {
        currentDate.setDate(currentDate.getDate() + interval);
      } else if (recurrence.pattern === 'monthly') {
        currentDate.setMonth(currentDate.getMonth() + interval);
      }

      sequenceNumber++;
    }

    return events;
  }
}
