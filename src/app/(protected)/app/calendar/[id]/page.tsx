'use client';

import React from 'react';
import { Calendar } from '@/components/calendar/calendar';
import { CalendarProvider } from '@/providers/calendar-context';

export default function CalendarPage() {
  return (
    <CalendarProvider>
      <Calendar />
    </CalendarProvider>
  );
}