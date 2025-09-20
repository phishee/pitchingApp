export interface CalendarEvent {
    id: string;
    calendarId?: string;
    clientName: string;
    service: string;
    time: string;
    color: 'purple' | 'green' | 'blue' | 'orange';
    date: string;
    startTime: string;
    endTime: string;
  }
  
  export interface CalendarDay {
    date: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    events: CalendarEvent[];
    fullDate: Date;
  }
  
  export interface Calendar {
    _id: string;
    userId: string;
  }
  
  export type CalendarView = 'month' | 'week' | 'day';