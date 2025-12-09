'use client';

import React, { use } from 'react';
import { useParams } from 'next/navigation';

export default function QuestionnairePage({ params }: { params: Promise<{ sessionId: string; questionnaireId: string }> }) {
    const resolvedParams = use(params);
    const { sessionId, questionnaireId } = resolvedParams;

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
            <h1 className="text-2xl font-bold">Questionnaire</h1>
            <p className="text-muted-foreground">Session ID: {sessionId}</p>
            <p className="text-muted-foreground">Questionnaire ID: {questionnaireId}</p>
            {/* TODO: Load and render the specific questionnaire component based on ID */}
        </div>
    );
}
