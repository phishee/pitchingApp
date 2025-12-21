'use client';

import React, { useState, useEffect } from 'react';
import { QuestionnaireHeader } from '@/components/questionnaires/QuestionnaireHeader';
import { QuestionnaireCard } from '@/components/questionnaires/QuestionnaireCard';
import { questionnaireApi } from '@/app/services-client/questionnaireApi';
import { QuestionnaireTemplate } from '@/models/Questionaire';
import { AssignQuestionnaireDialog } from '@/components/questionnaires/assignment/AssignQuestionnaireDialog';
import { QuestionnaireAssignmentList } from '@/components/questionnaires/assignment/QuestionnaireAssignmentList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useOrganization } from '@/providers/organization-context';
import { useTeam } from '@/providers/team-context';

// Prevent static generation since this page uses client-side hooks and context
export const dynamic = 'force-dynamic';

export default function QuestionnairesPage() {
    const [questionnaires, setQuestionnaires] = useState<QuestionnaireTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [assigningQuestionnaire, setAssigningQuestionnaire] = useState<QuestionnaireTemplate | null>(null);

    const { currentOrganization } = useOrganization();
    const { currentTeam } = useTeam();

    useEffect(() => {
        if (currentOrganization?._id) {
            loadQuestionnaires();
        }
    }, [currentOrganization?._id, currentTeam?._id]);



    const loadQuestionnaires = async () => {
        try {
            setLoading(true);
            setError(null);
            if (!currentOrganization) return;
            const data = await questionnaireApi.getQuestionnaireTemplates(currentOrganization._id, currentTeam?._id);
            setQuestionnaires(data);
        } catch (err) {
            console.error('Failed to load questionnaires:', err);
            setError('Failed to load questionnaires');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        // Placeholder for create logic
        console.log('Create questionnaire');
    };

    const handleClick = (questionnaire: QuestionnaireTemplate) => {
        console.log('Clicked questionnaire:', questionnaire.name);
        // Future navigation logic
    };

    const handleAssign = (questionnaire: QuestionnaireTemplate) => {
        setAssigningQuestionnaire(questionnaire);
    };

    if (loading) {
        return (
            <div className="container mx-auto p-4 md:p-6">
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading questionnaires...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-4 md:p-6">
                <div className="text-center py-12">
                    <div className="text-red-600 mb-4">Error: {error}</div>
                    <button
                        onClick={loadQuestionnaires}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-6 space-y-6">
            <QuestionnaireHeader onCreate={handleCreate} />

            <Tabs defaultValue="library" className="w-full">
                <TabsList className="mb-6 rounded-full p-3">
                    <TabsTrigger value="library" className="rounded-full">Library</TabsTrigger>
                    <TabsTrigger value="assignments" className="rounded-full">Assignments</TabsTrigger>
                </TabsList>

                <TabsContent value="library" className="space-y-6">
                    {questionnaires.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
                            <p className="text-gray-500">No questionnaires found.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {questionnaires.map((q) => (
                                <QuestionnaireCard
                                    key={q._id}
                                    questionnaire={q}
                                    onClick={handleClick}
                                    onAssign={handleAssign}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="assignments">
                    <QuestionnaireAssignmentList teamId={currentTeam?._id} />
                </TabsContent>
            </Tabs>

            <AssignQuestionnaireDialog
                open={!!assigningQuestionnaire}
                questionnaire={assigningQuestionnaire}
                onClose={() => setAssigningQuestionnaire(null)}
                teamId={currentTeam?._id}
                teamName={currentTeam?.name}
            />
        </div>
    );
}
