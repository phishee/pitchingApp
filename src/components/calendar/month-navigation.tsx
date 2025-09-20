import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CalendarView } from '../../models';

interface MonthNavigationProps {
  currentDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  view: CalendarView;
}

export function MonthNavigation({ currentDate, onPreviousMonth, onNextMonth, view }: MonthNavigationProps) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getWeekRange = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    startOfWeek.setDate(diff);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return { startOfWeek, endOfWeek };
  };

  const formatDateRange = () => {
    if (view === 'week') {
      const { startOfWeek, endOfWeek } = getWeekRange(currentDate);
      const startMonth = monthNames[startOfWeek.getMonth()];
      const endMonth = monthNames[endOfWeek.getMonth()];
      const startYear = startOfWeek.getFullYear();
      const endYear = endOfWeek.getFullYear();
      
      if (startMonth === endMonth && startYear === endYear) {
        return `${startMonth} ${startOfWeek.getDate()}-${endOfWeek.getDate()}, ${startYear}`;
      } else if (startYear === endYear) {
        return `${startMonth} ${startOfWeek.getDate()} - ${endMonth} ${endOfWeek.getDate()}, ${startYear}`;
      } else {
        return `${startMonth} ${startOfWeek.getDate()}, ${startYear} - ${endMonth} ${endOfWeek.getDate()}, ${endYear}`;
      }
    } else if (view === 'day') {
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;
    }
    return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  };

  return (
    <div className="flex items-center gap-4">
      <Button
        onClick={onPreviousMonth}
        variant="ghost"
        size="icon"
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <h2 className="text-xl font-semibold text-gray-900">
        {formatDateRange()}
      </h2>
      <Button
        onClick={onNextMonth}
        variant="ghost"
        size="icon"
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}