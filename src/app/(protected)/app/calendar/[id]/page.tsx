'use client';

import React, { useEffect } from 'react';
import { Calendar } from '@/components/calendar/calendar';
import { CalendarProvider } from '@/providers/calendar-context';
import { MemberSwitcher } from '@/app/components/layouts/common/member-switcher';
import { useTeam } from '@/providers/team-context';
import { useUser } from '@/providers/user.context';
import { CoachCalendar } from '@/components/calendar/coach-calendar';
import { useOrganization } from '@/providers/organization-context'; // ADD THIS

export default function CalendarPage() {
  const { currentTeamMember, currentTeam } = useTeam();
  const { user } = useUser();
  const { currentOrganization } = useOrganization(); // ADD THIS
  
  // Show loading state while user data is being fetched
  if (!user || !currentOrganization) { // UPDATE THIS
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }
  
  return (
    <CalendarProvider 
      organizationId={currentOrganization._id} // ADD THIS
      initialSelectedMember={currentTeamMember}
    >
      {user.role === 'coach' ? (
        <CoachCalendar />
      ) : (
        <Calendar />
      )}
    </CalendarProvider>
  );
}