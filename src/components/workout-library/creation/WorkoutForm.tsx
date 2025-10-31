'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkoutActions, useWorkoutMetadata, useWorkoutUI, useWorkoutFlow, useWorkoutOrganization } from '@/providers/workout-context';
import { WorkoutFormStepper } from './WorkoutFormStepper';
import { WorkoutBasicInfoStep } from './steps/WorkoutBasicInfoStep';
import { WorkoutExercisesStep } from './steps/WorkoutExercisesStep';
import { WorkoutFlowStep } from './steps/WorkoutFlowStep';
import { WorkoutPreviewStep } from './steps/WorkoutPreviewStep';
import { Button } from '@/components/ui/button';
import { useOrganization } from '@/providers/organization-context';

const steps = [
  { id: 1, title: 'Basic Info', description: 'Workout details and settings' },
  { id: 2, title: 'Exercises', description: 'Select and configure exercises' },
  { id: 3, title: 'Flow', description: 'Organize workout sequence' },
  { id: 4, title: 'Preview', description: 'Review and finalize' }
];

export function WorkoutForm() {
  const router = useRouter();
  const { workoutMetadata } = useWorkoutMetadata();
  const { workoutFlow } = useWorkoutFlow();
  const { loading, error, isEditing, isDirty } = useWorkoutUI();
  const { createWorkout, updateWorkout, setWorkout, clearWorkout } = useWorkoutActions();
  const { currentOrganization } = useOrganization();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  // Initialize workout data for new workouts - only run once
  useEffect(() => {
    if (!isEditing && !isInitialized) {
      setWorkout({
        name: '',
        description: '',
        tags: [],
        flow: {
          questionnaires: [],
          warmup: [],
          exercises: [],
        },
      });
      setIsInitialized(true);
    }
  }, [isEditing, isInitialized, setWorkout]);

  useEffect(() => {
    if (currentOrganization) {
      setOrganizationId(currentOrganization._id);
    }
  }, [currentOrganization]);

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!workoutMetadata.name) return;

    try {
      setIsSubmitting(true);
      
      console.log('Submitting workout:', {
        isEditing,
        workoutId: workoutMetadata.id,
        organizationId,
        workoutData: {
          ...workoutMetadata,
          flow: workoutFlow,
        }
      });
      
      if (!organizationId) {
        throw new Error('Organization ID is required');
      }
      
      const workoutData = {
        ...workoutMetadata,
        flow: workoutFlow,
      };
      
      if (isEditing) {
        if (!workoutMetadata.id) {
          throw new Error('Workout ID is required for editing');
        }
        await updateWorkout(workoutMetadata.id, workoutData, organizationId);
      } else {
        await createWorkout(workoutData, organizationId);
      }
      
      // Redirect to workout library or detail page
      if (isEditing) {
        router.push(`/app/workout-library/${workoutMetadata.id}`);
      } else {
        router.push('/app/workout-library');
      }
    } catch (err) {
      console.error('Failed to save workout:', err);
      // Error is handled by the context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to leave?'
      );
      if (!confirmed) return;
    }
    
    clearWorkout();
    router.back();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <WorkoutBasicInfoStep />;
      case 2:
        return <WorkoutExercisesStep />;
      case 3:
        return <WorkoutFlowStep />;
      case 4:
        return <WorkoutPreviewStep />;
      default:
        return null;
    }
  };

  if (loading && isEditing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading workout...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 mb-4">Error: {error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show loading only while initializing for new workouts
  if (!isEditing && !isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Initializing workout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Edit Workout' : 'Create New Workout'}
              </h1>
              <p className="text-gray-600">
                {isEditing ? 'Update your workout details' : 'Build a custom workout for your team'}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="text-gray-600"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {steps && (
            <WorkoutFormStepper
              steps={steps}
              currentStep={currentStep}
              onStepClick={setCurrentStep}
            />
          )}

          <div className="mt-8">
            {renderStepContent()}
          </div>

          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            
            {currentStep < steps.length ? (
              <Button onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Workout')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}