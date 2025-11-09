import { inject, injectable } from 'inversify';
import { NextRequest, NextResponse } from 'next/server';
import { WORKOUT_SESSION_TYPES } from '@/app/api/lib/symbols/Symbols';
import { WorkoutSessionService } from '@/app/api/lib/services/workoutSession.service';

@injectable()
export class WorkoutSessionController {
  constructor(
    @inject(WORKOUT_SESSION_TYPES.WorkoutSessionService)
    private readonly workoutSessionService: WorkoutSessionService
  ) {}

  async startSession(req: NextRequest): Promise<NextResponse> {
    try {
      const body = await req.json();
      const { calendarEventId } = body ?? {};

      if (!calendarEventId || typeof calendarEventId !== 'string') {
        return NextResponse.json(
          { error: 'calendarEventId is required' },
          { status: 400 }
        );
      }

      const session = await this.workoutSessionService.createSession(calendarEventId);
      return NextResponse.json(session, { status: 201 });
    } catch (error: any) {
      return NextResponse.json(
        { error: error?.message ?? 'Failed to start workout session' },
        { status: 500 }
      );
    }
  }
}

