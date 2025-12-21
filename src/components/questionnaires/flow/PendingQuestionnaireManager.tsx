'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@/providers/user.context';
import { useTeam } from '@/providers/team-context';
import { QuestionnaireAssignment } from '@/models/Questionaire';
import { questionnaireAssignmentApi } from '@/app/services-client/questionnaireAssignmentApi';
import { QuestionnaireDrawer } from './QuestionnaireDrawer';

export function PendingQuestionnaireManager() {
    const { user } = useUser();
    const { currentTeam, currentTeamMember } = useTeam();
    const [pendingAssignments, setPendingAssignments] = useState<QuestionnaireAssignment[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [currentAssignment, setCurrentAssignment] = useState<QuestionnaireAssignment | null>(null);

    useEffect(() => {
        if (user && currentTeam && currentTeamMember) {
            checkPending();
        }
    }, [user, currentTeam, currentTeamMember]);

    const checkPending = async () => {
        try {
            // using user.userId and currentTeamMember._id
            if (!currentTeamMember?._id) return;
            const pending = await questionnaireAssignmentApi.getPendingAssignments(user!.userId, currentTeamMember._id, currentTeam!._id);
            if (pending && pending.length > 0) {
                setPendingAssignments(pending);
                setCurrentAssignment(pending[0]);
                setIsOpen(true);
            }
        } catch (error) {
            console.error("Failed to check pending questionnaires", error);
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        // Maybe mark as skipped in session storage so we don't annoy them every reload?
    };

    const handleComplete = () => {
        // Remove completed from list
        const remaining = pendingAssignments.filter(a => a._id !== currentAssignment?._id);
        if (remaining.length > 0) {
            setPendingAssignments(remaining);
            setCurrentAssignment(remaining[0]);
        } else {
            setIsOpen(false);
        }
    };

    if (!isOpen || !currentAssignment) return null;

    return (
        <QuestionnaireDrawer
            open={isOpen}
            onClose={handleClose}
            assignment={currentAssignment}
            onComplete={handleComplete}
        />
    );
}
