// app/onboarding/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-context';
import OnboardingFlow from '@/components/onboarding/onboarding-flow';
import { OnboardingProvider } from '@/providers/onboarding-context';

export default function OnboardingPage() {
  const { userFromFirebase, isLoading } = useAuth();
  const router = useRouter();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!userFromFirebase) {
        router.push('/sign-in');
      } else {
        setShouldRender(true);
      }
    }
  }, [userFromFirebase, isLoading, router]);

  // Show loading spinner while checking auth
  if (isLoading || !shouldRender) {
    return (
      <div className="min-h-screen w-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen">
      <OnboardingProvider>
        <OnboardingFlow />
      </OnboardingProvider>
    </div>
  );
}