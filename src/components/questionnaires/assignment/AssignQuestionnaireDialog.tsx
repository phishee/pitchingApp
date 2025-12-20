'use client';

import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { QuestionnaireTemplate } from '@/models/Questionaire';
import { StepSelectTargets } from './StepSelectTargets';
import { StepSchedule } from './StepSchedule';
import { useTeam } from '@/providers/team-context';
import { questionnaireAssignmentApi, AssignQuestionnaireData } from '@/app/services-client/questionnaireAssignmentApi';
import { teamMemberApi } from '@/app/services-client/teamMemberApi';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
// Note: Using Sheet instead of Dialog for better mobile experience and consistency if available, 
// otherwise fall back to custom or standard Dialog. Given standard UI lib, assuming standard Dialog or Sheet. 
// I'll stick to a custom modal implementation for now to avoid dependency assumption issues, or use the project's Dialog if standard.
// Based on previous files, `AssignmentOrchestrator` used custom wizard. Let's build a clean custom Dialog overlay.

interface AssignQuestionnaireDialogProps {
    questionnaire: QuestionnaireTemplate | null;
    open: boolean;
    onClose: () => void;
    teamId?: string;
    organizationId?: string;
    teamName?: string;
}

interface DialogState {
    targetType: 'team' | 'individual';
    teamId: string;
    targetAthletes?: string[];
    recurrence: {
        pattern: 'daily' | 'weekly' | 'once';
        startDate: Date;
        endDate?: Date;
    };
}

export function AssignQuestionnaireDialog({ questionnaire, open, onClose, teamId, teamName }: AssignQuestionnaireDialogProps) {
    const { teamMembers, loadTeamMembers } = useTeam();
    const [step, setStep] = useState<1 | 2>(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [displayedMembers, setDisplayedMembers] = useState<{ id: string; name: string }[]>([]);

    React.useEffect(() => {
        if (open && teamId) {
            loadMembers();
        }
    }, [open, teamId]);

    const loadMembers = async () => {
        try {
            if (!teamId) return;
            // Ensure we have latest members
            await loadTeamMembers(teamId);
        } catch (e) {
            console.error("Failed to load team members", e);
        }
    };

    useEffect(() => {
        if (teamMembers) {
            setDisplayedMembers(teamMembers
                .filter(m => m.status === 'active' && 'user' in m && m.user)
                .map((m: any) => ({
                    id: m.userId,
                    name: m.user?.firstName ? `${m.user.firstName} ${m.user.lastName}` : (m.user?.email || 'Unknown User'),
                    avatarUrl: m.user?.profileImageUrl
                })));
        }
    }, [teamMembers]);

    // Assignment State
    const [assignmentData, setAssignmentData] = useState<DialogState>({
        targetType: 'team',
        teamId: teamId || '',
        recurrence: { pattern: 'daily', startDate: new Date() }
    });

    // Mock Team Data
    // const teamName = "Var Baseball 2024"; // REMOVED: Using prop
    /* 
    const teamMembersMock = [
        { id: "1", name: "John Doe" },
        { id: "2", name: "Jane Smith" },
        { id: "3", name: "Mike Johnson" },
        { id: "4", name: "Sarah Williams" }
    ]; 
    */

    if (!open || !questionnaire) return null;

    const handleNext = () => setStep(2);
    const handleBack = () => setStep(1);

    const handleAssign = async () => {
        setIsSubmitting(true);
        try {
            await questionnaireAssignmentApi.assignQuestionnaire({
                questionnaireTemplateId: questionnaire._id,
                teamId: assignmentData.teamId || teamId!,
                targetType: assignmentData.targetType!,
                // If Team: assign all active members (filtered list)
                // If Individual: assign specific selected athletes (targetAthletes)
                targetMembers: assignmentData.targetType === 'team'
                    ? displayedMembers.map(m => m.id)
                    : assignmentData.targetAthletes,
                schedule: {
                    pattern: assignmentData.recurrence!.pattern,
                    startDate: assignmentData.recurrence!.startDate,
                    endDate: assignmentData.recurrence!.endDate,
                    time: "06:00" // Default time as per instructions
                }
            });

            // Success handling
            setTimeout(() => {
                setIsSubmitting(false);
                onClose();
                setStep(1);
            }, 500);
        } catch (error) {
            console.error(error);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Assign Questionnaire</h2>
                        <p className="text-xs text-gray-500">{questionnaire.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {step === 1 ? (
                        <StepSelectTargets
                            teamName={teamName || 'Current Team'}
                            teamMembers={displayedMembers}
                            onSelectionChange={(sel) => setAssignmentData(prev => ({ ...prev, ...sel }))}
                        />
                    ) : (
                        <StepSchedule
                            onScheduleChange={(sch) => setAssignmentData(prev => ({ ...prev, recurrence: sch }))}
                        />
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0 flex justify-between items-center">
                    {step === 2 ? (
                        <button
                            onClick={handleBack}
                            className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2"
                        >
                            Back
                        </button>
                    ) : (
                        <div></div> // Spacer
                    )}

                    {step === 1 ? (
                        <button
                            onClick={handleNext}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
                        >
                            Next Step
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleAssign}
                            disabled={isSubmitting}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Assigning...
                                </>
                            ) : (
                                <>
                                    Confirm Assignment
                                    <CheckCircle2 className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
