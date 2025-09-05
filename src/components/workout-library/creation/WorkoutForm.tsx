'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Import step components
import { WorkoutFormStepper } from './WorkoutFormStepper';
import { WorkoutBasicInfoStep } from './steps/WorkoutBasicInfoStep';
import { WorkoutExercisesStep } from './steps/WorkoutExercisesStep';
import { WorkoutFlowStep } from './steps/WorkoutFlowStep';
import { WorkoutPreviewStep } from './steps/WorkoutPreviewStep';

interface WorkoutFormProps {
  mode: 'create' | 'edit';
  initialData: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

const defaultWorkoutData = {
  name: '',
  description: '',
  tags: [],
  coverImage: '',
  exercises: [],
  flow: {
    warmup: [],
    questionnaires: [],
    exercises: []
  },
  teamIds: []
};

const steps = [
  { id: 1, title: 'Basic Info', description: 'Workout details and settings' },
  { id: 2, title: 'Exercises', description: 'Select and configure exercises' },
  { id: 3, title: 'Flow', description: 'Organize workout sequence' },
  { id: 4, title: 'Preview', description: 'Review and finalize' }
];

export function WorkoutForm({ mode, initialData, onSave, onCancel }: WorkoutFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [workoutData, setWorkoutData] = useState(defaultWorkoutData);

  useEffect(() => {
    if (initialData) {
      setWorkoutData(initialData);
    }
  }, [initialData]);

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = () => {
    onSave(workoutData);
  };

  const handlePreview = () => {
    console.log('Previewing workout:', workoutData);
    // TODO: Implement preview logic
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <WorkoutBasicInfoStep
            data={workoutData}
            onUpdate={(data) => setWorkoutData({ ...workoutData, ...data })}
          />
        );
      case 2:
        return (
          <WorkoutExercisesStep
            data={workoutData}
            onUpdate={(data) => setWorkoutData({ ...workoutData, ...data })}
          />
        );
      case 3:
        return (
          <WorkoutFlowStep
            data={workoutData}
            onUpdate={(data) => setWorkoutData({ ...workoutData, ...data })}
          />
        );
      case 4:
        return (
          <WorkoutPreviewStep
            data={workoutData}
            onUpdate={(data) => setWorkoutData({ ...workoutData, ...data })}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onCancel}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {mode === 'create' ? 'Create Workout' : 'Edit Workout'}
                </h1>
                <p className="text-sm text-gray-600">
                  Step {currentStep} of {steps.length}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handlePreview}
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Preview
              </Button>
              <Button
                onClick={handleSave}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {mode === 'create' ? 'Create Workout' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <WorkoutFormStepper
            steps={steps}
            currentStep={currentStep}
            onStepClick={setCurrentStep}
          />

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
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handlePreview}
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Preview
              </Button>
              
              {currentStep < steps.length ? (
                <Button onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleSave} className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {mode === 'create' ? 'Create Workout' : 'Save Changes'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}