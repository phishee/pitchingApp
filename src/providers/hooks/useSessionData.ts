import { useState, useCallback, useEffect, useRef } from 'react';
import { WorkoutSession, WorkoutSessionStep } from '@/models/WorkoutSession';
import { workoutSessionApi } from '@/app/services-client/workoutSessionApi';
import { workoutSessionCache } from '@/lib/workout-session-cache';

export type LoadingState = 'idle' | 'loading' | 'loaded' | 'error';

export interface AsyncDataState<T> {
    data: T | null;
    status: LoadingState;
    error: string | null;
}

const createInitialAsyncState = <T,>(): AsyncDataState<T> => ({
    data: null,
    status: 'idle',
    error: null,
});

const toErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    return fallback;
};

export interface UseSessionDataProps {
    sessionId?: string;
    calendarEventId?: string;
}

export function useSessionData({ sessionId, calendarEventId }: UseSessionDataProps) {
    const [sessionState, setSessionState] = useState<AsyncDataState<WorkoutSession>>(
        createInitialAsyncState
    );
    const [currentStep, setCurrentStep] = useState<WorkoutSessionStep | null>(null);

    // Loads the workout session using either the direct session id or calendar event id
    // Checks cache first, then fetches if needed
    const fetchSession = useCallback(async (): Promise<WorkoutSession | null> => {
        if (!sessionId && !calendarEventId) {
            setSessionState({
                data: null,
                status: 'error',
                error: 'Workout session identifiers are missing.',
            });
            return null;
        }

        // We're in workout-session pages, so check cache with active flag
        const isOnWorkoutSessionPage = true;
        const targetSessionId = sessionId || null;

        // Check cache first if we have a sessionId
        if (targetSessionId) {
            const cached = workoutSessionCache.get(targetSessionId, isOnWorkoutSessionPage);
            if (cached?.session) {
                // Use cached session immediately
                setSessionState({ data: cached.session, status: 'loaded', error: null });
                setCurrentStep(cached.session.progress?.currentStep ?? null);

                // Background refresh to ensure we have latest data
                try {
                    const updated = await workoutSessionApi.getSession(targetSessionId);
                    if (updated) {
                        setSessionState({ data: updated, status: 'loaded', error: null });
                        setCurrentStep(updated.progress?.currentStep ?? null);
                        // Update cache with fresh data
                        workoutSessionCache.update(targetSessionId, { session: updated });
                    }
                } catch (error) {
                    // Silent fail for background refresh - we have cached data
                    console.warn('Background session refresh failed:', error);
                }

                return cached.session;
            }
        }

        // No cache or cache miss - fetch from API
        console.log('[useSessionData] Fetching session from API', { sessionId, calendarEventId });
        setSessionState((prev) => ({ ...prev, status: 'loading', error: null }));

        try {
            let session: WorkoutSession | null = null;

            // Try sessionId first if available
            if (sessionId) {
                console.log('[useSessionData] Fetching session by ID:', sessionId);
                try {
                    session = await workoutSessionApi.getSession(sessionId);
                    if (session) {
                        console.log('[useSessionData] Session loaded by ID:', session);
                    }
                } catch (error) {
                    console.warn('[useSessionData] Failed to fetch by sessionId, will try calendarEventId if available:', error);
                    // Don't throw - try calendarEventId as fallback
                }
            }

            // If sessionId fetch failed or no sessionId, try calendarEventId as fallback
            if (!session && calendarEventId) {
                console.log('[useSessionData] Fetching session by event ID (fallback):', calendarEventId);
                try {
                    session = await workoutSessionApi.getSessionByEventId(calendarEventId);
                    if (session) {
                        console.log('[useSessionData] Session loaded by event ID:', session);
                    }
                } catch (error) {
                    console.warn('[useSessionData] Failed to fetch by calendarEventId:', error);
                }
            }

            // If we still don't have a session, set error state
            if (!session) {
                console.error('[useSessionData] Session not found - tried sessionId and calendarEventId');
                const errorMessage = sessionId
                    ? `Workout session not found. Session ID: ${sessionId}`
                    : calendarEventId
                        ? `Workout session not found for event ID: ${calendarEventId}`
                        : 'Workout session identifiers are missing.';
                setSessionState({ data: null, status: 'error', error: errorMessage });
                return null;
            }

            console.log('[useSessionData] Session loaded successfully:', session);
            setSessionState({ data: session, status: 'loaded', error: null });
            setCurrentStep(session.progress?.currentStep ?? null);

            // Update cache with fetched data (mark as active since we're in workout-session)
            if (session._id) {
                workoutSessionCache.update(session._id, { session });
            }

            return session;
        } catch (error) {
            console.error('[useSessionData] Unexpected error fetching session:', error);
            const message = toErrorMessage(error, 'Failed to load workout session.');
            setSessionState({ data: null, status: 'error', error: message });
            return null;
        }
    }, [calendarEventId, sessionId]);

    // Refresh helper used by consumers to re-fetch the session
    const refreshSession = useCallback(async () => {
        const session = await fetchSession();
        return session;
    }, [fetchSession]);

    // Advances the workout session to the next progress step server-side
    // Updates cache when session changes
    const updateSessionProgress = useCallback(
        async (nextStep: WorkoutSessionStep) => {
            if (!sessionState.data?._id) {
                return null;
            }

            setSessionState((prev) => ({ ...prev, status: 'loading', error: null }));
            try {
                const updatedSession = await workoutSessionApi.updateSessionProgress(
                    sessionState.data._id,
                    nextStep
                );
                setSessionState({ data: updatedSession, status: 'loaded', error: null });
                setCurrentStep(updatedSession.progress?.currentStep ?? nextStep);

                // Update cache with fresh session data
                workoutSessionCache.update(sessionState.data._id, { session: updatedSession });

                return updatedSession;
            } catch (error) {
                const message = toErrorMessage(error, 'Failed to update workout session progress.');
                setSessionState((prev) => ({ ...prev, status: 'error', error: message }));
                return null;
            }
        },
        [sessionState.data]
    );

    // Fetch session when sessionId or calendarEventId becomes available
    useEffect(() => {
        console.log('[useSessionData] Session fetch effect', { sessionId, calendarEventId });
        if (!sessionId && !calendarEventId) {
            console.log('[useSessionData] No sessionId or calendarEventId, skipping fetch');
            return;
        }
        console.log('[useSessionData] Calling refreshSession');
        refreshSession();
    }, [sessionId, calendarEventId, refreshSession]);

    // Cleanup: Reset active session flags when leaving workout-session pages
    useEffect(() => {
        return () => {
            if (sessionId) {
                // Reset this specific session's active flag
                const cached = workoutSessionCache.get(sessionId, true);
                if (cached?.isActiveSession) {
                    workoutSessionCache.set(
                        sessionId,
                        {
                            session: cached.session,
                            assignment: cached.assignment,
                            workout: cached.workout,
                            exercises: cached.exercises,
                            event: cached.event,
                        },
                        false // Mark as inactive
                    );
                }
            }
        };
    }, [sessionId]);

    return {
        sessionState,
        setSessionState,
        currentStep,
        setCurrentStep,
        refreshSession,
        updateSessionProgress,
    };
}
