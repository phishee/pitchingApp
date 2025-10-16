// src/services/eventApi.ts

import axios from "axios";
import { Event } from "@/models/Calendar";

const API_BASE = "/api/v1/events";

// ===== REQUEST/RESPONSE TYPES =====

export interface CreateEventsRequest {
  events: Partial<Event>[];
}

export interface CreateEventsResponse {
  success: boolean;
  summary: {
    totalCreated: number;
    athleteGroups: {
      athleteId: string;
      groupId: string;
      eventCount: number;
    }[];
    dateRange: {
      start: string;
      end: string;
    };
  };
  message: string;
}

export interface EventFilterParams {
  organizationId: string; // Required
  teamId?: string;
  types?: string[]; // ['workout', 'gameday']
  statuses?: string[]; // ['scheduled', 'completed']
  startDate?: Date | string;
  endDate?: Date | string;
  athleteIds?: string[];
  coachIds?: string[];
  bookingStatus?: string;
  limit?: number;
  offset?: number;
  sort?: string; // Field name to sort by
  order?: 'asc' | 'desc';
  includeDetails?: boolean;
}

export interface BulkUpdateResponse {
  message: string;
  updatedCount: number;
}

export interface BulkDeleteResponse {
  message: string;
  deletedCount: number;
}

// ===== API SERVICE =====

