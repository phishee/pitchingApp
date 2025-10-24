'use client';

import { useEffect } from 'react';
import { useAuth } from './auth-context';
import { useUser } from './user.context';
import { useRouter, usePathname } from 'next/navigation';

export function AuthRedirectHandler({ children }: { children: React.ReactNode }) {
  const { userFromFirebase, isLoading: authLoading, token } = useAuth();
  const { user, isLoading: userLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't do anything while loading
    if (authLoading || userLoading) return;

    // Define protected and auth routes
    const authRoutes = ['/sign-in', '/sign-up', '/login', '/signup'];
    const protectedRoutes = ['/app/', '/dashboard', '/onboarding'];
    const isAuthRoute = authRoutes.includes(pathname);
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));


    // If user has Firebase auth and token, but we're on auth pages
    if (userFromFirebase && token && isAuthRoute) {
      if (user) {
        // User exists in DB - go to dashboard
        console.log('Redirecting to dashboard - user exists');
        router.push('/app/dashboard');
      } else {
        // No user in DB - go to onboarding
        console.log('Redirecting to onboarding - user not in DB');
        router.push('/onboarding');
      }
      return;
    }

    // If no Firebase user but on protected route
    if (!userFromFirebase && isProtectedRoute) {
      console.log('Redirecting to sign-in - no auth');
      router.push('/sign-in');
      return;
    }

    // If Firebase user exists but no DB user, and not on onboarding
    if (userFromFirebase && !user && pathname !== '/onboarding') {
      console.log('Redirecting to onboarding - missing DB user');
      router.push('/onboarding');
      return;
    }

    // If user exists in DB but is on onboarding page, redirect to dashboard
    if (userFromFirebase && user && pathname === '/onboarding') {
      console.log('Redirecting to dashboard - user already exists, should not be on onboarding');
      router.push('/app/dashboard');
      return;
    }

  }, [
    userFromFirebase, 
    user, 
    token, 
    authLoading, 
    userLoading, 
    pathname, 
    router
  ]);

  return <>{children}</>;
}