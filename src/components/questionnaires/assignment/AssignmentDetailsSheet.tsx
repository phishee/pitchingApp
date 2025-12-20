'use client';

import React from 'react';
import { X, Calendar, Clock, Users, Trash2, Edit2, CheckCircle2, PauseCircle } from 'lucide-react';
import { QuestionnaireAssignment } from '@/models/Questionaire';
import { useTeam } from '@/providers/team-context';
import { useMemo, useState } from 'react';
import { questionnaireAssignmentApi } from '@/app/services-client/questionnaireAssignmentApi';
import { toast } from 'sonner';

interface AssignmentDetailsSheetProps {
    assignment: QuestionnaireAssignment | null;
    open: boolean;
    onClose: () => void;
}

export function AssignmentDetailsSheet({ assignment, open, onClose }: AssignmentDetailsSheetProps) {
    const { teamMembers, loadTeamMembers } = useTeam();

    // Hooks should generally be at top level
    const [isUpdating, setIsUpdating] = useState(false);

    const handleToggleStatus = async (newStatus: boolean) => {
        if (!assignment) return;
        setIsUpdating(true);
        try {
            await questionnaireAssignmentApi.toggleAssignmentStatus(assignment._id!, newStatus);
            toast.success(newStatus ? "Assignment Resumed" : "Assignment Paused", {
                description: `The assignment has been ${newStatus ? 'resumed' : 'paused'} successfully.`
            });
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Error", {
                description: "Failed to update assignment status."
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const assignedMembers = useMemo(() => {
        if (!assignment || !teamMembers) return [];
        if (!assignment.targetMembers || assignment.targetMembers.length === 0) {
            return [];
        }
        return teamMembers.filter(m => assignment.targetMembers?.includes(m.userId) && 'user' in m && m.user);
    }, [assignment, teamMembers]);

    if (!open || !assignment) return null;

    // Formatting helpers
    const startDate = new Date(assignment.recurrence.startDate).toLocaleDateString(undefined, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const endDate = assignment.recurrence.endDate
        ? new Date(assignment.recurrence.endDate).toLocaleDateString()
        : 'Ongoing';

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Sheet Panel */}
            <div className="relative w-full max-w-md bg-white shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Assignment Details</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`w-2 h-2 rounded-full ${assignment.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                                {assignment.isActive ? 'Active' : 'Paused'}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* Schedule Section */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            Schedule Configuration
                        </h3>
                        <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Frequency</span>
                                <span className="font-medium text-gray-900 capitalize">{assignment.recurrence.pattern}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Start Date</span>
                                <span className="font-medium text-gray-900">{startDate}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">End Date</span>
                                <span className="font-medium text-gray-900">{endDate}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-200">
                                <span className="text-gray-500 flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" /> Due Time
                                </span>
                                <span className="font-medium text-gray-900">{assignment.expiresAtTime || '23:59'}</span>
                            </div>
                        </div>
                    </section>

                    {/* Target Section */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-600" />
                            Assigned To
                        </h3>
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            {assignedMembers.length > 0 && (
                                <div className="p-4 bg-white">
                                    <div className="flex flex-wrap gap-2">
                                        {assignedMembers.map((member: any) => (
                                            <div key={member.userId} className="relative group">
                                                {/* Avatar */}
                                                {member.user?.profileImageUrl ? (
                                                    <img
                                                        src={member.user.profileImageUrl}
                                                        alt={member.user.name}
                                                        className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover hover:border-blue-200 transition-colors cursor-help"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 border-2 border-white shadow-sm flex items-center justify-center text-xs font-semibold text-gray-500 hover:bg-gray-200 transition-colors cursor-help">
                                                        {member.user?.name?.substring(0, 2).toUpperCase() || '??'}
                                                    </div>
                                                )}

                                                {/* Tooltip */}
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                                    {member.user?.name || 'Unknown'}
                                                    {/* Arrow */}
                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="mt-3 text-xs text-gray-400 text-center">
                                        {assignedMembers.length} recipient{assignedMembers.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Stats Placeholder */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900">Recent Performance</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm text-center">
                                <div className="text-2xl font-bold text-gray-900">92%</div>
                                <div className="text-xs text-gray-500 mt-1">Completion Rate</div>
                            </div>
                            <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm text-center">
                                <div className="text-2xl font-bold text-gray-900">4.8</div>
                                <div className="text-xs text-gray-500 mt-1">Avg Score</div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 space-y-3">
                    <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        <Edit2 className="w-4 h-4" />
                        Edit Schedule
                    </button>

                    {assignment.isActive ? (
                        <button
                            onClick={() => handleToggleStatus(false)}
                            disabled={isUpdating}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-yellow-50 border border-yellow-200 rounded-xl text-sm font-medium text-yellow-700 hover:bg-yellow-100 transition-colors disabled:opacity-50"
                        >
                            {isUpdating ? <Clock className="w-4 h-4 animate-spin" /> : <PauseCircle className="w-4 h-4" />}
                            {isUpdating ? 'Updating...' : 'Pause Assignment'}
                        </button>
                    ) : (
                        <button
                            onClick={() => handleToggleStatus(true)}
                            disabled={isUpdating}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-50 border border-green-200 rounded-xl text-sm font-medium text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50"
                        >
                            {isUpdating ? <Clock className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            {isUpdating ? 'Updating...' : 'Resume Assignment'}
                        </button>
                    )}

                    <button className="w-full flex items-center justify-center gap-2 py-2.5 text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors">
                        <Trash2 className="w-4 h-4" />
                        Delete Assignment
                    </button>
                </div>
            </div>
        </div>
    );
}
