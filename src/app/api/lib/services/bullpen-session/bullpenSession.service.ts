import { injectable, inject } from 'inversify';
import { ObjectId } from 'mongodb';
import { IBullpenSessionService } from './interfaces/IBullpenSessionService';
import { DB_TYPES } from '@/app/api/lib/symbols/Symbols';
import { MongoDBProvider } from '@/app/api/lib/providers/mongoDb.provider';
import { BullpenSession, Pitch } from '@/models/Bullpen';

@injectable()
export class BullpenSessionService implements IBullpenSessionService {
    private readonly collection = 'bullpen_sessions';

    constructor(
        @inject(DB_TYPES.MongoDBProvider)
        private readonly mongoProvider: MongoDBProvider
    ) { }

    async createSession(session: Partial<BullpenSession>): Promise<BullpenSession> {
        const sessionWithDefaults = {
            ...session,
            pitches: session.pitches || [],
            status: session.status || 'in_progress',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await this.mongoProvider.create(this.collection, sessionWithDefaults);
        return this.normalizeSession(result);
    }

    async getSessionById(sessionId: string): Promise<BullpenSession | null> {
        const session = await this.mongoProvider.findById(this.collection, sessionId);
        return session ? this.normalizeSession(session) : null;
    }

    async updateSession(sessionId: string, updates: Partial<BullpenSession>): Promise<BullpenSession | null> {
        // Prevent overriding immutable fields accidentally
        const { id, _id, ...safeUpdates } = updates as any;

        const result = await this.mongoProvider.update(this.collection, sessionId, {
            ...safeUpdates,
            updatedAt: new Date()
        });

        return result ? this.normalizeSession(result) : null;
    }

    async logPitch(sessionId: string, pitch: Pitch): Promise<BullpenSession | null> {
        const session = await this.getSessionById(sessionId);
        if (!session) return null;

        const updatedPitches = [...session.pitches, pitch];

        // --- Calculate Summary Metrics ---
        const totalPitches = updatedPitches.length;

        // 1. Strike Percentage
        const totalStrikes = updatedPitches.filter(p => p.strike).length;
        const strikePct = totalPitches > 0 ? Math.round((totalStrikes / totalPitches) * 100) : 0;

        // 2. Velocity Stats (Average & Top)
        const validVelocities = updatedPitches
            .map(p => p.velocity)
            .filter((v): v is number => typeof v === 'number' && v > 0);

        const topVelocity = validVelocities.length > 0 ? Math.max(...validVelocities) : 0;
        const avgVelocity = validVelocities.length > 0
            ? parseFloat((validVelocities.reduce((a, b) => a + b, 0) / validVelocities.length).toFixed(1))
            : 0;

        // 3. Compliance (Target Accuracy)
        const totalCompliant = updatedPitches.filter(p => p.compliance).length;
        // Compliance is typically % of pitches that matched target
        const compliance = totalPitches > 0 ? Math.round((totalCompliant / totalPitches) * 100) : 0;

        const updatedSummary = {
            ...session.summary,
            totalPitchCompleted: totalPitches,
            strikePct,
            topVelocity,
            avgVelocity,
            compliance
        };

        return this.updateSession(sessionId, {
            pitches: updatedPitches,
            summary: updatedSummary
        });
    }

    async getSessionsByAssignmentId(assignmentId: string): Promise<BullpenSession[]> {
        const sessions = await this.mongoProvider.findQuery(this.collection, { workoutAssignmentId: assignmentId });
        return sessions.map(s => this.normalizeSession(s));
    }

    private normalizeSession(doc: any): BullpenSession {
        if (!doc) return doc;
        const { _id, ...rest } = doc;
        return {
            id: _id.toString(),
            ...rest,
        };
    }
}
