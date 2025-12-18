import React, { useState } from 'react';
import { DashboardConfig } from '@/models/Dashboard';
import { DashboardGrid } from './DashboardGrid';

const DEFAULT_CONFIG: DashboardConfig = {
    modules: [
        {
            id: 'welcome-1',
            moduleId: 'welcome-athlete',
            size: 'full-width',
            settings: {}
        },
        {
            id: 'active-session-1',
            moduleId: 'active-session',
            size: 'full-width',
            settings: {}
        },
        {
            id: 'upcoming-workout-1',
            moduleId: 'upcoming-workout',
            size: 'medium',
            settings: { showDetails: true }
        },
        {
            id: 'last-session-stats-1',
            moduleId: 'last-session-stats',
            size: 'medium',
            settings: {}
        },
        {
            id: 'recent-workouts-1',
            moduleId: 'recent-workouts',
            size: 'medium',
            settings: { limit: 5, showDate: true }
        }
    ]
};

export function AthleteDashboard() {
    // In a real app, this would be fetched from an API
    const [config, setConfig] = useState<DashboardConfig>(DEFAULT_CONFIG);

    return (
        <div className="space-y-6 pb-24">
            <div className="flex items-center justify-between px-4 pt-4">
                <h1 className="text-2xl font-bold text-gray-900">Athlete Dashboard</h1>
            </div>

            <DashboardGrid config={config} />
        </div>
    );
}