export const eventApi = {
  /**
   * Create events (simple or recurring, single or multiple athletes)
   * POST /api/v1/events
   */
  async createEvents(request: CreateEventsRequest): Promise<CreateEventsResponse> {
    const res = await axios.post<CreateEventsResponse>(API_BASE, request);
    return res.data;
  },

  /**
   * List events with advanced filtering
   * GET /api/v1/events
   */
  async getEvents(filters: EventFilterParams): Promise<Event[]> {
    const params = new URLSearchParams();

    // Required
    params.append('organizationId', filters.organizationId);

    // Optional filters
    if (filters.teamId) params.append('teamId', filters.teamId);
    if (filters.types?.length) params.append('types', filters.types.join(','));
    if (filters.statuses?.length) params.append('statuses', filters.statuses.join(','));
    if (filters.athleteIds?.length) params.append('athleteIds', filters.athleteIds.join(','));
    if (filters.coachIds?.length) params.append('coachIds', filters.coachIds.join(','));
    if (filters.bookingStatus) params.append('bookingStatus', filters.bookingStatus);

    // Date filters
    if (filters.startDate) {
      const startDate = filters.startDate instanceof Date 
        ? filters.startDate.toISOString() 
        : filters.startDate;
      params.append('startDate', startDate);
    }
    if (filters.endDate) {
      const endDate = filters.endDate instanceof Date 
        ? filters.endDate.toISOString() 
        : filters.endDate;
      params.append('endDate', endDate);
    }

    // Pagination
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());

    // Sorting
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.order) params.append('order', filters.order);

    // Details inclusion
    if (filters.includeDetails === false) params.append('includeDetails', 'false');

    const res = await axios.get<Event[]>(`${API_BASE}?${params.toString()}`);
    return res.data;
  },

  /**
   * Get single event by ID
   * GET /api/v1/events/:id
   */
  async getEventById(id: string): Promise<Event> {
    const res = await axios.get<Event>(`${API_BASE}/${id}`);
    return res.data;
  },

  /**
   * Update single event
   * PATCH /api/v1/events/:id
   */
  async updateEvent(id: string, data: Partial<Event>): Promise<Event> {
    const res = await axios.patch<Event>(`${API_BASE}/${id}`, data);
    return res.data;
  },

  /**
   * Delete single event
   * DELETE /api/v1/events/:id
   */
  async deleteEvent(id: string): Promise<{ message: string }> {
    const res = await axios.delete<{ message: string }>(`${API_BASE}/${id}`);
    return res.data;
  },

  /**
   * Bulk update all events in a group
   * PATCH /api/v1/events/group/:groupId
   */
  async bulkUpdateEventGroup(
    groupId: string, 
    data: Partial<Event>
  ): Promise<BulkUpdateResponse> {
    const res = await axios.patch<BulkUpdateResponse>(
      `${API_BASE}/group/${groupId}`, 
      data
    );
    return res.data;
  },

  /**
   * Bulk delete all events in a group
   * DELETE /api/v1/events/group/:groupId
   */
  async bulkDeleteEventGroup(groupId: string): Promise<BulkDeleteResponse> {
    const res = await axios.delete<BulkDeleteResponse>(`${API_BASE}/group/${groupId}`);
    return res.data;
  },

  // ===== CONVENIENCE METHODS =====

  /**
   * Get events for a specific month
   */
  async getMonthEvents(
    organizationId: string,
    year: number,
    month: number, // 1-12
    options?: {
      teamId?: string;
      athleteIds?: string[];
      types?: string[];
      includeDetails?: boolean;
    }
  ): Promise<Event[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    return this.getEvents({
      organizationId,
      startDate,
      endDate,
      ...options
    });
  },

  /**
   * Get events for a specific week
   */
  async getWeekEvents(
    organizationId: string,
    startOfWeek: Date,
    options?: {
      teamId?: string;
      athleteIds?: string[];
      types?: string[];
      includeDetails?: boolean;
    }
  ): Promise<Event[]> {
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59);

    return this.getEvents({
      organizationId,
      startDate: startOfWeek,
      endDate: endOfWeek,
      ...options
    });
  },

  /**
   * Get upcoming events for an athlete
   */
  async getUpcomingEventsForAthlete(
    organizationId: string,
    athleteId: string,
    options?: {
      limit?: number;
      types?: string[];
      includeDetails?: boolean;
    }
  ): Promise<Event[]> {
    return this.getEvents({
      organizationId,
      athleteIds: [athleteId],
      startDate: new Date(),
      statuses: ['scheduled'],
      sort: 'startTime',
      order: 'asc',
      limit: options?.limit || 10,
      types: options?.types,
      includeDetails: options?.includeDetails
    });
  },

  /**
   * Get events requiring coach for a specific coach
   */
  async getCoachPendingEvents(
    organizationId: string,
    coachId: string,
    options?: {
      limit?: number;
      includeDetails?: boolean;
    }
  ): Promise<Event[]> {
    return this.getEvents({
      organizationId,
      coachIds: [coachId],
      bookingStatus: 'pending',
      sort: 'startTime',
      order: 'asc',
      limit: options?.limit || 20,
      includeDetails: options?.includeDetails
    });
  },

  /**
   * Get all events in a recurring series (by groupId)
   */
  async getEventsByGroupId(
    organizationId: string,
    groupId: string,
    options?: {
      includeDetails?: boolean;
    }
  ): Promise<Event[]> {
    // Note: You'll need to add a groupId filter to the backend
    // For now, we can fetch all events and filter client-side
    const allEvents = await this.getEvents({
      organizationId,
      includeDetails: options?.includeDetails
    });

    return allEvents.filter(event => event.groupId === groupId);
  },

  /**
   * Create a simple single event (no recurrence)
   */
  async createSingleEvent(event: Partial<Event>): Promise<CreateEventsResponse> {
    return this.createEvents({
      events: [{
        ...event,
        recurrence: {
          pattern: 'none',
          interval: 1
        }
      }]
    });
  },

  /**
   * Create recurring events for a single athlete
   * Note: With the new foreign key architecture, recurrence is handled by the source objects (WorkoutAssignment, etc.)
   * This method now creates events from a template without recurrence validation
   */
  async createRecurringEventForAthlete(
    event: Partial<Event>,
  ): Promise<CreateEventsResponse> {
    // Note: Recurrence validation is now handled by the source objects (WorkoutAssignment, etc.)
    // The Event model no longer contains recurrence information directly
    
    return this.createEvents({
      events: [event]
    });
  },

  /**
   * Create recurring events for multiple athletes
   * Note: With the new foreign key architecture, recurrence is handled by the source objects (WorkoutAssignment, etc.)
   * This method now validates events without recurrence validation
   */
  async createRecurringEventsForAthletes(
    events: Partial<Event>[]
  ): Promise<CreateEventsResponse> {
    events.forEach((event, index) => {
      // Note: Recurrence validation is now handled by the source objects (WorkoutAssignment, etc.)
      // The Event model no longer contains recurrence information directly
      
      if (!event.participants?.athletes?.length) {
        throw new Error(`Event at index ${index} missing athlete participant`);
      }
    });

    return this.createEvents({ events });
  },

  /**
   * Cancel a single event instance in a recurring series
   */
  async cancelEventInstance(eventId: string, reason?: string): Promise<Event> {
    return this.updateEvent(eventId, {
      status: 'cancelled',
      description: reason 
        ? `Cancelled: ${reason}` 
        : 'Cancelled'
    });
  },

  /**
   * Cancel entire recurring event series
   */
  async cancelEventSeries(
    groupId: string, 
    reason?: string
  ): Promise<BulkUpdateResponse> {
    return this.bulkUpdateEventGroup(groupId, {
      status: 'cancelled',
      description: reason 
        ? `Series cancelled: ${reason}` 
        : 'Series cancelled'
    });
  },

  /**
   * Reschedule a single event instance
   */
  async rescheduleEvent(
    eventId: string,
    newStartTime: Date,
    newEndTime: Date
  ): Promise<Event> {
    return this.updateEvent(eventId, {
      startTime: newStartTime,
      endTime: newEndTime
    });
  },

  /**
   * Get events by date range with lightweight data (no details)
   */
  async getCalendarEvents(
    organizationId: string,
    startDate: Date,
    endDate: Date,
    options?: {
      teamId?: string;
      athleteIds?: string[];
      types?: string[];
    }
  ): Promise<Event[]> {
    return this.getEvents({
      organizationId,
      startDate,
      endDate,
      includeDetails: false, // Lightweight for calendar views
      ...options
    });
  },

  /**
   * Search events by title
   */
  async searchEventsByTitle(
    organizationId: string,
    searchTerm: string,
    options?: {
      teamId?: string;
      limit?: number;
    }
  ): Promise<Event[]> {
    // Note: This requires backend support for text search
    // For now, fetch events and filter client-side
    const events = await this.getEvents({
      organizationId,
      teamId: options?.teamId,
      limit: options?.limit || 50
    });

    return events.filter(event => 
      event.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
};