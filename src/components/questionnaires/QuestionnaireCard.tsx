'use client';

import React from 'react';
import { QuestionnaireTemplate } from '@/models/Questionaire';
import { ClipboardList, Activity, Heart, AlertCircle, HelpCircle, Clock, Users, Moon, MoonStar } from 'lucide-react';

interface QuestionnaireCardProps {
    questionnaire: QuestionnaireTemplate;
    onClick?: (questionnaire: QuestionnaireTemplate) => void;
    onAssign?: (questionnaire: QuestionnaireTemplate) => void;
}

const ICON_MAP: Record<string, typeof Heart> = {
    Heart,
    Activity,
    ClipboardList,
    AlertCircle,
    HelpCircle,
    Moon,
    MoonStar
};

const COLOR_THEMES: Record<string, string> = {
    indigo: 'bg-indigo-100 text-indigo-700',
    green: 'bg-green-100 text-green-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
    red: 'bg-red-100 text-red-700',
    gray: 'bg-gray-100 text-gray-700'
};

const getCategoryConfig = (category: string) => {
    switch (category) {
        case 'wellness':
            return { icon: Heart, color: 'bg-green-100 text-green-700', label: 'Wellness' };
        case 'recovery':
            return { icon: Activity, color: 'bg-blue-100 text-blue-700', label: 'Recovery' };
        case 'readiness':
            return { icon: ClipboardList, color: 'bg-purple-100 text-purple-700', label: 'Readiness' };
        case 'pain':
            return { icon: AlertCircle, color: 'bg-red-100 text-red-700', label: 'Pain' };
        default:
            return { icon: HelpCircle, color: 'bg-gray-100 text-gray-700', label: category };
    }
};

export function QuestionnaireCard({ questionnaire, onClick, onAssign }: QuestionnaireCardProps) {
    // Resolve configuration
    let config = getCategoryConfig(questionnaire.category);

    // Override with direct metadata if present
    if (questionnaire.icon && ICON_MAP[questionnaire.icon]) {
        config.icon = ICON_MAP[questionnaire.icon];
    }

    if (questionnaire.colorTheme && COLOR_THEMES[questionnaire.colorTheme]) {
        config.color = COLOR_THEMES[questionnaire.colorTheme];
    }

    const { icon: CategoryIcon, color, label } = config;

    return (
        <div
            className="flex flex-col bg-white rounded-2xl hover:shadow-xl transition-all duration-200 cursor-pointer overflow-hidden border border-gray-100"
            style={{
                boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 12px -2px rgba(0, 0, 0, 0.05)'
            }}
            onClick={() => onClick?.(questionnaire)}
        >
            <div className="p-5 md:p-6 flex flex-col h-full bg-white">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl ${color}`}>
                        <CategoryIcon className="w-6 h-6" strokeWidth={1.25} />
                    </div>
                    <div className="flex gap-2">
                        {questionnaire.targetRoles.map(role => (
                            <span key={role} className="text-xs px-2 py-1 bg-gray-50 text-gray-500 rounded-md border border-gray-200 flex items-center gap-1 capitalize">
                                <Users className="w-3 h-3" strokeWidth={1.5} />
                                {role}
                            </span>
                        ))}
                    </div>
                </div>

                <h3 className="font-semibold text-lg text-gray-900 mb-2">{questionnaire.name}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">{questionnaire.description}</p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                    <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                        <span className="flex items-center gap-1">
                            <ClipboardList className="w-3.5 h-3.5" strokeWidth={1.5} />
                            {questionnaire.questions.length} Questions
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                            {questionnaire.estimatedDuration}s
                        </span>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${color}`}>
                        {label}
                    </span>
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onAssign?.(questionnaire);
                    }}
                    className="mt-4 w-full py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors border border-blue-100"
                >
                    Assign to
                </button>
            </div>
        </div>
    );
}
