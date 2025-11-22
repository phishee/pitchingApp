import { inject, injectable } from 'inversify';
import { NextResponse } from 'next/server';
import { WORKOUT_SESSION_TYPES } from '@/app/api/lib/symbols/Symbols';
import { AuthenticatedRequest } from '@/app/api/lib/middleware/auth.middleware';
import { WorkoutSessionService } from '@/app/api/lib/services/workout-session/workoutSession.service';
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from '@/app/api/lib/services/workout-session/errors/SessionErrors';
import { WorkoutSessionStep } from '@/models/WorkoutSession';

@injectable()
export class WorkoutSessionController {
  constructor(
    @inject(WORKOUT_SESSION_TYPES.WorkoutSessionService)
    private readonly workoutSessionService: WorkoutSessionService
  ) {}

  async startSession(req: AuthenticatedRequest): Promise<NextResponse> {
    try {
      const body = await req.json();
      const { calendarEventId } = body ?? {};

      if (!calendarEventId || typeof calendarEventId !== 'string') {
        return NextResponse.json(
          { error: 'calendarEventId is required' },
          { status: 400 }
        );
      }

      const athleteUserId = req.user?.uid;

      if (!athleteUserId) {
        return NextResponse.json(
          { error: 'Authenticated user context is required' },
          { status: 401 }
        );
      }

      const session = await this.workoutSessionService.startSession(calendarEventId, athleteUserId);
      return NextResponse.json(session, { status: 201 });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        return NextResponse.json(
          { error: 'Validation failed', details: error.errors },
          { status: 400 }
        );
      }

      if (error instanceof NotFoundError) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }

      if (error instanceof ConflictError) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }

      return NextResponse.json(
        { error: error?.message ?? 'Failed to start workout session' },
        { status: 500 }
      );
    }
  }

  async getSessionById(
    _req: AuthenticatedRequest,
    { params }: { params: Promise<{ sessionId: string }> }
  ): Promise<NextResponse> {
    try {
      const { sessionId } = await params;

      if (!sessionId) {
        return NextResponse.json(
          { error: 'sessionId is required' },
          { status: 400 }
        );
      }

      const session = await this.workoutSessionService.getSessionById(sessionId);

      if (!session) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      return NextResponse.json(session);
    } catch (error: any) {
      return NextResponse.json(
        { error: error?.message ?? 'Failed to fetch workout session' },
        { status: 500 }
      );
    }
  }

  async getSessionByEvent(
    _req: AuthenticatedRequest,
    { params }: { params: Promise<{ eventId: string }> }
  ): Promise<NextResponse> {
    try {
      const { eventId } = await params;

      if (!eventId) {
        return NextResponse.json(
          { error: 'eventId is required' },
          { status: 400 }
        );
      }

      const session = await this.workoutSessionService.getSessionByEventId(eventId);

      if (!session) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      return NextResponse.json(session);
    } catch (error: any) {
      return NextResponse.json(
        { error: error?.message ?? 'Failed to fetch workout session' },
        { status: 500 }
      );
    }
  }

  async updateSessionProgress(
    req: AuthenticatedRequest,
    { params }: { params: Promise<{ sessionId: string }> }
  ): Promise<NextResponse> {
    try {
      const { sessionId } = await params;

      if (!sessionId) {
        return NextResponse.json(
          { error: 'sessionId is required' },
          { status: 400 }
        );
      }

      const body = await req.json();
      const { nextStep } = body ?? {};

      if (!nextStep || !this.isValidStep(nextStep)) {
        return NextResponse.json(
          { error: 'nextStep is required and must be a valid step' },
          { status: 400 }
        );
      }

      const session = await this.workoutSessionService.updateSessionProgress(sessionId, nextStep);

      if (!session) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      return NextResponse.json(session);
    } catch (error: any) {
      return NextResponse.json(
        { error: error?.message ?? 'Failed to update workout session' },
        { status: 500 }
      );
    }
  }

  private isValidStep(step: string): step is WorkoutSessionStep {
    return [
      'pre_workout_questionnaire',
      'exercises',
      'rpe',
      'post_workout_questionnaire',
      'summary',
    ].includes(step);
  }
}

