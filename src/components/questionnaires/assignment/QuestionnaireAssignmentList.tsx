'use client';

import React, { useEffect, useState } from 'react';
import { QuestionnaireAssignment } from '@/models/Questionaire';
import { questionnaireAssignmentApi } from '@/app/services-client/questionnaireAssignmentApi';
import { QuestionnaireAssignmentCard } from './QuestionnaireAssignmentCard';
import { AssignmentDetailsSheet } from './AssignmentDetailsSheet';

interface Props {
    teamId?: string;
}

export function QuestionnaireAssignmentList({ teamId }: Props) {
    const [assignments, setAssignments] = useState<QuestionnaireAssignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAssignment, setSelectedAssignment] = useState<QuestionnaireAssignment | null>(null);

    useEffect(() => {
        if (teamId) {
            loadData();
        } else {
            setLoading(false);
        }
    }, [teamId]);

    const loadData = async () => {
        try {
            if (!teamId) return;
            const data = await questionnaireAssignmentApi.getAssignments(teamId);
            setAssignments(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="py-12 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (assignments.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-gray-500">No active assignments found.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.map(a => (
                <QuestionnaireAssignmentCard
                    key={a._id}
                    assignment={a}
                    // In a real app, we'd need to fetch or join the template data.
                    // For now, we'll placeholder it or fetch it separately.
                    // Simplification: mocking the template name based on ID
                    template={{
                        name: a.questionnaireTemplateId === 'questionnaire_sleep_quality_v1' ? 'Sleep Quality Check' : 'Daily Check-in',
                    } as any}
                    onViewDetails={setSelectedAssignment}
                />
            ))}

            <AssignmentDetailsSheet
                open={!!selectedAssignment}
                assignment={selectedAssignment}
                onClose={() => setSelectedAssignment(null)}
            />
        </div>
    );
}
