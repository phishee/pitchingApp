'use client';

import React, { useEffect } from 'react';
import { useLayout } from '@/providers/layout-context';
import { useWorkoutSessionContext } from '@/providers/workout-session-context';
import { UserWorkoutDetailDesktop } from '@/components/my-workouts/user-workout-detail-desktop';
import { ExerciseSessionMobile } from './exercise-session-mobile';

interface ExerciseSessionProps {
    exerciseId?: string;
}

export function ExerciseSession({ exerciseId }: ExerciseSessionProps) {
    const { isMobile } = useLayout();
    const { exercises } = useWorkoutSessionContext();

    // Sync URL exerciseId with context
    useEffect(() => {
        if (exerciseId && exerciseId !== exercises.activeExerciseId) {
            exercises.setActiveExerciseId(exerciseId);
        }
    }, [exerciseId, exercises]);

    if (!isMobile) {
        return <UserWorkoutDetailDesktop />;
    }

    return <ExerciseSessionMobile />;
}
