// /components/onboarding/mobile-progress-bar.tsx
'use client';

import React from 'react';

type Step = {
  id: string;
  title: string;
  description: string;
  icon: any;
  component?: any;
};

interface MobileProgressBarProps {
  steps: Step[];
  currentStepIndex: number;
}

export function MobileProgressBar({ steps, currentStepIndex }: MobileProgressBarProps) {
  return (
    <div className="mb-6 px-4">
      <div className="flex items-center justify-between">
        {steps.map((step: Step, index: number) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                  index < currentStepIndex
                    ? "bg-primary border-primary text-white"
                    : index === currentStepIndex
                    ? "border-primary text-primary bg-white"
                    : "border-gray-300 text-gray-400 bg-white"
                }`}
              >
                {index < currentStepIndex ? '✓' : index + 1}
              </div>
              <p className={`text-xs mt-1 ${
                index <= currentStepIndex ? "text-gray-900" : "text-gray-500"
              }`}>
                {step.title.split(' ')[0]}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 ${
                  index < currentStepIndex ? "bg-primary" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}