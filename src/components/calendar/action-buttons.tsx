import React from 'react';
import { Filter, Plus, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ActionButtonsProps {
  onEventTypeSelect?: (eventType: string) => void;
}

export function ActionButtons({ onEventTypeSelect }: ActionButtonsProps) {
  const handleEventTypeClick = (eventType: string) => {
    if (onEventTypeSelect) {
      onEventTypeSelect(eventType);
    }
    // You can add specific logic for each event type here
    console.log('Selected event type:', eventType);
  };

  return (
    <div className="flex items-center gap-3">
      {/* <Button variant="ghost" size="icon" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
        <Filter className="h-5 w-5 text-gray-600" />
      </Button> */}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="primary" 
            size="md"
            className="bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Event
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48" side="bottom" align="end">
          <DropdownMenuItem
            onClick={() => handleEventTypeClick('Assign Workout')}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            Assign Workout
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleEventTypeClick('Assign Assessment')}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            Assign Assessment
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleEventTypeClick('Book Session')}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-2 h-2 bg-orange-500 rounded-full" />
            Book Session
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}