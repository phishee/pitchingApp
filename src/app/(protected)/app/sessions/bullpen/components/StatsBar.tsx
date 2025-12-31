import React from 'react';
import { BullpenSummary } from '@/models/Bullpen';
import { Card } from '@/components/ui/card';
import { Activity, Target, Zap, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsBarProps {
    summary: BullpenSummary;
    pitchCount: number;
}

export function StatsBar({ summary, pitchCount }: StatsBarProps) {
    const stats = [
        {
            label: 'Pitch Count',
            value: pitchCount,
            subtext: summary.totalPitchPrescribed > 0 ? `/ ${summary.totalPitchPrescribed}` : undefined,
            icon: Activity,
            color: 'text-slate-500'
        },
        {
            label: 'Strike %',
            value: `${summary.strikePct}%`,
            icon: Target,
            color: 'text-green-500',
            success: summary.strikePct >= 60
        },
        {
            label: 'Avg Velo',
            value: summary.avgVelocity > 0 ? summary.avgVelocity.toFixed(1) : '-',
            unit: 'MPH',
            icon: Zap,
            color: 'text-blue-500'
        },
        {
            label: 'Top Velo',
            value: summary.topVelocity > 0 ? summary.topVelocity.toFixed(1) : '-',
            unit: 'MPH',
            icon: Flame,
            color: 'text-orange-500'
        },
        {
            label: 'Compliance',
            value: `${summary.compliance}%`,
            icon: Target, // Reusing Target icon or maybe CheckCircle if available
            color: 'text-purple-500',
            success: summary.compliance >= 80
        }
    ];

    return (
        <div className="grid grid-cols-5 gap-4 mb-6">
            {stats.map((stat, i) => (
                <Card key={i} className="p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{stat.label}</span>
                        <stat.icon className={cn("w-4 h-4", stat.color)} />
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-slate-900">{stat.value}</span>
                        {stat.subtext && <span className="text-sm text-gray-400 font-medium">{stat.subtext}</span>}
                        {stat.unit && <span className="text-xs text-gray-400 font-bold ml-1">{stat.unit}</span>}
                    </div>
                </Card>
            ))}
        </div>
    );
}
