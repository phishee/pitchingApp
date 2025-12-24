import { injectable, inject } from 'inversify';
import { MongoDBProvider } from '@/app/api/lib/providers/mongoDb.provider';
import { DB_TYPES } from '../symbols/Symbols';
import { QuestionnaireResult } from '@/models/Questionaire';
import { ObjectId } from 'mongodb';

@injectable()
export class QuestionnaireResultService {
    private readonly collectionName = 'questionnaire_results';

    constructor(
        @inject(DB_TYPES.MongoDBProvider) private mongoProvider: MongoDBProvider
    ) { }

    async submitResult(result: QuestionnaireResult): Promise<QuestionnaireResult> {
        const now = new Date();
        const doc = {
            ...result,
            scheduledDate: new Date(result.scheduledDate),
            submittedAt: new Date(result.submittedAt),
            createdAt: now,
            updatedAt: now
        };
        return await this.mongoProvider.create(this.collectionName, doc);
    }

    async hasCompletedForDate(questionnaireTemplateId: string, userId: string, date: Date): Promise<boolean> {
        // Find if improved query needed for date range.
        // Assuming date is set to midnight of the target day.
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const query = {
            questionnaireTemplateId,
            'athleteInfo.userId': userId,
            scheduledDate: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        };

        const count = await this.mongoProvider.getCollection(this.collectionName).countDocuments(query);
        return count > 0;
    }

    async getResults(userId: string, templateId?: string, startDate?: Date, endDate?: Date): Promise<QuestionnaireResult[]> {
        const query: any = {
            'athleteInfo.userId': userId
        };

        if (templateId) {
            query.questionnaireTemplateId = templateId;
        }

        if (startDate || endDate) {
            query.scheduledDate = {};
            if (startDate) {
                query.scheduledDate.$gte = startDate;
            }
            if (endDate) {
                query.scheduledDate.$lte = endDate;
            }
        }

        return await this.mongoProvider.findQuery(this.collectionName, query) as QuestionnaireResult[];
    }
}
