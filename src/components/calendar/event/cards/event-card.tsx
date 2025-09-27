import React from 'react';
import { Clock, MapPin, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CalendarEvent, EVENT_COLORS } from '@/models';

interface EventCardProps {
  event: CalendarEvent;
  onClick?: (event: CalendarEvent) => void;
  compact?: boolean;
}

export function EventCard({ event, onClick, compact = false }: EventCardProps) {
  // Format time display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const timeDisplay = `${formatTime(event.startTime)} - ${formatTime(event.endTime)}`;
  
  // Get event color based on type and status
  const getEventColor = () => {
    return EVENT_COLORS[event.type]?.[event.status] || event.color || '#9E9E9E';
  };

  // Get status display
  const getStatusDisplay = () => {
    return event.status.replace('_', ' ').toLowerCase();
  };

  // Get participant role display
  // const getRoleDisplay = () => {
  //   return event.participants.role.charAt(0).toUpperCase() + event.participants.role.slice(1);
  // };

  if (compact) {
    return (
      <div
        className="rounded border mb-1 cursor-pointer hover:shadow-sm transition-shadow text-xs min-h-[40px] p-2 blue"
        style={{ 
          backgroundColor: getEventColor(),
          borderColor: getEventColor(),
          color: 'white'
        }}
        onClick={() => onClick?.(event)}
      >
        <div className="font-semibold truncate">{event.title}</div>
        <div className="opacity-80 truncate">{event.description}</div>
        <div className="flex items-center gap-1 opacity-70">
          <Clock className="h-2 w-2" />
          {timeDisplay}
        </div>
        {event.location && (
          <div className="flex items-center gap-1 opacity-70 truncate">
            <MapPin className="h-2 w-2" />
            {event.location}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card
      className="rounded-lg border p-2 mb-1 cursor-pointer hover:shadow-sm transition-shadow"
      style={{ 
        backgroundColor: getEventColor(),
        borderColor: getEventColor(),
        color: 'white'
      }}
      onClick={() => onClick?.(event)}
    >
      <CardContent className="p-0">
        <div className="font-semibold text-sm">{event.title}</div>
        <div className="text-xs opacity-80 mb-1">{event.description}</div>
        
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs opacity-70">
            <Clock className="h-3 w-3" />
            {timeDisplay}
          </div>
          
          {event.location && (
            <div className="flex items-center gap-1 text-xs opacity-70">
              <MapPin className="h-3 w-3" />
              {event.location}
            </div>
          )}
          
          <div className="flex items-center gap-1 text-xs opacity-70">
            <Users className="h-3 w-3" />
            {/* {getRoleDisplay()} */}
            {event.participants.isRequired && (
              <span className="bg-white bg-opacity-20 px-1 rounded text-xs">
                Required
              </span>
            )}
          </div>
        </div>
        
        <div className="mt-2 space-y-1">
          <div className="text-xs opacity-60 capitalize">
            Status: {getStatusDisplay()}
          </div>
          
          {event.isBookable && (
            <div className="text-xs opacity-80 bg-white bg-opacity-20 px-2 py-1 rounded">
              Bookable for coaching
            </div>
          )}
          
          {/* Event type specific info */}
          {event.workoutType && (
            <div className="text-xs opacity-70">
              Workout: {event.workoutType}
            </div>
          )}
          
          {event.opponent && (
            <div className="text-xs opacity-70">
              vs. {event.opponent}
            </div>
          )}
          
          {event.assessmentType && (
            <div className="text-xs opacity-70">
              Assessment: {event.assessmentType}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}