'use client';

import React from 'react';
import { useParams } from 'next/navigation';

export default function WorkoutRpePage() {
  const params = useParams<{ sessionId: string }>();
  const sessionId = params?.sessionId ?? '';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Record Session RPE</h1>
      <p className="text-muted-foreground">Session ID: {sessionId}</p>
    </div>
  );
}

