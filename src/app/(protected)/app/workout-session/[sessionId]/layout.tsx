'use client';

import React, { useEffect, useMemo, useState, use } from 'react';
import { useLayout } from '@/providers/layout-context';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

import { WorkoutSessionProvider } from '@/providers/workout-session-context';

const FALLBACK_ROUTE = '/app/my-workouts';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{
    sessionId: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default function WorkoutSessionLayout({
  children,
  params,
  searchParams,
}: LayoutProps) {
  const { setBottomNavVisible, setHeaderVisible } = useLayout();
  const router = useRouter();
  const [previousRoute, setPreviousRoute] = useState(FALLBACK_ROUTE);

  // Unwrap params Promise using React.use()
  const resolvedParams = use(params);
  const sessionId = resolvedParams?.sessionId;

  // Unwrap searchParams Promise if it exists
  const resolvedSearchParams = searchParams ? use(searchParams) : undefined;

  const { calendarEventId, assignmentId, organizationId } = useMemo(() => {
    const getString = (key: string): string | undefined => {
      const value = resolvedSearchParams?.[key];
      if (Array.isArray(value)) {
        return value[0];
      }
      return typeof value === 'string' ? value : undefined;
    };

    return {
      calendarEventId: getString('eventId'),
      assignmentId: getString('assignmentId'),
      organizationId: getString('orgId'),
    };
  }, [resolvedSearchParams]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRoute =
        sessionStorage.getItem('lastRouteBeforeWorkout') ?? FALLBACK_ROUTE;
      setPreviousRoute(storedRoute);
    }
  }, []);

  useEffect(() => {
    setBottomNavVisible(false);
    setHeaderVisible(false);
    return () => {
      setBottomNavVisible(true);
      setHeaderVisible(true);
    };
  }, [setBottomNavVisible, setHeaderVisible]);

  const handleExit = () => {
    router.push(previousRoute || FALLBACK_ROUTE);
  };

  return (
    <WorkoutSessionProvider
      sessionId={sessionId}
      calendarEventId={calendarEventId}
      assignmentId={assignmentId}
      organizationId={organizationId}
    >
      <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
        <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-end px-4 py-4 bg-transparent">
          <button
            type="button"
            onClick={handleExit}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-border/60 bg-background/70 text-foreground shadow-sm transition-colors hover:bg-muted"
            aria-label="Exit workout"
          >
            <X className="h-6 w-6" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-background px-4 py-6 pt-20">
          {children}
        </main>
      </div>
    </WorkoutSessionProvider>
  );
}

