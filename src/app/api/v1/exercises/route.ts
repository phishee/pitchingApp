import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/app/api/lib/middleware/auth.middleware";
import container from "@/app/api/lib/container";
import { EXERCISE_TYPES } from "@/app/api/lib/symbols/Symbols";
import { ExerciseController } from "@/app/api/lib/controllers/exercise.controller";

export const GET = withAuth(async (req: AuthenticatedRequest) => {
    const exerciseController = container.get<ExerciseController>(EXERCISE_TYPES.ExerciseController);
    return exerciseController.getExercises(req);
});

