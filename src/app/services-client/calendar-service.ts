import { CalendarEvent, CalendarDay, Event } from '@/models';
import { calendarApi } from './calendarApi';

export const calendarService = {
  // Get calendar month data
  async getCalendarMonth(userId: string, year: number, month: number): Promise<CalendarDay[]> {
    const events = await calendarApi.getEventsByUserId(userId);
    // Transform Event[] to CalendarEvent[]
    const calendarEvents = events.map(event => this.transformToCalendarEvent(event, userId));
    return generateCalendarDaysFromEvents(calendarEvents, year, month);
  },

  // Get events for date range  
  async getEventsForDateRange(userId: string, range: { start: Date; end: Date }): Promise<CalendarEvent[]> {
    const startDate = range.start.toISOString().split('T')[0];
    const endDate = range.end.toISOString().split('T')[0];
    const events = await calendarApi.getEventsByDateRange(userId, startDate, endDate);
    return events.map(event => this.transformToCalendarEvent(event, userId));
  },

  // Create event
  async createEvent(eventData: Event): Promise<Event> {
    const userId = eventData.participants?.athletes?.[0]?.userId || 'default-user';
    
    const createdEvent = await calendarApi.createEvent(userId, eventData);
    return createdEvent;
  },

  // Update event
  async updateEvent(eventId: string, updates: Partial<Event>, userId?: string): Promise<Event> {
    const targetUserId = userId || 'default-user';
    const updatedEvent = await calendarApi.updateEvent(targetUserId, eventId, updates);
    return updatedEvent;
  },

  // Delete event
  async deleteEvent(eventId: string, userId?: string): Promise<void> {
    const targetUserId = userId || 'default-user';
    return calendarApi.deleteEvent(targetUserId, eventId);
  },

  // Transform Event to CalendarEvent
  transformToCalendarEvent(event: Event, currentUserId: string): CalendarEvent {
    return {
      id: event.id,
      groupId: event.groupId,
      title: event.title,
      description: event.description,
      startTime: event.startTime,
      endTime: event.endTime,
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
      isBookable: this.isEventBookable(event),
      bookingStatus: this.getBookingStatus(event)
    };
  },

  // Helper methods
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
    if (event.type === 'workout' && event.details.type === 'workout') {
      return event.title;
    }
    return undefined;
  },

  getOpponent(event: Event): string | undefined {
    if (event.type === 'gameday' && event.details.type === 'gameday') {
      return event.details.opponent;
    }
    return undefined;
  },

  getAssessmentType(event: Event): string | undefined {
    if (event.type === 'assessment' && event.details.type === 'assessment') {
      return event.details.assessmentType;
    }
    return undefined;
  },

  isEventBookable(event: Event): boolean {
    return event.type === 'workout' && event.details.type === 'workout' && 
           event.details.bookingInfo.isBookingRequested;
  },

  getBookingStatus(event: Event): 'none' | 'pending' | 'approved' | 'rejected' | 'cancelled' | undefined {
    if (event.type === 'workout' && event.details.type === 'workout') {
      return event.details.bookingInfo.requestStatus;
    }
    return undefined;
  }
};

// Helper function to generate calendar days
function generateCalendarDaysFromEvents(events: CalendarEvent[], year: number, month: number): CalendarDay[] {
  const firstDay = new Date(year, month - 1, 1);
  const startDate = new Date(firstDay);
  
  // Adjust to start from Monday
  const dayOfWeek = firstDay.getDay();
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  startDate.setDate(startDate.getDate() - daysToSubtract);
  
  const days: CalendarDay[] = [];
  const totalDays = 42; // 6 weeks * 7 days
  
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

