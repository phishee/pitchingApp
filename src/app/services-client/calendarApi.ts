import { Event } from '@/models';
import { mockMemberEvents, defaultEvents } from '@/data/mock-calendar-events';

export const calendarApi = {
  // Get events for a specific user
  async getEventsByUserId(userId: string): Promise<Event[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Return member-specific events or default events
    return mockMemberEvents[userId] || defaultEvents;
  },

  // Get events for a specific date range
  async getEventsByDateRange(userId: string, startDate: string, endDate: string): Promise<Event[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const allEvents = mockMemberEvents[userId] || defaultEvents;
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return allEvents.filter(event => {
      const eventDate = event.startTime;
      return eventDate >= start && eventDate <= end;
    });
  },

  // Create a new event
  async createEvent(userId: string, eventData: Omit<Event, '_id' | 'createdAt' | 'updatedAt'>): Promise<Event> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const now = new Date();
    const newEvent: Event = {
      ...eventData,
      _id: Date.now().toString(),
      createdAt: now,
      updatedAt: now
    };
    
    // In a real app, this would be saved to the backend
    if (mockMemberEvents[userId]) {
      mockMemberEvents[userId].push(newEvent);
    } else {
      mockMemberEvents[userId] = [newEvent];
    }
    
    return newEvent;
  },

  // Update an existing event
  async updateEvent(userId: string, eventId: string, updates: Partial<Event>): Promise<Event> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const userEvents = mockMemberEvents[userId] || defaultEvents;
    const eventIndex = userEvents.findIndex(event => event._id === eventId);
    
    if (eventIndex === -1) {
      throw new Error('Event not found');
    }
    
    const updatedEvent: Event = { 
      ...userEvents[eventIndex], 
      ...updates,
      updatedAt: new Date()
    };
    userEvents[eventIndex] = updatedEvent;
    
    return updatedEvent;
  },

  // Delete an event
  async deleteEvent(userId: string, eventId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const userEvents = mockMemberEvents[userId] || defaultEvents;
    const eventIndex = userEvents.findIndex(event => event._id === eventId);
    
    if (eventIndex === -1) {
      throw new Error('Event not found');
    }
    
    userEvents.splice(eventIndex, 1);
  },

  // Get a single event by ID
  async getEventById(userId: string, eventId: string): Promise<Event | null> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const userEvents = mockMemberEvents[userId] || defaultEvents;
    return userEvents.find(event => event._id === eventId) || null;
  },

  // Get events by type
  async getEventsByType(userId: string, eventType: string): Promise<Event[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const allEvents = mockMemberEvents[userId] || defaultEvents;
    return allEvents.filter(event => event.type === eventType);
  },

  // Get events by status
  async getEventsByStatus(userId: string, status: string): Promise<Event[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const allEvents = mockMemberEvents[userId] || defaultEvents;
    return allEvents.filter(event => event.status === status);
  },

  // Search events by title or description
  async searchEvents(userId: string, query: string): Promise<Event[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const allEvents = mockMemberEvents[userId] || defaultEvents;
    const lowercaseQuery = query.toLowerCase();
    
    return allEvents.filter(event => 
      event.title.toLowerCase().includes(lowercaseQuery) ||
      event.description.toLowerCase().includes(lowercaseQuery)
    );
  }
};
