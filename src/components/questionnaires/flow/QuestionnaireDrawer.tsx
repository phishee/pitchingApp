'use client';

import React, { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { QuestionnaireAssignment, QuestionnaireTemplate } from '@/models/Questionaire';
import { QuestionnaireForm } from './QuestionnaireForm';
import { questionnaireApi } from '@/app/services-client/questionnaireApi';
import { Loader2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface QuestionnaireDrawerProps {
    open: boolean;
    onClose: () => void;
    assignment: QuestionnaireAssignment;
    onComplete: () => void;
}

export function QuestionnaireDrawer({ open, onClose, assignment, onComplete }: QuestionnaireDrawerProps) {
    const [template, setTemplate] = useState<QuestionnaireTemplate | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (open && assignment) {
            loadTemplate();
        }
    }, [open, assignment]);

    const loadTemplate = async () => {
        try {
            setLoading(true);
            const tmpl = await questionnaireApi.getTemplate(assignment.questionnaireTemplateId);
            setTemplate(tmpl);
        } catch (error) {
            console.error("Failed to load template", error);
        } finally {
            setLoading(false);
        }
    };

    // Dynamic icon rendering
    const IconComponent = template?.icon && (LucideIcons as any)[template.icon];

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent side="bottom" className="h-[90vh] sm:h-[85vh] rounded-t-2xl p-0 overflow-hidden flex flex-col">
                <SheetHeader className="px-6 py-5 border-b border-gray-100 bg-white">
                    <div className="flex items-center gap-4">
                        {IconComponent && <IconComponent className="w-8 h-8 text-blue-600" />}
                        <SheetTitle className="text-2xl font-bold">{loading ? 'Loading...' : template?.name || 'Questionnaire'}</SheetTitle>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto bg-gray-50/50">
                    {loading ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                    ) : (
                        template && (
                            <QuestionnaireForm
                                assignment={assignment}
                                template={template}
                                onComplete={onComplete}
                                onCancel={onClose}
                            />
                        )
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
