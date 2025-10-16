'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Target, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { AssignmentOrchestratorProvider, useAssignmentOrchestrator } from '@/providers/workout-assignment/assignment-orchestrator.context';
import { TeamMemberWithUser, Workout } from '@/models';
import { ProgressIndicator } from './components/progress-indicator';
import { SummarySidebar } from './components/summary-sidebar';
import { Step1SelectAthletes } from './steps/step-1-athletes';
import { Step2SelectWorkout } from './steps/step-2-workout';
import { Step3ExercisePrescriptions } from './steps/step-3-prescriptions';
import { Step4ConfigureSchedule } from './steps/step-4-schedule';
import { Step5ReviewCustomize } from './steps/step-5-review';
import { toast } from 'sonner';
import { workoutApi } from '@/app/services-client/workoutApi';

type WizardStep = 'athletes' | 'workout' | 'prescriptions' | 'schedule' | 'review';

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
  const [currentStep, setCurrentStep] = useState<WizardStep>('athletes');
  const [availableWorkouts, setAvailableWorkouts] = useState<Workout[]>([]);
  const [isLoadingWorkouts, setIsLoadingWorkouts] = useState(false);

  const {
    createAssignment,
    isValid,
    getTotalEvents,
    getValidationErrors,
    state
  } = useAssignmentOrchestrator();

  // Fetch workouts when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchWorkouts();
      setCurrentStep('athletes'); // Reset to first step
    }
  }, [isOpen]);

  const fetchWorkouts = async () => {
    setIsLoadingWorkouts(true);
    try {
      const response = await workoutApi.getWorkouts(
        {
          organizationId,
          teamId,
          page: 1,
          limit: 100
        },
        organizationId
      );
      setAvailableWorkouts(response.data);
    } catch (error) {
      console.error('Failed to fetch workouts:', error);
      toast.error('Failed to load workouts');
      setAvailableWorkouts([]);
    } finally {
      setIsLoadingWorkouts(false);
    }
  };

  const steps: { id: WizardStep; title: string; icon?: React.ReactNode }[] = [
    { id: 'athletes', title: 'Select Athletes' },
    { id: 'workout', title: 'Select Workout' },
    { id: 'prescriptions', title: 'Exercise Prescriptions' },
    { id: 'schedule', title: 'Configure Schedule' },
    { id: 'review', title: 'Review & Customize' }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id);
    }
  };

  const handleSubmit = async () => {
    if (!isValid()) {
      const errors = getValidationErrors();
      toast.error(`Cannot create assignment: ${errors.join(', ')}`);
      return;
    }

    try {
      const result = await createAssignment();

      if (result.success) {
        toast.success(`Created ${result.totalCreated} calendar events`);
        
        // Refresh calendar events if callback provided
        if (onEventsCreated) {
          await onEventsCreated();
        }
        
        onClose();
      }
    } catch (error) {
      console.error('Failed to create assignment:', error);
      toast.error('Failed to create assignment');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Assign Workout to Athletes
          </DialogTitle>
        </DialogHeader>

        {/* Progress Indicator */}
        <ProgressIndicator
          steps={steps as { id: WizardStep; title: string; icon?: React.ReactNode }[]}
          currentStepIndex={currentStepIndex}
          onStepClick={(index) => {
            if (index <= currentStepIndex) {
              setCurrentStep(steps[index].id);
            }
          }}
        />

        <div className="flex-1 overflow-hidden flex gap-6">
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            {currentStep === 'athletes' && (
              <Step1SelectAthletes availableMembers={availableMembers} />
            )}
            {currentStep === 'workout' && (
              <Step2SelectWorkout 
                availableWorkouts={availableWorkouts}
                isLoadingWorkouts={isLoadingWorkouts}
              />
            )}
            {currentStep === 'prescriptions' && <Step3ExercisePrescriptions />}
            {currentStep === 'schedule' && <Step4ConfigureSchedule />}
            {currentStep === 'review' && <Step5ReviewCustomize />}
          </div>

          {/* Summary Sidebar */}
          <SummarySidebar totalEvents={getTotalEvents()} currentStep={currentStep} />
        </div>

        {/* Footer Navigation */}
        <DialogFooter className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={state.isSubmitting}>
              Cancel
            </Button>
          </div>

          <div className="flex gap-2">
            {currentStepIndex > 0 && (
              <Button variant="outline" onClick={handleBack} disabled={state.isSubmitting}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}

            {currentStepIndex < steps.length - 1 ? (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                // disabled={!isValid() || state.isSubmitting}
              >
                {state.isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  `Create ${getTotalEvents()} Events`
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
