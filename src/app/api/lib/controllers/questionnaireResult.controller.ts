import { injectable, inject } from 'inversify';
import { QuestionnaireResultService } from '../services/questionnaireResult.service';
import { QUESTIONNAIRE_RESULT_TYPES } from '../symbols/Symbols';
import { NextResponse } from 'next/server';

@injectable()
export class QuestionnaireResultController {
    constructor(
        @inject(QUESTIONNAIRE_RESULT_TYPES.QuestionnaireResultService) private service: QuestionnaireResultService
    ) { }

    async submitResult(payload: any) {
        try {
            // Validation logic could go here
            if (!payload.questionnaireTemplateId || !payload.answers) {
                return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
            }

            const data = await this.service.submitResult(payload);
            return NextResponse.json(data, { status: 201 });
        } catch (error: any) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }

    async getResults(userId: string, templateId?: string, startDate?: string, endDate?: string) {
        try {
            if (!userId) {
                return NextResponse.json({ error: "User ID required" }, { status: 400 });
            }

            const start = startDate ? new Date(startDate) : undefined;
            const end = endDate ? new Date(endDate) : undefined;

            const data = await this.service.getResults(userId, templateId, start, end);
            return NextResponse.json(data);
        } catch (error: any) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
}
