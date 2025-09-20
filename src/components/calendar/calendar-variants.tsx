import React from 'react';
import { Calendar } from './calendar';
import { CalendarProvider } from '@/providers/calendar-context';

// Full-screen calendar
export function FullScreenCalendar() {
  return (
    <CalendarProvider>
      <Calendar 
        className="h-screen w-full"
      />
    </CalendarProvider>
  );
}

// Compact calendar
export function CompactCalendar() {
  return (
    <CalendarProvider initialView="week">
      <Calendar 
        className="max-w-4xl mx-auto"
      />
    </CalendarProvider>
  );
}

// Mobile-optimized calendar
export function MobileCalendar() {
  return (
    <CalendarProvider initialView="day">
      <Calendar 
        className="p-4"
      />
    </CalendarProvider>
  );
}