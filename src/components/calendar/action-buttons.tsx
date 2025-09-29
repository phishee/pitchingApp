import React, { useState } from 'react';
import { Filter, Plus, ChevronDown, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { WorkoutAssignmentDialog } from './event/creation/work-assignment-event';
import { TeamMemberWithUser } from '@/models';

interface ActionButtonsProps {
  onEventTypeSelect?: (eventType: string) => void;
  selectedMembers?: TeamMemberWithUser[];
  availableMembers?: TeamMemberWithUser[];
  onAddEvent?: (event: any) => Promise<void>;
  organizationId?: string;
  teamId?: string;
  currentUserId?: string;
}

export function ActionButtons({
  onEventTypeSelect,
  selectedMembers,
  availableMembers = [], // Add default empty array
  onAddEvent = async () => {},
  organizationId,
  teamId,
  currentUserId,
}: ActionButtonsProps) {
  const handleEventTypeClick = (eventType: string) => {
    if (onEventTypeSelect) {
      onEventTypeSelect(eventType);
    }
    // You can add specific logic for each event type here
    console.log('Selected event type:', eventType);
  };

  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);

  const handleOpenAssignmentDialog = () => {
    setIsAssignmentDialogOpen(true);
  };

  const handleCloseAssignmentDialog = () => {
    setIsAssignmentDialogOpen(false);
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
            <Button 
              onClick={handleOpenAssignmentDialog}
              className="flex items-center gap-2"
            >
              <Target className="h-4 w-4" />
              Assign Workout
            </Button>
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

      <WorkoutAssignmentDialog
        isOpen={isAssignmentDialogOpen}
        onClose={handleCloseAssignmentDialog}
        selectedMembers={selectedMembers}
        availableMembers={availableMembers} // Pass the available members
        onAddEvent={onAddEvent as (event: any) => Promise<void>}
        organizationId={organizationId}
        teamId={teamId}
        currentUserId={currentUserId}
      />
    </div>
  );
}