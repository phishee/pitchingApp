'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Event } from '@/models/Calendar';
import { WorkoutAssignment } from '@/models/WorkoutAssignment';
import { Workout } from '@/models/Workout';
import { eventApi } from '@/app/services-client/eventApi';
import { workoutAssignmentApi } from '@/app/services-client/workoutAssignmentApi';
import { workoutApi } from '@/app/services-client/workoutApi';

// Enriched event interface with workout details
export interface EnrichedEvent {
  event: Event;
  workoutAssignment?: WorkoutAssignment;
  workout?: Workout;
  exerciseCount?: number;
  estimatedDuration?: number; // in minutes
}

interface UserEventContextType {
  enrichedEvents: EnrichedEvent[];
  workouts: EnrichedEvent[];
  assessments: EnrichedEvent[];
  isLoading: boolean;
  error: string | null;
  loadEventsForMonth: (year: number, month: number) => Promise<void>;
  getEventsForWeek: (startDate: Date) => EnrichedEvent[];
  refreshEvents: () => Promise<void>;
  currentMonth: number;
  currentYear: number;
}

const UserEventContext = createContext<UserEventContextType | undefined>(undefined);

interface UserEventProviderProps {
  children: ReactNode;
  organizationId: string;
  userId: string;
}

export function UserEventProvider({ children, organizationId, userId }: UserEventProviderProps) {
  const [enrichedEvents, setEnrichedEvents] = useState<EnrichedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Separate workouts and assessments
  const workouts = enrichedEvents.filter(e => e.event.type === 'workout');
  const assessments = enrichedEvents.filter(e => e.event.type === 'assessment');

  // Fetch and enrich events for a given month
  const loadEventsForMonth = useCallback(async (year: number, month: number) => {
    setIsLoading(true);
    setError(null);
    setCurrentMonth(month);
    setCurrentYear(year);

    try {
      // Calculate month start and end dates
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month, 0, 23, 59, 59);

      // Fetch events from API
      const events = await eventApi.getEvents({
        organizationId,
        athleteIds: [userId],
        types: ['workout', 'assessment'],
        startDate: monthStart,
        endDate: monthEnd,
        includeDetails: true
      });

      // Enrich each event with workout and assignment data
      const enrichedPromises = events.map(async (event): Promise<EnrichedEvent> => {
        const enriched: EnrichedEvent = { event };

        try {
          // For workout events, fetch assignment and workout details
          if (event.type === 'workout' && event.sourceType === 'workout_assignment') {
            const assignment = await workoutAssignmentApi.get(event.sourceId);
            enriched.workoutAssignment = assignment;

            // Fetch workout details
            const workout = await workoutApi.getWorkoutById(assignment.workoutId, organizationId);
            enriched.workout = workout;

            // Calculate exercise count
            if (workout.flow?.exercises) {
              enriched.exerciseCount = workout.flow.exercises.length;
            }

            // Get duration: prefer workout duration, fallback to calculated from event times
            if (workout.duration) {
              enriched.estimatedDuration = workout.duration;
            } else {
              const startTime = new Date(event.startTime);
              const endTime = new Date(event.endTime);
              const calculatedDuration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
              // Only use calculated duration if it's valid
              if (calculatedDuration > 0) {
                enriched.estimatedDuration = calculatedDuration;
              }
            }
          } else if (event.type === 'assessment') {
            // For assessments, calculate duration from event times
            const startTime = new Date(event.startTime);
            const endTime = new Date(event.endTime);
            enriched.estimatedDuration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
          }
        } catch (err) {
          console.error(`Error enriching event ${event._id}:`, err);
          // Continue with partial data if enrichment fails
        }

        return enriched;
      });

      const enriched = await Promise.all(enrichedPromises);
      
      // Merge with existing events, avoiding duplicates
      setEnrichedEvents(prevEvents => {
        const existingIds = new Set(prevEvents.map(e => e.event._id));
        const newEvents = enriched.filter(e => !existingIds.has(e.event._id));
        return [...prevEvents, ...newEvents];
      });
    } catch (err) {
      console.error('Error loading events:', err);
      setError(err instanceof Error ? err.message : 'Failed to load events');
      setEnrichedEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, [organizationId, userId]);

  // Get events for a specific week (Sun-Sat)
  const getEventsForWeek = useCallback((startDate: Date): EnrichedEvent[] => {
    const weekStart = new Date(startDate);
    const dayOfWeek = weekStart.getDay();
    
    // Adjust to Sunday
    weekStart.setDate(weekStart.getDate() - dayOfWeek);
    weekStart.setHours(0, 0, 0, 0);

    // Calculate week end (Saturday)
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Filter events that fall within this week
    return enrichedEvents.filter(enrichedEvent => {
      const eventDate = new Date(enrichedEvent.event.startTime);
      return eventDate >= weekStart && eventDate <= weekEnd;
    });
  }, [enrichedEvents]);

  // Refresh events for current month
  const refreshEvents = useCallback(async () => {
    await loadEventsForMonth(currentYear, currentMonth);
  }, [loadEventsForMonth, currentYear, currentMonth]);

  // Load events for current month on mount
  useEffect(() => {
    const now = new Date();
    loadEventsForMonth(now.getFullYear(), now.getMonth() + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  const contextValue: UserEventContextType = {
    enrichedEvents,
    workouts,
    assessments,
    isLoading,
    error,
    loadEventsForMonth,
    getEventsForWeek,
    refreshEvents,
    currentMonth,
    currentYear,
  };

  return (
    <UserEventContext.Provider value={contextValue}>
      {children}
    </UserEventContext.Provider>
  );
}

export function useUserEvent() {
  const context = useContext(UserEventContext);
  if (context === undefined) {
    throw new Error('useUserEvent must be used within a UserEventProvider');
  }
  return context;
}
