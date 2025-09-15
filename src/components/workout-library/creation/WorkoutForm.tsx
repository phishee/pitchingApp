'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkout } from '@/providers/workout-context';
import { WorkoutFormStepper } from './WorkoutFormStepper';
import { WorkoutBasicInfoStep } from './steps/WorkoutBasicInfoStep';
import { WorkoutExercisesStep } from './steps/WorkoutExercisesStep';
import { WorkoutFlowStep } from './steps/WorkoutFlowStep';
import { WorkoutPreviewStep } from './steps/WorkoutPreviewStep';
import { Button } from '@/components/ui/button';

const steps = [
  { id: 1, title: 'Basic Info', description: 'Workout details and settings' },
  { id: 2, title: 'Exercises', description: 'Select and configure exercises' },
  { id: 3, title: 'Flow', description: 'Organize workout sequence' },
  { id: 4, title: 'Preview', description: 'Review and finalize' }
];

export function WorkoutForm() {
  const router = useRouter();
  const { 
    workout, 
    loading, 
    error, 
    isEditing, 
    isDirty,
    createWorkout,
    updateWorkout,
    setWorkout,
    clearWorkout
  } = useWorkout();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize workout data for new workouts
  useEffect(() => {
    if (!isEditing && !workout) {
      setWorkout({
        name: '',
        description: '',
        tags: [],
        flow: {
          questionnaires: [],
          warmup: [],
          exercises: [],
          // rest_between_exercises: 30,
          // rest_between_sets: 60
        },
        // difficulty: 'beginner',
        // estimated_duration: 30,
        // image: '',
        // is_template: false
      });
    }
  }, [isEditing, workout, setWorkout]);

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!workout) return;

    try {
      setIsSubmitting(true);
      
      // TODO: Get organizationId from context or props
      const organizationId = 'org_001'; // This should come from your auth context
      
      if (isEditing) {
        await updateWorkout(workout.id!, workout, organizationId);
      } else {
        await createWorkout(workout, organizationId);
      }
      
      // Redirect to workout library or detail page
      if (isEditing) {
        router.push(`/app/workout-library/${workout.id}`);
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
    if (!workout) return null;
    
    switch (currentStep) {
      case 1:
        return (
          <WorkoutBasicInfoStep
            data={workout}
            onUpdate={(data) => setWorkout({ ...workout, ...data })}
          />
        );
      case 2:
        return (
          <WorkoutExercisesStep
            data={workout}
            onUpdate={(data) => setWorkout({ ...workout, ...data })}
          />
        );
      case 3:
        return (
          <WorkoutFlowStep
            data={workout}
            onUpdate={(data) => setWorkout({ ...workout, ...data })}
          />
        );
      case 4:
        return (
          <WorkoutPreviewStep
            data={workout}
            onUpdate={(data) => setWorkout({ ...workout, ...data })}
          />
        );
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

  if (!workout) {
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
        {/* ... existing header code ... */}
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