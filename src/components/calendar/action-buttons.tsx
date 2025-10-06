// In action-buttons.tsx
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
import { EventCreationProvider, useEventCreation} from '@/providers/event-creation-context';
import { TeamMemberWithUser } from '@/models';

interface ActionButtonsProps {
  onEventTypeSelect?: (eventType: string) => void;
  selectedMembers?: Partial<TeamMemberWithUser>[];
  availableMembers?: Partial<TeamMemberWithUser>[];
  onAddEvent?: (event: any) => Promise<void>;
  organizationId?: string;
  teamId?: string;
  currentUserId?: string;
}

export function ActionButtons({
  onEventTypeSelect,
  selectedMembers = [],
  availableMembers = [],
  onAddEvent = async () => {},
  organizationId,
  teamId,
  currentUserId,
}: ActionButtonsProps) {
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);

  const handleEventTypeClick = (eventType: string) => {
    onEventTypeSelect?.(eventType);
  };

  const handleOpenAssignmentDialog = () => {
    setIsAssignmentDialogOpen(true);
  };

  const handleCloseAssignmentDialog = () => {
    setIsAssignmentDialogOpen(false);
  };

  // Get the current user from selectedMembers (the user whose calendar we're viewing)
  const currentUser = selectedMembers.length > 0 ? selectedMembers[0] : null;

  return (
    <div className="flex items-center gap-2">
      {/* Your existing buttons */}
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
          {/* Other menu items */}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Wrap the dialog with EventCreationProvider */}
      <EventCreationProvider
        organizationId={organizationId || ''}
        teamId={teamId || ''}
        currentUserId={currentUser?.userId || currentUserId || ''} // Use current user from selectedMembers
        initialEventType="workout"
      >
        <WorkoutAssignmentDialog
          isOpen={isAssignmentDialogOpen}
          onClose={handleCloseAssignmentDialog}
          selectedMembers={selectedMembers}
          availableMembers={availableMembers}
          onAddEvent={onAddEvent as (event: any) => Promise<void>}
          organizationId={organizationId}
          teamId={teamId}
          currentUserId={currentUser?.userId || currentUserId || ''} // Pass the same current user
        />
      </EventCreationProvider>
    </div>
  );
}