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

    async updateAssignment(id: string, payload: any) {
        try {
            if (!id) {
                return NextResponse.json({ error: "Assignment ID required" }, { status: 400 });
            }
            // Basic validation could be added here
            const data = await this.service.updateAssignment(id, payload);
            return NextResponse.json(data);
        } catch (error: any) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }

    async getPendingAssignments(userId: string, memberId: string | null, teamId: string, dateStr: string | null) {
        try {
            if (!userId || !teamId) {
                return NextResponse.json({ error: "userId and teamId are required" }, { status: 400 });
            }

            const date = dateStr ? new Date(dateStr) : new Date();
            const pending = await this.service.getPendingAssignments(userId, memberId || undefined, teamId, date);
            return NextResponse.json(pending);
        } catch (error: any) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
}
