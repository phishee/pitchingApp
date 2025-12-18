import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Activity, ArrowRight } from 'lucide-react';
import { workoutSessionApi } from '@/app/services-client/workoutSessionApi';
import { WorkoutSession } from '@/models/WorkoutSession';
import Link from 'next/link';
import { useUser } from '@/providers/user.context';

interface ActiveSessionModuleProps {
    settings: {
        // No specific settings needed yet
    };
    onVisibilityChange?: (isVisible: boolean) => void;
}

export function ActiveSessionModule({ settings, onVisibilityChange }: ActiveSessionModuleProps) {
    const { user } = useUser();
    const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActiveSession = async () => {
            if (!user?.userId) return;

            try {
                const session = await workoutSessionApi.getActiveSession();

                if (session) {
                    setActiveSession(session);
                    onVisibilityChange?.(true);
                } else {
                    setActiveSession(null);
                    onVisibilityChange?.(false);
                }
            } catch (error) {
                console.error('Failed to fetch active session:', error);
                onVisibilityChange?.(false);
            } finally {
                setLoading(false);
            }
        };

        fetchActiveSession();
    }, [user?.userId, onVisibilityChange]);

    if (loading) {
        // Return null or a skeleton, but null is better for self-hiding during load to avoid flickering
        // However, if we return null here, the grid might hide it immediately.
        // Let's return a hidden div or similar if we want to avoid layout shift, 
        // but since we want it to appear only if active, starting hidden is fine.
        return null;
    }

    if (!activeSession) {
        return null;
    }

    return (
        <Card className="h-full flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 shadow-sm rounded-3xl">
            {/* <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-blue-600 animate-pulse" />
                        Workout In Progress
                    </CardTitle>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700 border border-blue-200">
                        Active
                    </span>
                </div>
            </CardHeader> */}
            <CardContent className="flex-1 flex flex-row items-center justify-between gap-4 p-4 pt-0">
                <div className="flex-1 min-w-0 pt-4">
                    <h3 className="text-lg font-bold text-gray-900 leading-tight truncate pr-2">
                        {activeSession.workout.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {activeSession.workout.description || 'Keep pushing!'}
                    </p>

                    <div className="mt-3">
                        <Button asChild className="w-auto h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4" size="sm">
                            <Link href={`/app/workout-session/${activeSession._id}`}>
                                Resume
                                <ArrowRight className="ml-1.5 h-3 w-3" />
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Completion Arc */}
                <div className="flex-shrink-0 relative h-16 w-16">
                    {/* Background Circle */}
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                        <path
                            className="text-blue-200"
                            d="M18 2.0845
                               a 15.9155 15.9155 0 0 1 0 31.831
                               a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                        />
                        {/* Progress Circle */}
                        <path
                            className="text-blue-600 transition-all duration-1000 ease-out"
                            strokeDasharray={`${Math.round(((activeSession.summary?.completedExercises || 0) / (activeSession.summary?.totalExercises || 1)) * 100)}, 100`}
                            d="M18 2.0845
                               a 15.9155 15.9155 0 0 1 0 31.831
                               a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-blue-900">
                        <span className="text-xs font-bold">
                            {Math.round(((activeSession.summary?.completedExercises || 0) / (activeSession.summary?.totalExercises || 1)) * 100)}%
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
