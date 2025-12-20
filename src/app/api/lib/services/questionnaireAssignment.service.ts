import { injectable, inject } from 'inversify';
import { MongoDBProvider } from '@/app/api/lib/providers/mongoDb.provider';
import { DB_TYPES } from '../symbols/Symbols';
import { QuestionnaireAssignment } from '@/models/Questionaire';

export interface CreateAssignmentPayload extends Omit<QuestionnaireAssignment, '_id' | 'createdAt' | 'updatedAt'> { }

@injectable()
export class QuestionnaireAssignmentService {
    private readonly collectionName = 'questionnaire_assignments';

    constructor(
        @inject(DB_TYPES.MongoDBProvider) private mongoProvider: MongoDBProvider
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
}
