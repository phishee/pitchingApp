import { useState, useCallback, useEffect } from 'react';
import { Workout } from '@/models/Workout';
import { workoutApi } from '@/app/services-client/workoutApi';
import { workoutSessionApi } from '@/app/services-client/workoutSessionApi';
import { AsyncDataState } from './types';

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

export interface UseWorkoutDataProps {
    sessionId?: string;
    organizationId?: string;
    workoutIdFromSession?: string;
    workoutIdFromWorkout?: string;
    orgIdFromSession?: string;
    orgIdFromAssignment?: string;
}

export function useWorkoutData({
    sessionId,
    organizationId,
    workoutIdFromSession,
    workoutIdFromWorkout,
    orgIdFromSession,
    orgIdFromAssignment,
}: UseWorkoutDataProps) {
    const [workoutState, setWorkoutState] = useState<AsyncDataState<Workout>>(
        createInitialAsyncState
    );

    // Loads the workout definition to drive flow and structure
    // Checks cache first if we have a sessionId
    const fetchWorkout = useCallback(
        async ({ workoutId, orgId }: { workoutId: string; orgId?: string }): Promise<Workout | null> => {
            if (!orgId) {
                setWorkoutState({
                    data: null,
                    status: 'error',
                    error: 'Organization ID is required to load workout.',
                });
                return null;
            }

            // Check cache first if we have a sessionId
            if (sessionId) {
                const cached = workoutSessionApi.getCache(sessionId, true);
                if (cached?.workout) {
                    setWorkoutState({ data: cached.workout, status: 'loaded', error: null });
                    // Background refresh
                    workoutApi.getWorkoutById(workoutId, orgId)
                        .then((workout) => {
                            setWorkoutState({ data: workout, status: 'loaded', error: null });
                            workoutSessionApi.updateCache(sessionId, { workout });
                        })
                        .catch(() => { }); // Silent fail
                    return cached.workout;
                }
            }

            setWorkoutState((prev) => ({ ...prev, status: 'loading', error: null }));
            try {
                const workout = await workoutApi.getWorkoutById(workoutId, orgId);
                setWorkoutState({ data: workout, status: 'loaded', error: null });

                // Update cache if we have a sessionId
                if (sessionId) {
                    workoutSessionCache.update(sessionId, { workout });
                }

                return workout;
            } catch (error) {
                const message = toErrorMessage(error, 'Failed to load workout definition.');
                setWorkoutState({ data: null, status: 'error', error: message });
                return null;
            }
        },
        [sessionId]
    );

    useEffect(() => {
        const workoutId = workoutIdFromSession ?? workoutIdFromWorkout;
        const orgId = organizationId ?? orgIdFromSession ?? orgIdFromAssignment;

        if (!workoutId || !orgId) {
            return;
        }

        // Only fetch if we don't already have this workout loaded
        if (workoutState.data?.id === workoutId && workoutState.status === 'loaded') {
            return;
        }

        fetchWorkout({ workoutId, orgId });
    }, [
        fetchWorkout,
        organizationId,
        workoutIdFromSession,
        workoutIdFromWorkout,
        orgIdFromSession,
        orgIdFromAssignment,
        workoutState.data?.id,
        workoutState.status,
    ]);

    return {
        workoutState,
        setWorkoutState,
        fetchWorkout,
    };
}
