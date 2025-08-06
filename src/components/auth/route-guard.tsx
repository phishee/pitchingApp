'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/providers/auth-context';

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, isOnboardingComplete } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Not logged in, redirect to sign in
        if (pathname !== '/sign-in' && pathname !== '/sign-up') {
          router.push('/sign-in');
        }
      } else if (!isOnboardingComplete) {
        // Logged in but onboarding not complete, redirect to onboarding
        if (pathname !== '/onboarding') {
          router.push('/onboarding');
        }
      } else {
        // Logged in and onboarding complete, allow access to protected routes
        if (pathname === '/sign-in' || pathname === '/sign-up' || pathname === '/onboarding') {
          router.push('/dashboard');
        }
      }
    }
  }, [isAuthenticated, isLoading, isOnboardingComplete, pathname, router]);

  if (isLoading) {
    return <div>Loading...</div>; // You can replace this with a proper loading component
  }

  return <>{children}</>;
}