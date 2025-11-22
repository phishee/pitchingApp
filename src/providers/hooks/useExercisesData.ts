import { useState, useCallback, useEffect, useMemo } from 'react';
import { Exercise } from '@/models';
import { WorkoutExercise } from '@/models/Workout';
import { exerciseApi } from '@/app/services-client/exerciseApi';
import { workoutSessionCache } from '@/lib/workout-session-cache';
import { LoadingState } from './useSessionData';

const toErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    return fallback;
};

export interface UseExercisesDataProps {
    sessionId?: string;
    workoutExercises?: WorkoutExercise[];
    workoutId?: string;
}

export function useExercisesData({
    sessionId,
    workoutExercises = [],
    workoutId,
}: UseExercisesDataProps) {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [exercisesStatus, setExercisesStatus] = useState<LoadingState>('idle');
    const [exercisesError, setExercisesError] = useState<string | null>(null);
    const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);

    // Memoize exercise IDs string for stable comparison
    const exerciseIdsKey = useMemo(() => {
        return workoutExercises.map((e) => e.exercise_id).sort().join(',');
    }, [workoutExercises, workoutId]);

    // Memoize exercise IDs array based on the stable key
    const exerciseIds = useMemo(() => {
        if (!exerciseIdsKey) return [];
        return exerciseIdsKey.split(',').filter(Boolean);
    }, [exerciseIdsKey]);

    // Loads all exercise records backing the workout flow
    // Checks cache first if we have a sessionId
    const fetchExercises = useCallback(
        async (ids: string[]): Promise<Exercise[]> => {
            if (ids.length === 0) {
                setExercises([]);
                setExercisesStatus('loaded');
                setExercisesError(null);
                return [];
            }

            // Check cache first if we have a sessionId
            if (sessionId) {
                const cached = workoutSessionCache.get(sessionId, true);
                if (cached?.exercises && cached.exercises.length > 0) {
                    setExercises(cached.exercises);
                    setExercisesStatus('loaded');
                    setExercisesError(null);
                    if (!activeExerciseId && cached.exercises.length > 0) {
                        setActiveExerciseId(cached.exercises[0].id ?? null);
                    }
                    // Background refresh (only if IDs might have changed)
                    exerciseApi.getExercisesByIds(ids)
                        .then((exerciseData) => {
                            setExercises(exerciseData);
                            if (!activeExerciseId && exerciseData.length > 0) {
                                setActiveExerciseId(exerciseData[0].id ?? null);
                            }
                            workoutSessionCache.update(sessionId, { exercises: exerciseData });
                        })
                        .catch(() => { }); // Silent fail
                    return cached.exercises;
                }
            }

            setExercisesStatus('loading');
            setExercisesError(null);
            try {
                const exerciseData = await exerciseApi.getExercisesByIds(ids);
                setExercises(exerciseData);
                setExercisesStatus('loaded');
                if (!activeExerciseId && exerciseData.length > 0) {
                    setActiveExerciseId(exerciseData[0].id ?? null);
                }

                // Update cache if we have a sessionId
                if (sessionId) {
                    workoutSessionCache.update(sessionId, { exercises: exerciseData });
                }

                return exerciseData;
            } catch (error) {
                const message = toErrorMessage(error, 'Failed to load exercises.');
                setExercises([]);
                setExercisesStatus('error');
                setExercisesError(message);
                return [];
            }
        },
        [activeExerciseId, sessionId]
    );

    useEffect(() => {
        if (exerciseIds.length === 0) {
            setExercises([]);
            setExercisesStatus('loaded');
            setExercisesError(null);
            return;
        }

        fetchExercises(exerciseIds);
    }, [exerciseIds, fetchExercises]);

    // Maps workout exercises to their prescribed default metrics for quick lookup
    const metricsByExercise = useMemo(() => {
        if (workoutExercises.length === 0) {
            return {};
        }

        return workoutExercises.reduce<
            Record<string, WorkoutExercise['default_Metrics']>
        >((acc, workoutExercise) => {
            acc[workoutExercise.exercise_id] = workoutExercise.default_Metrics;
            return acc;
        }, {});
    }, [workoutExercises]);

    return {
        exercises,
        exercisesStatus,
        exercisesError,
        activeExerciseId,
        setActiveExerciseId,
        fetchExercises,
        metricsByExercise,
    };
}
