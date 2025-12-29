'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Repeat, Plus, Loader2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTeam } from '@/providers/team-context';
import { workoutApi } from '@/app/services-client/workoutApi';
import { Workout } from '@/models/Workout';
import { WorkoutCard } from '@/components/workout-library/components/WorkoutCard';

export default function SessionsLibraryPage() {
    const router = useRouter();
    const { currentTeam } = useTeam();
    const organizationId = currentTeam?.organizationId;
    const [sessions, setSessions] = useState<Workout[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSessions = async () => {
            if (!organizationId) return;

            try {
                setIsLoading(true);
                // Fetch all workouts/sessions for the organization
                const response = await workoutApi.getWorkouts({
                    limit: 100, // Fetch a reasonable amount
                    sort: 'updated',
                    order: 'desc'
                }, organizationId);

                // Filter to include bullpen sessions if needed, though getWorkouts usually returns all
                setSessions(response.data.filter(w => w.sessionType === 'bullpen'));
            } catch (err) {
                console.error('Failed to fetch sessions:', err);
                setError('Failed to load sessions');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSessions();
    }, [organizationId]);

    const handleViewSession = (id: string) => {
        // Placeholder for viewing session details
        // router.push(`/app/sessions/${id}`);
        console.log('View session', id);
    };

    const handleEditSession = (id: string) => {
        router.push(`/app/sessions/bullpen/${id}/edit`);
    };

    const handleAssignSession = (id: string) => {
        router.push(`/app/workout-library/assign?workoutId=${id}`);
    };

    const handleStartSession = (id: string) => {
        // Placeholder for starting session
        console.log('Start session', id);
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Sessions Library</h1>
                    <p className="text-gray-600 mt-1 md:mt-2 text-sm sm:text-base">Manage your training session templates</p>
                </div>
                <Link href="/app/sessions/bullpen/create">
                    <Button className="gap-2 bg-blue-600 hover:bg-blue-700 rounded-full">
                        <Plus className="w-4 h-4" />
                        New Bullpen Session
                    </Button>
                </Link>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                    <p className="text-gray-500">Loading sessions...</p>
                </div>
            ) : error ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
                    {error}
                </div>
            ) : sessions.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <div className="max-w-md mx-auto">
                        <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Repeat className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Sessions Yet</h3>
                        <p className="text-gray-500 mb-6">
                            Create your first session template to get started.
                        </p>
                        <Link href="/app/sessions/bullpen/create">
                            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                                <Plus className="w-4 h-4" />
                                New Bullpen Session
                            </Button>
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sessions.map(session => (
                        <WorkoutCard
                            key={session.id}
                            workout={session}
                            onView={handleViewSession}
                            onEdit={handleEditSession}
                            onAssign={handleAssignSession}
                            onStart={handleStartSession}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
