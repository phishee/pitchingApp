import React from 'react';
import { Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CalendarEvent } from '../../../../models';

interface EventCardProps {
  event: CalendarEvent;
  onClick?: (event: CalendarEvent) => void;
  compact?: boolean;
}

export function EventCard({ event, onClick, compact = false }: EventCardProps) {
  const colorClasses = {
    purple: 'bg-purple-100 border-purple-200 text-purple-800',
    green: 'bg-green-100 border-green-200 text-green-800',
    blue: 'bg-blue-100 border-blue-200 text-blue-800',
    orange: 'bg-orange-100 border-orange-200 text-orange-800'
  };

  if (compact) {
    return (
      <Card
        className={cn(
          'rounded border p-1 mb-1 cursor-pointer hover:shadow-sm transition-shadow text-xs',
          colorClasses[event.color]
        )}
        onClick={() => onClick?.(event)}
      >
        <CardContent className="p-0">
          <div className="font-semibold truncate">{event.clientName}</div>
          <div className="opacity-80 truncate">{event.service}</div>
          <div className="flex items-center gap-1 opacity-70">
            <Clock className="h-2 w-2" />
            {event.time}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'rounded-lg border p-2 mb-1 cursor-pointer hover:shadow-sm transition-shadow',
        colorClasses[event.color]
      )}
      onClick={() => onClick?.(event)}
    >
      <CardContent className="p-0">
        <div className="font-semibold text-sm">{event.clientName}</div>
        <div className="text-xs opacity-80 mb-1">{event.service}</div>
        <div className="flex items-center gap-1 text-xs opacity-70">
          <Clock className="h-3 w-3" />
          {event.time}
        </div>
      </CardContent>
    </Card>
  );
}