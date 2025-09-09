import { NextRequest, NextResponse } from "next/server";
import container from "@/app/api/lib/container";
import { EXERCISE_TYPES } from "@/app/api/lib/symbols/Symbols";
import { ExerciseController } from "@/app/api/lib/controllers/exercise.controller";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const exerciseController = container.get<ExerciseController>(EXERCISE_TYPES.ExerciseController);
    return exerciseController.getExerciseById(req, { params });
}