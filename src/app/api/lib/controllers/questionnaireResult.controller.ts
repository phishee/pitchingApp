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
}
