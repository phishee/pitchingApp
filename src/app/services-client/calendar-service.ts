import { CalendarEvent, CalendarDay, Event } from '@/models';
import { eventApi } from './eventApi';

export const calendarService = {
  // Get calendar month data
  async getCalendarMonth(
    organizationId: string,
    userId: string, 
    year: number, 
    month: number
  ): Promise<CalendarDay[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const events = await eventApi.getEvents({
      organizationId,
      athleteIds: [userId],
      startDate,
      endDate,
      includeDetails: true
    });

    const calendarEvents = events.map(event => this.transformToCalendarEvent(event, userId));
    return generateCalendarDaysFromEvents(calendarEvents, year, month);
  },

  // Get events for date range  
  async getEventsForDateRange(
    organizationId: string,
    userId: string, 
    range: { start: Date; end: Date }
  ): Promise<CalendarEvent[]> {
    const events = await eventApi.getEvents({
      organizationId,
      athleteIds: [userId],
      startDate: range.start,
      endDate: range.end,
      includeDetails: true
    });

    return events.map(event => this.transformToCalendarEvent(event, userId));
  },

  // Create event
  async createEvent(eventData: Event): Promise<Event> {
    const result = await eventApi.createSingleEvent(eventData);
    
    // Fetch the created event to return full details
    if (result.success && result.summary.athleteGroups.length > 0) {
      const events = await eventApi.getEvents({
        organizationId: eventData.organizationId,
        athleteIds: eventData.participants.athletes.map(a => a.userId),
        startDate: eventData.startTime,
        endDate: eventData.endTime,
        limit: 1
      });
      return events[0] || eventData;
    }
    
    return eventData;
  },

  // Update event
  async updateEvent(eventId: string, updates: Partial<Event>): Promise<Event> {
    return await eventApi.updateEvent(eventId, updates);
  },

  // Delete event
  async deleteEvent(eventId: string): Promise<void> {
    await eventApi.deleteEvent(eventId);
  },

  // Bulk update event group
  async bulkUpdateEventGroup(groupId: string, updates: Partial<Event>): Promise<void> {
    await eventApi.bulkUpdateEventGroup(groupId, updates);
  },

  // Bulk delete event group
  async bulkDeleteEventGroup(groupId: string): Promise<void> {
    await eventApi.bulkDeleteEventGroup(groupId);
  },

  // Transform Event to CalendarEvent
  transformToCalendarEvent(event: Event, currentUserId: string): CalendarEvent {
    return {
      id: event.id,
      groupId: event.groupId,
      title: event.title,
      description: event.description,
      startTime: new Date(event.startTime),
      endTime: new Date(event.endTime),
      type: event.type,
      status: event.status,
      participants: {
        role: this.getUserRole(event, currentUserId),
        isRequired: event.participants.required.includes(currentUserId),
        attendanceStatus: 'attending'
      },
      color: this.getEventColor(event.type, event.status),
      location: event.location,
      workoutType: this.getWorkoutType(event),
      opponent: this.getOpponent(event),
      assessmentType: this.getAssessmentType(event),
    };
  },

  // Helper methods remain the same
  getUserRole(event: Event, userId: string): 'athlete' | 'coach' | 'observer' {
    if (event.participants.athletes.some(a => a.userId === userId)) return 'athlete';
    if (event.participants.coaches.some(c => c.userId === userId)) return 'coach';
    return 'observer';
  },

  getEventColor(type: string, status: string): string {
    const colorMap = {
      workout: { scheduled: '#4CAF50', in_progress: '#FF9800', completed: '#2196F3' },
      assessment: { scheduled: '#9C27B0', completed: '#673AB7' },
      coaching_session: { scheduled: '#00BCD4', completed: '#4CAF50' },
      gameday: { scheduled: '#E91E63', completed: '#3F51B5' }
    };
    return colorMap[type]?.[status] || '#9E9E9E';
  },

  getWorkoutType(event: Event): string | undefined {
    if (event.type === 'workout') {
      return event.title;
    }
    return undefined;
  },

  getOpponent(event: Event): string | undefined {
    if (event.type === 'gameday') {
      // Note: Opponent details now stored separately, referenced by detailsId
      return 'Game'; // Placeholder - would need to fetch from detailsId
    }
    return undefined;
  },

  getAssessmentType(event: Event): string | undefined {
    if (event.type === 'assessment') {
      // Note: Assessment details now stored separately, referenced by detailsId
      return 'Assessment'; // Placeholder - would need to fetch from detailsId
    }
    return undefined;
  },
};

// Helper function to generate calendar days
function generateCalendarDaysFromEvents(events: CalendarEvent[], year: number, month: number): CalendarDay[] {
  const firstDay = new Date(year, month - 1, 1);
  const startDate = new Date(firstDay);

  const dayOfWeek = firstDay.getDay();
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  startDate.setDate(startDate.getDate() - daysToSubtract);

  const days: CalendarDay[] = [];
  const totalDays = 42;

  for (let i = 0; i < totalDays; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    const dayEvents = events.filter(event => {
      const eventDate = event.startTime.toISOString().split('T')[0];
      const currentDate = date.toISOString().split('T')[0];
      return eventDate === currentDate;
    });

    days.push({
      date: date.getDate(),
      isCurrentMonth: date.getMonth() === month - 1,
      isToday: date.toDateString() === new Date().toDateString(),
      events: dayEvents,
      fullDate: date,
      dayOfWeek: date.toLocaleDateString('en', { weekday: 'long' }),
      isAvailable: true
    });
  }

  return days;
}

