import { Event, RecurrenceConfig, EventType } from '@/models/Calendar';
import { WorkoutAssignment } from '@/models/WorkoutAssignment';
import { UserInfo } from '@/models/User';
import { RecurrenceCalculatorService } from './recurrenceCalculator.service';
import { MongoDBProvider } from '../providers/mongoDb.provider';
import { inject, injectable } from 'inversify';
import { ObjectId } from 'mongodb';
import { DB_TYPES } from '../symbols/Symbols';

export interface EventGenerationOptions {
  groupId: string;
  sourceId: string;
  sourceType: 'workout_assignment' | 'game_schedule' | 'assessment' | 'coaching_session';
  createdBy: UserInfo;
  organizationId: string;
  teamId: string;
  workoutData?: {
    name: string;
    description: string;
    coverImage: string;
    sessionType?: string;
  };
}

export interface WorkoutEventDetails {
  title: string;
  description: string;
  location?: string;
  coverPhotoUrl?: string;
  prescriptions?: Record<string, any>;
  notes?: string;
}

@injectable()
export class EventGeneratorService {
  constructor(
    @inject(DB_TYPES.MongoDBProvider)
    private readonly mongoProvider: MongoDBProvider,
    @inject('RecurrenceCalculatorService')
    private readonly recurrenceCalculator: RecurrenceCalculatorService
  ) { }

  /**
   * Generate events from a workout assignment
   */
  async generateWorkoutEvents(
    assignment: WorkoutAssignment,
    options: EventGenerationOptions
  ): Promise<Event[]> {
    try {
      const { recurrence, startDate, endDate, defaultTimeSlot } = assignment;

      // Calculate all event dates
      const eventDates = this.calculateEventDates(recurrence, {
        startDate,
        endDate,
        maxOccurrences: 100
      });

      // Generate events for each date
      const events: Event[] = [];
      const totalEvents = eventDates.length;

      for (let i = 0; i < eventDates.length; i++) {
        const eventDate = eventDates[i];
        const event = this.createWorkoutEvent(
          assignment,
          eventDate,
          options,
          i + 1,
          totalEvents,
          defaultTimeSlot
        );
        events.push(event);
      }

      if (events.length === 0) {
        return [];
      }

      const result = await this.mongoProvider.bulkInsert('events', events);
      if (!result.insertedIds.length) {
        return [];
      }

      const objectIds = result.insertedIds.map(id => new ObjectId(id));
      const savedEvents = await this.mongoProvider.findQuery('events', {
        _id: { $in: objectIds }
      });

      return savedEvents.map(event => this.normalizeEvent(event));
    } catch (error) {
      console.error('EventGeneratorService: Failed to generate workout events:', error);
      throw error;
    }
  }

  /**
   * Generate events from a template with custom details
   */
  async generateEventsFromTemplate(
    template: {
      title: string;
      description: string;
      recurrence: RecurrenceConfig;
      startDate: Date;
      endDate?: Date;
      defaultTimeSlot: { start: string; end: string };
      participants: {
        athletes: UserInfo[];
        coaches: UserInfo[];
        required: string[];
        optional: string[];
      };
      location?: string;
      coverPhotoUrl?: string;
    },
    options: EventGenerationOptions
  ): Promise<Event[]> {
    try {
      const { recurrence, startDate, endDate, defaultTimeSlot } = template;

      // Calculate all event dates
      const eventDates = this.calculateEventDates(recurrence, {
        startDate,
        endDate,
        maxOccurrences: 100
      });

      // Generate events for each date
      const events: Event[] = [];
      const totalEvents = eventDates.length;

      for (let i = 0; i < eventDates.length; i++) {
        const eventDate = eventDates[i];
        const event = this.createEventFromTemplate(
          template,
          eventDate,
          options,
          i + 1,
          totalEvents,
          defaultTimeSlot
        );
        events.push(event);
      }

      if (events.length === 0) {
        return [];
      }

      const result = await this.mongoProvider.bulkInsert('events', events);
      if (!result.insertedIds.length) {
        return [];
      }

      const objectIds = result.insertedIds.map(id => new ObjectId(id));
      const savedEvents = await this.mongoProvider.findQuery('events', {
        _id: { $in: objectIds }
      });

      return savedEvents.map(event => this.normalizeEvent(event));
    } catch (error) {
      console.error('EventGeneratorService: Failed to generate events from template:', error);
      throw error;
    }
  }

  /**
   * Calculate event dates based on recurrence configuration
   */
  private calculateEventDates(
    recurrence: RecurrenceConfig,
    options: {
      startDate: Date;
      endDate?: Date;
      maxOccurrences?: number;
    }
  ): Date[] {
    if (recurrence.pattern === 'weekly') {
      return this.recurrenceCalculator.calculateWeeklyDates(recurrence, options);
    } else {
      return this.recurrenceCalculator.calculateDates(recurrence, options);
    }
  }

