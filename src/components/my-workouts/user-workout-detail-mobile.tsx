'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { EnrichedEvent } from '@/providers/user-event-context';
import { Exercise } from '@/models/Exercise';
import { exerciseApi } from '@/app/services-client/exerciseApi';
import { WorkoutExerciseCard } from './workout-exercise-card';
import { Clock, Dumbbell } from 'lucide-react';

interface UserWorkoutDetailMobileProps {
  enrichedEvent: EnrichedEvent;
}

export function UserWorkoutDetailMobile({ enrichedEvent }: UserWorkoutDetailMobileProps) {
  const { workout, workoutAssignment, estimatedDuration } = enrichedEvent;
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoadingExercises, setIsLoadingExercises] = useState(true);

  // Fetch exercise details
  useEffect(() => {
    const loadExercises = async () => {
      if (!workout?.flow?.exercises || workout.flow.exercises.length === 0) {
        setIsLoadingExercises(false);
        return;
      }

      try {
        setIsLoadingExercises(true);
        const exerciseIds = workout.flow.exercises.map(ex => ex.exercise_id);
        const exerciseData = await exerciseApi.getExercisesByIds(exerciseIds);
        setExercises(exerciseData);
      } catch (err) {
        console.error('Failed to load exercises:', err);
      } finally {
        setIsLoadingExercises(false);
      }
    };

    loadExercises();
  }, [workout]);

  const handleWellnessQuestionnaire = () => {
    console.log('Wellness Questionnaire clicked');
  };

  const handleStartWorkout = () => {
    console.log('Start Workout clicked');
  };

  if (!workout) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <p className="text-gray-600">Workout not found</p>
      </div>
    );
  }

  // Get sets and reps from prescription or default metrics
  const getExerciseData = (exerciseId: string) => {
    const exercise = exercises.find(ex => ex.id === exerciseId);
    const workoutExercise = workout.flow.exercises.find(ex => ex.exercise_id === exerciseId);
    const prescription = workoutAssignment?.prescriptions?.[exerciseId];

    let sets = '';
    let reps = '';

    if (prescription?.prescribedMetrics) {
      // Use prescribed metrics if available
      const metrics = prescription.prescribedMetrics;
      if (metrics.sets) sets = `${metrics.sets} Sets`;
      if (metrics.reps) {
        reps = typeof metrics.reps === 'string' ? metrics.reps : `${metrics.reps} Reps`;
      } else if (metrics.reps_min && metrics.reps_max) {
        reps = `${metrics.reps_min}-${metrics.reps_max} Reps`;
      }
    } else if (workoutExercise?.default_Metrics) {
      // Fallback to default metrics
      const metrics = workoutExercise.default_Metrics;
      if (metrics.sets) sets = `${metrics.sets} Sets`;
      if (metrics.reps) {
        reps = typeof metrics.reps === 'string' ? metrics.reps : `${metrics.reps} Reps`;
      } else if (metrics.reps_min && metrics.reps_max) {
        reps = `${metrics.reps_min}-${metrics.reps_max} Reps`;
      }
    }

    // Default fallback
    if (!sets && !reps) {
      sets = '3 Sets';
      reps = '8-12 Reps';
    }

    return { sets, reps, exercise };
  };

  // Get workout cover image
  const workoutImageUrl = enrichedEvent.event?.coverPhotoUrl || workout.coverImage || '/assets/images/default_profile.png';

  return (
    <div className="w-full min-h-screen bg-gray-50 pb-24">
      {/* Workout Title */}
      <div className="bg-white px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {workout.name}
        </h1>

        {/* Workout Cover Image Card */}
        <div className="mb-4 rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <div className="relative w-full h-48">
            <Image
              src={workoutImageUrl}
              alt={workout.name}
              fill
              className="object-cover"
              sizes="100vw"
              onError={(e) => {
                // Fallback to default image on error
                (e.target as HTMLImageElement).src = '/assets/images/default_profile.png';
              }}
            />
          </div>
        </div>

        {/* Metadata Placeholders */}
        <div className="flex justify-center items-center gap-6 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-500" />
            <span className="text-gray-900 font-medium">
              {estimatedDuration || 60} min
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-purple-500" />
            <span className="text-gray-900 font-medium">High Energy</span>
          </div>
        </div>

        {/* Wellness Questionnaire Button */}
        <button
          onClick={handleWellnessQuestionnaire}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-3 px-6 rounded-xl transition-colors duration-200 mb-6"
        >
          Wellness Questionnaire
        </button>
      </div>

      {/* Exercise List */}
      <div className="px-4 space-y-3 mt-4">
        {isLoadingExercises ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-600">Loading exercises...</p>
          </div>
        ) : workout.flow.exercises.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-600">No exercises found</p>
          </div>
        ) : (
          workout.flow.exercises.map((workoutExercise) => {
            const { sets, reps, exercise } = getExerciseData(workoutExercise.exercise_id);
            return (
              <WorkoutExerciseCard
                key={workoutExercise.exercise_id}
                exercise={exercise}
                sets={sets}
                reps={reps}
              />
            );
          })
        )}
      </div>

      {/* Start Workout Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
        <button
          onClick={handleStartWorkout}
          className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 px-6 rounded-full transition-colors duration-200 uppercase"
        >
          Start Workout
        </button>
      </div>
    </div>
  );
}

