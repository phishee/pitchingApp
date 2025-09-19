import { NextRequest, NextResponse } from "next/server";
import container from "@/app/api/lib/container";
import { WORKOUT_TYPES } from "@/app/api/lib/symbols/Symbols";
import { WorkoutController } from "@/app/api/lib/controllers/workout.controller";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const workoutController = container.get<WorkoutController>(WORKOUT_TYPES.WorkoutController);
  return workoutController.getWorkoutsWithUsers(req);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const workoutController = container.get<WorkoutController>(WORKOUT_TYPES.WorkoutController);
  return workoutController.createWorkout(req);
}