  /**
   * Create a workout event from assignment
   */
  private createWorkoutEvent(
    assignment: WorkoutAssignment,
    eventDate: Date,
    options: EventGenerationOptions,
    sequenceNumber: number,
    totalInSequence: number,
    defaultTimeSlot: { start: string; end: string }
  ): Event {
    const startTime = this.createDateTime(eventDate, defaultTimeSlot.start);
    const endTime = this.createDateTime(eventDate, defaultTimeSlot.end);

    // Use workout data if available, otherwise fall back to defaults
    const workoutData = options.workoutData;
    const title = workoutData?.name || `Workout Assignment`;
    const description = workoutData?.description || `Assigned workout for ${assignment.athleteInfo.userId}`;
    const coverPhotoUrl = workoutData?.coverImage;

    // Determine event type based on workout session type
    let eventType: EventType = 'workout';
    if (workoutData?.sessionType === 'bullpen') {
      eventType = 'bullpen';
    } else if (workoutData?.sessionType === 'drill') {
      eventType = 'drill';
    }

    return {
      groupId: options.groupId,
      type: eventType,
      organizationId: options.organizationId,
      teamId: options.teamId,
      title,
      description,
      startTime,
      endTime,
      coverPhotoUrl,
      participants: {
        athletes: [assignment.athleteInfo],
        coaches: assignment.scheduledCoach ? [assignment.scheduledCoach] : [],
        required: [assignment.athleteInfo.userId],
        optional: []
      },
      sourceId: options.sourceId,
      sourceType: options.sourceType,
      sequenceNumber,
      totalInSequence,
      isModified: false,
      status: 'scheduled',
      visibility: 'team_only',
      createdBy: options.createdBy,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Create an event from a template
   */
  private createEventFromTemplate(
    template: {
      title: string;
      description: string;
      participants: {
        athletes: UserInfo[];
        coaches: UserInfo[];
        required: string[];
        optional: string[];
      };
      location?: string;
      coverPhotoUrl?: string;
    },
    eventDate: Date,
    options: EventGenerationOptions,
    sequenceNumber: number,
    totalInSequence: number,
    defaultTimeSlot: { start: string; end: string }
  ): Event {
    const startTime = this.createDateTime(eventDate, defaultTimeSlot.start);
    const endTime = this.createDateTime(eventDate, defaultTimeSlot.end);

    return {
      groupId: options.groupId,
      type: 'workout',
      organizationId: options.organizationId,
      teamId: options.teamId,
      title: template.title,
      description: template.description,
      startTime,
      endTime,
      location: template.location,
      coverPhotoUrl: template.coverPhotoUrl,
      participants: template.participants,
      sourceId: options.sourceId,
      sourceType: options.sourceType,
      sequenceNumber,
      totalInSequence,
      isModified: false,
      status: 'scheduled',
      visibility: 'team_only',
      createdBy: options.createdBy,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Create a date-time from a date and time string
   */
  private createDateTime(date: Date, timeString: string): Date {
    const [hours, minutes] = timeString.split(':').map(Number);
    const dateTime = new Date(date);
    dateTime.setHours(hours, minutes, 0, 0);
    return dateTime;
  }

  /**
   * Generate a unique group ID for related events
   */
  generateGroupId(): string {
    return new ObjectId().toString();
  }

  private normalizeEvent(event: any): Event {
    if (!event) {
      return event;
    }

    const document = event?.value ?? event;
    if (!document) {
      return document;
    }

    const { _id, ...rest } = document;

    return {
      ...rest,
      _id: typeof _id === 'string' ? _id : _id?.toString?.()
    } as Event;
  }

  /**
   * Calculate event duration in minutes
   */
  calculateEventDuration(startTime: string, endTime: string): number {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);

    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;

    return endTotalMinutes - startTotalMinutes;
  }

  /**
   * Validate event generation parameters
   */
  validateEventGeneration(
    assignment: WorkoutAssignment,
    options: EventGenerationOptions
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!assignment) {
      errors.push('Assignment is required');
    }

    if (!options.groupId) {
      errors.push('Group ID is required');
    }

    if (!options.sourceId) {
      errors.push('Source ID is required');
    }

    if (!options.sourceType) {
      errors.push('Source type is required');
    }

    if (!options.createdBy) {
      errors.push('Created by user is required');
    }

    if (!options.organizationId) {
      errors.push('Organization ID is required');
    }

    if (!options.teamId) {
      errors.push('Team ID is required');
    }

    if (assignment && !assignment.recurrence) {
      errors.push('Assignment recurrence configuration is required');
    }

    if (assignment && !assignment.startDate) {
      errors.push('Assignment start date is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
