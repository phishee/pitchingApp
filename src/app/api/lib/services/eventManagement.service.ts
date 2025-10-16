import { Event, EventStatus, EventVisibility } from '@/models/Calendar';
import { MongoDBProvider } from '../providers/mongoDb.provider';
import { inject, injectable } from 'inversify';
import { ObjectId } from 'mongodb';
import { DB_TYPES } from '../symbols/Symbols';

export interface EventUpdateOptions {
  skipModified?: boolean;
  updateStrategy?: 'all' | 'future_only' | 'unmodified_only';
  fromDate?: Date;
}

export interface BulkEventUpdatePayload {
  title?: string;
  description?: string;
  startTime?: Date;
  endTime?: Date;
  location?: string;
  coverPhotoUrl?: string;
  status?: EventStatus;
  visibility?: EventVisibility;
  notes?: string;
}

export interface EventGroupInfo {
  groupId: string;
  totalEvents: number;
  modifiedEvents: number;
  unmodifiedEvents: number;
  futureEvents: number;
  pastEvents: number;
}

@injectable()
export class EventManagementService {
  private readonly collectionName = 'events';

  constructor(
    @inject(DB_TYPES.MongoDBProvider)
    private readonly mongoProvider: MongoDBProvider
  ) {}

  /**
   * Update a single event by ID
   */
  async updateSingleEvent(
    eventId: string,
    updates: Partial<Event>
  ): Promise<Event | null> {
    try {
      if (!ObjectId.isValid(eventId)) {
        throw new Error('Invalid event ID');
      }

      const updateData = {
        ...updates,
        isModified: true,
        updatedAt: new Date()
      };

      const updatedEvent = await this.mongoProvider.update(
        this.collectionName,
        eventId,
        updateData
      );

      return updatedEvent as Event | null;
    } catch (error) {
      console.error('EventManagementService: Failed to update single event:', error);
      throw error;
    }
  }

  /**
   * Update all events in a group
   */
  async updateEventGroup(
    groupId: string,
    updates: BulkEventUpdatePayload,
    options: EventUpdateOptions = {}
  ): Promise<{ updatedCount: number; events: Event[] }> {
    try {
      const { skipModified = false, updateStrategy = 'all', fromDate } = options;

      // Build query based on options
      let query: any = { groupId };

      if (skipModified) {
        query.isModified = { $ne: true };
      }

      if (updateStrategy === 'future_only' || fromDate) {
        const targetDate = fromDate || new Date();
        query.startTime = { $gte: targetDate };
      }

      if (updateStrategy === 'unmodified_only') {
        query.isModified = { $ne: true };
      }

      // Prepare update data
      const updateData = {
        ...updates,
        updatedAt: new Date()
      };

      // Update events
      const updatedCount = await this.mongoProvider.updateMany(
        this.collectionName,
        query,
        updateData
      );

      // Fetch updated events
      const updatedEvents = await this.mongoProvider.findQuery(
        this.collectionName,
        { groupId }
      ) as Event[];

      return {
        updatedCount,
        events: updatedEvents
      };
    } catch (error) {
      console.error('EventManagementService: Failed to update event group:', error);
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
      const targetDate = fromDate || new Date();
      
      const query = {
        groupId,
        startTime: { $gte: targetDate }
      };

      const deletedCount = await this.mongoProvider.deleteMany(
        this.collectionName,
        query
      );

      return { deletedCount };
    } catch (error) {
      console.error('EventManagementService: Failed to delete future events:', error);
      throw error;
    }
  }

  /**
   * Get events by group ID
   */
  async getEventsByGroup(groupId: string): Promise<Event[]> {
    try {
      const events = await this.mongoProvider.findQuery(
        this.collectionName,
        { groupId }
      ) as Event[];

      return events.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    } catch (error) {
      console.error('EventManagementService: Failed to get events by group:', error);
      throw error;
    }
  }

  /**
   * Get events by source ID and type
   */
  async getEventsBySource(
    sourceId: string,
    sourceType: string
  ): Promise<Event[]> {
    try {
      const events = await this.mongoProvider.findQuery(
        this.collectionName,
        { sourceId, sourceType }
      ) as Event[];

      return events.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    } catch (error) {
      console.error('EventManagementService: Failed to get events by source:', error);
      throw error;
    }
  }

  /**
   * Get event by ID
   */
  async getEventById(eventId: string): Promise<Event | null> {
    try {
      if (!ObjectId.isValid(eventId)) {
        return null;
      }

      const event = await this.mongoProvider.findById(
        this.collectionName,
        eventId
      ) as Event | null;

      return event;
    } catch (error) {
      console.error('EventManagementService: Failed to get event by ID:', error);
      throw error;
    }
  }

  /**
   * Delete an event by ID
   */
  async deleteEvent(eventId: string): Promise<boolean> {
    try {
      if (!ObjectId.isValid(eventId)) {
        return false;
      }

      const deleted = await this.mongoProvider.delete(
        this.collectionName,
        eventId
      );

      return deleted;
    } catch (error) {
      console.error('EventManagementService: Failed to delete event:', error);
      throw error;
    }
  }

