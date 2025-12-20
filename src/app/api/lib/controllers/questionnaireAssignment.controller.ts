import { injectable, inject } from 'inversify';
import { QuestionnaireAssignmentService } from '../services/questionnaireAssignment.service';
import { QUESTIONNAIRE_ASSIGNMENT_TYPES } from '../symbols/Symbols';
import { NextResponse } from 'next/server';

@injectable()
export class QuestionnaireAssignmentController {
    constructor(
        @inject(QUESTIONNAIRE_ASSIGNMENT_TYPES.QuestionnaireAssignmentService) private service: QuestionnaireAssignmentService
    ) { }

    async getAssignments(teamId: string) {
        try {
            if (!teamId) {
                return NextResponse.json({ error: "Team ID required" }, { status: 400 });
            }
            const data = await this.service.getAssignments(teamId);
            return NextResponse.json(data);
        } catch (error: any) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }

    async createAssignment(payload: any) {
        try {
            const data = await this.service.createAssignment(payload);
            return NextResponse.json(data, { status: 201 });
        } catch (error: any) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }

    async toggleStatus(id: string, isActive: boolean) {
        try {
            if (!id) {
                return NextResponse.json({ error: "Assignment ID required" }, { status: 400 });
            }
            const data = await this.service.toggleActiveStatus(id, isActive);
            return NextResponse.json(data);
        } catch (error: any) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
}
