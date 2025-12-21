import container from '@/app/api/lib/container';
import { QuestionnaireAssignmentController } from '@/app/api/lib/controllers/questionnaireAssignment.controller';
import { QUESTIONNAIRE_ASSIGNMENT_TYPES } from '@/app/api/lib/symbols/Symbols';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const memberId = searchParams.get('memberId');
    const teamId = searchParams.get('teamId');
    const dateStr = searchParams.get('date');

    const controller = container.get<QuestionnaireAssignmentController>(QUESTIONNAIRE_ASSIGNMENT_TYPES.QuestionnaireAssignmentController);
    return await controller.getPendingAssignments(userId!, memberId, teamId!, dateStr);
}
