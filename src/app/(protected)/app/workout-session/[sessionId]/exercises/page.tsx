'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useWorkoutSessionContext } from '@/providers/workout-session-context';

export default function WorkoutExercisesPage() {
  const params = useParams<{ sessionId: string }>();
  const sessionId = params?.sessionId ?? '';
  const { session, workout, exercises, assignment, ui, completion } = useWorkoutSessionContext();

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

  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Log Exercises</h1>
      <p className="text-muted-foreground">Session ID: {sessionId}</p>
      <p className="text-sm text-muted-foreground">
        Completion: {completion.completionPercentage}% ({completion.completedSets}/{completion.totalRequiredSets} sets)
      </p>
      {ui.isInitializing && <p className="text-muted-foreground">Loading...</p>}
      {session.error && <p className="text-red-500">Session Error: {session.error}</p>}
      {workout.error && <p className="text-red-500">Workout Error: {workout.error}</p>}
      {assignment.error && <p className="text-red-500">Assignment Error: {assignment.error}</p>}
      {exercises.error && <p className="text-red-500">Exercises Error: {exercises.error}</p>}
    </div>
  );
}

