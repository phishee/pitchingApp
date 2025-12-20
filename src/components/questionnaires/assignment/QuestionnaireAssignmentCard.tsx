'use client';

import React from 'react';
import { QuestionnaireAssignment, QuestionnaireTemplate } from '@/models/Questionaire';
import { Calendar, Users, Clock, ArrowRight } from 'lucide-react';

interface QuestionnaireAssignmentCardProps {
    assignment: QuestionnaireAssignment;
    template?: QuestionnaireTemplate; // Optional: join with template data if available
    onViewDetails?: (assignment: QuestionnaireAssignment) => void;
}

export function QuestionnaireAssignmentCard({ assignment, template, onViewDetails }: QuestionnaireAssignmentCardProps) {
    // Format start date
    const startDate = new Date(assignment.recurrence.startDate).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric'
    });

    const templateName = template?.name || "Unknown Questionnaire";
    const templateIcon = template?.icon || "ClipboardList"; // Fallback logic would be needed if icon map isn't shared

    return (
        <div className="flex flex-col bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-start justify-between">
                <div>
                    <h3 className="font-semibold text-gray-900">{templateName}</h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <span className="capitalize px-2 py-0.5 bg-gray-100 rounded text-gray-600">
                            {assignment.recurrence.pattern}
                        </span>
                        <span>•</span>
                        <span>Starts {startDate}</span>
                    </div>
                </div>
                <div className={`w-2 h-2 rounded-full ${assignment.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>

            <div className="p-4 bg-gray-50/50 flex-1 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>
                        {assignment.teamId ? 'Assigned to Team' : 'Assigned to Athletes'}
                        {/* More detailed logic would go here */}
                    </span>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>Due by {assignment.expiresAtTime}</span>
                </div>
            </div>

            <div className="p-3 border-t border-gray-100 bg-white">
                <button
                    onClick={() => onViewDetails?.(assignment)}
                    className="w-full text-xs font-medium text-gray-500 hover:text-gray-800 flex items-center justify-center gap-1 py-1"
                >
                    View Details
                    <ArrowRight className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
}
