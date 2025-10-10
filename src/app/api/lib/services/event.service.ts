// src/app/api/lib/services/event.service.ts

import { injectable, inject } from 'inversify';
import { DBProviderFactory } from '../factories/DBFactory';
import { DB_TYPES } from '../symbols/Symbols';
import { Event, RecurrenceConfig } from '@/models/Calendar';
import { ClientSession } from 'mongodb';

interface CreateEventRequest {
  events: Partial<Event>[];
}

interface CreateEventResponse {
  success: boolean;
  summary: {
    totalCreated: number;
    athleteGroups: {
      athleteId: string;
      groupId: string;
      eventCount: number;
    }[];
    dateRange: {
      start: Date;
      end: Date;
    };
  };
  message: string;
}

interface EventFilter {
  organizationId: string; // Required
  types?: string[];
  statuses?: string[];
  startDate?: Date;
  endDate?: Date;
  athleteIds?: string[];
  athleteMemberIds?: string[];
  coachIds?: string[];
  coachMemberIds?: string[];
  bookingStatus?: string;
  teamId?: string;
  limit?: number;
  offset?: number;
  sort?: { [key: string]: 1 | -1 };
  includeDetails?: boolean;
}

@injectable()
export class EventService {
  private dbProvider;
  private eventCollection = 'events';

  constructor(@inject(DB_TYPES.DBProviderFactory) private dbFactory: DBProviderFactory) {
    this.dbProvider = this.dbFactory.createDBProvider();
  }

  /**
   * Normalize dates - convert date strings to Date objects
   */
  private normalizeDates(event: Partial<Event>): Partial<Event> {
    const normalized = { ...event };

    // Convert main event dates
    if (normalized.startTime && !(normalized.startTime instanceof Date)) {
      normalized.startTime = new Date(normalized.startTime);
    }
    
    if (normalized.endTime && !(normalized.endTime instanceof Date)) {
      normalized.endTime = new Date(normalized.endTime);
    }

    if (normalized.createdAt && !(normalized.createdAt instanceof Date)) {
      normalized.createdAt = new Date(normalized.createdAt);
    }

    if (normalized.updatedAt && !(normalized.updatedAt instanceof Date)) {
      normalized.updatedAt = new Date(normalized.updatedAt);
    }

    // Convert recurrence dates
    if (normalized.recurrence) {
      if (normalized.recurrence.startDate && !(normalized.recurrence.startDate instanceof Date)) {
        normalized.recurrence.startDate = new Date(normalized.recurrence.startDate);
      }
      
      if (normalized.recurrence.endDate && !(normalized.recurrence.endDate instanceof Date)) {
        normalized.recurrence.endDate = new Date(normalized.recurrence.endDate);
      }

      // Convert exception dates
      if (normalized.recurrence.exceptions && Array.isArray(normalized.recurrence.exceptions)) {
        normalized.recurrence.exceptions = normalized.recurrence.exceptions.map(exception => 
          exception instanceof Date ? exception : new Date(exception)
        );
      }
    }

    // Convert gameday-specific dates (if present)
    if (normalized.details) {
      const details = normalized.details as any;
      
      if (details.type === 'gameday') {
        if (details.arrivalTime && !(details.arrivalTime instanceof Date)) {
          details.arrivalTime = new Date(details.arrivalTime);
        }
        
        if (details.warmupStart && !(details.warmupStart instanceof Date)) {
          details.warmupStart = new Date(details.warmupStart);
        }
      }
    }

    // Convert booking summary dates (if present)
    if (normalized.bookingSummary && normalized.bookingSummary.lastUpdated) {
      if (!(normalized.bookingSummary.lastUpdated instanceof Date)) {
        normalized.bookingSummary.lastUpdated = new Date(normalized.bookingSummary.lastUpdated);
      }
    }

    return normalized;
  }

