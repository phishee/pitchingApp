
import container from '@/app/api/lib/container';
import { QuestionnaireAssignmentController } from '@/app/api/lib/controllers/questionnaireAssignment.controller';
import { QUESTIONNAIRE_ASSIGNMENT_TYPES } from '@/app/api/lib/symbols/Symbols';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> } // Correct type for dynamic routes as of Next.js 15+ or generally safe
) {
    const { id } = await params;
    const body = await request.json();
    const { isActive } = body;

    const controller = container.get<QuestionnaireAssignmentController>(QUESTIONNAIRE_ASSIGNMENT_TYPES.QuestionnaireAssignmentController);
    return controller.toggleStatus(id, isActive);
}
