'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserEvent } from '@/providers/user-event-context';
import { WeekDaySelector } from './week-day-selector';
import { UserEventCard } from './user-event-card';

export function UserWorkoutsDesktop() {
  const router = useRouter();
  const { isLoading, error, enrichedEvents } = useUserEvent();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Get events for the currently selected day only
  const getEventsForDay = (date: Date) => {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    return enrichedEvents.filter(enrichedEvent => {
      const eventDate = new Date(enrichedEvent.event.startTime);
      return eventDate >= dayStart && eventDate <= dayEnd;
    });
  };

  const dayEvents = getEventsForDay(selectedDate);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleEventClick = (event: typeof enrichedEvents[0]) => {
    // Navigate to workout detail page
    router.push(`/app/my-workouts/${event.event.id}`);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="text-red-600 text-center">
          <p className="font-semibold mb-2">Failed to load workouts</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col max-w-4xl mx-auto">
      {/* Week Day Selector */}
      <div className="sticky top-0 z-10 bg-white px-6 pt-6 pb-4">
        <WeekDaySelector
          currentDate={selectedDate}
          events={enrichedEvents}
          onDateSelect={handleDateSelect}
        />
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-600">Loading workouts...</p>
          </div>
        ) : dayEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <svg
                className="w-10 h-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <p className="text-gray-600 font-medium mb-1">No workouts scheduled</p>
            <p className="text-sm text-gray-500 text-center">
              No workouts scheduled for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
        ) : (
          <div className="space-y-4 pt-6">
            {dayEvents.map((enrichedEvent) => (
              <UserEventCard
                key={enrichedEvent.event.id}
                enrichedEvent={enrichedEvent}
                onClick={() => handleEventClick(enrichedEvent)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
