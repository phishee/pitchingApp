'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLayout } from '@/providers/layout-context';
import { useOrganization } from '@/providers/organization-context';
import { eventApi } from '@/app/services-client/eventApi';
import { workoutAssignmentApi } from '@/app/services-client/workoutAssignmentApi';
import { workoutApi } from '@/app/services-client/workoutApi';
import { EnrichedEvent } from '@/providers/user-event-context';
import { UserWorkoutDetailMobile } from './user-workout-detail-mobile';
import { UserWorkoutDetailDesktop } from './user-workout-detail-desktop';

export function UserWorkoutDetail() {
  const params = useParams();
  const router = useRouter();
  const { isMobile, setBottomNavVisible } = useLayout();
  const { currentOrganization } = useOrganization();
  const [enrichedEvent, setEnrichedEvent] = useState<EnrichedEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const eventId = params?.id as string;
  const organizationId = currentOrganization?._id;

  // Hide bottom navigation when on this page
  useEffect(() => {
    setBottomNavVisible(false);
    // Restore bottom navigation on unmount
    return () => {
      setBottomNavVisible(true);
    };
  }, [setBottomNavVisible]);

  // Fetch enriched event data
  useEffect(() => {
    if (!eventId || !organizationId) {
      if (!organizationId) {
        setError('Organization not found');
      }
      setIsLoading(false);
      return;
    }

    const loadEnrichedEvent = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 1. Fetch event using getEvents with filters (more reliable)
        // This matches the pattern used in user-event-context
        const events = await eventApi.getEvents({
          organizationId,
          types: ['workout'],
          limit: 200, // Reasonable limit to find the event
          includeDetails: true
        });
        
        const event = events.find(e => e._id === eventId);
        
        if (!event) {
          setError('Event not found');
          setIsLoading(false);
          return;
        }

        const enriched: EnrichedEvent = { event };

        // 2. For workout events, fetch assignment and workout details
        if (event.type === 'workout' && event.sourceType === 'workout_assignment') {
          const assignment = await workoutAssignmentApi.get(event.sourceId);
          enriched.workoutAssignment = assignment;

          // 3. Fetch workout details
          const workout = await workoutApi.getWorkoutById(assignment.workoutId, organizationId);
          enriched.workout = workout;

          // 4. Calculate exercise count
          if (workout.flow?.exercises) {
            enriched.exerciseCount = workout.flow.exercises.length;
          }

          // 5. Get duration: prefer workout duration, fallback to calculated from event times
          if (workout.duration) {
            enriched.estimatedDuration = workout.duration;
          } else {
            const startTime = new Date(event.startTime);
            const endTime = new Date(event.endTime);
            const calculatedDuration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
            if (calculatedDuration > 0) {
              enriched.estimatedDuration = calculatedDuration;
            }
          }
        } else {
          setError('Event is not a workout event');
          setIsLoading(false);
          return;
        }

        setEnrichedEvent(enriched);
      } catch (err) {
        console.error('Failed to load workout detail:', err);
        setError(err instanceof Error ? err.message : 'Failed to load workout');
        router.push('/app/my-workouts');
      } finally {
        setIsLoading(false);
      }
    };

    loadEnrichedEvent();
  }, [eventId, organizationId, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
        <p className="text-gray-600">Loading workout...</p>
      </div>
    );
  }

  if (error || !enrichedEvent) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="text-red-600 text-center">
          <p className="font-semibold mb-2">Failed to load workout</p>
          <p className="text-sm">{error || 'Workout not found'}</p>
        </div>
        <button
          onClick={() => router.push('/app/my-workouts')}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Back to Workouts
        </button>
      </div>
    );
  }

  if (isMobile) {
    return <UserWorkoutDetailMobile enrichedEvent={enrichedEvent} />;
  }

  return <UserWorkoutDetailDesktop />;
}

