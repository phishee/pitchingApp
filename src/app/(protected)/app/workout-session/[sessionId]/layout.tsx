'use client';

import React, { useEffect, useState } from 'react';
import { useLayout } from '@/providers/layout-context';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

const FALLBACK_ROUTE = '/app/my-workouts';

export default function WorkoutSessionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setBottomNavVisible, setHeaderVisible } = useLayout();
  const router = useRouter();
  const [previousRoute, setPreviousRoute] = useState(FALLBACK_ROUTE);

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

      <main className="flex-1 overflow-y-auto bg-background px-4 py-6 pt-20">
        {children}
      </main>
    </div>
  );
}

