import { useMemo } from 'react';
import { WorkoutSession } from '@/models/WorkoutSession';
import { WorkoutExercise } from '@/models/Workout';
import { Exercise } from '@/models';

export interface WorkoutCompletionSection {
    totalRequiredSets: number;
    completedSets: number;
    completionPercentage: number;
    exerciseCompletionStatus: Record<string, boolean>;
    isExerciseComplete: (exerciseId: string) => boolean;
    hasPendingSets: (exerciseId: string) => boolean;
}

export interface UseSessionCompletionProps {
    sessionData: WorkoutSession | null;
    workoutExercises: WorkoutExercise[];
    exercises: Exercise[];
}

export function useSessionCompletion({
    sessionData,
    workoutExercises,
    exercises,
}: UseSessionCompletionProps) {
    const completion = useMemo<WorkoutCompletionSection>(() => {
        const sessionExercises = sessionData?.exercises ?? [];

        // If we have neither, return empty state
        if (workoutExercises.length === 0 && sessionExercises.length === 0) {
            return {
                totalRequiredSets: 0,
                completedSets: 0,
                completionPercentage: 0,
                exerciseCompletionStatus: {},
                isExerciseComplete: () => false,
                hasPendingSets: () => false,
            };
        }

        const perExerciseTotals: Record<string, { total: number; completed: number }> = {};
        let totalRequiredSets = 0;
        let completedSets = 0;

        // Use workout definition as the primary source of truth for what *should* be there
        // If workout is not loaded yet, fall back to session exercises
        const sourceExercises = workoutExercises.length > 0
            ? workoutExercises.map(we => ({ exerciseId: we.exercise_id }))
            : sessionExercises.map(se => ({ exerciseId: se.exerciseId }));

        sourceExercises.forEach(({ exerciseId }) => {
            const sessionExercise = sessionExercises.find((e) => e.exerciseId === exerciseId);
            const exerciseDef = exercises.find((e) => e.id === exerciseId);

            const actualSets = sessionExercise?.sets ?? [];
            const completedCount = actualSets.filter((s) => s.status === 'completed').length;

            // Determine required sets:
            // 1. Use actual sets if they exist (and are not empty)
            // 2. Fallback to exercise settings (3 for sets-based, 1 otherwise)
            let requiredCount = actualSets.length;

            if (requiredCount === 0) {
                if (exerciseDef?.settings?.sets_counting) {
                    requiredCount = 3;
                } else {
                    requiredCount = 1;
                }
            }

            perExerciseTotals[exerciseId] = {
                total: requiredCount,
                completed: completedCount,
            };

            totalRequiredSets += requiredCount;
            completedSets += completedCount;
        });

        const normalizedCompletedSets = Math.min(completedSets, totalRequiredSets);
        const completionPercentage =
            totalRequiredSets > 0
                ? Math.round((normalizedCompletedSets / totalRequiredSets) * 100)
                : 0;

        const exerciseCompletionStatus = Object.fromEntries(
            Object.entries(perExerciseTotals).map(([exerciseId, counts]) => [
                exerciseId,
                counts.total > 0 && counts.completed >= counts.total,
            ])
        );

        const isExerciseComplete = (exerciseId: string) =>
            !!exerciseCompletionStatus[exerciseId];

        const hasPendingSets = (exerciseId: string) => {
            const counts = perExerciseTotals[exerciseId];
            if (!counts) return false;
            return counts.completed < counts.total;
        };

        return {
            totalRequiredSets,
            completedSets: normalizedCompletedSets,
            completionPercentage,
            exerciseCompletionStatus,
            isExerciseComplete,
            hasPendingSets,
        };
    }, [sessionData?.exercises, workoutExercises, exercises]);

    return completion;
}