  /**
   * Main event creation method - handles both simple and recurring events
   */
  async createEvents(request: CreateEventRequest): Promise<CreateEventResponse> {
    const { events } = request;

    if (!events || events.length === 0) {
      throw new Error('No events provided');
    }

    // Validate all events have required organizationId
    events.forEach((event, index) => {
      if (!event.organizationId) {
        throw new Error(`Event at index ${index} missing required organizationId`);
      }
    });

    // Use transaction for atomicity
    return await this.dbProvider.withTransaction(async (session: ClientSession) => {
      const allEventsToCreate: Event[] = [];
      const athleteGroups: { athleteId: string; groupId: string; eventCount: number }[] = [];
      let minDate: Date | null = null;
      let maxDate: Date | null = null;

      // Process each event template
      for (const eventTemplate of events) {
        const athleteId = eventTemplate.participants?.athletes?.[0]?.userId;
        
        if (!athleteId) {
          throw new Error('Each event must have at least one athlete in participants');
        }

        // Convert date strings to Date objects
        const normalizedTemplate = this.normalizeDates(eventTemplate);

        // Check if recurrence is needed
        if (normalizedTemplate.recurrence && normalizedTemplate.recurrence.pattern !== 'none') {
          // Generate groupId for this athlete's recurring series
          const groupId = await this.generateUniqueGroupId(athleteId, session);

          // Generate all recurring instances
          const recurringEvents = this.generateRecurringEvents(
            normalizedTemplate as Event,
            groupId
          );

          allEventsToCreate.push(...recurringEvents);

          athleteGroups.push({
            athleteId,
            groupId,
            eventCount: recurringEvents.length
          });

          // Track date range
          recurringEvents.forEach(event => {
            if (!minDate || event.startTime < minDate) minDate = event.startTime;
            if (!maxDate || event.endTime > maxDate) maxDate = event.endTime;
          });

        } else {
          // Simple single event
          const groupId = await this.generateUniqueGroupId(athleteId, session);
          
          const singleEvent: Event = {
            ...normalizedTemplate,
            id: this.generateEventId(),
            groupId,
            sequenceNumber: 1,
            totalInSequence: 1,
            createdAt: new Date(),
            updatedAt: new Date()
          } as Event;

          allEventsToCreate.push(singleEvent);

          athleteGroups.push({
            athleteId,
            groupId,
            eventCount: 1
          });

          if (!minDate || singleEvent.startTime < minDate) minDate = singleEvent.startTime;
          if (!maxDate || singleEvent.endTime > maxDate) maxDate = singleEvent.endTime;
        }
      }

      // Bulk insert all events
      const result = await this.dbProvider.bulkInsert(
        this.eventCollection,
        allEventsToCreate,
        session
      );

      return {
        success: true,
        summary: {
          totalCreated: result.insertedCount,
          athleteGroups,
          dateRange: {
            start: minDate || new Date(),
            end: maxDate || new Date()
          }
        },
        message: `Successfully created ${result.insertedCount} events for ${athleteGroups.length} athlete(s)`
      };
    });
  }

