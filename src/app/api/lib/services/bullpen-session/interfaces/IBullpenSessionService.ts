import { BullpenSession, Pitch } from '@/models/Bullpen';

export interface IBullpenSessionService {
    createSession(session: Partial<BullpenSession>): Promise<BullpenSession>;
    getSessionById(sessionId: string): Promise<BullpenSession | null>;
    updateSession(sessionId: string, updates: Partial<BullpenSession>): Promise<BullpenSession | null>;
    logPitch(sessionId: string, pitch: Pitch): Promise<BullpenSession | null>;
    getSessionsByAssignmentId(assignmentId: string): Promise<BullpenSession[]>;
}
