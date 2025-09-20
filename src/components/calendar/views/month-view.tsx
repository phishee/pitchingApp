import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarDay } from '@/models';
import { CalendarDayComponent } from '../calendar-day';
import { useCalendar } from '@/providers/calendar-context';

interface MonthViewProps {
  currentDate: Date;
  onEventClick: (event: any) => void;
}

export function MonthView({ currentDate, onEventClick }: MonthViewProps) {
  const { events } = useCalendar();
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    
    // Adjust to start from Monday
    const dayOfWeek = firstDay.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(startDate.getDate() - daysToSubtract);
    
    const days: CalendarDay[] = [];
    const totalDays = 42; // 6 weeks * 7 days
    
    for (let i = 0; i < totalDays; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getDate() === date.getDate() &&
               eventDate.getMonth() === date.getMonth() &&
               eventDate.getFullYear() === date.getFullYear();
      });
      
      days.push({
        date: date.getDate(),
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === new Date().toDateString(),
        events: dayEvents,
        fullDate: date
      });
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Week Day Headers */}
        <div className="grid grid-cols-7 bg-gray-50">
          {weekDays.map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-600 border-r border-gray-200 last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => (
            <CalendarDayComponent
              key={index}
              day={day}
              onEventClick={onEventClick}
              view="month"
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
