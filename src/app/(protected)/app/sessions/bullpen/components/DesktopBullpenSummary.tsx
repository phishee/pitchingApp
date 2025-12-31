import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Home, Calendar, MapPin, Target, Activity, Zap, Flame, CheckCircle } from 'lucide-react';
import { BullpenSession } from '@/models/Bullpen';
import { bullpenSessionService } from '@/app/services-client/bullpenSessionService';
import { format } from 'date-fns';
import { StatsBar } from './StatsBar'; // Reusing StatsBar for consistency

interface DesktopBullpenSummaryProps {
    sessionId: string;
}

export function DesktopBullpenSummary({ sessionId }: DesktopBullpenSummaryProps) {
    const router = useRouter();
    const [session, setSession] = useState<BullpenSession | null>(null);
    const [loading, setLoading] = useState(true);

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

    if (loading) return <div className="flex h-screen items-center justify-center">Loading summary...</div>;
    if (!session) return <div className="flex h-screen items-center justify-center">Session not found</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-6 flex flex-col">
            <div className="max-w-5xl mx-auto w-full space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-green-500 shadow-sm">
                            <img src={session.athleteInfo.profileImageUrl} alt="Athlete" className="h-full w-full object-cover" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span className="text-xs font-bold text-green-600 uppercase tracking-widest">Completed</span>
                            </div>
                            <h1 className="text-3xl font-black text-slate-900">Session Summary</h1>
                            <p className="text-gray-500 font-medium">
                                {format(new Date(session.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                            </p>
                        </div>
                    </div>
                    <Button onClick={() => router.push('/app/dashboard')} variant="outline" className="gap-2">
                        <Home className="w-4 h-4" /> Back to Dashboard
                    </Button>
                </div>

                {/* Main Stats Card */}
                <Card className="p-8 shadow-sm border-gray-100">
                    <h2 className="text-xl font-bold text-slate-800 mb-6">Performance Overview</h2>
                    <StatsBar summary={session.summary} pitchCount={session.pitches.length} />
                </Card>

                {/* Detailed Info Grid */}
                <div className="grid grid-cols-2 gap-6">
                    <Card className="p-6 shadow-sm border-gray-100">
                        <h3 className="font-bold text-gray-500 uppercase text-xs tracking-wider mb-4">Target Compliance</h3>
                        <div className="flex items-center gap-4">
                            <div className="h-20 w-20 rounded-full border-4 border-purple-100 flex items-center justify-center">
                                <span className="text-2xl font-black text-purple-600">{session.summary.compliance}%</span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Pitches in Target Zone</p>
                                <p className="text-xs text-gray-400 mt-1">Goal: 80%</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 shadow-sm border-gray-100">
                        <h3 className="font-bold text-gray-500 uppercase text-xs tracking-wider mb-4">Strike %</h3>
                        <div className="flex items-center gap-4">
                            <div className="h-20 w-20 rounded-full border-4 border-green-100 flex items-center justify-center">
                                <span className="text-2xl font-black text-green-600">{session.summary.strikePct}%</span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Strikes thrown</p>
                                <p className="text-xs text-gray-400 mt-1">Goal: 65%</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Pitch List / Log Placeholder */}
                <Card className="p-0 overflow-hidden shadow-sm border-gray-100">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                        <h3 className="font-bold text-slate-800">Pitch Log</h3>
                    </div>
                    <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                        {session.pitches.map((pitch, index) => (
                            <div key={pitch.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50/50">
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-bold text-gray-400 w-6">#{pitch.number}</span>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-800">{pitch.pitchType.label}</span>
                                        <span className="text-[10px] text-gray-500">Zone {pitch.actualZone || '-'} {pitch.targetZone && pitch.actualZone !== pitch.targetZone ? `(Missed ${pitch.targetZone})` : ''}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <span className="block text-sm font-bold text-slate-800">{pitch.velocity} <span className="text-[10px] font-normal text-gray-400">MPH</span></span>
                                    </div>
                                    <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${pitch.compliance ? 'bg-green-100 text-green-700' : (pitch.strike ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500')}`}>
                                        {pitch.compliance ? 'Hit Spot' : (pitch.strike ? 'Strike' : 'Ball')}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

            </div>
        </div>
    );
}
