import apiClient from "@/lib/axios-config";
import { QuestionnaireTemplate } from "@/models/Questionaire";

const API_BASE = '/questionnaires';

export const questionnaireApi = {
    async getQuestionnaireTemplates(organizationId: string, teamId?: string): Promise<QuestionnaireTemplate[]> {
        const params = new URLSearchParams();
        if (organizationId) params.append('organizationId', organizationId);
        if (teamId) params.append('teamId', teamId);

        try {
            const res = await apiClient.get<QuestionnaireTemplate[]>(`${API_BASE}?${params.toString()}`);
            return res.data;
        } catch (error) {
            console.error('Failed to fetch questionnaires:', error);
            // Return empty array instead of throwing to avoid crashing UI for now, 
            // or let the component handle the error. 
            // Given the previous mock implementation, let's bubble up the error 
            // so the component can set setError(true).
            throw error;
        }
    },

    async getTemplate(id: string): Promise<QuestionnaireTemplate> {
        const res = await apiClient.get<QuestionnaireTemplate>(`${API_BASE}/${id}`);
        return res.data;
    },

    async submitResult(payload: any): Promise<void> {
        await apiClient.post(`/questionnaire-results`, payload);
    }
};
