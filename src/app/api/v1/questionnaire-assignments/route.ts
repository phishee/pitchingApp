import { NextRequest, NextResponse } from 'next/server';
import container from '@/app/api/lib/container';
import { QuestionnaireAssignmentController } from '@/app/api/lib/controllers/questionnaireAssignment.controller';
import { QUESTIONNAIRE_ASSIGNMENT_TYPES } from '@/app/api/lib/symbols/Symbols';
import { withAuth, AuthenticatedRequest } from '@/app/api/lib/middleware/auth.middleware';

export const GET = withAuth(async (request: AuthenticatedRequest) => {
    const controller = container.get<QuestionnaireAssignmentController>(QUESTIONNAIRE_ASSIGNMENT_TYPES.QuestionnaireAssignmentController);
    const searchParams = request.nextUrl.searchParams;
    const teamId = searchParams.get('teamId') || '';

    return await controller.getAssignments(teamId);
});

export const POST = withAuth(async (request: AuthenticatedRequest) => {
    const controller = container.get<QuestionnaireAssignmentController>(QUESTIONNAIRE_ASSIGNMENT_TYPES.QuestionnaireAssignmentController);
    const payload = await request.json();

    return await controller.createAssignment(payload);
});
