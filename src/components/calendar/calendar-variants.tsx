import React from 'react';
import { Calendar } from './calendar';
import { CalendarProvider } from '@/providers/calendar-context';
import { CalendarView } from '@/models/Calendar';

interface CalendarVariantProps {
  organizationId: string;
  initialDate?: Date;
  initialView?: CalendarView;
  initialSelectedMember?: any;
}

// Full-screen calendar
export function FullScreenCalendar({ 
  organizationId, 
  initialDate, 
  initialView = 'month',
  initialSelectedMember 
}: CalendarVariantProps) {
  return (
    <CalendarProvider
      organizationId={organizationId}
      initialDate={initialDate}
      initialView={initialView}
      initialSelectedMember={initialSelectedMember}
    >
      <Calendar 
        className="h-screen w-full"
      />
    </CalendarProvider>
  );
}

// Compact calendar
export function CompactCalendar({ 
  organizationId, 
  initialDate, 
  initialView = 'week',
  initialSelectedMember 
}: CalendarVariantProps) {
  return (
    <CalendarProvider
      organizationId={organizationId}
      initialDate={initialDate}
      initialView={initialView}
      initialSelectedMember={initialSelectedMember}
    >
      <Calendar 
        className="max-w-4xl mx-auto"
      />
    </CalendarProvider>
  );
}

// Mobile-optimized calendar
export function MobileCalendar({ 
  organizationId, 
  initialDate, 
  initialView = 'day',
  initialSelectedMember 
}: CalendarVariantProps) {
  return (
    <CalendarProvider
      organizationId={organizationId}
      initialDate={initialDate}
      initialView={initialView}
      initialSelectedMember={initialSelectedMember}
    >
      <Calendar 
        className="p-4"
      />
    </CalendarProvider>
  );
}