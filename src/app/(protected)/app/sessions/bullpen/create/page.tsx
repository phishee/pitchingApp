'use client';

import React from 'react';
import { useOrganization } from '@/providers/organization-context';
import { WorkoutProvider } from '@/providers/workout-context';
import { BullpenSessionForm } from './BullpenSessionForm';

export default function CreateBullpenPage() {
    const { currentOrganization } = useOrganization();
    const organizationId = currentOrganization?._id;

    if (!organizationId) {
        return <div>Loading organization...</div>;
    }

    return (
        <WorkoutProvider organizationId={organizationId}>
            <BullpenSessionForm />
        </WorkoutProvider>
    );
}
