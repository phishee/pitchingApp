import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Home, Calendar, Flag, CheckCircle } from 'lucide-react';
import { BullpenSession } from '@/models/Bullpen';
import { bullpenSessionService } from '@/app/services-client/bullpenSessionService';
import { format } from 'date-fns';

interface MobileBullpenSummaryProps {
    sessionId: string;
}

export function MobileBullpenSummary({ sessionId }: MobileBullpenSummaryProps) {
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
        <div className="min-h-screen bg-slate-50 pb-24 w-full max-w-[100vw] overflow-x-hidden">
            {/* Header */}
            <header className="bg-white px-4 py-6 border-b border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-green-500 shadow-sm">
                        <img src={session.athleteInfo.profileImageUrl} alt="Athlete" className="h-full w-full object-cover" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider">Completed</span>
                        </div>
                        <h1 className="text-xl font-black text-slate-900 leading-tight">Session Summary</h1>
                        <p className="text-xs text-gray-500 font-medium tracking-wide">
                            {format(new Date(session.createdAt), "MMM d, yyyy • h:mm a")}
                        </p>
                    </div>
                </div>
            </header>

            {/* Stats Row (Horizontal Scroll) */}
            <div className="flex w-full max-w-[100vw] gap-2 px-3 py-4 bg-white border-b border-gray-100 overflow-x-auto no-scrollbar mb-4">
                <div className="min-w-[80px] flex-shrink-0 bg-slate-50 rounded-xl p-3 flex flex-col items-center justify-center border border-slate-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Pitches</span>
                    <span className="text-lg font-black text-slate-900">
                        {session.pitches.length}
                    </span>
                </div>
                <div className="min-w-[80px] flex-shrink-0 bg-slate-50 rounded-xl p-3 flex flex-col items-center justify-center border border-slate-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Strike %</span>
                    <span className="text-lg font-black text-green-600">
                        {session.summary.strikePct}%
                    </span>
                </div>
                <div className="min-w-[80px] flex-shrink-0 bg-slate-50 rounded-xl p-3 flex flex-col items-center justify-center border border-slate-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Avg Velo</span>
                    <span className="text-lg font-black text-slate-900">
                        {session.summary.avgVelocity}
                    </span>
                </div>
                <div className="min-w-[80px] flex-shrink-0 bg-slate-50 rounded-xl p-3 flex flex-col items-center justify-center border border-slate-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Top Velo</span>
                    <span className="text-lg font-black text-orange-500">
                        {session.summary.topVelocity}
                    </span>
                </div>
                <div className="min-w-[80px] flex-shrink-0 bg-slate-50 rounded-xl p-3 flex flex-col items-center justify-center border border-slate-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Comp %</span>
                    <span className="text-lg font-black text-purple-600">
                        {session.summary.compliance}%
                    </span>
                </div>
            </div>

            <div className="px-4 space-y-4">
                {/* Key Metrics Cards */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Target Hits</span>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-black text-purple-600">{session.summary.compliance}%</span>
                            <span className="text-[10px] text-gray-400 font-medium mb-1">Success</span>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Total Strikes</span>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-black text-green-600">{session.summary.strikePct}%</span>
                            <span className="text-[10px] text-gray-400 font-medium mb-1">Zone</span>
                        </div>
                    </div>
                </div>

                {/* Pitch Log Preview */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="font-bold text-slate-800 text-sm">Pitch History</h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {session.pitches.slice().reverse().map((pitch, index) => (
                            <div key={pitch.id} className="px-4 py-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold text-gray-400 w-5">#{pitch.number}</span>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-slate-800">{pitch.pitchType.label}</span>
                                        <span className="text-[10px] text-gray-500">Zone {pitch.actualZone || '-'}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-slate-800">{pitch.velocity}</span>
                                    <div className={`w-2 h-2 rounded-full ${pitch.compliance ? 'bg-purple-500' : (pitch.strike ? 'bg-green-500' : 'bg-red-400')}`} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sticky Footer */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-30 pb- safe-area-bottom">
                <Button
                    className="w-full h-12 text-lg font-bold bg-slate-900 hover:bg-slate-800 shadow-lg rounded-xl"
                    onClick={() => router.push('/app/dashboard')}
                >
                    <Home className="mr-2 w-5 h-5" /> Back to Dashboard
                </Button>
            </div>

        </div>
    );
}
