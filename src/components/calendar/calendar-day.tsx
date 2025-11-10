import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { CalendarDay, CalendarView } from '@/models';
import { EventCard } from './event/cards/event-card';

interface CalendarDayProps {
  day: CalendarDay;
  onEventClick: (event: any) => void;
  view: CalendarView;
}

export function CalendarDayComponent({ day, onEventClick, view }: CalendarDayProps) {
  const isWeekView = view === 'week';
  
  return (
    <div className={cn(
      "p-2 border-r border-b border-gray-200 flex flex-col",
      isWeekView ? "h-full" : "min-h-24"
    )}>
      <div className={cn(
        'text-sm font-medium mb-2 flex-shrink-0',
        !day.isCurrentMonth ? 'text-gray-400' : 'text-gray-900',
        day.isToday ? 'text-purple-600' : ''
      )}>
        {day.date}
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-1">
          {day.events.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              onClick={onEventClick}
              compact={isWeekView}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}