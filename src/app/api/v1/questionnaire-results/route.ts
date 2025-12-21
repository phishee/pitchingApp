import container from '@/app/api/lib/container';
import { QuestionnaireResultController } from '@/app/api/lib/controllers/questionnaireResult.controller';
import { QUESTIONNAIRE_RESULT_TYPES } from '@/app/api/lib/symbols/Symbols';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const controller = container.get<QuestionnaireResultController>(QUESTIONNAIRE_RESULT_TYPES.QuestionnaireResultController);
    const body = await request.json();
    return controller.submitResult(body);
}
