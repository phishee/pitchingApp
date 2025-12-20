'use client';

import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Repeat } from 'lucide-react';

interface StepScheduleProps {
    onScheduleChange: (schedule: { pattern: 'daily' | 'weekly' | 'once'; startDate: Date; endDate?: Date }) => void;
}

export function StepSchedule({ onScheduleChange }: StepScheduleProps) {
    const [pattern, setPattern] = useState<'daily' | 'weekly' | 'once'>('daily');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState<string>('');

    const handleUpdate = (newPattern: typeof pattern, newStart: string, newEnd: string) => {
        setPattern(newPattern);
        setStartDate(newStart);
        setEndDate(newEnd);

        onScheduleChange({
            pattern: newPattern,
            startDate: new Date(newStart),
            endDate: newEnd ? new Date(newEnd) : undefined
        });
    };

    return (
        <div className="space-y-6">
            {/* Recurrence Pattern */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Frequency</label>
                <div className="grid grid-cols-3 gap-3">
                    {['daily', 'weekly', 'once'].map((p) => (
                        <button
                            key={p}
                            onClick={() => handleUpdate(p as any, startDate, endDate)}
                            className={`flex items-center justify-center py-2.5 rounded-lg border text-sm font-medium capitalize transition-all ${pattern === p
                                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-gray-400" />
                        Start Date
                    </label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => handleUpdate(pattern, e.target.value, endDate)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {pattern !== 'once' && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-gray-400" />
                            End Date
                            <span className="text-xs font-normal text-gray-400">(Optional)</span>
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => handleUpdate(pattern, startDate, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                )}
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-900">Assignment Time</p>
                    <p className="text-xs text-gray-500">
                        Assignments will appear on the athlete's dashboard at 6:00 AM local time on the scheduled days.
                    </p>
                </div>
            </div>
        </div>
    );
}
