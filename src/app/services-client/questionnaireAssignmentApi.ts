import apiClient from "@/lib/axios-config";
import { QuestionnaireAssignment } from "@/models/Questionaire";

const API_BASE = '/questionnaire-assignments';

export interface AssignQuestionnaireData {
    questionnaireTemplateId: string;
    teamId: string;
    targetType: 'team' | 'individual'; // Matches API expectation? Payload is flexible in controller
    targetMembers?: string[];
    targetAthletes?: string[]; // Deprecated, keep for backward compat if needed, or remove. keeping for now but logic should primarily use targetMembers
    schedule: {
        pattern: 'once' | 'daily' | 'weekly';
        startDate: Date;
        endDate?: Date;
        daysOfWeek?: number[];
        time: string; // "HH:MM"
    };
}

export const questionnaireAssignmentApi = {
    async assignQuestionnaire(data: AssignQuestionnaireData): Promise<void> {
        // Map frontend data to backend expected payload if necessary.
        // The backend `CreateAssignmentPayload` expects properties matching `QuestionnaireAssignment`.
        // We might need to construct the payload here or ensure frontend sends exact structure.
        // Let's assume we send a payload that the controller/service can handle or standardizing it here.

        // Constructing payload to match QuestionnaireAssignment model
        const payload = {
            questionnaireTemplateId: data.questionnaireTemplateId,
            teamId: data.teamId,
            recurrence: {
                pattern: data.schedule.pattern,
                startDate: data.schedule.startDate, // axios will serialize date
                endDate: data.schedule.endDate,
                daysOfWeek: data.schedule.daysOfWeek
            },
            expiresAtTime: data.schedule.time,
            isActive: true,
            targetMembers: data.targetMembers
            // For now, simple team assignment
            // In future, if targetType is individual, we might need multiple records or a list of userIds
        };

        const res = await apiClient.post(API_BASE, payload);
        return res.data;
    },

    async getAssignments(teamId: string): Promise<QuestionnaireAssignment[]> {
        const params = new URLSearchParams({ teamId });
        const res = await apiClient.get<QuestionnaireAssignment[]>(`${API_BASE}?${params.toString()}`);
        return res.data;
    },

    async toggleAssignmentStatus(id: string, isActive: boolean): Promise<void> {
        await apiClient.patch(`${API_BASE}/${id}/status`, { isActive });
    }
};
