import { injectable, inject } from 'inversify';
import { NextRequest } from 'next/server';
import { BULLPEN_SESSION_TYPES } from '@/app/api/lib/symbols/Symbols';
import type { IBullpenSessionService } from '../services/bullpen-session/interfaces/IBullpenSessionService';
import { BullpenSession } from '@/models/Bullpen';


@injectable()
export class BullpenSessionController {
    constructor(
        @inject(BULLPEN_SESSION_TYPES.BullpenSessionService)
        private readonly bullpenService: IBullpenSessionService
    ) { }

    async createSession(req: NextRequest) {
        try {
            const body = await req.json();
            // Basic validation could happen here or in service
            // Ensure required fields like athleteInfo, organizationId are present
            if (!body.organizationId || !body.athleteInfo) {
                return { error: 'Missing required fields', status: 400 };
            }

            const session = await this.bullpenService.createSession(body);
            return session;
        } catch (error) {
            console.error('Error creating bullpen session:', error);
            throw error;
        }
    }

    async getSessionById(sessionId: string) {
        return this.bullpenService.getSessionById(sessionId);
    }

    async updateSession(sessionId: string, req: NextRequest) {
        const body = await req.json();
        return this.bullpenService.updateSession(sessionId, body);
    }

    async logPitch(sessionId: string, req: NextRequest) {
        const body = await req.json();
        return this.bullpenService.logPitch(sessionId, body);
    }

    async getSessions(req: NextRequest) {
        const { searchParams } = new URL(req.url);
        const workoutAssignmentId = searchParams.get('workoutAssignmentId');

        if (workoutAssignmentId) {
            return this.bullpenService.getSessionsByAssignmentId(workoutAssignmentId);
        }

        return [];
    }
}
