import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/app/api/lib/middleware/auth.middleware";
import container from "@/app/api/lib/container";
import { WORKOUT_TYPES } from "@/app/api/lib/symbols/Symbols";
import { WorkoutController } from "@/app/api/lib/controllers/workout.controller";

export const GET = withAuth(async (req: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) => {
  const workoutController = container.get<WorkoutController>(WORKOUT_TYPES.WorkoutController);
  return workoutController.getWorkoutById(req, { params });
});

export const PUT = withAuth(async (req: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) => {
  const workoutController = container.get<WorkoutController>(WORKOUT_TYPES.WorkoutController);
  return workoutController.updateWorkout(req, { params });
});

export const DELETE = withAuth(async (req: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) => {
  const workoutController = container.get<WorkoutController>(WORKOUT_TYPES.WorkoutController);
  return workoutController.deleteWorkout(req, { params });
});