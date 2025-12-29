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
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const timeDisplay = `${formatTime(event.startTime)} - ${formatTime(event.endTime)}`;

  // Get event color based on type and status
  const eventColor = EVENT_COLORS[event.type]?.[event.status] || event.color || '#9E9E9E';

  // Get status display
  const getStatusDisplay = () => {
    return event.status.replace('_', ' ');
  };

  // Get source type display
  const getSourceTypeDisplay = () => {
    if (event.sourceType) {
      return event.sourceType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
    return event.type.charAt(0).toUpperCase() + event.type.slice(1);
  };

  const sourceTypeDisplay = getSourceTypeDisplay();

  if (compact) {
    return (
      <div
        className="rounded-md border-t-4 cursor-pointer hover:shadow-md transition-all text-xs p-1.5 bg-white border-gray-100 shadow-sm overflow-hidden w-full max-w-full flex flex-col gap-1"
        style={{
          borderTopColor: eventColor,
        }}
        onClick={() => onClick?.(event)}
      >
        <div className="font-semibold truncate text-gray-900 leading-tight">{event.title}</div>
        <div className="flex items-center gap-1 text-[10px] text-gray-500 truncate">
          <Clock className="h-2.5 w-2.5 flex-shrink-0" />
          <span className="truncate">{timeDisplay}</span>
        </div>
      </div>
    );
  }

  return (
    <Card
      className="rounded-lg border-0 border-t-4 shadow-sm cursor-pointer hover:shadow-md transition-all bg-white group w-full max-w-full overflow-hidden"
      style={{
        borderTopColor: eventColor,
      }}
      onClick={() => onClick?.(event)}
    >
      <CardContent className="p-2">
        {/* Top Row: Status (Right) & Title (Left) - Title takes precedence */}
        <div className="flex justify-between items-start gap-2 mb-1">
          <h3 className="font-bold text-gray-900 text-xs leading-tight line-clamp-2 w-full" title={event.title}>
            {event.title}
          </h3>

          {/* Status Dot (Compact) */}
          <div className="flex-shrink-0 pt-1" title={getStatusDisplay()}>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: eventColor }} />
          </div>
        </div>

        {/* Middle: Type & Time Stacked */}
        <div className="space-y-0.5 mb-2">
          <p className="text-[10px] text-gray-500 font-medium truncate">
            {sourceTypeDisplay}
          </p>
          <div className="flex items-center gap-1 text-[10px] text-gray-400 truncate">
            <Clock className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{timeDisplay}</span>
          </div>
        </div>

        {/* Bottom: Assignees */}
        <div className="flex items-center justify-between pt-1.5 border-t border-gray-50 gap-2 min-w-0">
          <div className="flex -space-x-1.5 overflow-hidden flex-shrink-0">
            {event.assignees && event.assignees.length > 0 ? (
              event.assignees.slice(0, 4).map((assignee, i) => (
                <div key={i} className="inline-block h-4 w-4 rounded-full ring-1 ring-white bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0" title={assignee.name}>
                  {assignee.profileImageUrl ? (
                    <img src={assignee.profileImageUrl} alt={assignee.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-[7px] font-medium text-gray-600">
                      {(assignee.name || 'U').charAt(0)}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <span className="text-[9px] text-gray-300 italic">No assignees</span>
            )}
          </div>
        </div>

      </CardContent>
    </Card>
  );
}