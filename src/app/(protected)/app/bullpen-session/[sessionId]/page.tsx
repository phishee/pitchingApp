'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { DesktopBullpenSession } from '@/app/(protected)/app/sessions/bullpen/components/DesktopBullpenSession';
import { MobileBullpenSession } from '@/app/(protected)/app/sessions/bullpen/components/MobileBullpenSession';

export default function BullpenSessionPage() {
    const params = useParams();
    const sessionId = params.sessionId as string;

    return (
        <>
            {/* Desktop View */}
            <div className="hidden lg:block">
                <DesktopBullpenSession sessionId={sessionId} />
            </div>

            {/* Mobile View */}
            <div className="lg:hidden">
                <MobileBullpenSession sessionId={sessionId} />
            </div>
        </>
    );
}
