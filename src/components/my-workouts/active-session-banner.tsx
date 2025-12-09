'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { WorkoutSession } from '@/models/WorkoutSession';
import { workoutSessionApi } from '@/app/services-client/workoutSessionApi';

// Removed useAppTheme import

export function ActiveSessionBanner() {
    const router = useRouter();
    // Removed useAppTheme hook
    const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchActiveSession = async () => {
            try {
                const session = await workoutSessionApi.getActiveSession();
                setActiveSession(session);
            } catch (error) {
                console.error('Failed to fetch active session:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchActiveSession();
    }, []);

    if (isLoading || !activeSession) {
        return null;
    }

    return (
        <div className="bg-primary text-primary-foreground p-4 shadow-md mb-4 mx-4 rounded-3xl">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="bg-white/20 text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            In Progress
                        </span>
                    </div>
                    <h3 className="font-bold text-lg leading-tight">
                        {activeSession.workout.name}
                    </h3>
                    {activeSession.workout.description && (
                        <p className="text-primary-foreground/80 text-sm line-clamp-1 mt-1">
                            {activeSession.workout.description}
                        </p>
                    )}
                </div>
                <button
                    onClick={() => router.push(`/app/workout-session/${activeSession._id}`)}
                    className="bg-white text-primary px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap ml-4 hover:bg-white/90 transition-colors"
                >
                    Continue
                </button>
            </div>
        </div>
    );
}
