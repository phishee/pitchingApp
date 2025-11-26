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
            // Handle error or missing session
            return;
        }

        const { status, progress, _id } = session.data;

        // 1. Resume Logic
        if (status === 'in_progress' && progress?.currentUrl) {
            console.log('Resuming session at:', progress.currentUrl);
            router.replace(progress.currentUrl);
            return;
        }

        // 2. Default Start Logic (if no progress or new session)
        // Check for pre-workout questionnaire
        const hasPreWorkout = session.data.workout.flow?.questionnaires?.length > 0; // Simplified check, ideally check specific type

        if (hasPreWorkout) {
            router.replace(`/app/workout-session/${_id}/pre-workout-questionnaire`);
        } else {
            // Go to first exercise
            const firstExerciseId = session.data.exercises[0]?.exerciseId;
            if (firstExerciseId) {
                router.replace(`/app/workout-session/${_id}/exercises/${firstExerciseId}`);
            } else {
                // Fallback to summary if no exercises (weird case)
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