  /**
   * Generate recurring event instances from template
   */
  private generateRecurringEvents(template: Event, groupId: string): Event[] {
    const events: Event[] = [];
    const recurrence = template.recurrence;

    if (!recurrence || recurrence.pattern === 'none') {
      return [];
    }

    const startDate = recurrence.startDate || template.startTime;
    const endDate = recurrence.endDate;
    const occurrences = recurrence.occurrences;

    let currentDate = new Date(startDate);
    let sequenceNumber = 1;
    const eventDuration = template.endTime.getTime() - template.startTime.getTime();

    // Generate events based on pattern
    while (true) {
      // Check termination conditions
      if (endDate && currentDate > new Date(endDate)) break;
      if (occurrences && sequenceNumber > occurrences) break;

      // Check if this date should generate an event
      if (this.shouldGenerateEvent(currentDate, recurrence)) {
        // Calculate event times for this occurrence
        const eventStartTime = new Date(currentDate);
        eventStartTime.setHours(template.startTime.getHours());
        eventStartTime.setMinutes(template.startTime.getMinutes());
        eventStartTime.setSeconds(template.startTime.getSeconds());

        const eventEndTime = new Date(eventStartTime.getTime() + eventDuration);

        // Check if in exceptions
        if (!this.isException(eventStartTime, recurrence.exceptions)) {
          events.push({
            ...template,
            id: this.generateEventId(),
            groupId,
            startTime: eventStartTime,
            endTime: eventEndTime,
            sequenceNumber,
            totalInSequence: 0, // Will update after we know total
            createdAt: new Date(),
            updatedAt: new Date()
          });

          sequenceNumber++;
        }
      }

      // Move to next date based on pattern
      currentDate = this.getNextDate(currentDate, recurrence);

      // Safety check - prevent infinite loops
      if (sequenceNumber > 1000) {
        throw new Error('Recurrence pattern would generate more than 1000 events');
      }
    }

    // Update totalInSequence for all events
    const totalInSequence = events.length;
    events.forEach(event => {
      event.totalInSequence = totalInSequence;
    });

    return events;
  }

  /**
   * Check if event should be generated on this date
   */
  private shouldGenerateEvent(date: Date, recurrence: RecurrenceConfig): boolean {
    if (recurrence.pattern === 'daily') {
      return true;
    }

    if (recurrence.pattern === 'weekly' && recurrence.daysOfWeek) {
      const dayOfWeek = date.getDay();
      return recurrence.daysOfWeek.includes(dayOfWeek);
    }

    if (recurrence.pattern === 'monthly') {
      if (recurrence.dayOfMonth) {
        return date.getDate() === recurrence.dayOfMonth;
      }
      
      if (recurrence.weekOfMonth) {
        const weekOfMonth = Math.ceil(date.getDate() / 7);
        return recurrence.weekOfMonth.includes(weekOfMonth);
      }
    }

    return false;
  }

  /**
   * Get next date based on recurrence pattern
   */
  private getNextDate(currentDate: Date, recurrence: RecurrenceConfig): Date {
    const next = new Date(currentDate);

    if (recurrence.pattern === 'daily') {
      next.setDate(next.getDate() + (recurrence.interval || 1));
    } else if (recurrence.pattern === 'weekly') {
      next.setDate(next.getDate() + 1); // Move day by day to check daysOfWeek
    } else if (recurrence.pattern === 'monthly') {
      next.setMonth(next.getMonth() + (recurrence.interval || 1));
    }

    return next;
  }

  /**
   * Check if date is in exceptions list
   */
  private isException(date: Date, exceptions?: Date[]): boolean {
    if (!exceptions || exceptions.length === 0) return false;

    const dateStr = date.toISOString().split('T')[0];
    return exceptions.some(exception => {
      const exceptionStr = new Date(exception).toISOString().split('T')[0];
      return dateStr === exceptionStr;
    });
  }

