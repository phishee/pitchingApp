import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { CalendarEvent } from '@/models';
import { Clock, MapPin, Users } from 'lucide-react';

interface EventPopupProps {
  event: CalendarEvent;
  position: { x: number; y: number };
  onClose: () => void;
}

export function EventPopup({ event, position, onClose }: EventPopupProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Popover open={true} onOpenChange={onClose}>
      <PopoverTrigger asChild>
        <div
          className="fixed z-50"
          style={{
            left: position.x,
            top: position.y,
          }}
        />
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">{event.title}</h3>
            <p className="text-sm text-gray-600">{formatDate(event.startTime)}</p>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-gray-600 h-6 w-6"
          >
            ×
          </Button>
        </div>
        
        <Separator className="my-3" />
        
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            {formatTime(event.startTime)} - {formatTime(event.endTime)}
          </div>
          
          {event.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              {event.location}
            </div>
          )}
          
          {event.description && (
            <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
              {event.description}
            </div>
          )}
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Status:</span>
            <span className="capitalize text-gray-700">{event.status.replace('_', ' ')}</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}