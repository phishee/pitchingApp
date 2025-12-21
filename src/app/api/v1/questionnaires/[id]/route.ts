import container from '@/app/api/lib/container';
import { QuestionnaireController } from '@/app/api/lib/controllers/questionnaire.controller';
import { QUESTIONNAIRE_TYPES } from '@/app/api/lib/symbols/Symbols';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const params = await context.params;
    const { id } = params;

    const controller = container.get<QuestionnaireController>(QUESTIONNAIRE_TYPES.QuestionnaireController);
    return controller.getQuestionnaireById(id);
}
