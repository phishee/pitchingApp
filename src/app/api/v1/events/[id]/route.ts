// src/app/api/v1/events/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/app/api/lib/middleware/auth.middleware';
import container from '@/app/api/lib/container';
import { EVENT_TYPES, WORKOUT_ASSIGNMENT_TYPES } from '@/app/api/lib/symbols/Symbols';
import { EventController } from '@/app/api/lib/controllers/event.controller';
import { WorkoutAssignmentController } from '@/app/api/lib/controllers/workoutAssignment.controller';

export const GET = withAuth(async (
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const eventController = container.get<EventController>(EVENT_TYPES.EventController);
  return eventController.getEventById(req, { params });
});

export const PATCH = withAuth(async (
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const body = await req.json();
    
    // Use the new EventManagementService through WorkoutAssignmentController
    const workoutController = container.get<WorkoutAssignmentController>(WORKOUT_ASSIGNMENT_TYPES.WorkoutAssignmentController);
    const updatedEvent = await workoutController.updateSingleEvent(id, body);
    
    if (!updatedEvent) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Failed to update event:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const eventController = container.get<EventController>(EVENT_TYPES.EventController);
  return eventController.deleteEvent(req, { params });
});