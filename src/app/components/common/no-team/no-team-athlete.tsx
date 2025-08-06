import React from 'react'
import { useUser } from '@/providers/user.context';
import PendingRequest from './pending-request';
import TeamInvitation from './team-invitation';
import TeamSearchRequest from './team-search';

function NoTeamAthlete() {
    const { userTeamStatus, currentTeam, currentTeamMember, pendingInvitation, pendingJoinRequest, teamToJoin, setTeamToJoin, searchTeamByCode, isLoading, error, loadUserData, joinTeam, acceptInvitation, rejectInvitation, clearError } = useUser();
    
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