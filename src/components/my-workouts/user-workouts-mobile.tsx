'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserEvent } from '@/providers/user-event-context';
import { WeekDaySelector } from './week-day-selector';
import { UserEventCard } from './user-event-card';

export function UserWorkoutsMobile() {
  const router = useRouter();
  const { isLoading, error, enrichedEvents, loadEventsForMonth } = useUserEvent();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [offsetX, setOffsetX] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isDragging = useRef(false);
  const lastLoadedMonth = useRef<{ year: number; month: number } | null>(null);

  // Handle swipe gestures for week navigation with smooth drag
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartX.current || !touchStartY.current || !isDragging.current) return;

    const touchCurrentX = e.touches[0].clientX;
    const touchCurrentY = e.touches[0].clientY;
    const diffX = touchStartX.current - touchCurrentX;
    const diffY = touchStartY.current - touchCurrentY;

    // Only handle horizontal swipes
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
      setOffsetX(-diffX);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX.current || !touchStartY.current) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStartX.current - touchEndX;
    const diffY = touchStartY.current - touchEndY;

    // Reset offset
    setOffsetX(0);

    // Only handle horizontal swipes (ignore if vertical swipe is dominant)
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      if (diffX > 0) {
        // Swipe left - next week
        const nextWeekDate = new Date(selectedDate);
        nextWeekDate.setDate(selectedDate.getDate() + 7);
        setSelectedDate(nextWeekDate);
      } else {
        // Swipe right - previous week
        const prevWeekDate = new Date(selectedDate);
        prevWeekDate.setDate(selectedDate.getDate() - 7);
        setSelectedDate(prevWeekDate);
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
    isDragging.current = false;
  };

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

  // Auto-load events when navigating to a different month
  useEffect(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1;
    
    // Only load if we haven't loaded this month yet
    if (!lastLoadedMonth.current || 
        lastLoadedMonth.current.year !== year || 
        lastLoadedMonth.current.month !== month) {
      // Load current month and adjacent months for smooth navigation
      loadEventsForMonth(year, month);
      
      // Pre-load previous month if we're near the beginning
      const dayOfMonth = selectedDate.getDate();
      if (dayOfMonth <= 7) {
        const prevMonth = month === 1 ? 12 : month - 1;
        const prevYear = month === 1 ? year - 1 : year;
        loadEventsForMonth(prevYear, prevMonth);
      }
      
      // Pre-load next month if we're near the end
      const daysInMonth = new Date(year, month, 0).getDate();
      if (dayOfMonth >= daysInMonth - 7) {
        const nextMonth = month === 12 ? 1 : month + 1;
        const nextYear = month === 12 ? year + 1 : year;
        loadEventsForMonth(nextYear, nextMonth);
      }
      
      lastLoadedMonth.current = { year, month };
    }
  }, [selectedDate, loadEventsForMonth]);

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
    <div 
      className="w-full h-full flex flex-col overflow-hidden max-w-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Month Header */}
      <div className="sticky top-0 z-10 bg-white px-4 pt-4 pb-2">
        <h2 className="text-lg font-bold text-gray-900">
          {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
      </div>

      {/* Week Day Selector */}
      <div 
        className="sticky z-10 bg-white px-4 pb-2 max-w-full"
        style={{ 
          transform: offsetX !== 0 ? `translateX(${offsetX}px)` : 'translateX(0)',
          transition: offsetX === 0 ? 'transform 0.3s ease-out' : 'none'
        }}
      >
        <WeekDaySelector
          currentDate={selectedDate}
          events={enrichedEvents}
          onDateSelect={handleDateSelect}
        />
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-4 max-w-full">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-600">Loading workouts...</p>
          </div>
        ) : dayEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
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
          <div className="space-y-3 pt-4">
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
