'use client';

import React, { useEffect, useState } from 'react';
import { QuestionnaireAssignment, QuestionnaireTemplate } from '@/models/Questionaire';
import { questionnaireApi } from '@/app/services-client/questionnaireApi';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Slider, SliderThumb } from '@/components/ui/slider';
import { useUser } from '@/providers/user.context';
import { useTeam } from '@/providers/team-context';

interface QuestionnaireFormProps {
    assignment: QuestionnaireAssignment;
    template?: QuestionnaireTemplate;
    onComplete: () => void;
    onCancel: () => void;
}

export function QuestionnaireForm({ assignment, template: propTemplate, onComplete, onCancel }: QuestionnaireFormProps) {
    const { user } = useUser();
    const { currentTeamMember } = useTeam();
    const [template, setTemplate] = useState<QuestionnaireTemplate | null>(propTemplate || null);
    const [loading, setLoading] = useState(!propTemplate);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!propTemplate) {
            loadTemplate();
        }
    }, [assignment.questionnaireTemplateId, propTemplate]);

    const loadTemplate = async () => {
        try {
            const tmpl = await questionnaireApi.getTemplate(assignment.questionnaireTemplateId);
            setTemplate(tmpl);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load questionnaire");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!template || !user) return;
        setSubmitting(true);
        try {
            const answerSnapshots = Object.entries(answers).map(([questionId, value]) => {
                const question = template.questions.find(q => q.id === questionId);
                if (!question) return null;

                const snapshot: any = {
                    questionId,
                    questionText: question.text,
                    questionType: question.type,
                    value
                };

                if ((question.type === 'single_choice' || question.type === 'multiple_choice') && question.options) {
                    const values = Array.isArray(value) ? value : [value];
                    snapshot.selectedOptions = question.options
                        .filter(opt => values.includes(opt.value))
                        .map(opt => ({
                            id: opt.id,
                            label: opt.label,
                            value: opt.value
                        }));
                }

                return snapshot;
            }).filter(Boolean);

            const payload = {
                questionnaireTemplateId: template._id,
                organizationId: assignment.organizationId,
                teamId: assignment.teamId,
                athleteInfo: {
                    userId: user.userId || user._id,
                    memberId: currentTeamMember?._id,
                    name: user.name,
                    email: user.email
                },
                scheduledDate: new Date(),
                context: { type: 'standalone', assignmentId: assignment._id },
                answers: answerSnapshots,
                submittedAt: new Date(),
                isLateSubmission: false
            };

            await questionnaireApi.submitResult(payload);

            toast.success("Submitted successfully");
            onComplete();
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    if (!template) return <div className="p-8 text-center text-red-500">Template not found</div>;

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-8">
            <div className="space-y-6">
                {template.questions.map((q, idx) => (
                    <div key={q.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <label className="block text-lg font-medium text-gray-900 mb-2">
                            {idx + 1}. {q.text}
                        </label>
                        {q.type === 'text_input' && (
                            <input
                                className="w-full border-gray-200 rounded-lg p-3"
                                placeholder="Type your answer..."
                                value={answers[q.id] || ''}
                                onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                            />
                        )}

                        {q.type === 'single_choice' && q.options && (
                            <div className="space-y-2">
                                {q.options.map(opt => (
                                    <label key={opt.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer">
                                        <input
                                            type="radio"
                                            name={q.id}
                                            value={opt.value}
                                            checked={answers[q.id] === opt.value}
                                            onChange={() => setAnswers(prev => ({ ...prev, [q.id]: opt.value }))}
                                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="text-gray-700">{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        {q.type === 'multiple_choice' && q.options && (
                            <div className="space-y-2">
                                {q.options.map(opt => (
                                    <label key={opt.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            value={opt.value}
                                            checked={(answers[q.id] || []).includes(opt.value)}
                                            onChange={(e) => {
                                                const current = answers[q.id] || [];
                                                let next;
                                                if (e.target.checked) {
                                                    next = [...current, opt.value];
                                                } else {
                                                    next = current.filter((v: any) => v !== opt.value);
                                                }
                                                setAnswers(prev => ({ ...prev, [q.id]: next }));
                                            }}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-gray-700">{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        {q.type === 'numeric_scale' && q.configs && (
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>{q.configs.minLabel || q.configs.min}</span>
                                    <span>{q.configs.maxLabel || q.configs.max}</span>
                                </div>
                                <div className="flex justify-between gap-2 overflow-x-auto pb-2">
                                    {Array.from({ length: (q.configs.max - q.configs.min) / q.configs.step + 1 }, (_, i) => q.configs!.min + i * q.configs!.step).map(val => (
                                        <button
                                            key={val}
                                            onClick={() => setAnswers(prev => ({ ...prev, [q.id]: val }))}
                                            className={`
                                                w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                                                ${answers[q.id] === val
                                                    ? 'bg-blue-600 text-white shadow-md scale-110'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }
                                            `}
                                        >
                                            {val}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {q.type === 'numeric_slider' && q.configs && (
                            <div className="space-y-6 pt-2">
                                <div className="flex justify-between text-sm text-gray-500 font-medium px-1">
                                    <span>{q.configs.minLabel || q.configs.min}</span>
                                    <span className="text-blue-600 font-bold text-lg">
                                        {answers[q.id] ?? Math.floor((q.configs.min + q.configs.max) / 2)}
                                    </span>
                                    <span>{q.configs.maxLabel || q.configs.max}</span>
                                </div>
                                <Slider
                                    min={q.configs.min}
                                    max={q.configs.max}
                                    step={q.configs.step}
                                    value={[answers[q.id] ?? Math.floor((q.configs.min + q.configs.max) / 2)]}
                                    onValueChange={(vals) => setAnswers(prev => ({ ...prev, [q.id]: vals[0] }))}
                                    className="w-full"
                                >
                                    <SliderThumb />
                                </Slider>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <button onClick={onCancel} className="px-4 py-2 text-gray-500 hover:text-gray-700">Skip</button>
                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                    {submitting ? 'Submitting...' : 'Submit'}
                </button>
            </div>
        </div>
    );
}
