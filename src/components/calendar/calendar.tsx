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
import { CalendarEvent } from '@/models';

interface CalendarProps {
  className?: string;
}

export function Calendar({ className }: CalendarProps) {
  const {
    currentDate,
    currentView,
    selectedEvent,
    popupPosition,
    setCurrentView,
    navigateToPrevious,
    navigateToNext,
    showEventPopup,
    hideEventPopup,
  } = useCalendar();

  const { currentTeamMember, teamMembers, currentTeam } = useTeam();

  const handleEventClick = (event: CalendarEvent) => {
    // For now, we'll position the popup in the center of the screen
    // In a real app, you might want to get the actual click position
    showEventPopup(event, {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    });
  };

  return (
    <div className={cn(
      "p-6 bg-white",
      currentView === 'week' || currentView === 'day' ? "h-screen flex flex-col" : "min-h-screen",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <ViewToggle currentView={currentView} onViewChange={setCurrentView} />
        <MonthNavigation
          currentDate={currentDate}
          onPreviousMonth={navigateToPrevious}
          onNextMonth={navigateToNext}
          view={currentView}
        />
        <ActionButtons 
          selectedMembers={currentTeamMember ? [currentTeamMember] : []}
          availableMembers={teamMembers}
          organizationId={currentTeam?.organizationId}
          teamId={currentTeam?._id}
        />
      </div>

      {/* Calendar Content */}
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