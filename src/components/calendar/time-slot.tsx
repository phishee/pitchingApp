import React from 'react';
import { Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CalendarEvent } from '@/models';

interface TimeSlotProps {
  time: string;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

export function TimeSlot({ time, events, onEventClick }: TimeSlotProps) {
  return (
    <div className="flex border-b border-gray-100 min-h-16">
      {/* Time Label */}
      <div className="w-20 flex-shrink-0 p-3 text-sm text-gray-500 border-r border-gray-100">
        {time}
      </div>
      
      {/* Events Column */}
      <div className="flex-1 p-2">
        {events.length > 0 ? (
          <div className="space-y-1">
            {events.map((event) => (
              <Card
                key={event.id}
                className="cursor-pointer hover:shadow-sm transition-shadow p-2"
                style={{ 
                  backgroundColor: event.color || '#9C27B0',
                  borderColor: event.color || '#9C27B0',
                  color: 'white'
                }}
                onClick={() => onEventClick(event)}
              >
                <CardContent className="p-0">
                  <div className="font-semibold text-sm">
                    {event.title || 'Untitled Event'}
                  </div>
                  <div className="text-xs opacity-80">
                    {event.description || 'No description'}
                  </div>
                  <div className="flex items-center gap-1 text-xs opacity-70 mt-1">
                    <Clock className="h-3 w-3" />
                    {`${event.startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${event.endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
                  </div>
                  {event.status && (
                    <div className="text-xs opacity-60 mt-1 capitalize">
                      Status: {event.status}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 text-sm py-2">No events</div>
        )}
      </div>
    </div>
  );
}