'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Calendar as CalendarIcon, MapPin, Users, Target } from 'lucide-react';
import { format } from 'date-fns';
import { BullpenSession, BullpenScriptItem } from '@/models/Bullpen';
import { bullpenSessionService } from '@/app/services-client/bullpenSessionService';
import { eventApi } from '@/app/services-client/eventApi';
import { workoutAssignmentApi } from '@/app/services-client/workoutAssignmentApi';
import { workoutApi } from '@/app/services-client/workoutApi';
import { useUser } from '@/providers/user.context';
import { toast } from 'sonner';

// Placeholder for event fetching until we have a proper hook or route
// We will mock basic event details or fetch if we can.
// For now, let's assume we can fetch basic details or just show a loading state and start.
// Ideally usage would be: const { event } = useEvent(params.id);

interface PageProps {
    params: Promise<{
        id: string; // This is the EVENT ID
    }>;
}

export default function BullpenDetailPage({ params }: PageProps) {
    const router = useRouter();
    const { user } = useUser();
    const [eventId, setEventId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Data states
    const [event, setEvent] = useState<any>(null);
    const [assignment, setAssignment] = useState<any>(null);
    const [script, setScript] = useState<BullpenScriptItem[]>([]);
    const [totalPitches, setTotalPitches] = useState(0);
    const [existingSessionId, setExistingSessionId] = useState<string | null>(null);

    useEffect(() => {
        params.then(p => setEventId(p.id));
    }, [params]);

    // Fetch Data
    useEffect(() => {
        if (!eventId) return;

        const fetchData = async () => {
            setIsLoading(true);
            try {
                // 1. Fetch Event
                const eventData = await eventApi.getEventById(eventId);
                setEvent(eventData);

                if (eventData?.sourceId && eventData.sourceType === 'workout_assignment') {
                    // 2. Fetch Assignment
                    const assignmentData = await workoutAssignmentApi.get(eventData.sourceId);
                    setAssignment(assignmentData);

                    // 3. Fetch Workout to get the script
                    if (assignmentData?.workoutId) {
                        const workoutData = await workoutApi.getWorkoutById(assignmentData.workoutId, eventData.organizationId);

                        // 3b. Check for existing sessions
                        try {
                            const existingSessions = await bullpenSessionService.getSessionsByAssignmentId(assignmentData._id);

                            // Check for completed session first (if event is completed)
                            if (eventData.status === 'completed') {
                                const completedSession = existingSessions.find(s => s.status === 'completed'); // 'closed' just in case
                                if (completedSession) {
                                    // Direct redirect or show "View Summary" button?
                                    // Requirement: "if it is completed to show the summary page"
                                    // Redirecting immediately might be jarring? 
                                    // Let's redirect immediately as requested or update state to trigger effect.
                                    // Changing button text to "View Summary" is safer, users usually click "Start" to enter.
                                    // But the request said "if click on that event... show summary page". 
                                    // This page IS the result of clicking the event. So I should redirect.
                                    router.replace(`/app/bullpen-session/${completedSession.id}/summary`);
                                    return;
                                }
                            }

                            const activeSession = existingSessions.find(s => s.status === 'in_progress');
                            if (activeSession) {
                                console.log('Found Active Session:', activeSession);
                                setExistingSessionId(activeSession.id);
                            }
                        } catch (err) {
                            console.error("Failed to check existing sessions", err);
                        }

                        // 4. Extract Script
                        const scriptItems: BullpenScriptItem[] = [];

                        // Strategy: Check if the Assignment has specific prescriptions for pitching
                        // The user object shows structure: prescriptions: { ex_pitching: { prescribedMetrics: [...] } }
                        // We need to iterate over these keys or find the one relevant to "Bullpen".

                        // Check if we have assignments prescriptions
                        if (assignmentData?.prescriptions) {
                            Object.values(assignmentData.prescriptions).forEach((prescription: any) => {
                                if (prescription?.prescribedMetrics) {
                                    prescription.prescribedMetrics.forEach((set: any) => {
                                        const metrics = set.metrics || {};

                                        // Count (default 1)
                                        // If "reps" or count-like metric exists, use it.
                                        // In the example, we have separate sets for unique pitches (setNumber 1, 2, 3)
                                        // so each set might be just 1 pitch?
                                        // Or do the sets represent blocks?
                                        // Looking at user example: setNumber 1 -> pitch_type: CT, target_zone: 3.
                                        // This implies 1 pitch per set entry if no 'reps' specified?
                                        // Let's assume 1 unless 'reps' is explicit.

                                        let pitchCount = 1;
                                        if (metrics.reps && typeof metrics.reps === 'number') {
                                            pitchCount = metrics.reps;
                                        }

                                        // Pitch Type
                                        let pitchType = "4-Seam"; // Default
                                        if (metrics.pitch_type) {
                                            pitchType = String(metrics.pitch_type);
                                        }

                                        // Target Zone
                                        let targetZone = "Global"; // Default
                                        if (metrics.target_zone) {
                                            targetZone = String(metrics.target_zone);
                                            // Ensure it matches format if needed (e.g. "3" -> "zone_3")
                                            // Our helper usually handles normalization, but let's be safe
                                            if (!targetZone.startsWith('zone_') && !isNaN(Number(targetZone))) {
                                                targetZone = `zone_${targetZone}`;
                                            }
                                        }

                                        for (let i = 0; i < pitchCount; i++) {
                                            const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `script_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                                            scriptItems.push({
                                                id: uniqueId,
                                                pitchType,
                                                targetZone
                                            });
                                        }
                                    });
                                }
                            });
                        }

                        // Fallback: If no assignment prescriptions found, use Workout Flow
                        if (scriptItems.length === 0 && workoutData?.flow?.exercises) {
                            workoutData.flow.exercises.forEach(ex => {
                                if (ex.sets) {
                                    ex.sets.forEach(set => {
                                        let pitchCount = 1;
                                        let targetZone = "Global";
                                        let pitchType = "4-Seam"; // Placeholder

                                        const metricValues = Object.values(set.metrics || {});
                                        const numericValue = metricValues.find(v => typeof v === 'number');
                                        if (typeof numericValue === 'number' && numericValue > 0) {
                                            pitchCount = numericValue;
                                        }

                                        const zoneValue = metricValues.find(v => typeof v === 'string' && (v.includes('zone') || v.includes('Zone')));
                                        if (zoneValue && typeof zoneValue === 'string') {
                                            targetZone = zoneValue;
                                        }

                                        for (let i = 0; i < pitchCount; i++) {
                                            const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `script_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                                            scriptItems.push({
                                                id: uniqueId,
                                                pitchType,
                                                targetZone
                                            });
                                        }
                                    });
                                }
                            });
                        }

                        setScript(scriptItems);
                        setTotalPitches(scriptItems.length);
                    }
                }

            } catch (error) {
                console.error("Failed to fetch bullpen details", error);
                toast.error("Failed to load session details");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [eventId]);

    const handleStartSession = async () => {
        if (!eventId || !user) {
            console.error('Missing eventId or user', { eventId, user });
            toast.error('Missing user information');
            return;
        }

        // If resuming
        if (existingSessionId) {
            router.push(`/app/bullpen-session/${existingSessionId}`);
            return;
        }

        setIsCreating(true);
        try {
            console.log('Creating session with user:', user);

            // Construct payload
            const newSession: Partial<BullpenSession> = {
                organizationId: user.currentOrganizationId || '',
                teamId: 'default-team', // user.teamIds fallback
                athleteInfo: {
                    userId: user.userId || '',
                    name: user.name || 'Athlete',
                    email: user.email || '',
                    profileImageUrl: user.profileImageUrl || ''
                },
                workoutAssignmentId: assignment?._id,
                calendarEventId: eventId,
                status: 'in_progress',
                pitches: [],
                script: script, // Include the fetched script
                summary: {
                    totalPitchPrescribed: totalPitches > 0 ? totalPitches : (script.length || 0),
                    totalPitchCompleted: 0,
                    compliance: 0,
                    avgVelocity: 0,
                    topVelocity: 0,
                    strikePct: 0
                }
            };

            console.log('Session Payload:', newSession);

            const createdSession = await bullpenSessionService.createSession(newSession);
            console.log('Session Created:', createdSession);

            // Update Event Status to 'in_progress'
            try {
                await eventApi.updateEvent(eventId, { status: 'in_progress' });
                console.log('Event status updated to in_progress');
            } catch (eventError) {
                console.error("Failed to update event status", eventError);
                // Don't block navigation if event update fails
            }

            router.push(`/app/bullpen-session/${createdSession.id}`);

        } catch (error) {
            console.error('Failed to start session', error);
            if (error && typeof error === 'object' && 'response' in error) {
                console.error('API Response:', (error as any).response?.data);
            }
            toast.error('Failed to start session');
            setIsCreating(false);
        }
    };

    if (!eventId) return null;

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-6 flex flex-col">
            <div className="max-w-3xl mx-auto w-full space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-gray-500 hover:text-gray-800">
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <h1 className="text-2xl font-black text-slate-900">Bullpen Session</h1>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-3xl p-5 md:p-8 shadow-sm border border-gray-100 space-y-8">

                    <div className="flex items-start justify-between">
                        <div>
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-bold mb-4">
                                <Target className="w-4 h-4 mr-2" /> Bullpen
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 mb-2">{event?.title || 'Scheduled Bullpen'}</h2>
                            <p className="text-gray-500 text-lg">{event?.description || 'Focus on command and execution.'}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-blue-500">
                                <CalendarIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase">Date</p>
                                <p className="font-semibold text-slate-900">{event?.startTime ? format(new Date(event.startTime), 'MMMM d, yyyy') : 'Loading...'}</p>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-purple-500">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase">Location</p>
                                <p className="font-semibold text-slate-900">{event?.location || 'Main Mound'}</p>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-green-500">
                                <Target className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase">Script</p>
                                <p className="font-semibold text-slate-900">{totalPitches > 0 ? `${totalPitches} Pitches` : 'Open Session'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-gray-100">
                        <Button
                            className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 rounded-2xl transition-all active:scale-[0.98]"
                            onClick={handleStartSession}
                            disabled={isCreating || isLoading}
                        >
                            {isCreating ? (existingSessionId ? 'Resuming...' : 'Starting Session...') : (
                                <>
                                    <Play className="w-5 h-5 mr-2 fill-current" /> {existingSessionId ? 'Resume Session' : 'Start Session'}
                                </>
                            )}
                        </Button>
                    </div>

                </div>
            </div>
        </div>
    );
}
