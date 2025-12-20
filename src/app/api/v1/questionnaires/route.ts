import { NextRequest, NextResponse } from 'next/server';
import container from '@/app/api/lib/container';
import { QuestionnaireController } from '@/app/api/lib/controllers/questionnaire.controller';
import { QUESTIONNAIRE_TYPES } from '@/app/api/lib/symbols/Symbols';
import { withAuth, AuthenticatedRequest } from '@/app/api/lib/middleware/auth.middleware';

export const GET = withAuth(async (request: AuthenticatedRequest) => {
    const controller = container.get<QuestionnaireController>(QUESTIONNAIRE_TYPES.QuestionnaireController);
    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get('organizationId') || '';
    const teamId = searchParams.get('teamId') || '';

    return await controller.getQuestionnaires(organizationId, teamId);
});

export const POST = withAuth(async (request: AuthenticatedRequest) => {
    const controller = container.get<QuestionnaireController>(QUESTIONNAIRE_TYPES.QuestionnaireController);
    const payload = await request.json();

    return await controller.createQuestionnaire(payload);
});
