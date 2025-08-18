// app/onboarding/page.tsx
'use client';

import React from 'react';
import OnboardingFlow from '@/components/onboarding/onboarding-flow';
import { OnboardingProvider } from '@/providers/onboarding-context';

export default function OnboardingPage() {
  return (
    <div className="min-h-screen w-screen">  {/* Remove overflow-hidden, use min-h-screen */}
      <OnboardingProvider>
        <OnboardingFlow />
      </OnboardingProvider>
    </div>
  );
}