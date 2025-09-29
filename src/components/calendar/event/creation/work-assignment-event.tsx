'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Target, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { WorkoutAssignmentDialogProps, WizardStep } from './work-assignment-types';
import { useWorkoutAssignment, useWorkouts, useExercisePrescriptions } from './work-assignment-hooks';
import { generateEvents, calculateTotalEvents, validateStep } from './work-assignment-utils';
import { ProgressIndicator } from './components/progress-indicator';
import { SummarySidebar } from './components/summary-sidebar';
import { Step1SelectAthletes } from './steps/step-1-athletes';
import { Step2SelectWorkout } from './steps/step-2-workout';
import { Step3ConfigureSchedule } from './steps/step-3-schedule';
import { Step4ReviewCustomize } from './steps/step-4-review';

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

  const { assignmentData, updateAssignmentData } = useWorkoutAssignment(initialSelectedMembers, organizationId);
  const { availableWorkouts, isLoadingWorkouts } = useWorkouts(organizationId, isOpen);
  const { exercisePrescriptions, isLoadingExercises, setExercisePrescriptions } = useExercisePrescriptions(assignmentData.selectedWorkout);

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
      const events = generateEvents(assignmentData, organizationId, teamId, currentUserId);
      await Promise.all(events.map(event => onAddEvent(event)));
      onClose();
    } catch (error) {
      console.error('Failed to assign workouts:', error);
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

  const steps: { id: WizardStep; title: string; icon: React.ReactNode }[] = [
    { id: 'athletes', title: 'Select Athletes', icon: <Target className="h-4 w-4" /> },
    { id: 'workout', title: 'Select Workout', icon: <Target className="h-4 w-4" /> },
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

            {currentStep === 'schedule' && (
              <Step3ConfigureSchedule
                assignmentData={assignmentData}
                onAssignmentDataChange={updateAssignmentData}
              />
            )}

            {currentStep === 'review' && (
              <Step4ReviewCustomize
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
                disabled={!canProceedFromStep || isSubmitting}
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