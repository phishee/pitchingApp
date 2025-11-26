'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { WorkoutSession } from '@/models/WorkoutSession';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Dumbbell, Activity, Calendar, Trophy, Layers, ListTodo } from 'lucide-react';
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

    const rpeDisplay = session.summary.sessionRpe
        ? formatRPEForDisplay(session.summary.sessionRpe)
        : session.summary.sessionRPE
            ? `${session.summary.sessionRPE}/10`
            : '--';

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 pb-8">
            {/* Header */}
            <div className="bg-white px-6 pt-12 pb-8 rounded-b-[3rem] shadow-sm text-center space-y-4">
                <div className="mx-auto w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 mb-4 ring-8 ring-yellow-50">
                    <Trophy className="w-12 h-12" />
                </div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Workout Complete!</h1>
                <p className="text-gray-500 font-medium">Great job crushing your session.</p>
            </div>

            <div className="flex-1 px-6 -mt-6 space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Duration */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-2">
                        <div className="flex items-center gap-2 text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Duration</span>
                        </div>
                        <p className="text-2xl font-black text-gray-900">{duration}</p>
                    </div>

                    {/* RPE */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-2">
                        <div className="flex items-center gap-2 text-gray-400">
                            <span className="text-lg leading-none">😰</span>
                            <span className="text-xs font-bold uppercase tracking-wider">RPE</span>
                        </div>
                        <p className="text-2xl font-black text-gray-900 truncate" title={rpeDisplay}>
                            {rpeDisplay}
                        </p>
                    </div>

                    {/* Exercises */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-2">
                        <div className="flex items-center gap-2 text-gray-400">
                            <ListTodo className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Exercises</span>
                        </div>
                        <p className="text-2xl font-black text-gray-900">
                            {session.summary.completedExercises}/{session.summary.totalExercises}
                        </p>
                    </div>

                    {/* Sets */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-2">
                        <div className="flex items-center gap-2 text-gray-400">
                            <Layers className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Sets</span>
                        </div>
                        <p className="text-2xl font-black text-gray-900">
                            {session.summary.completedSets}/{session.summary.totalSets}
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
