import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Activity, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { workoutSessionApi } from '@/app/services-client/workoutSessionApi';
import { useUser } from '@/providers/user.context';
import { WorkoutSession } from '@/models/WorkoutSession';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';

interface RecentWorkoutsModuleProps {
    settings: {
        limit?: number;
        showDate?: boolean;
    };
}

export function RecentWorkoutsModule({ settings }: RecentWorkoutsModuleProps) {
    const limit = settings.limit || 5;
    const { user } = useUser();
    const [sessions, setSessions] = useState<WorkoutSession[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSessions = async () => {
            if (!user?.currentOrganizationId) return;

            try {
                const response = await workoutSessionApi.getWorkoutSessions({
                    organizationId: user.currentOrganizationId,
                    status: 'completed',
                    limit: limit,
                    // We might need to add sorting here if the API supports it, 
                    // usually APIs return most recent first by default or have a sort param.
                    // Assuming default is recent first.
                });
                setSessions(response.sessions);
            } catch (error) {
                console.error('Failed to fetch recent workouts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSessions();
    }, [limit, user?.currentOrganizationId]);

    if (loading) {
        return (
            <Card className="h-full flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Recent Workouts</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center">
                    <div className="text-sm text-muted-foreground">Loading...</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Workouts</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
                <div className="space-y-4">
                    {sessions.length === 0 ? (
                        <div className="text-sm text-muted-foreground text-center py-4">No completed workouts yet.</div>
                    ) : (
                        sessions.map((session) => (
                            <div key={session._id} className="flex items-center gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                                {/* Image */}
                                <div className="h-12 w-12 rounded-md bg-gray-100 relative overflow-hidden flex-shrink-0">
                                    {session.workout.coverImage ? (
                                        <Image
                                            src={session.workout.coverImage}
                                            alt={session.workout.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-gray-400">
                                            <Activity className="h-6 w-6" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium leading-none truncate">{session.workout.name}</p>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                        {settings.showDate !== false && session.actualEndTime && (
                                            <span className="flex items-center gap-1">
                                                <CalendarIcon className="h-3 w-3" />
                                                {formatDistanceToNow(new Date(session.actualEndTime), { addSuffix: true })}
                                            </span>
                                        )}
                                        {session.summary?.durationSeconds && (
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {Math.round(session.summary.durationSeconds / 60)} min
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
