import apiClient from '@/lib/axios-config';
import { BullpenSession, Pitch } from '@/models/Bullpen';
import { FAKE_BULLPEN_SESSION } from '@/data/fakeBullpenData';

const BASE_URL = '/bullpen-sessions';

export const bullpenSessionService = {
    createSession: async (session: Partial<BullpenSession>): Promise<BullpenSession> => {
        const response = await apiClient.post<BullpenSession>(BASE_URL, session);
        return response.data;
    },

    getSessionById: async (sessionId: string): Promise<BullpenSession> => {
        try {
            const response = await apiClient.get<BullpenSession>(`${BASE_URL}/${sessionId}`);
            console.log('Got session:', response.data);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch session, falling back to fake data for demo if 404", error);
            // Fallback for demo purposes if backend isn't running or ID not found
            // In production, throw error or return null
            throw error;
        }
    },

    logPitch: async (sessionId: string, pitch: Pitch): Promise<BullpenSession> => {
        const response = await apiClient.post<BullpenSession>(`${BASE_URL}/${sessionId}/pitch`, pitch);
        return response.data;
    },

    endSession: async (sessionId: string): Promise<BullpenSession> => {
        const response = await apiClient.patch<BullpenSession>(`${BASE_URL}/${sessionId}`, {
            status: 'completed',
            completedAt: new Date()
        });
        return response.data;
    },

    updateSession: async (sessionId: string, updates: Partial<BullpenSession>): Promise<BullpenSession> => {
        const response = await apiClient.patch<BullpenSession>(`${BASE_URL}/${sessionId}`, updates);
        return response.data;
    },

    getSessionsByAssignmentId: async (assignmentId: string): Promise<BullpenSession[]> => {
        const response = await apiClient.get<BullpenSession[]>(`${BASE_URL}?workoutAssignmentId=${assignmentId}`);
        return response.data;
    }
};