  /**
   * Generate unique groupId for athlete
   */
  private async generateUniqueGroupId(athleteId: string, session?: ClientSession): Promise<string> {
    let groupId: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      groupId = `group_${athleteId}_${timestamp}_${random}`;

      const exists = await this.dbProvider.exists(this.eventCollection, { groupId });
      
      if (!exists) {
        return groupId;
      }

      attempts++;
      if (attempts >= maxAttempts) {
        throw new Error('Failed to generate unique groupId after multiple attempts');
      }
    } while (true);
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * List events with advanced filtering
   */
  async listEventsWithFilters(filter: EventFilter): Promise<any[]> {
    const filters: any[] = [];

    // Required organizationId
    filters.push({
      field: 'organizationId',
      operator: '$eq' as const,
      value: filter.organizationId
    });

    // Optional filters
    if (filter.teamId) {
      filters.push({
        field: 'teamId',
        operator: '$eq' as const,
        value: filter.teamId
      });
    }

    if (filter.types && filter.types.length > 0) {
      filters.push({
        field: 'type',
        operator: '$in' as const,
        value: filter.types
      });
    }

    if (filter.statuses && filter.statuses.length > 0) {
      filters.push({
        field: 'status',
        operator: '$in' as const,
        value: filter.statuses
      });
    }

    // ✅ Date range query - dates are already Date objects from controller
    if (filter.startDate && filter.endDate) {
      console.log('[Service] Date filters received:', {
        startDate: filter.startDate,
        endDate: filter.endDate,
        startDateIsDate: filter.startDate instanceof Date,
        endDateIsDate: filter.endDate instanceof Date
      });

      // Find overlapping events
      filters.push({
        field: 'startTime',
        operator: '$lte' as const,
        value: filter.endDate
      });
      filters.push({
        field: 'endTime',
        operator: '$gte' as const,
        value: filter.startDate
      });
    } else if (filter.startDate) {
      filters.push({
        field: 'endTime',
        operator: '$gte' as const,
        value: filter.startDate
      });
    } else if (filter.endDate) {
      filters.push({
        field: 'startTime',
        operator: '$lte' as const,
        value: filter.endDate
      });
    }

    // Filter by athlete userId
    if (filter.athleteIds && filter.athleteIds.length > 0) {
      filters.push({
        field: 'participants.athletes.userId',
        operator: '$in' as const,
        value: filter.athleteIds
      });
    }

    // Filter by athlete memberId
    if (filter.athleteMemberIds && filter.athleteMemberIds.length > 0) {
      filters.push({
        field: 'participants.athletes.memberId',
        operator: '$in' as const,
        value: filter.athleteMemberIds
      });
    }

    // Filter by coach userId
    if (filter.coachIds && filter.coachIds.length > 0) {
      filters.push({
        field: 'participants.coaches.userId',
        operator: '$in' as const,
        value: filter.coachIds
      });
    }

    // Filter by coach memberId
    if (filter.coachMemberIds && filter.coachMemberIds.length > 0) {
      filters.push({
        field: 'participants.coaches.memberId',
        operator: '$in' as const,
        value: filter.coachMemberIds
      });
    }

    if (filter.bookingStatus) {
      filters.push({
        field: 'bookingSummary.status',
        operator: '$eq' as const,
        value: filter.bookingStatus
      });
    }

    // Build options
    const options: any = {};

    if (filter.sort) {
      options.sort = filter.sort;
    } else {
      options.sort = { startTime: 1 };
    }

    if (filter.limit) {
      options.limit = filter.limit;
    }

    if (filter.offset) {
      options.skip = filter.offset;
    }

    if (filter.includeDetails === false) {
      options.projection = { details: 0 };
    }

    console.log('[Service] Calling findWithFilters with filters:', JSON.stringify(filters, null, 2));

    return await this.dbProvider.findWithFilters(this.eventCollection, filters, options);
  }

  /**
   * Get single event by ID
   */
  async getEventById(id: string): Promise<Event | null> {
    return await this.dbProvider.findById(this.eventCollection, id);
  }

  /**
   * Update single event
   */
  async updateEvent(id: string, data: Partial<Event>): Promise<Event | null> {
    // Normalize dates in update data
    const normalizedData = this.normalizeDates(data);
    return await this.dbProvider.update(this.eventCollection, id, normalizedData);
  }

  /**
   * Delete single event
   */
  async deleteEvent(id: string): Promise<boolean> {
    return await this.dbProvider.delete(this.eventCollection, id);
  }

  /**
   * Bulk update all events in a group
   */
  async bulkUpdateEventGroup(groupId: string, data: Partial<Event>): Promise<number> {
    // Normalize dates in update data
    const normalizedData = this.normalizeDates(data);
    return await this.dbProvider.updateMany(
      this.eventCollection,
      { groupId },
      normalizedData
    );
  }

  /**
   * Bulk delete all events in a group
   */
  async bulkDeleteEventGroup(groupId: string): Promise<number> {
    return await this.dbProvider.deleteMany(
      this.eventCollection,
      { groupId }
    );
  }
}