'use client';

import React from 'react';
import { EnrichedEvent } from '@/providers/user-event-context';

interface WeekDaySelectorProps {
  currentDate: Date;
  events: EnrichedEvent[];
  onDateSelect: (date: Date) => void;
}

interface DayInfo {
  date: Date;
  dayName: string;
  dayNumber: number;
  hasEvents: boolean;
  isToday: boolean;
  isSelected: boolean;
}

export function WeekDaySelector({ currentDate, events, onDateSelect }: WeekDaySelectorProps) {
  // Get the week containing currentDate (Sunday to Saturday)
  const getWeekDays = (date: Date): DayInfo[] => {
    const weekStart = new Date(date);
    const dayOfWeek = weekStart.getDay();
    
    // Adjust to Sunday
    weekStart.setDate(weekStart.getDate() - dayOfWeek);
    weekStart.setHours(0, 0, 0, 0);

    const days: DayInfo[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);

      // Check if this day has events
      const dayStart = new Date(day);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);

      const hasEvents = events.some(enrichedEvent => {
        const eventDate = new Date(enrichedEvent.event.startTime);
        return eventDate >= dayStart && eventDate <= dayEnd;
      });

      const dayInfo: DayInfo = {
        date: day,
        dayName: day.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: day.getDate(),
        hasEvents,
        isToday: day.toDateString() === today.toDateString(),
        isSelected: day.toDateString() === currentDate.toDateString(),
      };

      days.push(dayInfo);
    }

    return days;
  };

  const weekDays = getWeekDays(currentDate);

  return (
    <div className="flex gap-2 pb-2 px-1 w-full">
      {weekDays.map((day, index) => (
        <button
          key={index}
          onClick={() => onDateSelect(day.date)}
          className={`
            flex flex-col items-center justify-center
            flex-1 py-3
            rounded-full transition-all duration-200
            ${
              day.isSelected
                ? 'bg-purple-600 text-white shadow-lg'
                : day.isToday
                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }
          `}
        >
          {/* Event indicator dot */}
          {day.hasEvents && (
            <div
              className={`
                w-1.5 h-1.5 rounded-full mb-1
                ${day.isSelected ? 'bg-white' : 'bg-purple-600'}
              `}
            />
          )}

          {/* Day name */}
          <span className="text-xs font-medium uppercase">{day.dayName}</span>

          {/* Day number */}
          <span className="text-lg font-semibold">{day.dayNumber}</span>
        </button>
      ))}
    </div>
  );
}
