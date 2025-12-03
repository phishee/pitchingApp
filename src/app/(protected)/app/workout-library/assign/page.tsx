'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useOrganization } from '@/providers/organization-context';
import { useTeam } from '@/providers/team-context';
import { useUser } from '@/providers/user.context';
import { AssignmentOrchestratorProvider } from '@/providers/workout-assignment/assignment-orchestrator.context';
import { WorkoutAssignmentFlow } from '@/components/calendar/event/creation/workout-assignment-flow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Target } from 'lucide-react';

function WorkoutAssignmentPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const workoutId = searchParams.get('workoutId');
    const athleteId = searchParams.get('athleteId');

    const { currentOrganization } = useOrganization();
    const { currentTeam, teamMembers } = useTeam();
    const { user } = useUser();

    const handleBack = () => {
        router.back();
    };

    const handleComplete = () => {
        // Redirect to calendar or back to workout library
        router.push('/app/workout-library');
    };

    if (!currentOrganization || !currentTeam || !user) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-muted-foreground">Loading...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <div className="mb-6">
                <Button variant="ghost" onClick={handleBack} className="pl-0 hover:pl-0 hover:bg-transparent">
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back
                </Button>
                <h1 className="text-2xl font-bold mt-2 flex items-center gap-2">
                    <Target className="h-6 w-6 text-primary" />
                    Assign Workout
                </h1>
                <p className="text-muted-foreground">
                    Assign workouts to your athletes and schedule them on the calendar.
                </p>
            </div>

            <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-0">
                    <AssignmentOrchestratorProvider
                        organizationId={currentOrganization._id}
                        teamId={currentTeam._id}
                        currentUserId={user.userId}
                    >
                        <div className="p-6">
                            <WorkoutAssignmentFlow
                                availableMembers={teamMembers}
                                organizationId={currentOrganization._id}
                                teamId={currentTeam._id}
                                onComplete={handleComplete}
                                onCancel={handleBack}
                                initialWorkoutId={workoutId || undefined}
                                initialAthleteId={athleteId || undefined}
                            />
                        </div>
                    </AssignmentOrchestratorProvider>
                </CardContent>
            </Card>
        </div>
    );
}

export default function WorkoutAssignmentPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <WorkoutAssignmentPageContent />
        </Suspense>
    );
}
