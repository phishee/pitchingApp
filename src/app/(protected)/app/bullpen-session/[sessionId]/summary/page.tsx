'use client';

import React from 'react';
import { DesktopBullpenSummary } from '@/app/(protected)/app/sessions/bullpen/components/DesktopBullpenSummary';
import { MobileBullpenSummary } from '@/app/(protected)/app/sessions/bullpen/components/MobileBullpenSummary';

interface PageProps {
    params: Promise<{
        sessionId: string;
    }>;
}

function useMediaQuery(query: string) {
    const [matches, setMatches] = React.useState(false);

    React.useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) {
            setMatches(media.matches);
        }
        const listener = () => setMatches(media.matches);
        media.addEventListener("change", listener);
        return () => media.removeEventListener("change", listener);
    }, [matches, query]);

    return matches;
}

export default function BullpenSessionSummaryPage({ params }: PageProps) {
    const { sessionId } = React.use(params);
    const isMobile = useMediaQuery('(max-width: 768px)');

    // We can also use a client-side mounted check to avoid hydration mismatch
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null; // or a generic loading spinner
    }

    return isMobile ? (
        <MobileBullpenSummary sessionId={sessionId} />
    ) : (
        <DesktopBullpenSummary sessionId={sessionId} />
    );
}
