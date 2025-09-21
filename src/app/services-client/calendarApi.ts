import { CalendarEvent } from '@/models';

// Mock data for different team members
const mockMemberEvents: Record<string, CalendarEvent[]> = {
  'user1': [
    {
      id: '1',
      clientName: 'Jenny Wilson',
      service: 'Pitching Practice',
      time: '14:00 - 16:00',
      color: 'purple',
      date: '2025-01-15',
      startTime: '14:00',
      endTime: '16:00'
    },
    {
      id: '2',
      clientName: 'Arlene McCoy',
      service: 'Strength Training',
      time: '10:00 - 11:30',
      color: 'green',
      date: '2025-01-16',
      startTime: '10:00',
      endTime: '11:30'
    },
    {
      id: '3',
      clientName: 'Jane Cooper',
      service: 'Bullpen Session',
      time: '16:00 - 17:30',
      color: 'blue',
      date: '2025-01-17',
      startTime: '16:00',
      endTime: '17:30'
    }
  ],
  'user2': [
    {
      id: '4',
      clientName: 'Wade Warren',
      service: 'Batting Practice',
      time: '09:00 - 10:30',
      color: 'orange',
      date: '2025-01-15',
      startTime: '09:00',
      endTime: '10:30'
    },
    {
      id: '5',
      clientName: 'Cody Fisher',
      service: 'Fielding Drills',
      time: '11:00 - 12:00',
      color: 'green',
      date: '2025-01-16',
      startTime: '11:00',
      endTime: '12:00'
    },
    {
      id: '6',
      clientName: 'Cayla Brister',
      service: 'Conditioning',
      time: '15:00 - 16:00',
      color: 'purple',
      date: '2025-01-18',
      startTime: '15:00',
      endTime: '16:00'
    }
  ],
  'user3': [
    {
      id: '7',
      clientName: 'Devon Lane',
      service: 'Catching Practice',
      time: '13:00 - 14:30',
      color: 'blue',
      date: '2025-01-15',
      startTime: '13:00',
      endTime: '14:30'
    },
    {
      id: '8',
      clientName: 'Dianne Russell',
      service: 'Pitching Mechanics',
      time: '10:30 - 12:00',
      color: 'purple',
      date: '2025-01-17',
      startTime: '10:30',
      endTime: '12:00'
    }
  ]
};

// Default events for when no specific member is selected
const defaultEvents: CalendarEvent[] = [
  {
    id: 'default1',
    clientName: 'Team Meeting',
    service: 'Strategy Session',
    time: '09:00 - 10:00',
    color: 'blue',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00'
  },
  {
    id: 'default2',
    clientName: 'General Practice',
    service: 'Team Practice',
    time: '14:00 - 16:00',
    color: 'green',
    date: new Date().toISOString().split('T')[0],
    startTime: '14:00',
    endTime: '16:00'
  }
];

export const calendarApi = {
  // Get events for a specific user
  async getEventsByUserId(userId: string): Promise<CalendarEvent[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Return member-specific events or default events
    return mockMemberEvents[userId] || defaultEvents;
  },

  // Get events for a specific date range
  async getEventsByDateRange(userId: string, startDate: string, endDate: string): Promise<CalendarEvent[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const allEvents = mockMemberEvents[userId] || defaultEvents;
    return allEvents.filter(event => 
      event.date >= startDate && event.date <= endDate
    );
  },

  // Create a new event
  async createEvent(userId: string, event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newEvent: CalendarEvent = {
      ...event,
      id: Date.now().toString(),
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
  async updateEvent(userId: string, eventId: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const userEvents = mockMemberEvents[userId] || defaultEvents;
    const eventIndex = userEvents.findIndex(event => event.id === eventId);
    
    if (eventIndex === -1) {
      throw new Error('Event not found');
    }
    
    const updatedEvent = { ...userEvents[eventIndex], ...updates };
    userEvents[eventIndex] = updatedEvent;
    
    return updatedEvent;
  },

  // Delete an event
  async deleteEvent(userId: string, eventId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const userEvents = mockMemberEvents[userId] || defaultEvents;
    const eventIndex = userEvents.findIndex(event => event.id === eventId);
    
    if (eventIndex === -1) {
      throw new Error('Event not found');
    }
    
    userEvents.splice(eventIndex, 1);
  }
};
