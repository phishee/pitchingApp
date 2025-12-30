import React from 'react';
import { Pitch, PITCH_TYPES } from '@/models/Bullpen';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

interface RecentThrowsProps {
    pitches: Pitch[];
}

export function RecentThrows({ pitches }: RecentThrowsProps) {
    const getPitchColor = (type: string) => {
        if (type.includes('Fastball') || type.includes('4-Seam') || type.includes('2-Seam')) return "bg-blue-500";
        if (type === 'SL' || type === 'CT') return "bg-orange-500";
        if (type === 'CB' || type === 'KN') return "bg-purple-500";
        if (type === 'CH' || type === 'SP' || type === 'SI') return "bg-green-500";
        return "bg-gray-500";
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-800">Recent Throws</h3>
                <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">View All</button>
            </div>

            {/* Header Row */}
            <div className="grid grid-cols-4 gap-2 px-4 py-2 bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <div>#</div>
                <div>Pitch</div>
                <div>MPH</div>
                <div className="text-center">Comp.</div>
            </div>

            <ScrollArea className="flex-1">
                <div className="divide-y divide-gray-50">
                    {pitches.map((pitch) => (
                        <div key={pitch.id} className="grid grid-cols-4 gap-2 px-4 py-3 text-sm hover:bg-gray-50/50 transition-colors items-center">
                            <div className="text-gray-500 font-medium">#{pitch.number}</div>
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    "w-3 h-3 rounded-full flex-shrink-0",
                                    getPitchColor(pitch.pitchType.value)
                                )} />
                                <span className="font-semibold text-gray-700 truncate">{pitch.pitchType.value}</span>
                            </div>
                            <div className="text-gray-600 font-mono">{pitch.velocity?.toFixed(1) || '-'}</div>
                            <div className="flex justify-center">
                                {pitch.compliance ? (
                                    <Check className="w-5 h-5 text-green-500" strokeWidth={3} />
                                ) : (
                                    <X className="w-5 h-5 text-red-500" strokeWidth={3} />
                                )}
                            </div>
                        </div>
                    ))}

                    {pitches.length === 0 && (
                        <div className="p-8 text-center text-gray-400 text-sm">
                            No pitches logged yet. Start throwing!
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
