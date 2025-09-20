import React from 'react';
import { Calendar } from './calendar';
import { CalendarView } from '@/models';

// Full-screen calendar
export function FullScreenCalendar() {
  return (
    <Calendar 
      className="h-screen w-full"
    />
  );
}

// Compact calendar
export function CompactCalendar() {
  return (
    <Calendar 
      className="max-w-4xl mx-auto"
      initialView="week"
    />
  );
}

// Mobile-optimized calendar
export function MobileCalendar() {
  return (
    <Calendar 
      className="p-4"
      initialView="day"
    />
  );
}