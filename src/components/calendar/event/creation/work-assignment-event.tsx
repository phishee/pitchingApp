'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Target } from 'lucide-react';
import { AssignmentOrchestratorProvider } from '@/providers/workout-assignment/assignment-orchestrator.context';
import { TeamMemberWithUser } from '@/models';
import { WorkoutAssignmentFlow } from './workout-assignment-flow';

interface WorkoutAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  availableMembers: Partial<TeamMemberWithUser>[];
  organizationId: string;
  teamId: string;
  currentUserId: string;
  onEventsCreated?: () => Promise<void>;
}

export function WorkoutAssignmentDialog({
  isOpen,
  onClose,
  availableMembers,
  organizationId,
  teamId,
  currentUserId,
  onEventsCreated
}: WorkoutAssignmentDialogProps) {
  return (
    <AssignmentOrchestratorProvider
      organizationId={organizationId}
      teamId={teamId}
      currentUserId={currentUserId}
    >
      <WorkoutAssignmentDialogContent
        isOpen={isOpen}
        onClose={onClose}
        availableMembers={availableMembers}
        organizationId={organizationId}
        teamId={teamId}
        onEventsCreated={onEventsCreated}
      />
    </AssignmentOrchestratorProvider>
  );
}

interface WorkoutAssignmentDialogContentProps {
  isOpen: boolean;
  onClose: () => void;
  availableMembers: Partial<TeamMemberWithUser>[];
  organizationId: string;
  teamId: string;
  onEventsCreated?: () => Promise<void>;
}

function WorkoutAssignmentDialogContent({
  isOpen,
  onClose,
  availableMembers,
  organizationId,
  teamId,
  onEventsCreated
}: WorkoutAssignmentDialogContentProps) {

  const handleComplete = async () => {
    if (onEventsCreated) {
      await onEventsCreated();
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Assign Workout to Athletes
          </DialogTitle>
        </DialogHeader>

        <WorkoutAssignmentFlow
          availableMembers={availableMembers}
          organizationId={organizationId}
          teamId={teamId}
          onComplete={handleComplete}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
