import { NextRequest, NextResponse } from "next/server";
import container from "@/app/api/lib/container";
import { WORKOUT_TYPES } from "@/app/api/lib/symbols/Symbols";
import { WorkoutController } from "@/app/api/lib/controllers/workout.controller";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const workoutController = container.get<WorkoutController>(WORKOUT_TYPES.WorkoutController);
  return workoutController.getWorkoutById(req, { params });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const workoutController = container.get<WorkoutController>(WORKOUT_TYPES.WorkoutController);
  return workoutController.updateWorkout(req, { params });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const workoutController = container.get<WorkoutController>(WORKOUT_TYPES.WorkoutController);
  return workoutController.deleteWorkout(req, { params });
}