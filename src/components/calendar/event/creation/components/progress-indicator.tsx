import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WizardStep } from '../work-assignment-types';

interface ProgressIndicatorProps {
  steps: { id: WizardStep; title: string; icon?: React.ReactNode }[];
  currentStepIndex: number;
  onStepClick: (index: number) => void;
}

export function ProgressIndicator({ 
  steps, 
  currentStepIndex,
  onStepClick
}: ProgressIndicatorProps) {
  return (
    <div className="flex items-center justify-between mb-6 px-4">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <button
            onClick={() => onStepClick(index)}
            disabled={index > currentStepIndex}
            className={cn(
              "flex items-center gap-2 transition-all",
              index === currentStepIndex && "text-primary font-medium",
              index < currentStepIndex && "text-muted-foreground cursor-pointer hover:text-foreground",
              index > currentStepIndex && "text-muted-foreground/50 cursor-not-allowed"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
              index === currentStepIndex && "border-primary bg-primary text-white shadow-md",
              index < currentStepIndex && "border-green-500 bg-green-500 text-white",
              index > currentStepIndex && "border-muted bg-muted/50"
            )}>
              {index < currentStepIndex ? (
                <Check className="h-5 w-5" />
              ) : (
                step.icon || <span className="text-sm font-bold">{index + 1}</span>
              )}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-sm font-medium">{step.title}</div>
              <div className="text-xs text-muted-foreground">Step {index + 1}</div>
            </div>
          </button>
          
          {index < steps.length - 1 && (
            <div className={cn(
              "flex-1 h-0.5 mx-2 transition-all",
              index < currentStepIndex ? "bg-green-500" : "bg-muted"
            )} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
