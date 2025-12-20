import { injectable, inject } from 'inversify';
import { QuestionnaireService } from '../services/questionnaire.service';
import { QUESTIONNAIRE_TYPES } from '../symbols/Symbols';
import { NextResponse } from 'next/server';

@injectable()
export class QuestionnaireController {
    constructor(
        @inject(QUESTIONNAIRE_TYPES.QuestionnaireService) private questionnaireService: QuestionnaireService
    ) { }

    async getQuestionnaires(organizationId: string, teamId: string) {
        try {
            if (!organizationId) { // simple validation
                throw new Error("Organization ID is required");
            }
            const data = await this.questionnaireService.getQuestionnaires(organizationId, teamId);
            return NextResponse.json(data);
        } catch (error: any) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }

    async createQuestionnaire(payload: any) {
        try {
            const data = await this.questionnaireService.createQuestionnaire(payload);
            return NextResponse.json(data, { status: 201 });
        } catch (error: any) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
}
