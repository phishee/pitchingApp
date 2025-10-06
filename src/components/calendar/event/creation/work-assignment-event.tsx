'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Target, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { WorkoutAssignmentDialogProps, WizardStep } from './work-assignment-types';
import { useWorkoutAssignment, useWorkouts, useExercisePrescriptions } from './work-assignment-hooks';
import { calculateTotalEvents, validateStep, generateEvents } from './work-assignment-utils';
import { ProgressIndicator } from './components/progress-indicator';
import { SummarySidebar } from './components/summary-sidebar';
import { Step1SelectAthletes } from './steps/step-1-athletes';
import { Step2SelectWorkout } from './steps/step-2-workout';
import { Step3ExercisePrescriptions } from './steps/step-3-prescriptions';
import { Step4ConfigureSchedule } from './steps/step-4-schedule';
import { Step5ReviewCustomize } from './steps/step-4-review';
// Import the new event creation context
import { useWorkoutEventCreation } from '@/providers/event-creation-context';

export function WorkoutAssignmentDialog({
  isOpen,
  onClose,
  selectedMembers: initialSelectedMembers,
  availableMembers = [],
  onAddEvent,
  organizationId = 'org-123',
  teamId = 'team-456',
  currentUserId = 'current-user'
}: WorkoutAssignmentDialogProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('athletes');
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [isAdvancedExpanded, setIsAdvancedExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Existing workout assignment hooks
  const { assignmentData, updateAssignmentData } = useWorkoutAssignment(initialSelectedMembers, organizationId);
  const { availableWorkouts, isLoadingWorkouts } = useWorkouts(organizationId, isOpen);
  const { exercisePrescriptions, isLoadingExercises, setExercisePrescriptions } = useExercisePrescriptions(assignmentData.selectedWorkout);

  // NEW: Use the event creation context for workout events
  const { 
    eventCreationData,
    updateEventData, 
    updateWorkoutDetails, 
    updateParticipants,
    updateRecurrence,
    generateEventCreationPayload,
    isEventDataValid,
    getValidationErrors
  } = useWorkoutEventCreation();

  // Sync assignment data with event creation context
  useEffect(() => {
    if (assignmentData.selectedWorkout) {
      // Update basic event data
      updateEventData({
        type: 'workout',
        title: `${assignmentData.selectedWorkout.name} - Week 1`,
        description: assignmentData.selectedWorkout.description || '',
        startTime: new Date(`${assignmentData.scheduleConfig.startDate.toISOString().split('T')[0]}T${assignmentData.scheduleConfig.defaultStartTime}:00`),
        endTime: new Date(`${assignmentData.scheduleConfig.startDate.toISOString().split('T')[0]}T${assignmentData.scheduleConfig.defaultEndTime}:00`),
        participants: {
          athletes: assignmentData.selectedMembers.map(member => ({
            userId: ('user' in member && member.user?.userId) || member.userId || '',
            memberId: member._id || ''
          })),
          coaches: [],
          required: assignmentData.selectedMembers.map(member => 
            ('user' in member && member.user?.userId) || member.userId || ''
          ).filter(Boolean),
          optional: []
        }
      });

      // Update workout-specific details
      updateWorkoutDetails({
        workoutId: assignmentData.selectedWorkout.id,
        sessionType: assignmentData.sessionType === 'coached' ? 'individual' : assignmentData.sessionType,
        estimatedDuration: 120, // Default 2 hours
        equipment: [],
        notes: assignmentData.notes,
        bookingInfo: {
          isBookingRequested: false,
          requestStatus: 'none'
        }
      });

      // Update recurrence if schedule is configured
      if (assignmentData.scheduleConfig.daysOfWeek.length > 0) {
        updateRecurrence({
          pattern: 'weekly',
          interval: 1,
          startDate: assignmentData.scheduleConfig.startDate,
          daysOfWeek: assignmentData.scheduleConfig.daysOfWeek,
          occurrences: assignmentData.scheduleConfig.numberOfWeeks * assignmentData.scheduleConfig.daysOfWeek.length
        });
      }
    }
  }, [assignmentData, updateEventData, updateWorkoutDetails, updateParticipants, updateRecurrence]);

  // Reset wizard when dialog opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('athletes');
      updateAssignmentData({ selectedMembers: initialSelectedMembers });
    }
  }, [isOpen, initialSelectedMembers, updateAssignmentData]);

  const handleAssignWorkouts = async () => {
    setIsSubmitting(true);
    try {
      // Use the new event creation context to generate events
      const payload = generateEventCreationPayload();
      // For now, we'll use the old generateEvents function until we fully migrate to the new context
      const events = generateEvents(assignmentData, organizationId, teamId, currentUserId);
      await Promise.all(events.map(event => onAddEvent(event)));
      onClose();
    } catch (error) {
      console.error('Failed to assign workouts:', error);
      // You could show validation errors here
      const errors = getValidationErrors();
      console.error('Validation errors:', errors);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedFromStep = useMemo(() => {
    return validateStep(currentStep, assignmentData);
  }, [currentStep, assignmentData]);

  const totalEvents = useMemo(() => {
    return calculateTotalEvents(assignmentData.scheduleConfig);
  }, [assignmentData.scheduleConfig]);

  // ... rest of your component remains the same
  const steps: { id: WizardStep; title: string; icon: React.ReactNode }[] = [
    { id: 'athletes', title: 'Select Athletes', icon: <Target className="h-4 w-4" /> },
    { id: 'workout', title: 'Select Workout', icon: <Target className="h-4 w-4" /> },
    { id: 'prescriptions', title: 'Exercise Prescriptions', icon: <Target className="h-4 w-4" /> },
    { id: 'schedule', title: 'Configure Schedule', icon: <Calendar className="h-4 w-4" /> },
    { id: 'review', title: 'Review & Customize', icon: <Target className="h-4 w-4" /> }
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

  const handlePrescriptionToggle = (exerciseId: string) => {
    updateAssignmentData({
      exercisePrescriptions: {
        ...assignmentData.exercisePrescriptions,
        [exerciseId]: {
          ...assignmentData.exercisePrescriptions[exerciseId],
          isPrescribed: !assignmentData.exercisePrescriptions[exerciseId]?.isPrescribed
        }
      }
    });

    setExercisePrescriptions(prev => 
      prev.map(prescription => 
        prescription.exerciseId === exerciseId 
          ? { ...prescription, isPrescribed: !prescription.isPrescribed }
          : prescription
      )
    );
  };

  const handleMetricChange = (exerciseId: string, metricId: string, value: any) => {
    updateAssignmentData({
      exercisePrescriptions: {
        ...assignmentData.exercisePrescriptions,
        [exerciseId]: {
          ...assignmentData.exercisePrescriptions[exerciseId],
          prescribedMetrics: {
            ...assignmentData.exercisePrescriptions[exerciseId]?.prescribedMetrics,
            [metricId]: value
          }
        }
      }
    });

    setExercisePrescriptions(prev => 
      prev.map(prescription => 
        prescription.exerciseId === exerciseId 
          ? {
              ...prescription,
              prescribedMetrics: {
                ...prescription.prescribedMetrics,
                [metricId]: value
              }
            }
          : prescription
      )
    );
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
          steps={steps} 
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
              <Step1SelectAthletes
                assignmentData={assignmentData}
                onAssignmentDataChange={updateAssignmentData}
                availableMembers={availableMembers}
                searchQuery={memberSearchQuery}
                onSearchChange={setMemberSearchQuery}
              />
            )}

            {currentStep === 'workout' && (
              <Step2SelectWorkout
                assignmentData={assignmentData}
                onAssignmentDataChange={updateAssignmentData}
                availableWorkouts={availableWorkouts}
                isLoadingWorkouts={isLoadingWorkouts}
              />
            )}

            {currentStep === 'prescriptions' && (
              <Step3ExercisePrescriptions
                assignmentData={assignmentData}
                onAssignmentDataChange={updateAssignmentData}
                selectedWorkout={assignmentData.selectedWorkout}
              />
            )}

            {currentStep === 'schedule' && (
              <Step4ConfigureSchedule
                assignmentData={assignmentData}
                onAssignmentDataChange={updateAssignmentData}
              />
            )}

            {currentStep === 'review' && (
              <Step5ReviewCustomize
                assignmentData={assignmentData}
                onAssignmentDataChange={updateAssignmentData}
                exercisePrescriptions={exercisePrescriptions}
                isLoadingExercises={isLoadingExercises}
                isAdvancedExpanded={isAdvancedExpanded}
                onToggleAdvanced={() => setIsAdvancedExpanded(!isAdvancedExpanded)}
                onPrescriptionToggle={handlePrescriptionToggle}
                onMetricChange={handleMetricChange}
                totalEvents={totalEvents}
              />
            )}
          </div>

          {/* Summary Sidebar */}
          <SummarySidebar
            assignmentData={assignmentData}
            totalEvents={totalEvents}
            currentStep={currentStep}
          />
        </div>

        {/* Footer Navigation */}
        <DialogFooter className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
          
          <div className="flex gap-2">
            {currentStepIndex > 0 && (
              <Button 
                variant="outline" 
                onClick={handleBack}
                disabled={isSubmitting}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            
            {currentStepIndex < steps.length - 1 ? (
              <Button 
                onClick={handleNext}
                disabled={!canProceedFromStep}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button 
                onClick={handleAssignWorkouts}
                disabled={!canProceedFromStep || isSubmitting || !isEventDataValid()}
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                {isSubmitting ? 'Creating...' : `Create ${totalEvents} Calendar Events`}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}