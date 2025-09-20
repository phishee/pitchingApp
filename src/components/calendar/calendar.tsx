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

  const handleEventClick = (event: any, clickEvent: React.MouseEvent) => {
    showEventPopup(event, {
      x: clickEvent.clientX,
      y: clickEvent.clientY
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
        <ActionButtons />
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