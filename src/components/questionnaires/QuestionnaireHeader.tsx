'use client';

import React from 'react';
import { Plus } from 'lucide-react';

interface QuestionnaireHeaderProps {
    onCreate?: () => void;
}

export function QuestionnaireHeader({ onCreate }: QuestionnaireHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Questionnaires</h1>
                <p className="text-gray-600 mt-1 md:mt-2 text-sm sm:text-base">
                    Browse and manage questionnaire templates
                </p>
            </div>
            {/* Create button disabled/hidden for now as per requirements */}
            {/* 
      <button
        onClick={onCreate}
        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-full flex items-center gap-2 transition-colors sm:w-auto text-sm justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={true} // For now
      >
        <Plus className="w-4 h-4" />
        Create Questionnaire
      </button> 
      */}
        </div>
    );
}
