import { injectable, inject } from 'inversify';
import { MongoDBProvider } from '@/app/api/lib/providers/mongoDb.provider';
import { DB_TYPES } from '../symbols/Symbols';
import { QuestionnaireAssignment } from '@/models/Questionaire';

export interface CreateAssignmentPayload extends Omit<QuestionnaireAssignment, '_id' | 'createdAt' | 'updatedAt'> { }

import { QuestionnaireResultService } from './questionnaireResult.service';
import { QUESTIONNAIRE_RESULT_TYPES } from '../symbols/Symbols';

@injectable()
export class QuestionnaireAssignmentService {
    private readonly collectionName = 'questionnaire_assignments';

    constructor(
        @inject(DB_TYPES.MongoDBProvider) private mongoProvider: MongoDBProvider,
        @inject(QUESTIONNAIRE_RESULT_TYPES.QuestionnaireResultService) private resultService: QuestionnaireResultService
    ) { }

    async getAssignments(teamId: string, athleteId?: string): Promise<QuestionnaireAssignment[]> {
        const query: any = {
            teamId: teamId
        };

        if (athleteId) {
            // Logic to find assignments specific to this athlete OR team assignments that include this athlete
            // For MVP, if targetType is 'team', we return it. If 'athlete', we match ID.
            // But typical schema uses targetRoles or specific list. 
            // Based on model: targetRoles. 
            // Simplification: just return team level assignments for now.
        }

        return await this.mongoProvider.findQuery(this.collectionName, query) as QuestionnaireAssignment[];
    }

    async getAssignmentByMemberId(memberId: string, teamId: string): Promise<QuestionnaireAssignment[]> {
        const query: any = {
            targetMembers: memberId,
            isActive: true,
            teamId: teamId
        };

        return await this.mongoProvider.findQuery(this.collectionName, query) as QuestionnaireAssignment[];
    }

    async createAssignment(payload: CreateAssignmentPayload): Promise<QuestionnaireAssignment> {
        const now = new Date();
        const doc = {
            ...payload,
            createdAt: now,
            updatedAt: now
        };

        // Future: Generate individual instances on a calendar (Events) if using Event system.
        // For now, simplifed model just stores the assignment rule.

        return await this.mongoProvider.create(this.collectionName, doc);
    }
    async toggleActiveStatus(id: string, isActive: boolean): Promise<QuestionnaireAssignment> {
        return await this.mongoProvider.update(this.collectionName, id, { isActive });
    }

    async updateAssignment(id: string, payload: Partial<CreateAssignmentPayload>): Promise<QuestionnaireAssignment> {
        return await this.mongoProvider.update(this.collectionName, id, {
            ...payload,
            updatedAt: new Date()
        });
    }

    async getPendingAssignments(userId: string, memberId: string | undefined, teamId: string, date: Date = new Date()): Promise<any[]> {
        // 1. Get all active assignments for member
        const assignments = await this.getAssignmentByMemberId(memberId, teamId);

        if (!memberId) {
            // Fallback? Or return empty? If memberId is required for this new logic, we should enforce it.
            // But route allows undefined. If undefined, maybe we want 'team' assignments with no constraints?
            // The previous logic allowed returning if targetMembers empty. 
            // BUT user asked to remove "Filter for user targeting".
            // Let's iterate over 'assignments' directly.
        }

        const pending = [];
        for (const assignment of assignments) {
            // 3. Check Schedule (basic daily check for MVP)
            // 3. Check Schedule (basic daily check for MVP)
            // If frequency is 'daily', it matches today. 
            // If 'weekly', check daysOfWeek. 
            // If 'once', check start/end date logic.

            let isScheduledForToday = false;
            const todayDay = date.getDay(); // 0-6

            if (assignment.recurrence.pattern === 'daily') {
                isScheduledForToday = true;
            } else if (assignment.recurrence.pattern === 'weekly') {
                if (assignment.recurrence.daysOfWeek?.includes(todayDay)) {
                    isScheduledForToday = true;
                }
            } else if (assignment.recurrence.pattern === 'once') {
                // Check if start date is today (ignoring time)
                const start = new Date(assignment.recurrence.startDate);
                if (start.toDateString() === date.toDateString()) {
                    isScheduledForToday = true;
                }
            }

            if (isScheduledForToday) {
                // 4. Check if already completed
                const completed = await this.resultService.hasCompletedForDate(assignment.questionnaireTemplateId, userId, date);
                if (!completed) {
                    // Return assignment with templateId. Frontend can fetch template details or we can join here.
                    // Returning assignment object for now.
                    pending.push(assignment);
                }
            }
        }
        return pending;
    }
}
