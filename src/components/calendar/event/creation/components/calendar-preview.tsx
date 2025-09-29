import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WorkoutAssignmentData, CalendarDay } from '../work-assignment-types';

interface CalendarPreviewProps {
  scheduleConfig: WorkoutAssignmentData['scheduleConfig'];
  totalEvents: number;
}

export function CalendarPreview({
  scheduleConfig,
  totalEvents
}: CalendarPreviewProps) {
  const calendarDays = useMemo(() => {
    const days: CalendarDay[] = [];
    const startDate = new Date(scheduleConfig.startDate);
    const endDate = new Date(scheduleConfig.endDate);
    
    // Get first day of the month
    const firstDayOfMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const lastDayOfMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
    
    // Get the day of week for the first day
    const firstDayOfWeek = firstDayOfMonth.getDay();
    
    // Add padding days from previous month
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(firstDayOfMonth);
      date.setDate(date.getDate() - (i + 1));
      days.push({
        date,
        dayNumber: date.getDate(),
        hasEvent: false,
        isCurrentMonth: false
      });
    }
    
    // Add days of current month
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(startDate.getFullYear(), startDate.getMonth(), day);
      const dayOfWeek = date.getDay();
      const isInRange = date >= startDate && date <= endDate;
      const hasEvent = isInRange && scheduleConfig.daysOfWeek.includes(dayOfWeek);
      
      days.push({
        date,
        dayNumber: day,
        hasEvent,
        isCurrentMonth: true
      });
    }
    
    // Add padding days from next month to complete the grid
    const remainingDays = 35 - days.length; // 5 weeks * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(lastDayOfMonth);
      date.setDate(date.getDate() + i);
      days.push({
        date,
        dayNumber: date.getDate(),
        hasEvent: false,
        isCurrentMonth: false
      });
    }
    
    return days;
  }, [scheduleConfig]);

  const monthName = scheduleConfig.startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Calendar className="h-4 w-4" />
          Calendar Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-sm font-medium">{monthName}</div>
          
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day}>{day}</div>
            ))}
          </div>
          
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={cn(
                  "aspect-square flex items-center justify-center rounded text-sm transition-all",
                  day.isCurrentMonth ? "text-foreground" : "text-muted-foreground/40",
                  day.hasEvent && "bg-primary text-primary-foreground font-semibold ring-2 ring-primary ring-offset-1",
                  !day.hasEvent && day.isCurrentMonth && "hover:bg-muted"
                )}
              >
                {day.dayNumber}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-primary" />
              <span>Scheduled workout</span>
            </div>
            <span className="ml-auto">{totalEvents} total sessions</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

