'use client';

import React, { useEffect } from 'react';
import { Calendar } from '@/components/calendar/calendar';
import { CalendarProvider } from '@/providers/calendar-context';
import { MemberSwitcher } from '@/app/components/layouts/common/member-switcher';
import { useTeam } from '@/providers/team-context';
import { CoachCalendar } from '@/components/calendar/coach-calendar';

export default function CalendarPage() {
  const { currentTeamMember } = useTeam();
  
  return (
    <CalendarProvider initialSelectedMember={currentTeamMember}>
      <CoachCalendar />
    </CalendarProvider>
  );
}