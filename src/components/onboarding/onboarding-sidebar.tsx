// /components/onboarding/onboarding-sidebar.tsx
'use client';

import React from 'react';
import { Check } from 'lucide-react';
import Image from 'next/image';

type Step = {
  id: string;
  title: string;
  description: string;
  icon: any;
  component?: any;
};

interface OnboardingSidebarProps {
  steps: Step[];
  currentStepIndex: number;
  userData: any;
  showWelcome: boolean;
}

export function OnboardingSidebar({ steps, currentStepIndex, userData, showWelcome }: OnboardingSidebarProps) {
  console.log('userData', userData);
  if (showWelcome) {
    return (
      <div className="w-80 bg-gradient-to-br from-blue-600 to-blue-800 flex flex-col h-full">
        <div className="p-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <Image 
                src="/assets/images/logo-3.png" 
                alt="Logo" 
                width={24} 
                height={24} 
                className="w-6 h-6 rounded" 
              />
            </div>
            <span className="text-xl font-bold text-white">Optimal Throws</span>
          </div>
        </div>

        <div className="flex-1 p-6 flex flex-col justify-center">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-white">
              Welcome, {userData?.name}!
            </h2>
            <p className="text-blue-100">
              You're just a few steps away from completing your setup and getting started with Optimal Throws.
            </p>
            <div className="mt-8">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                <Image 
                  src={userData?.profileImageUrl || '/assets/images/default_profile.png'} 
                  alt="Profile" 
                  width={72}  // ✅ Add width (w-18 = 72px)
                  height={72} // ✅ Add height (h-18 = 72px)
                  className="w-18 h-18 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <Image 
              src="/assets/images/logo-3.png" 
              alt="Logo" 
              width={24} 
              height={24} 
              className="w-6 h-6 rounded" 
            />
          </div>
          <span className="text-xl font-bold text-gray-900">Optimal Throws</span>
        </div>
      </div>

      <div className="flex-1 p-8">
        <div className="space-y-8">
          {steps.map((step: Step, index: number) => {
            const IconComponent = step.icon;
            const isCompleted = currentStepIndex > index;
            const isCurrent = currentStepIndex === index;
            
            return (
              <div key={step.id}>
                <div className="flex items-start space-x-4">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 flex-shrink-0 ${
                      isCompleted
                        ? 'bg-green-500 border-green-500 text-white'
                        : isCurrent
                        ? 'border-primary text-primary'
                        : 'border-gray-300 text-gray-400'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : IconComponent ? (
                      <IconComponent className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className={`text-base font-medium mb-1 ${
                      currentStepIndex >= index ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                    <p className={`text-sm ${
                      currentStepIndex >= index ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-px h-8 ml-5 mt-2 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

