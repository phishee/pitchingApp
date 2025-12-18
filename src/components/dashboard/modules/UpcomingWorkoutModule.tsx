import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Clock, ArrowRight, Dumbbell } from 'lucide-react';
import { eventApi } from '@/app/services-client/eventApi';
import { useUser } from '@/providers/user.context';
import { Event } from '@/models/Calendar';
import { format } from 'date-fns';
import Link from 'next/link';

interface UpcomingWorkoutModuleProps {
    settings: {
        showDetails?: boolean;
    };
    onVisibilityChange?: (isVisible: boolean) => void;
}

export function UpcomingWorkoutModule({ settings, onVisibilityChange }: UpcomingWorkoutModuleProps) {
    const { user } = useUser();
    const [upcomingEvent, setUpcomingEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUpcomingWorkout = async () => {
            if (!user?.userId || !user?.currentOrganizationId) return;

            try {
                // Fetch upcoming workouts (limit 1)
                const events = await eventApi.getUpcomingEventsForAthlete(
                    user.currentOrganizationId,
                    user.userId,
                    {
                        limit: 1,
                        types: ['workout'],
                        includeDetails: true
                    }
                );

                if (events && events.length > 0) {
                    setUpcomingEvent(events[0]);
                    onVisibilityChange?.(true);
                } else {
                    setUpcomingEvent(null);
                    onVisibilityChange?.(false);
                }
            } catch (error) {
                console.error('Failed to fetch upcoming workout:', error);
                onVisibilityChange?.(false);
            } finally {
                setLoading(false);
            }
        };

        fetchUpcomingWorkout();
    }, [user, onVisibilityChange]);

    if (loading) {
        return (
            <Card className="h-full flex flex-col">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Today's Workout</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center">
                    <div className="text-sm text-muted-foreground">Loading...</div>
                </CardContent>
            </Card>
        );
    }

    if (!upcomingEvent) {
        return null;
    }

    const startTime = new Date(upcomingEvent.startTime);
    const isToday = new Date().toDateString() === startTime.toDateString();

    return (
        <Card className="h-full flex flex-col overflow-hidden border-l-4 border-l-primary shadow-sm">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        {isToday ? "Today's Workout" : "Next Workout"}
                    </CardTitle>
                    {isToday && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Scheduled
                        </span>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between pt-0">
                <div className="mt-2 space-y-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 leading-tight">
                            {upcomingEvent.title}
                        </h3>
                        {upcomingEvent.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {upcomingEvent.description}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-3 text-sm">
                        <div className="flex items-center text-gray-600 bg-gray-50 px-2 py-1 rounded-md">
                            <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                            {format(startTime, 'EEEE, MMM d')}
                        </div>
                        <div className="flex items-center text-gray-600 bg-gray-50 px-2 py-1 rounded-md">
                            <Clock className="mr-2 h-4 w-4 text-primary" />
                            {format(startTime, 'h:mm a')}
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <Button asChild className="w-full group rounded-full" size="lg">
                        <Link href={`/app/my-workouts/${upcomingEvent._id}`}>
                            Start Workout
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
