'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { BullpenSessionForm } from '../../create/BullpenSessionForm';

import { useOrganization } from '@/providers/organization-context';
import { WorkoutProvider } from '@/providers/workout-context';

export default function BullpenSessionEditPage() {
    const params = useParams();
    const id = params?.id as string;
    const { currentOrganization } = useOrganization();
    const organizationId = currentOrganization?._id;

    if (!id) {
        return <div>Invalid session ID</div>;
    }

    if (!organizationId) {
        return <div>Loading organization...</div>;
    }

    return (
        <WorkoutProvider organizationId={organizationId}>
            <BullpenSessionForm workoutId={id} />
        </WorkoutProvider>
    );
}
