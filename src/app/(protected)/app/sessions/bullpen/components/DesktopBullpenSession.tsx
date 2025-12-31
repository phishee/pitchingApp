'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft, PauseCircle, StopCircle, ArrowRight } from 'lucide-react';
import { StatsBar } from '@/app/(protected)/app/sessions/bullpen/components/StatsBar';
import { RecentThrows } from '@/app/(protected)/app/sessions/bullpen/components/RecentThrows';
import { PitchTypeSelector } from '@/app/(protected)/app/sessions/bullpen/components/PitchTypeSelector';
import { LocationPicker } from '@/app/(protected)/app/sessions/bullpen/components/LocationPicker';
import { bullpenSessionService } from '@/app/services-client/bullpenSessionService';
import { BullpenSession, PITCH_TYPES } from '@/models/Bullpen';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface DesktopBullpenSessionProps {
    sessionId: string;
}

export function DesktopBullpenSession({ sessionId }: DesktopBullpenSessionProps) {
    const router = useRouter();

    // State
    const [session, setSession] = useState<BullpenSession | null>(null);
    const [loading, setLoading] = useState(true);

    // Input State
    const [selectedPitchType, setSelectedPitchType] = useState('4-Seam');
    const [velocity, setVelocity] = useState('');
    const [spinRate, setSpinRate] = useState('');
    const [selectedZone, setSelectedZone] = useState<string | null>(null);
    const [isStrike, setIsStrike] = useState(false);

    // Derived State
    const currentPitchIndex = session?.pitches.length ?? 0;
    const currentPrescription = session?.script?.[currentPitchIndex];

    // Prescribe Pitch Type Effect
    useEffect(() => {
        if (currentPrescription) {
            setSelectedPitchType(currentPrescription.pitchType);
        }
    }, [currentPrescription]);

    // Load Session
    useEffect(() => {
        const loadSession = async () => {
            try {
                const data = await bullpenSessionService.getSessionById(sessionId);
                setSession(data);
            } catch (error) {
                console.error('Failed to load session', error);
            } finally {
                setLoading(false);
            }
        };
        loadSession();
    }, [sessionId]);

    const handleLogPitch = async () => {
        if (!session || !velocity || !selectedZone) return;

        const currentPitchIdx = session.pitches.length;
        const prescription = session.script?.[currentPitchIdx];
        const isCompliant = prescription ? prescription.targetZone === selectedZone : true;

        const pitchTypeObj = PITCH_TYPES.find(p => p.value === selectedPitchType) || PITCH_TYPES[0];

        const newPitch = {
            id: `p_${Date.now()}`,
            number: currentPitchIdx + 1,
            pitchType: pitchTypeObj,
            velocity: parseFloat(velocity),
            targetZone: prescription ? prescription.targetZone : selectedZone,
            actualZone: selectedZone,
            compliance: isCompliant,
            strike: isStrike,
            intensity: 'game_intensity',
            timestamp: new Date()
        };

        const updatedSession = await bullpenSessionService.logPitch(sessionId, newPitch);
        setSession(updatedSession);

        // Reset Form (keep pitch type and strike setting for speed)
        setVelocity('');
        setSpinRate('');
        setSelectedZone(null);
    };

    const handleEndSession = async () => {
        if (confirm('Are you sure you want to end this session?')) {
            await bullpenSessionService.endSession(sessionId);

            // Mark event as completed if linked
            if (session?.calendarEventId) {
                try {
                    // We need to import eventApi at the top first!
                    // But wait, I can just dynamically import or assume it's available?
                    // Better to add import. Since this is a partial replace, I'll need to double check imports.
                    // I'll assume I need to add the import in a separate step or included here if the file is small enough? 
                    // The file is large. I'll stick to logic here and add import separately if needed.
                    // Actually, let's use the dynamic import or just standard import.
                    const { eventApi } = await import('@/app/services-client/eventApi');
                    await eventApi.updateEvent(session.calendarEventId, { status: 'completed' });
                } catch (e) {
                    console.error('Failed to update event status', e);
                }
            }

            router.push(`/app/bullpen-session/${sessionId}/summary`);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center">Loading session...</div>;
    if (!session) return <div className="flex h-screen items-center justify-center">Session not found</div>;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* HEADER */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-blue-500 shadow-sm">
                        <img src={session.athleteInfo.profileImageUrl} alt="Athlete" className="h-full w-full object-cover" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Live Session</span>
                        </div>
                        <h1 className="text-xl font-black text-slate-900 leading-none">{session.athleteInfo.name}</h1>
                        <p className="text-xs text-gray-500 mt-1 font-medium">
                            {format(new Date(), "MMMM d, yyyy")} • <span className="text-blue-600">Goal: Fastball Command</span>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">

                    {session.script && session.pitches.length >= session.script.length ? (
                        <Button className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-sm rounded-full" onClick={handleEndSession}>
                            <StopCircle className="w-4 h-4" /> Complete Session
                        </Button>
                    ) : (
                        <Button variant="destructive" className="gap-2 bg-red-600 hover:bg-red-700 shadow-sm rounded-full" onClick={handleEndSession}>
                            <StopCircle className="w-4 h-4" /> End Session
                        </Button>
                    )}
                </div>
            </header>
            {/* STATS BAR */}
            <div className='mt-3 px-4'>
                <StatsBar summary={session.summary} pitchCount={session.pitches.length} />
            </div>

            {/* PROGRESS BAR - Only show if there is a script */}
            {session.script && session.script.length > 0 && (
                <div className="px-4">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-bold text-slate-700">
                            Current Pitch: <span className="text-slate-900">
                                {currentPrescription
                                    ? `${currentPrescription.pitchType} to Zone ${currentPrescription.targetZone}`
                                    : 'Free Throw'}
                            </span>
                        </span>
                        <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">
                            Script: {Math.round((session.pitches.length / session.script.length) * 100)}%
                        </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-600 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min((session.pitches.length / session.script.length) * 100, 100)}%` }}
                        />
                    </div>
                </div>
            )}

            <div className="flex-1 p-6 max-w-[1600px] mx-auto w-full grid grid-cols-12 gap-6 items-start">

                {/* LEFT COLUMN: Main Controls */}
                <div className="col-span-8 space-y-6">
                    {/* INPUT AREA */}
                    <Card className="p-0 overflow-hidden shadow-sm border-gray-200">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="font-bold text-gray-800 text-lg">Log Pitch #{session.pitches.length + 1}</h2>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Input Mode</span>
                        </div>
                        {/* Pitch Type */}
                        <div className="p-4 border-b border-gray-100">
                            <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pitch Type</Label>
                            <PitchTypeSelector
                                selectedType={selectedPitchType}
                                onSelect={setSelectedPitchType}
                                prescribedType={currentPrescription?.pitchType}
                            />
                        </div>

                        <div className="p-8 grid grid-cols-2 gap-12 items-center">
                            {/* LEFT INPUTS */}
                            <div className="space-y-8">

                                {/* Velocity & Spin */}
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-3">
                                        <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Velocity (MPH)</Label>
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            className="h-14 text-center text-3xl font-black text-slate-900 tracking-tight"
                                            value={velocity}
                                            onChange={(e) => setVelocity(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Spin (RPM)</Label>
                                        <Input
                                            type="number"
                                            placeholder="-"
                                            className="h-14 text-center text-3xl font-bold text-slate-400"
                                            value={spinRate}
                                            onChange={(e) => setSpinRate(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Strike Toggle */}
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <Label className="font-bold text-slate-700">Strike</Label>
                                    <Switch checked={isStrike} onCheckedChange={setIsStrike} className="data-[state=checked]:bg-green-500" />
                                </div>
                            </div>

                            {/* RIGHT INPUTS (Location) */}
                            <div className="flex flex-col items-center justify-center space-y-6">
                                <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider w-full text-center">Location</Label>
                                <LocationPicker
                                    selectedZone={selectedZone}
                                    onSelect={setSelectedZone}
                                    prescribedZone={currentPrescription?.targetZone}
                                />
                            </div>
                        </div>
                        <div className='m-4'>
                            {session.script && session.pitches.length >= session.script.length ? (
                                <Button
                                    className="w-full h-12 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 rounded-full"
                                    onClick={handleEndSession}
                                >
                                    Complete Session <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            ) : (
                                <Button
                                    className="w-full h-12 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 rounded-full"
                                    onClick={handleLogPitch}
                                    disabled={!velocity || !selectedZone}
                                >
                                    Log Pitch <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            )}
                        </div>

                    </Card>
                </div>

                {/* RIGHT COLUMN: Recent Throws */}
                <div className="col-span-4 h-[calc(100vh-140px)] sticky top-24">
                    <RecentThrows pitches={session.pitches} />
                </div>

            </div>
        </div>
    );
}
