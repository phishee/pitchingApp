import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/app/api/lib/middleware/auth.middleware";
import container from "@/app/api/lib/container";
import { WORKOUT_TYPES } from "@/app/api/lib/symbols/Symbols";
import { WorkoutController } from "@/app/api/lib/controllers/workout.controller";

export const GET = withAuth(async (req: AuthenticatedRequest): Promise<NextResponse> => {
  const workoutController = container.get<WorkoutController>(WORKOUT_TYPES.WorkoutController);
  return workoutController.getWorkoutsWithUsers(req);
});

export const POST = withAuth(async (req: AuthenticatedRequest): Promise<NextResponse> => {
  const workoutController = container.get<WorkoutController>(WORKOUT_TYPES.WorkoutController);
  return workoutController.createWorkout(req);
});