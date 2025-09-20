import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarDay } from '@/models';
import { cn } from '@/lib/utils';
import { useCalendar } from '@/providers/calendar-context';

interface WeekViewProps {
  currentDate: Date;
  onEventClick: (event: any) => void;
}

// Time slot component for week view
interface WeekTimeSlotProps {
  time: string;
  weekDays: CalendarDay[];
  onEventClick: (event: any) => void;
}

function WeekTimeSlot({ time, weekDays, onEventClick }: WeekTimeSlotProps) {
  const [hour] = time.split(':');
  
  return (
    <div className="flex border-b border-gray-100 min-h-16">
      {/* Time Label - Fixed width to match header */}
      <div className="w-20 flex-shrink-0 p-3 text-sm text-gray-500 border-r border-gray-100">
        {time}
      </div>
      
      {/* Week Days Grid - Use flex-1 to fill remaining space */}
      <div className="flex-1 grid grid-cols-7">
        {weekDays.map((day, dayIndex) => {
          // Find events for this day and time slot
          const eventsInSlot = day.events.filter(event => {
            const [eventHour] = event.startTime.split(':');
            return parseInt(eventHour) === parseInt(hour);
          });

          return (
            <div
              key={dayIndex}
              className={cn(
                "p-2 border-r border-gray-100 last:border-r-0",
                day.isToday ? "bg-purple-50" : ""
              )}
            >
              {eventsInSlot.length > 0 ? (
                <div className="space-y-1">
                  {eventsInSlot.map((event) => (
                    <div
                      key={event.id}
                      className={cn(
                        'cursor-pointer hover:shadow-sm transition-shadow p-2 rounded text-xs',
                        {
                          'bg-purple-100 border border-purple-200 text-purple-800': event.color === 'purple',
                          'bg-green-100 border border-green-200 text-green-800': event.color === 'green',
                          'bg-blue-100 border border-blue-200 text-blue-800': event.color === 'blue',
                          'bg-orange-100 border border-orange-200 text-orange-800': event.color === 'orange',
                        }
                      )}
                      onClick={() => onEventClick(event)}
                    >
                      <div className="font-semibold truncate">{event.clientName}</div>
                      <div className="opacity-80 truncate">{event.service}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-300 text-xs py-1">-</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function WeekView({ currentDate, onEventClick }: WeekViewProps) {
  const { events } = useCalendar();
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const getWeekDays = (): CalendarDay[] => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    startOfWeek.setDate(diff);
    
    const weekDays: CalendarDay[] = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getDate() === date.getDate() &&
               eventDate.getMonth() === date.getMonth() &&
               eventDate.getFullYear() === date.getFullYear();
      });
      
      weekDays.push({
        date: date.getDate(),
        isCurrentMonth: date.getMonth() === currentDate.getMonth(),
        isToday: date.toDateString() === new Date().toDateString(),
        events: dayEvents,
        fullDate: date
      });
    }
    
    return weekDays;
  };

  // Generate time slots from 8 AM to 8 PM
  const timeSlots = [];
  for (let hour = 8; hour <= 20; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
  }

  const weekDaysData = getWeekDays();

  return (
    <Card className="h-[calc(100vh-12rem)] overflow-hidden">
      <CardContent className="p-0 h-full flex flex-col">
        {/* Week Day Headers - Fixed layout to match time slots */}
        <div className="flex bg-gray-50 flex-shrink-0">
          {/* Time column header - Fixed width to match time slots */}
          <div className="w-20 p-3 text-sm font-medium text-gray-600 border-r border-gray-200">
            Time
          </div>
          {/* Week days - Use flex-1 to fill remaining space */}
          <div className="flex-1 grid grid-cols-7">
            {weekDays.map((day, index) => (
              <div 
                key={day} 
                className={cn(
                  "p-3 text-center text-sm font-medium text-gray-600 border-r border-gray-200 last:border-r-0",
                  weekDaysData[index]?.isToday ? "bg-purple-100 text-purple-700" : ""
                )}
              >
                <div className="font-semibold">{day}</div>
                <div className="text-xs text-gray-500">
                  {weekDaysData[index]?.date}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Time Slots */}
        <ScrollArea className="flex-1">
          <div className="divide-y divide-gray-100">
            {timeSlots.map((time) => (
              <WeekTimeSlot
                key={time}
                time={time}
                weekDays={weekDaysData}
                onEventClick={onEventClick}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}