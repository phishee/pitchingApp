import React from 'react'
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { useUser } from '@/providers/user.context';
import PendingRequest from './pending-request';
import TeamInvitation from './team-invitation';
import TeamSearchRequest from './team-search';
import { useTeam } from '@/providers/team-context';
import { LoadingSpinner } from '../loading-spinner';

function CoachOptions() {
    const router = useRouter();

    const handleCreateTeam = () => {
        router.push('/create-team');
    };

    const handleJoinTeam = () => {
        router.push('/join-team');
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl font-semibold">
                    Coach Options
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="text-center mb-6">
                    <p className="text-gray-600">
                        As a coach, you can create your own team or join an existing one
                    </p>
                </div>

                <Button
                    onClick={handleCreateTeam}
                    className="w-full h-12 text-lg"
                    size="lg"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Create New Team
                </Button>

                <div className="flex items-center justify-center my-4">
                    <div className="border-t border-gray-200 flex-1"></div>
                    <span className="px-3 text-sm text-gray-500 bg-white">or</span>
                    <div className="border-t border-gray-200 flex-1"></div>
                </div>

                <Button
                    onClick={handleJoinTeam}
                    variant="outline"
                    className="w-full h-12 text-lg"
                    size="lg"
                >
                    <Search className="w-5 h-5 mr-2" />
                    Join Existing Team
                </Button>
            </CardContent>
        </Card>
    );
}

function NoTeamAthlete() {
    const { user } = useUser()
    const { pendingInvitation, pendingJoinRequest, isLoading } = useTeam();

    const isCoach = user?.role === 'coach'; // Adjust this based on your user role structure

    if (isLoading) {
        return <LoadingSpinner message="Loading team data..." />;
    }

    return (
        <div className='h-full w-full flex items-center justify-center'>
            <div className='flex flex-col gap-4'>
                {pendingJoinRequest && <PendingRequest />}
                {pendingInvitation && <TeamInvitation />}
                {(!pendingJoinRequest && !pendingInvitation) && (
                    isCoach ? <CoachOptions /> : <TeamSearchRequest />
                )}
            </div>
        </div>
    )
}

export default NoTeamAthlete