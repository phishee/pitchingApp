'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkoutSessionContext } from '@/providers/workout-session-context';

export default function WorkoutSessionPage() {
    const router = useRouter();
    const { session, ui } = useWorkoutSessionContext();

    useEffect(() => {
        if (ui.isInitializing) return;

        if (!session.data) {
            return;
        }

        const { status, progress, _id, exercises } = session.data;

        // Helper to construct route from semantic progress
        const getRouteFromProgress = () => {
            if (!progress?.stepName) return null;

            switch (progress.stepName) {
                case 'pre_workout_questionnaire':
                    return `/app/workout-session/${_id}/pre-workout-questionnaire`;
                case 'questionnaire':
                    return `/app/workout-session/${_id}/questionnaire/${progress.positionId}`;
                case 'exercises':
                    // If we have a specific exercise ID, go there
                    if (progress.positionId) {
                        return `/app/workout-session/${_id}/exercises/${progress.positionId}`;
                    }
                    // Fallback to first exercise if no position recorded
                    const firstEx = exercises?.[0]?.exerciseId;
                    return firstEx ? `/app/workout-session/${_id}/exercises/${firstEx}` : `/app/workout-session/${_id}/summary`;
                case 'rpe':
                    return `/app/workout-session/${_id}/rpe`;
                case 'post_workout_questionnaire':
                    return `/app/workout-session/${_id}/post-workout-questionnaire`;
                case 'summary':
                    return `/app/workout-session/${_id}/summary`;
                default:
                    return null;
            }
        };

        // 0. Completed Session Logic
        if (status === 'completed') {
            router.replace(`/app/workout-session/${_id}/summary`);
            return;
        }

        // 1. Resume Logic
        if (status === 'in_progress') {
            const resumeRoute = getRouteFromProgress();
            if (resumeRoute) {
                console.log('Resuming session at:', resumeRoute, 'based on progress:', progress);
                router.replace(resumeRoute);
                return;
            }
        }

        // 2. Default Start Logic (if no progress or new session)
        const hasPreWorkout = session.data.workout.flow?.questionnaires?.length > 0; // Simplified check

        if (hasPreWorkout) {
            router.replace(`/app/workout-session/${_id}/pre-workout-questionnaire`);
        } else {
            // Go to first exercise
            const firstExerciseId = exercises?.[0]?.exerciseId;
            if (firstExerciseId) {
                router.replace(`/app/workout-session/${_id}/exercises/${firstExerciseId}`);
            } else {
                router.replace(`/app/workout-session/${_id}/summary`);
            }
        }

    }, [session.data, ui.isInitializing, router]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gray-200"></div>
                <div className="h-4 w-32 rounded bg-gray-200"></div>
            </div>
        </div>
    );
}
