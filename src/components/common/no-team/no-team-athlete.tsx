import React from 'react'
import PendingRequest from './pending-request';
import TeamInvitation from './team-invitation';
import TeamSearchRequest from './team-search';
import { useTeam } from '@/providers/team-context';
import { LoadingSpinner } from '../loading-spinner';

function NoTeamAthlete() {
    const { pendingJoinRequest, pendingInvitation, isLoading } = useTeam();

    if (isLoading) {
        return <LoadingSpinner message="Loading team data..." />;
    }
    
    return (
        <div className='h-full w-full flex items-center justify-center'>
            <div className='flex flex-col gap-4'>
                {pendingJoinRequest && <PendingRequest />}
                {pendingInvitation && <TeamInvitation />}
                {(!pendingJoinRequest && !pendingInvitation) && <TeamSearchRequest />}
            </div>
        </div>
    )
}

export default NoTeamAthlete