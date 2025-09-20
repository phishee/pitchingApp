import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { CalendarEvent } from '@/models';

interface EventPopupProps {
  event: CalendarEvent;
  position: { x: number; y: number };
  onClose: () => void;
}

export function EventPopup({ event, position, onClose }: EventPopupProps) {
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
      <PopoverContent className="w-64 p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">{event.service}</h3>
            <p className="text-sm text-gray-600">
              {new Date(event.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
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
        
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center">
              <span className="text-xs font-semibold text-purple-800">
                {event.clientName.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <div className="font-medium text-sm">{event.clientName}</div>
              <div className="text-xs text-gray-600">{event.service}</div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}