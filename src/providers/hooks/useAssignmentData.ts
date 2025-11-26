import { useState, useCallback, useEffect } from 'react';
import { WorkoutAssignment } from '@/models/WorkoutAssignment';
import { workoutAssignmentApi } from '@/app/services-client/workoutAssignmentApi';
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

export interface UseAssignmentDataProps {
    sessionId?: string;
    assignmentId?: string;
    workoutAssignmentIdFromSession?: string;
}

export function useAssignmentData({
    sessionId,
    assignmentId,
    workoutAssignmentIdFromSession,
}: UseAssignmentDataProps) {
    const [assignmentState, setAssignmentState] =
        useState<AsyncDataState<WorkoutAssignment>>(createInitialAsyncState);

    // Loads the workout assignment, used for prescribed metrics and metadata
    // Checks cache first if we have a sessionId
    const fetchAssignment = useCallback(
        async (id: string): Promise<WorkoutAssignment | null> => {
            console.log('[useAssignmentData] Fetching assignment:', id);
            // Check cache first if we have a sessionId
            if (sessionId) {
                const cached = workoutSessionApi.getCache(sessionId, true);
                if (cached?.assignment) {
                    console.log('[useAssignmentData] Using cached assignment');
                    setAssignmentState({ data: cached.assignment, status: 'loaded', error: null });
                    // Background refresh
                    workoutAssignmentApi.get(id)
                        .then((assignment) => {
                            console.log('[useAssignmentData] Assignment refreshed:', assignment);
                            setAssignmentState({ data: assignment, status: 'loaded', error: null });
                            workoutSessionApi.updateCache(sessionId, { assignment });
                        })
                        .catch((err) => {
                            console.warn('[useAssignmentData] Background assignment refresh failed:', err);
                        });
                    return cached.assignment;
                }
            }

            console.log('[useAssignmentData] Fetching assignment from API');
            setAssignmentState((prev) => ({ ...prev, status: 'loading', error: null }));
            try {
                const assignment = await workoutAssignmentApi.get(id);
                console.log('[useAssignmentData] Assignment loaded:', assignment);
                setAssignmentState({ data: assignment, status: 'loaded', error: null });

                // Update cache if we have a sessionId
                if (sessionId) {
                    workoutSessionCache.update(sessionId, { assignment });
                }

                return assignment;
            } catch (error) {
                console.error('[useAssignmentData] Error fetching assignment:', error);
                const message = toErrorMessage(error, 'Failed to load workout assignment.');
                setAssignmentState({ data: null, status: 'error', error: message });
                return null;
            }
        },
        [sessionId]
    );

    useEffect(() => {
        const targetAssignmentId = assignmentId ?? workoutAssignmentIdFromSession;
        console.log('[useAssignmentData] Assignment fetch effect', {
            assignmentId,
            workoutAssignmentId: workoutAssignmentIdFromSession,
            targetAssignmentId,
            hasAssignment: !!assignmentState.data,
            assignmentStatus: assignmentState.status
        });
        if (!targetAssignmentId) {
            console.log('[useAssignmentData] No assignment ID, skipping fetch');
            return;
        }

        // Only fetch if we don't already have this assignment loaded
        if (assignmentState.data?._id === targetAssignmentId && assignmentState.status === 'loaded') {
            console.log('[useAssignmentData] Assignment already loaded, skipping fetch');
            return;
        }

        console.log('[useAssignmentData] Calling fetchAssignment');
        fetchAssignment(targetAssignmentId);
    }, [
        assignmentId,
        assignmentState.data,
        assignmentState.data?._id,
        assignmentState.status,
        fetchAssignment,
        workoutAssignmentIdFromSession
    ]);

    return {
        assignmentState,
        setAssignmentState,
        fetchAssignment,
    };
}
