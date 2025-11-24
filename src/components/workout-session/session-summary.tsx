'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { WorkoutSession } from '@/models/WorkoutSession';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Dumbbell, Activity, Calendar } from 'lucide-react';
import { formatRPEForDisplay } from '@/models/RPE';

interface SessionSummaryProps {
    session: WorkoutSession;
}

export function SessionSummary({ session }: SessionSummaryProps) {
    const router = useRouter();

    const handleFinish = () => {
        router.push('/app/dashboard');
    };

    // Calculate duration
    const duration = session.durationMinutes
        ? `${Math.round(session.durationMinutes)} min`
        : session.actualStartTime && session.actualEndTime
            ? `${Math.round((new Date(session.actualEndTime).getTime() - new Date(session.actualStartTime).getTime()) / 60000)} min`
            : '--';

    const totalVolume = session.summary.totalVolumeLifted
        ? `${session.summary.totalVolumeLifted.toLocaleString()} lbs`
        : '--';

    const compliance = `${session.summary.compliancePercent}%`;

    const rpeDisplay = session.rpeResult?.overall
        ? formatRPEForDisplay(session.rpeResult.overall)
        : session.summary.sessionRPE
            ? `${session.summary.sessionRPE}/10`
            : '--';

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 pb-8">
            {/* Header */}
            <div className="bg-white px-6 pt-12 pb-8 rounded-b-[3rem] shadow-sm text-center space-y-4">
                <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
                    <CheckCircle className="w-10 h-10" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Workout Complete!</h1>
                <p className="text-gray-500">Great job crushing your session.</p>
            </div>

            <div className="flex-1 px-6 -mt-6 space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-2">
                        <div className="flex items-center gap-2 text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Duration</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{duration}</p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-2">
                        <div className="flex items-center gap-2 text-gray-400">
                            <Activity className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Compliance</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{compliance}</p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-2">
                        <div className="flex items-center gap-2 text-gray-400">
                            <Dumbbell className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Volume</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{totalVolume}</p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-2">
                        <div className="flex items-center gap-2 text-gray-400">
                            <span className="text-lg">😰</span>
                            <span className="text-xs font-bold uppercase tracking-wider">RPE</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900 truncate" title={rpeDisplay}>
                            {rpeDisplay}
                        </p>
                    </div>
                </div>

                {/* Workout Details Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                    <h3 className="font-bold text-gray-900">Session Details</h3>

                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 shrink-0">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900">{session.workout.name}</h4>
                            <p className="text-sm text-gray-500 line-clamp-2">{session.workout.description}</p>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex justify-between text-sm">
                        <span className="text-gray-500">Exercises Completed</span>
                        <span className="font-bold text-gray-900">
                            {session.summary.completedExercises}/{session.summary.totalExercises}
                        </span>
                    </div>
                </div>
            </div>

            <div className="px-6 pt-4">
                <Button
                    onClick={handleFinish}
                    className="w-full h-14 text-lg font-bold rounded-xl bg-gray-900 text-white hover:bg-gray-800 shadow-lg"
                >
                    Back to Dashboard
                </Button>
            </div>
        </div>
    );
}
