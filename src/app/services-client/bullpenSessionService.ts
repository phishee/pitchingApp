import { BullpenSession } from '@/models/Bullpen';
import { FAKE_BULLPEN_SESSION } from '@/data/fakeBullpenData';

export const bullpenSessionService = {
    getSessionById: async (sessionId: string): Promise<BullpenSession> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // In a real app, we'd fetch by ID. Here we return the fake session.
        // If you want to simulate loading different sessions based on ID, 
        // you could clone/modify FAKE_BULLPEN_SESSION here.
        return { ...FAKE_BULLPEN_SESSION, id: sessionId };
    },

    logPitch: async (sessionId: string, pitch: any): Promise<BullpenSession> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));

        console.log(`Logging pitch for session ${sessionId}:`, pitch);

        // In a real app, this would return the updated session
        return {
            ...FAKE_BULLPEN_SESSION,
            id: sessionId,
            pitches: [pitch, ...FAKE_BULLPEN_SESSION.pitches]
        };
    },

    endSession: async (sessionId: string): Promise<BullpenSession> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log(`Ending session ${sessionId}`);
        return { ...FAKE_BULLPEN_SESSION, id: sessionId, status: 'completed', completedAt: new Date() };
    }
};
