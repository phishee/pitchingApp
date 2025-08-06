// app/onboarding/page.tsx
'use client';

import React from 'react';
import OnboardingFlow from '@/components/onboarding/onboarding-flow';
import { OnboardingProvider } from '@/providers/onboarding-context';

export default function OnboardingPage() {
  return (
    <div className="h-screen w-screen overflow-hidden">
      <OnboardingProvider>
        <OnboardingFlow />
      </OnboardingProvider>
    </div>
  );
}