import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CalendarView } from '../../models';

interface ViewToggleProps {
  currentView: CalendarView;
  onViewChange: (view: CalendarView) => void;
}

export function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
  const views = [
    { key: 'month', label: 'Month' },
    { key: 'week', label: 'Week' },
    { key: 'day', label: 'Day' }
  ] as const;

  return (
    <div className="flex bg-gray-100 p-1 rounded-full">
      {views.map((view) => (
        <Button
          key={view.key}
          onClick={() => onViewChange(view.key)}
          variant={currentView === view.key ? 'primary' : 'ghost'}
          size="sm"
          className={cn(
            'px-4 py-2 text-sm font-medium transition-colors rounded-full',
            currentView === view.key
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white'
          )}
        >
          {view.label}
        </Button>
      ))}
    </div>
  );
}