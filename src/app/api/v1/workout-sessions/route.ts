import { NextRequest, NextResponse } from 'next/server';
import container from '@/app/api/lib/container';
import { WORKOUT_SESSION_TYPES } from '@/app/api/lib/symbols/Symbols';
import { WorkoutSessionController } from '@/app/api/lib/controllers/workoutSession.controller';
import { withAuth } from '@/app/api/lib/middleware/auth.middleware';

export async function GET(req: NextRequest) {
    const controller = container.get<WorkoutSessionController>(
        WORKOUT_SESSION_TYPES.WorkoutSessionController
    );

    return withAuth((request) => controller.getWorkoutSessions(request))(req);
}
