'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { RpeCollection } from '@/components/workout-session/rpe-collection';
import { useWorkoutSessionContext } from '@/providers/workout-session-context';
import { RPEValue, DEFAULT_RPE_CONFIG } from '@/models/RPE';

export default function WorkoutRpePage() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const { session } = useWorkoutSessionContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use workout-defined config or default
  const rpeConfig = session.data?.workout?.rpe ?? DEFAULT_RPE_CONFIG;

  const handleRpeSubmit = async (result: { overall: RPEValue; exerciseValues?: Record<string, RPEValue> }) => {
    if (!session.data) return;

    setIsSubmitting(true);
    try {
      const updates: any = {
        rpeResult: {
          config: rpeConfig,
          overall: result.overall
        },
        // Also update legacy field for backward compatibility
        summary: {
          ...session.data.summary,
          sessionRPE: result.overall.numeric,
          sessionRpe: result.overall
        },
        status: 'completed', // Mark session as completed
        actualEndTime: new Date()
      };

      // If we have per-exercise RPE, update the exercises array
      if (result.exerciseValues) {
        updates.exercises = session.data.exercises.map(ex => {
          const rpe = result.exerciseValues?.[ex.exerciseId];
          if (rpe) {
            return {
              ...ex,
              exerciseRpe: rpe,
              exerciseRPE: rpe.numeric // Legacy
            };
          }
          return ex;
        });
      }

      // Save session
      await session.saveSession(updates);

      // Navigate to summary
      router.push(`/app/workout-session/${session.data._id}/summary`);
    } catch (error) {
      console.error('Failed to save RPE:', error);
      setIsSubmitting(false);
    }
  };

  if (!session.data) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Map session exercises to RPE collection format
  const exercises = session.data.exercises.map(ex => ({
    id: ex.exerciseId,
    name: ex.exerciseName,
    image: ex.exerciseImage,
    sets: ex.summary.completedSets,
    reps: `${ex.sets.length} sets` // Simplified display
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <RpeCollection
        config={rpeConfig}
        exercises={exercises}
        onSubmit={handleRpeSubmit}
        isSubmitting={isSubmitting}
        onBack={() => router.back()}
      />
    </div>
  );
}

