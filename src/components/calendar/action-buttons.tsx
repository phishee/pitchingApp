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
import { TeamMemberWithUser } from '@/models';
import { useCalendar } from '@/providers/calendar-context';

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
  onAddEvent = async () => { },
  organizationId,
  teamId,
  currentUserId,
}: ActionButtonsProps) {
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  
  // Get calendar refresh function
  const { refreshEvents } = useCalendar();

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
            onClick={handleOpenAssignmentDialog}  // ✅ Remove the nested button, just use the dropdown item
            className="flex items-center gap-2 cursor-pointer"
          >
            <Target className="h-4 w-4" />
            Assign Workout
          </DropdownMenuItem>
          {/* Other menu items */}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Workout Assignment Dialog - uses new orchestrator architecture */}
      <WorkoutAssignmentDialog
        isOpen={isAssignmentDialogOpen}
        onClose={handleCloseAssignmentDialog}
        availableMembers={availableMembers}
        organizationId={organizationId || ''}
        teamId={teamId || ''}
        currentUserId={currentUser?.userId || currentUserId || ''}
        onEventsCreated={refreshEvents}
      />
    </div>
  );
}