  /**
   * Delete all events in a group
   */
  async deleteEventGroup(groupId: string): Promise<{ deletedCount: number }> {
    try {
      const deletedCount = await this.mongoProvider.deleteMany(
        this.collectionName,
        { groupId }
      );

      return { deletedCount };
    } catch (error) {
      console.error('EventManagementService: Failed to delete event group:', error);
      throw error;
    }
  }

  /**
   * Get group information and statistics
   */
  async getEventGroupInfo(groupId: string): Promise<EventGroupInfo | null> {
    try {
      const events = await this.getEventsByGroup(groupId);
      
      if (events.length === 0) {
        return null;
      }

      const now = new Date();
      const modifiedEvents = events.filter(e => e.isModified).length;
      const unmodifiedEvents = events.length - modifiedEvents;
      const futureEvents = events.filter(e => e.startTime >= now).length;
      const pastEvents = events.length - futureEvents;

      return {
        groupId,
        totalEvents: events.length,
        modifiedEvents,
        unmodifiedEvents,
        futureEvents,
        pastEvents
      };
    } catch (error) {
      console.error('EventManagementService: Failed to get event group info:', error);
      throw error;
    }
  }

  /**
   * Mark events as modified when they are individually changed
   */
  async markEventsAsModified(eventIds: string[]): Promise<{ updatedCount: number }> {
    try {
      const validIds = eventIds.filter(id => ObjectId.isValid(id));
      
      if (validIds.length === 0) {
        return { updatedCount: 0 };
      }

      const query = { _id: { $in: validIds.map(id => ObjectId.createFromHexString(id)) } };
      const updateData = { isModified: true, updatedAt: new Date() };

      const updatedCount = await this.mongoProvider.updateMany(
        this.collectionName,
        query,
        updateData
      );

      return { updatedCount };
    } catch (error) {
      console.error('EventManagementService: Failed to mark events as modified:', error);
      throw error;
    }
  }

  /**
   * Reset modified flag for events (useful for bulk updates)
   */
  async resetModifiedFlag(groupId: string): Promise<{ updatedCount: number }> {
    try {
      const query = { groupId };
      const updateData = { isModified: false, updatedAt: new Date() };

      const updatedCount = await this.mongoProvider.updateMany(
        this.collectionName,
        query,
        updateData
      );

      return { updatedCount };
    } catch (error) {
      console.error('EventManagementService: Failed to reset modified flag:', error);
      throw error;
    }
  }

  /**
   * Get events with pagination and filtering
   */
  async getEventsWithFilters(filters: {
    organizationId?: string;
    teamId?: string;
    groupId?: string;
    sourceId?: string;
    sourceType?: string;
    status?: EventStatus;
    startDate?: Date;
    endDate?: Date;
    isModified?: boolean;
  }, options: {
    limit?: number;
    skip?: number;
    sort?: { [field: string]: 1 | -1 };
  } = {}): Promise<{ events: Event[]; total: number }> {
    try {
      const query: any = {};

      if (filters.organizationId) query.organizationId = filters.organizationId;
      if (filters.teamId) query.teamId = filters.teamId;
      if (filters.groupId) query.groupId = filters.groupId;
      if (filters.sourceId) query.sourceId = filters.sourceId;
      if (filters.sourceType) query.sourceType = filters.sourceType;
      if (filters.status) query.status = filters.status;
      if (filters.isModified !== undefined) query.isModified = filters.isModified;

      if (filters.startDate || filters.endDate) {
        query.startTime = {};
        if (filters.startDate) query.startTime.$gte = filters.startDate;
        if (filters.endDate) query.startTime.$lte = filters.endDate;
      }

      const total = await this.mongoProvider.count(this.collectionName, query);

      const events = await this.mongoProvider.findWithFilters(
        this.collectionName,
        Object.entries(query).map(([field, value]) => ({
          field,
          operator: '$eq' as const,
          value
        })),
        {
          limit: options.limit || 50,
          skip: options.skip || 0,
          sort: options.sort || { startTime: 1 }
        }
      ) as Event[];

      return { events, total };
    } catch (error) {
      console.error('EventManagementService: Failed to get events with filters:', error);
      throw error;
    }
  }

  /**
   * Validate event update data
   */
  validateEventUpdate(updates: Partial<Event>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (updates.startTime && updates.endTime && updates.startTime >= updates.endTime) {
      errors.push('Start time must be before end time');
    }

    if (updates.sequenceNumber && updates.sequenceNumber < 1) {
      errors.push('Sequence number must be greater than 0');
    }

    if (updates.totalInSequence && updates.totalInSequence < 1) {
      errors.push('Total in sequence must be greater than 0');
    }

    if (updates.sequenceNumber && updates.totalInSequence && 
        updates.sequenceNumber > updates.totalInSequence) {
      errors.push('Sequence number cannot be greater than total in sequence');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
