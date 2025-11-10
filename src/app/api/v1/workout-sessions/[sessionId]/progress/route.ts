import { withAuth, AuthenticatedRequest } from '@/app/api/lib/middleware/auth.middleware';
import container from '@/app/api/lib/container';
import { WORKOUT_SESSION_TYPES } from '@/app/api/lib/symbols/Symbols';
import { WorkoutSessionController } from '@/app/api/lib/controllers/workoutSession.controller';

export const PATCH = withAuth(async (req: AuthenticatedRequest, { params }: { params: Promise<{ sessionId: string }> }) => {
  const controller = container.get<WorkoutSessionController>(WORKOUT_SESSION_TYPES.WorkoutSessionController);
  return controller.updateSessionProgress(req, { params });
});

