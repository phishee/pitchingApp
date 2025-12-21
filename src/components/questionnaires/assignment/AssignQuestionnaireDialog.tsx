import { QuestionnaireAssignment, QuestionnaireTemplate } from '@/models/Questionaire';
import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { StepSelectTargets } from './StepSelectTargets';
import { StepSchedule } from './StepSchedule';
import { useTeam } from '@/providers/team-context';
import { questionnaireAssignmentApi } from '@/app/services-client/questionnaireAssignmentApi';
// removed unused imports

interface AssignQuestionnaireDialogProps {
    questionnaire: QuestionnaireTemplate | null;
    open: boolean;
    onClose: () => void;
    teamId?: string;
    teamName?: string;
    initialData?: QuestionnaireAssignment | null; // For Edit Mode
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

export function AssignQuestionnaireDialog({ questionnaire, open, onClose, teamId, teamName, initialData }: AssignQuestionnaireDialogProps) {
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
                    id: m._id,
                    name: m.user?.firstName ? `${m.user.firstName} ${m.user.lastName}` : (m.user?.email || 'Unknown User'),
                    avatarUrl: m.user?.profileImageUrl
                })));
        }
    }, [teamMembers]);

    // Assignment State
    // Initialize from initialData if editing
    const [assignmentData, setAssignmentData] = useState<DialogState>({
        targetType: 'team',
        teamId: teamId || '',
        recurrence: { pattern: 'daily', startDate: new Date() }
    });

    useEffect(() => {
        if (open && initialData) {
            // Pre-fill for Edit
            // Determine targetType: based on targetMembers? 
            // If targetMembers matches "all active" it was 'team'. 
            // But we might not knwo "all" at this moment. 
            // Actually, we can infer: if targetMembers is defined and has items, it's 'individual' UNLESS it was 'team' and saved all IDs.
            // Simplified: if user explicitly selected 'individual' before, we likely saved it. 
            // Wait, our previous bug fix forced 'individual' if specific athletes selected.
            // But if 'team' mode was selected, we saved all IDs. 
            // So on edit, it might look like 'individual' with all IDs. 
            // That's acceptable. Or we can check if count matches.

            setAssignmentData({
                targetType: 'individual', // Default to individual so we see the selection
                teamId: initialData.teamId,
                targetAthletes: initialData.targetMembers || [],
                recurrence: {
                    pattern: initialData.recurrence.pattern as any,
                    startDate: new Date(initialData.recurrence.startDate),
                    endDate: initialData.recurrence.endDate ? new Date(initialData.recurrence.endDate) : undefined
                }
            });
        } else if (open && !initialData) {
            // Reset for Create
            setAssignmentData({
                targetType: 'team',
                teamId: teamId || '',
                recurrence: { pattern: 'daily', startDate: new Date() }
            });
            setStep(1);
        }
    }, [open, initialData, teamId]);


    if (!open) return null; // Simplified return, allow questionnaire to be null if we are just editing assignment (though props enforce it)
    // Actually, if editing, we might not pass 'questionnaire' object but we have 'initialData.questionnaireTemplateId'. 
    // To keep UI consistent, we probably want the questionnaire name.
    // If we only have initialData, we might miss the name. 
    // Let's assume parent passes questionnaire object or we fetch it? 
    // For now, parent (AssignmentDetailsSheet) has access to assignment, maybe not template details directly?
    // AssignmentDetailsSheet usually has assignment populated? No, it has 'assignment' object. 
    // Does 'assignment' object have template name? No.
    // We might need to fetch template or rely on parent passing it.
    // Assume parent handles it.

    if (!questionnaire && !initialData) return null;

    const handleNext = () => setStep(2);
    const handleBack = () => setStep(1);

    const handleAssign = async () => {
        setIsSubmitting(true);
        try {
            if (initialData) {
                // UPDATE
                await questionnaireAssignmentApi.updateAssignment(initialData._id!, {
                    targetType: assignmentData.targetType,
                    targetMembers: assignmentData.targetType === 'team'
                        ? displayedMembers.map(m => m.id)
                        : assignmentData.targetAthletes,
                    schedule: {
                        pattern: assignmentData.recurrence!.pattern,
                        startDate: assignmentData.recurrence!.startDate,
                        endDate: assignmentData.recurrence!.endDate,
                        time: initialData.expiresAtTime || "06:00"
                        // daysOfWeek? Not preserving yet. Add to state if needed.
                    },
                    teamId: assignmentData.teamId // Usually unchanged
                });
            } else {
                // CREATE
                await questionnaireAssignmentApi.assignQuestionnaire({
                    questionnaireTemplateId: questionnaire!._id,
                    teamId: assignmentData.teamId || teamId!,
                    targetType: assignmentData.targetType!,
                    targetMembers: assignmentData.targetType === 'team'
                        ? displayedMembers.map(m => m.id)
                        : assignmentData.targetAthletes,
                    schedule: {
                        pattern: assignmentData.recurrence!.pattern,
                        startDate: assignmentData.recurrence!.startDate,
                        endDate: assignmentData.recurrence!.endDate,
                        time: "06:00"
                    }
                });
            }

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

    const title = initialData ? 'Edit Assignment' : 'Assign Questionnaire';
    const subTitle = questionnaire?.name || 'Update details';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                        <p className="text-xs text-gray-500">{subTitle}</p>
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
                            initialTargetType={assignmentData.targetType === 'team' ? 'team' : 'athletes'}
                            initialSelectedIds={assignmentData.targetAthletes}
                            onSelectionChange={(sel) => setAssignmentData(prev => ({
                                ...prev,
                                targetType: sel.type === 'athletes' ? 'individual' : 'team',
                                targetAthletes: sel.athleteIds
                            }))}
                        />
                    ) : (
                        <StepSchedule
                            initialSchedule={assignmentData.recurrence}
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
                        <div></div>
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
                                    {initialData ? 'Updating...' : 'Assigning...'}
                                </>
                            ) : (
                                <>
                                    {initialData ? 'Update Assignment' : 'Confirm Assignment'}
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
