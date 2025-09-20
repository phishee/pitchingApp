import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarEvent } from '@/models';
import { TimeSlot } from '../time-slot';
import { useCalendar } from '@/providers/calendar-context';

interface DayViewProps {
  currentDate: Date;
  onEventClick: (event: CalendarEvent) => void;
}

export function DayView({ currentDate, onEventClick }: DayViewProps) {
  const { events } = useCalendar();
  
  // Generate time slots from 8 AM to 8 PM
  const timeSlots = [];
  for (let hour = 8; hour <= 20; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
  }

  // Get events for the current day
  const dayEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate.getDate() === currentDate.getDate() &&
           eventDate.getMonth() === currentDate.getMonth() &&
           eventDate.getFullYear() === currentDate.getFullYear();
  });

  // Group events by time slot
  const eventsByTimeSlot = timeSlots.reduce((acc, time) => {
    const [hour] = time.split(':');
    const eventsInSlot = dayEvents.filter(event => {
      const [eventHour] = event.startTime.split(':');
      return parseInt(eventHour) === parseInt(hour);
    });
    acc[time] = eventsInSlot;
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
  const dayNumber = currentDate.getDate();
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long' });
  const year = currentDate.getFullYear();

  return (
    <Card className="h-[calc(100vh-12rem)] overflow-hidden">
      <CardContent className="p-0 h-full flex flex-col">
        {/* Day Header */}
        <div className="bg-gray-50 p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{dayName}</h2>
              <p className="text-lg text-gray-600">{monthName} {dayNumber}, {year}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                {dayEvents.length} events
              </Badge>
            </div>
          </div>
        </div>

        {/* Time Slots */}
        <ScrollArea className="flex-1">
          <div className="divide-y divide-gray-100">
            {timeSlots.map((time) => (
              <TimeSlot
                key={time}
                time={time}
                events={eventsByTimeSlot[time] || []}
                onEventClick={onEventClick}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

