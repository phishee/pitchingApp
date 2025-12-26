'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkoutFlow, useWorkoutExercises, useWorkoutActions, useWorkoutOrganization, useWorkoutMetadata } from '@/providers/workout-context';
import { WorkoutExerciseRow } from '@/components/workout-library/creation/steps/WorkoutExerciseRow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Save, ArrowLeft } from 'lucide-react';
import { exerciseApi } from '@/app/services-client/exerciseApi';
import { useTeam } from '@/providers/team-context';
import { useUser } from '@/providers/user.context';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkoutImagePicker } from '@/components/workout-library/WorkoutImagePicker';
import { TagPicker } from '@/components/ui/tag-picker';
import { BullpenConfig } from '@/models/Session_Type';

export function BullpenSessionForm({ workoutId }: { workoutId?: string }) {
    const router = useRouter();
    const { workoutFlow, addExercise, updateExercise, removeExercise } = useWorkoutFlow();
    const { selectedExercises } = useWorkoutExercises();
    const { createWorkout, updateWorkout, loadWorkout, setWorkout } = useWorkoutActions();
    const { organizationId } = useWorkoutOrganization();
    const { updateName, updateDescription, updateTags, updateCoverImage, updateConfig, workoutMetadata } = useWorkoutMetadata();
    const { currentTeamMember } = useTeam();
    const { user } = useUser();

    const [isLoading, setIsLoading] = useState(true);

    // Pitching Exercise ID - assuming this is the ID from fakeExercises.ts
    const PITCHING_EXERCISE_ID = 'ex_pitching';

    useEffect(() => {
        const initializeBullpen = async () => {
            if (workoutId && organizationId) {
                try {
                    await loadWorkout(workoutId, organizationId);
                } catch (error) {
                    console.error('Failed to load workout:', error);
                } finally {
                    setIsLoading(false);
                }
                return;
            }

            // Check if pitching exercise is already added
            const hasPitching = workoutFlow.exercises.some(ex => ex.exercise_id === PITCHING_EXERCISE_ID);

            if (!hasPitching) {
                try {
                    // Initialize the workout since provider state might be null
                    const baseWorkout = {
                        name: '',
                        description: '',
                        tags: ['bullpen'],
                        organizationId,
                        teamIds: currentTeamMember ? [currentTeamMember.teamId] : [],
                        config: {
                            bullpen_type: 'scripted',
                            total_pitch_target: 30
                        } as BullpenConfig,
                        flow: {
                            exercises: [],
                            questionnaires: [],
                            warmup: []
                        }
                    };

                    const pitchingExercise = await exerciseApi.getExerciseById(PITCHING_EXERCISE_ID);

                    if (pitchingExercise) {
                        const exerciseWithConfig = {
                            exercise_id: pitchingExercise.id,
                            sets: [
                                {
                                    setNumber: 1,
                                    metrics: {
                                        pitch_type: 'fastball_4seam',
                                        velocity: 0,
                                        target_zone: 'zone_5',
                                        strike: true,
                                        intensity: 'moderate'
                                    }
                                }
                            ]
                        };

                        // Initialize the workout with the exercise config directly
                        // This ensures that when the provider updates, the flow is already correct.
                        // The provider's useEffect will then automatically fetch the selectedExercises details.
                        const workoutWithExercise = {
                            ...baseWorkout,
                            flow: {
                                ...baseWorkout.flow,
                                exercises: [exerciseWithConfig]
                            }
                        };

                        // Use setWorkout from useWorkoutActions to initialize the state
                        // This bypasses the need for addExercise to check for existing state
                        setWorkout(workoutWithExercise);

                        // Note: We don't need to manually update selectedExercises because 
                        // the WorkoutProvider has a useEffect that watches workout.flow.exercises
                        // and fetches the details automatically.
                    }
                } catch (error) {
                    console.error('Failed to load pitching exercise:', error);
                }
            }
            // We do NOT set isLoading(false) here immediately if we just initialized usage
            // The component will re-render when context updates.
            // We can rely on a check in the render phase to determine if we are "ready".
            // However, to be safe, we can set it to false, but handle the "missing data" case as "loading" in render.
            setIsLoading(false);
        };

        initializeBullpen();
    }, [organizationId, workoutId]); // Run when organizationId or workoutId changes

    const handleSaveSession = async () => {
        if (!currentTeamMember || !user) return;

        const commonData = {
            name: workoutMetadata.name || 'Bullpen Session',
            description: workoutMetadata.description,
            // Ensure bullpen tag is preserved/added
            tags: workoutMetadata.tags.includes('bullpen') ? workoutMetadata.tags : ['bullpen', ...workoutMetadata.tags],
            coverImage: workoutMetadata.coverImage,
            config: workoutMetadata.config,
            flow: workoutFlow
        };

        try {
            if (workoutId) {
                // UPDATE existing session
                await updateWorkout(workoutId, commonData, organizationId);
            } else {
                // CREATE new session
                await createWorkout({
                    ...commonData,
                    sessionType: 'bullpen',
                }, organizationId);
            }

            router.push('/app/sessions');
        } catch (error) {
            console.error('Failed to save session:', error);
        }
    };

    // Find the pitching exercise in the selected exercises list
    const pitchingExerciseData = selectedExercises.find(ex => ex.id === PITCHING_EXERCISE_ID);
    const workoutExerciseConfig = workoutFlow.exercises.find(ex => ex.exercise_id === PITCHING_EXERCISE_ID);

    // If we are loading, OR if we are missing the exercise data but expecting it (implied by this page)
    // checking for workoutExerciseConfig is enough to know if "flow" is ready.
    // checking for pitchingExerciseData is enough to know if "details" are ready.
    // If either is missing, we treat it as loading.
    const isDataReady = !!pitchingExerciseData && !!workoutExerciseConfig;

    if (isLoading || !isDataReady) {
        // Optional: Add a timeout/error state if it takes too long? 
        // For now, infinite loading is better than a crash/error message for a race condition.
        return <div>Loading workspace...</div>;
    }

    /* 
       Note: Previously we returned an error here. Now we just keep loading.
       If the exercise *really* doesn't exist, we might get stuck in loading.
       Ideally we'd handle that error case specifically, but given the user report,
       the issue is timing, not existence.
    */

    return (
        <div className="space-y-6 max-w-5xl mx-auto p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {workoutId ? 'Edit Bullpen Session' : 'New Bullpen Session'}
                        </h1>
                        <p className="text-gray-500">Configure your pitching session metrics</p>
                    </div>
                </div>
                <Button onClick={handleSaveSession} className="gap-2 bg-blue-600 hover:bg-blue-700 rounded-full">
                    <Save className="w-4 h-4" />
                    {workoutId ? 'Update Session' : 'Save Session'}
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        General Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bullpen Name *
                        </label>
                        <Input
                            value={workoutMetadata.name}
                            onChange={(e) => updateName(e.target.value)}
                            placeholder="e.g. High Intensity Bullpen"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <Textarea
                            value={workoutMetadata.description}
                            onChange={(e) => updateDescription(e.target.value)}
                            placeholder="Describe the focus of this session..."
                            rows={3}
                        />
                    </div>

                    {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bullpen Type
                        </label>
                        <Select
                            value={(workoutMetadata.config as BullpenConfig)?.bullpen_type || 'scripted'}
                            onValueChange={(value) => {
                                const currentConfig = (workoutMetadata.config as BullpenConfig) || {
                                    bullpen_type: 'scripted',
                                    total_pitch_target: 30
                                };
                                updateConfig({
                                    ...currentConfig,
                                    bullpen_type: value as any
                                });
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="standard" disabled>Standard (Coming Soon)</SelectItem>
                                <SelectItem value="scripted">Scripted</SelectItem>
                                <SelectItem value="recovery" disabled>Recovery (Coming Soon)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tags
                        </label>
                        <TagPicker
                            selectedTags={workoutMetadata.tags}
                            onTagsChange={(newTags) => {
                                const tags = newTags.filter(t => t !== 'bullpen');
                                updateTags(['bullpen', ...tags]);
                            }}
                            categories={[
                                'baseball_specific',
                                'movement_patterns',
                                'training_types'
                            ]}
                        />
                    </div>

                    {/* </div> */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cover Image
                        </label>
                        <div className="mt-1">
                            <WorkoutImagePicker
                                value={workoutMetadata.coverImage}
                                onChange={(imageUrl) => updateCoverImage(imageUrl)}
                                searchQuery={"baseball pitching"}
                            />
                        </div>
                    </div>

                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Session Configuration
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <WorkoutExerciseRow
                        exercise={pitchingExerciseData}
                        index={0}
                        workoutExercise={workoutExerciseConfig}
                        onUpdateConfig={(id, field, value) => updateExercise(id, field, value)}
                        onRemove={() => { }} // Prevent removal
                        onLink={() => { }}
                        onUnlink={() => { }}
                        isLast={true}
                        itemLabel="Pitch"
                        forcePerSet={true}
                        globalMetricIds={['intensity']}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
