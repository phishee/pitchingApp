import { injectable, inject } from 'inversify';
import { MongoDBProvider } from '@/app/api/lib/providers/mongoDb.provider';
import { DB_TYPES } from '../symbols/Symbols';
import { QuestionnaireTemplate } from '@/models/Questionaire';
import { ObjectId } from 'mongodb';

export interface CreateQuestionnairePayload extends Omit<QuestionnaireTemplate, '_id' | 'createdAt' | 'updatedAt'> { }
export interface UpdateQuestionnairePayload extends Partial<Omit<QuestionnaireTemplate, '_id' | 'createdAt' | 'updatedAt'>> { }

@injectable()
export class QuestionnaireService {
    private readonly collectionName = 'questionnaire_templates';

    constructor(
        @inject(DB_TYPES.MongoDBProvider) private mongoProvider: MongoDBProvider
    ) { }

    async getQuestionnaires(organizationId: string, teamId: string): Promise<QuestionnaireTemplate[]> {
        // Fetch system templates (null org) OR templates belonging to this org
        const query = {
            $or: [
                { organizationId: null },
                { organizationId: organizationId }
            ],
            isActive: true
        };

        // Note: Could filter by team visibility if that was in the requirements, but sticking to org level for now.

        return await this.mongoProvider.findQuery(this.collectionName, query) as QuestionnaireTemplate[];
    }

    async getQuestionnaireById(id: string): Promise<QuestionnaireTemplate | null> {
        return await this.mongoProvider.findById(this.collectionName, id) as QuestionnaireTemplate | null;
    }

    async createQuestionnaire(payload: CreateQuestionnairePayload): Promise<QuestionnaireTemplate> {
        const now = new Date();
        const doc = {
            ...payload,
            createdAt: now,
            updatedAt: now
        };
        return await this.mongoProvider.create(this.collectionName, doc);
    }

    async updateQuestionnaire(id: string, payload: UpdateQuestionnairePayload): Promise<QuestionnaireTemplate | null> {
        return await this.mongoProvider.update(this.collectionName, id, {
            ...payload,
            updatedAt: new Date()
        }) as QuestionnaireTemplate | null;
    }

    async deleteQuestionnaire(id: string): Promise<boolean> {
        // interactive soft delete or hard delete? usually soft delete for templates that might have data.
        // For now, let's just mark as inactive
        await this.mongoProvider.update(this.collectionName, id, { isActive: false });
        return true;
    }
}
