'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { PitchTypeSelector } from '@/app/(protected)/app/sessions/bullpen/components/PitchTypeSelector';
import { LocationPicker } from '@/app/(protected)/app/sessions/bullpen/components/LocationPicker';
import { bullpenSessionService } from '@/app/services-client/bullpenSessionService';
import { BullpenSession, PITCH_TYPES } from '@/models/Bullpen';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface MobileBullpenSessionProps {
    sessionId: string;
}

export function MobileBullpenSession({ sessionId }: MobileBullpenSessionProps) {
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

        // Reset Form
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
                    const { eventApi } = await import('@/app/services-client/eventApi');
                    await eventApi.updateEvent(session.calendarEventId, { status: 'completed' });
                } catch (e) {
                    console.error('Failed to update event status', e);
                }
            }

            router.push(`/app/bullpen-session/${sessionId}/summary`);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
    if (!session) return <div className="flex h-screen items-center justify-center">Session not found</div>;

    const progressPct = session ? Math.round((session.pitches.length / (session.summary.totalPitchPrescribed || 30)) * 100) : 0;

    return (
        <div className="min-h-screen bg-slate-50 pb-24 w-full max-w-[100vw] overflow-x-hidden">
            {/* Header */}
            <header className="bg-white px-4 py-3 border-b border-gray-100 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <img
                            src={session.athleteInfo.profileImageUrl}
                            alt="Athlete"
                            className="w-10 h-10 rounded-full object-cover border-2 border-slate-100"
                        />
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                        <h1 className="font-extrabold text-slate-900 text-sm leading-tight">{session.athleteInfo.name}</h1>
                        <p className="text-[10px] text-gray-500 font-medium tracking-wide">
                            Session #{session.pitches.length + 1} • {format(new Date(), "MMM d, yyyy")}
                        </p>
                    </div>
                </div>
                {session.script && session.pitches.length >= session.script.length ? (
                    <Button
                        size="sm"
                        className="h-8 rounded-full px-4 text-xs font-bold bg-blue-600 hover:bg-blue-700 shadow-sm"
                        onClick={handleEndSession}
                    >
                        Complete Session
                    </Button>
                ) : (
                    <Button
                        variant="destructive"
                        size="sm"
                        className="h-8 rounded-full px-4 text-xs font-bold bg-red-500 hover:bg-red-600 shadow-sm"
                        onClick={handleEndSession}
                    >
                        End Session
                    </Button>
                )}
            </header>

            {/* Stats Row */}
            <div className="flex w-full max-w-[100vw] gap-2 px-3 py-3 bg-white border-b border-gray-100 overflow-x-auto no-scrollbar">
                <div className="min-w-[72px] flex-shrink-0 bg-slate-50 rounded-lg p-2 flex flex-col items-center justify-center border border-slate-100">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Count</span>
                    <span className="text-sm font-black text-slate-800">
                        {session.pitches.length}
                        {session.summary.totalPitchPrescribed > 0 && <span className="text-gray-400 text-[10px] font-medium">/{session.summary.totalPitchPrescribed}</span>}
                    </span>
                </div>
                <div className="min-w-[72px] flex-shrink-0 bg-slate-50 rounded-lg p-2 flex flex-col items-center justify-center border border-slate-100">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Strike %</span>
                    <span className="text-sm font-black text-green-600">
                        {session.summary.strikePct}%
                    </span>
                </div>
                <div className="min-w-[72px] flex-shrink-0 bg-slate-50 rounded-lg p-2 flex flex-col items-center justify-center border border-slate-100">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Avg Velo</span>
                    <span className="text-sm font-black text-slate-800">
                        {session.summary.avgVelocity}
                    </span>
                </div>
                <div className="min-w-[72px] flex-shrink-0 bg-slate-50 rounded-lg p-2 flex flex-col items-center justify-center border border-slate-100">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Top</span>
                    <span className="text-sm font-black text-orange-500">
                        {session.summary.topVelocity}
                    </span>
                </div>
                <div className="min-w-[72px] flex-shrink-0 bg-slate-50 rounded-lg p-2 flex flex-col items-center justify-center border border-slate-100">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Comp %</span>
                    <span className="text-sm font-black text-purple-600">
                        {session.summary.compliance}%
                    </span>
                </div>
            </div>

            {/* Progress - Only show if there is a script */}
            {session.script && session.script.length > 0 && (
                <div className="px-4 py-3 bg-white mb-2">
                    <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[11px] font-bold text-slate-600">
                            Current: <span className="text-slate-900">{currentPrescription?.pitchType || 'Free Throw'} {currentPrescription?.targetZone ? `to Zone ${currentPrescription.targetZone}` : ''}</span>
                        </span>
                        <span className="text-[11px] font-bold text-blue-600">{progressPct}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
                    </div>
                </div>
            )}

            {/* Main Info */}
            <div className="px-3 pb-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50/80 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="font-extrabold text-slate-800 text-lg">Log Pitch #{session.pitches.length + 1}</h2>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Input Mode</span>
                    </div>

                    <div className="p-4 space-y-6">
                        {/* Pitch Type */}
                        <div>
                            <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Pitch Type</Label>
                            <PitchTypeSelector
                                selectedType={selectedPitchType}
                                onSelect={setSelectedPitchType}
                                prescribedType={currentPrescription?.pitchType}
                            />
                        </div>

                        {/* Velocity & Spin */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Velocity (MPH)</Label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    className="h-12 text-center text-2xl font-black text-slate-900 bg-gray-50 border-gray-200"
                                    value={velocity}
                                    onChange={(e) => setVelocity(e.target.value)}
                                />
                            </div>
                            <div>
                                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Spin (RPM)</Label>
                                <Input
                                    type="number"
                                    placeholder="-"
                                    className="h-12 text-center text-2xl font-bold text-slate-500 bg-gray-50 border-gray-200"
                                    value={spinRate}
                                    onChange={(e) => setSpinRate(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div className="flex flex-col items-center">
                            <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-3 w-full">Location</Label>
                            <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
                                <LocationPicker
                                    selectedZone={selectedZone}
                                    onSelect={setSelectedZone}
                                    prescribedZone={currentPrescription?.targetZone}
                                    className="scale-95 origin-top"
                                />
                            </div>
                            <span className="text-[10px] items-center text-center font-medium mt-1 text-slate-400 mt-2">Tap grid to set location</span>
                        </div>

                        {/* Strike Toggle */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <span className="font-bold text-slate-800">Strike</span>
                            <Switch checked={isStrike} onCheckedChange={setIsStrike} className="data-[state=checked]:bg-green-500 scale-110" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-30 pb- safe-area-bottom">
                {session.script && session.pitches.length >= session.script.length ? (
                    <Button
                        className="w-full h-12 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 rounded-xl"
                        onClick={handleEndSession}
                    >
                        COMPLETE SESSION <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                ) : (
                    <Button
                        className="w-full h-12 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 rounded-xl"
                        onClick={handleLogPitch}
                        disabled={!velocity || !selectedZone}
                    >
                        LOG PITCH <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                )}
            </div>
        </div>
    );
}
