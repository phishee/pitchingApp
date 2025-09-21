'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ViewToggle } from './view-toggle';
import { MonthNavigation } from './month-navigation';
import { ActionButtons } from './action-buttons';
import { EventPopup } from './event/popup/event-popup';
import { MonthView } from './views/month-view';
import { WeekView } from './views/week-view';
import { DayView } from './views/day-view';
import { useCalendar } from '@/providers/calendar-context';
import { useTeam } from '@/providers/team-context';
import { MemberSwitcher } from '@/app/components/layouts/common/member-switcher';
import { CalendarEvent, TeamMemberWithUser } from '@/models';
import { LoadingSpinner } from '@/components/common/loading-spinner';

interface CoachCalendarProps {
  className?: string;
}

export function CoachCalendar({ className }: CoachCalendarProps) {
  const {
    currentDate,
    currentView,
    selectedEvent,
    popupPosition,
    selectedMember,
    isLoadingEvents,
    setCurrentView,
    navigateToPrevious,
    navigateToNext,
    showEventPopup,
    hideEventPopup,
    setSelectedMember,
  } = useCalendar();

  const { teamMembers } = useTeam();

  const handleEventClick = (event: CalendarEvent) => {
    // For now, we'll position the popup in the center of the screen
    // In a real app, you might want to get the actual click position
    showEventPopup(event, {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    });
  };

  const handleMemberSelect = (member: Partial<TeamMemberWithUser>) => {
    setSelectedMember(member);
    // Events will be automatically loaded via useEffect in the context
  };

  return (
    <div className={cn(
      "p-6 bg-white",
      currentView === 'week' || currentView === 'day' ? "h-screen flex flex-col" : "min-h-screen",
      className
    )}>
      {/* Member Switcher at the top */}
      <div className="mb-6 flex-shrink-0">
        <MemberSwitcher
          selectedMember={selectedMember}
          members={teamMembers}
          onMemberSelect={handleMemberSelect}
        />
      </div>

      {/* Header with View Toggle and Navigation */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <ViewToggle currentView={currentView} onViewChange={setCurrentView} />
        <MonthNavigation
          currentDate={currentDate}
          onPreviousMonth={navigateToPrevious}
          onNextMonth={navigateToNext}
          view={currentView}
        />
        <ActionButtons />
      </div>

      {/* Loading State */}
      {isLoadingEvents && (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
          <span className="ml-2 text-sm text-muted-foreground">
            Loading {selectedMember ? getMemberDisplayName(selectedMember) : 'member'}'s calendar...
          </span>
        </div>
      )}

      {/* Calendar Content */}
      {!isLoadingEvents && (
        <>
          {currentView === 'day' ? (
            <DayView
              currentDate={currentDate}
              onEventClick={handleEventClick}
            />
          ) : currentView === 'week' ? (
            <WeekView
              currentDate={currentDate}
              onEventClick={handleEventClick}
            />
          ) : (
            <MonthView
              currentDate={currentDate}
              onEventClick={handleEventClick}
            />
          )}
        </>
      )}

      {/* Event Popup */}
      {selectedEvent && (
        <EventPopup
          event={selectedEvent}
          position={popupPosition}
          onClose={hideEventPopup}
        />
      )}
    </div>
  );
}

// Helper function to get member display name
function getMemberDisplayName(member: Partial<TeamMemberWithUser>) {
  if ('user' in member && member.user) {
    return member.user.name || 'Unknown User';
  }
  return 'Team Member';
}
