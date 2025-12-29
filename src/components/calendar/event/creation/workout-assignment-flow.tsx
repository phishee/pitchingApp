'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useAssignmentOrchestrator } from '@/providers/workout-assignment/assignment-orchestrator.context';
import { useWorkoutSelection } from '@/providers/workout-assignment/workout-selection.context';
import { useAthleteSelection } from '@/providers/workout-assignment/athlete-selection.context';
import { useScheduleConfig } from '@/providers/workout-assignment/schedule-config.context';
import { useExercisePrescription } from '@/providers/workout-assignment/exercise-prescription.context';
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

interface WorkoutAssignmentFlowProps {
    availableMembers: Partial<TeamMemberWithUser>[];
    organizationId: string;
    teamId: string;
    onComplete: () => void;
    onCancel: () => void;
    initialWorkoutId?: string;
    initialAthleteId?: string;
}

export function WorkoutAssignmentFlow({
    availableMembers,
    organizationId,
    teamId,
    onComplete,
    onCancel,
    initialWorkoutId,
    initialAthleteId
}: WorkoutAssignmentFlowProps) {
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

    const { selectWorkout, clearWorkout, state: workoutState } = useWorkoutSelection();
    const { setSelectedAthletes, clearSelection } = useAthleteSelection();
    const { resetSchedule } = useScheduleConfig();
    const { resetPrescriptions } = useExercisePrescription();

    // Fetch workouts on mount
    useEffect(() => {
        fetchWorkouts();
    }, []);

    // Auto-select workout if initialWorkoutId is provided
    useEffect(() => {
        if (initialWorkoutId && availableWorkouts.length > 0) {
            const workout = availableWorkouts.find(w => w.id === initialWorkoutId);
            if (workout) {
                selectWorkout(workout);
            }
        }
    }, [initialWorkoutId, availableWorkouts, selectWorkout]);

    // Auto-select athlete if initialAthleteId is provided
    useEffect(() => {
        if (initialAthleteId && availableMembers.length > 0) {
            const member = availableMembers.find(m => m.userId === initialAthleteId || m._id === initialAthleteId);
            if (member && member.userId && member._id) {
                setSelectedAthletes([{
                    userId: member.userId,
                    memberId: member._id
                }]);
            }
        }
    }, [initialAthleteId, availableMembers, setSelectedAthletes]);

    const fetchWorkouts = async () => {
        setIsLoadingWorkouts(true);
        try {
            const response = await workoutApi.getWorkouts(
                {},
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

    const allSteps: { id: WizardStep; title: string; icon?: React.ReactNode }[] = [
        { id: 'athletes', title: 'Select Athletes' },
        { id: 'workout', title: 'Select Workout' },
        { id: 'prescriptions', title: 'Exercise Prescriptions' },
        { id: 'schedule', title: 'Configure Schedule' },
        { id: 'review', title: 'Review & Customize' }
    ];

    const steps = allSteps.filter(step => {
        if (step.id === 'prescriptions') {
            // Skip prescription step for bullpen assignments as they have their own configuration flow
            return workoutState.selectedWorkout?.sessionType !== 'bullpen';
        }
        return true;
    });

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

                // Clear all data
                clearSelection();
                clearWorkout();
                resetSchedule();
                resetPrescriptions();
                setCurrentStep('athletes');

                onComplete();
            }
        } catch (error) {
            console.error('Failed to create assignment:', error);
            toast.error('Failed to create assignment');
        }
    };

    return (
        <div className="flex flex-col">
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

            <div className="flex-1 flex gap-6 mt-4">
                {/* Main Content */}
                <div className="flex-1">
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
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <div className="flex gap-2">
                    <Button variant="outline" onClick={onCancel} disabled={state.isSubmitting}>
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
            </div>
        </div>
    );
}
