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
    const { session, workout, exercises, assignment, ui, completion } = useWorkoutSessionContext();

    // Sync URL exerciseId with context
    useEffect(() => {
        if (exerciseId && exerciseId !== exercises.activeExerciseId) {
            exercises.setActiveExerciseId(exerciseId);
        }
    }, [exerciseId, exercises]);

    // Logging side effects (preserved from original page)
    useEffect(() => {
        console.log('Session:', session.data);
        console.log('Session Status:', session.status);
        console.log('Session Error:', session.error);
    }, [session.data, session.status, session.error]);

    useEffect(() => {
        console.log('Workout:', workout.data);
        console.log('Workout Status:', workout.status);
        console.log('Workout Error:', workout.error);
    }, [workout.data, workout.status, workout.error]);

    useEffect(() => {
        console.log('Exercises:', exercises.list);
        console.log('Exercises Status:', exercises.status);
        console.log('Exercises Error:', exercises.error);
    }, [exercises.list, exercises.status, exercises.error]);

    useEffect(() => {
        console.log('Assignment:', assignment.data);
        console.log('Assignment Status:', assignment.status);
        console.log('Assignment Error:', assignment.error);
    }, [assignment.data, assignment.status, assignment.error]);

    useEffect(() => {
        console.log('Is Initializing:', ui.isInitializing);
    }, [ui.isInitializing]);

    useEffect(() => {
        console.log('Completion:', completion);
    }, [completion]);

    if (!isMobile) {
        return <UserWorkoutDetailDesktop />;
    }

    return <ExerciseSessionMobile />;
}
