import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Dumbbell, CheckCircle2, BarChart3, TrendingUp } from 'lucide-react';
import { workoutSessionApi } from '@/app/services-client/workoutSessionApi';
import { useUser } from '@/providers/user.context';
import { WorkoutSession } from '@/models/WorkoutSession';
import { formatDistanceToNow } from 'date-fns';

interface LastSessionStatsModuleProps {
    settings: {
        // No specific settings needed for now, but keeping structure consistent
    };
}

export function LastSessionStatsModule({ settings }: LastSessionStatsModuleProps) {
    const { user } = useUser();
    const [lastSession, setLastSession] = useState<WorkoutSession | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLastSession = async () => {
            if (!user?.currentOrganizationId || !user?.userId) return;

            try {
                const response = await workoutSessionApi.getWorkoutSessions({
                    organizationId: user.currentOrganizationId,
                    status: 'completed',
                    limit: 1,
                });

                if (response.sessions && response.sessions.length > 0) {
                    setLastSession(response.sessions[0]);
                } else {
                    setLastSession(null);
                }
            } catch (error) {
                console.error('Failed to fetch last session stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLastSession();
    }, [user?.currentOrganizationId, user?.userId]);

    if (loading) {
        return (
            <Card className="h-full flex flex-col">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Last Session Stats</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center">
                    <div className="text-sm text-muted-foreground">Loading...</div>
                </CardContent>
            </Card>
        );
    }

    if (!lastSession) {
        return (
            <Card className="h-full flex flex-col">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Last Session Stats</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center text-center p-4">
                    <div className="text-sm text-muted-foreground">
                        No completed workouts yet.
                        <br />
                        Complete a workout to see your stats!
                    </div>
                </CardContent>
            </Card>
        );
    }

    const summary = lastSession.summary;
    const completedSetsTotal = (summary.completedSets || 0) + (summary.extraSets || 0);
    const totalSets = summary.totalSets || 0;

    // Calculate RPE value to display
    const rpeValue = summary.sessionRpe?.numeric ?? summary.sessionRPE ?? '-';

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-2 border-b border-gray-50">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-medium text-gray-900">Last Session Stats</CardTitle>
                    {lastSession.actualEndTime && (
                        <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(lastSession.actualEndTime), { addSuffix: true })}
                        </span>
                    )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{lastSession.workout.name}</p>
            </CardHeader>
            <CardContent className="flex-1 pt-4">
                <div className="grid grid-cols-2 gap-3 h-full">
                    {/* Exercises */}
                    <div className="flex flex-col p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex items-center gap-2 mb-1">
                            <Dumbbell className="h-4 w-4 text-blue-600" />
                            <span className="text-xs font-medium text-blue-700">Exercises</span>
                        </div>
                        <div className="mt-auto">
                            <span className="text-xl font-bold text-gray-900">{summary.completedExercises}</span>
                            <span className="text-xs text-gray-500"> / {summary.totalExercises}</span>
                        </div>
                    </div>

                    {/* Compliance */}
                    <div className="flex flex-col p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                        <div className="flex items-center gap-2 mb-1">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            <span className="text-xs font-medium text-emerald-700">Compliance</span>
                        </div>
                        <div className="mt-auto">
                            <span className="text-xl font-bold text-gray-900">{summary.compliancePercent}%</span>
                        </div>
                    </div>

                    {/* Sets */}
                    <div className="flex flex-col p-3 bg-purple-50 rounded-lg border border-purple-100">
                        <div className="flex items-center gap-2 mb-1">
                            <Activity className="h-4 w-4 text-purple-600" />
                            <span className="text-xs font-medium text-purple-700">Sets</span>
                        </div>
                        <div className="mt-auto">
                            <span className="text-xl font-bold text-gray-900">{completedSetsTotal}</span>
                            <span className="text-xs text-gray-500"> / {totalSets}</span>
                        </div>
                    </div>

                    {/* RPE */}
                    <div className="flex flex-col p-3 bg-orange-50 rounded-lg border border-orange-100">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="h-4 w-4 text-orange-600" />
                            <span className="text-xs font-medium text-orange-700">RPE</span>
                        </div>
                        <div className="mt-auto">
                            <span className="text-xl font-bold text-gray-900">{rpeValue}</span>
                            <span className="text-xs text-gray-500"> / 10</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
