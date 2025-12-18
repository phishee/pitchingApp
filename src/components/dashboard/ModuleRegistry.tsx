import React from 'react';
import { RecentWorkoutsModule } from './modules/RecentWorkoutsModule';
import { LastSessionStatsModule } from './modules/LastSessionStatsModule';
import { WelcomeAthleteModule } from './modules/WelcomeAthleteModule';
import { UpcomingWorkoutModule } from './modules/UpcomingWorkoutModule';
import { ActiveSessionModule } from './modules/ActiveSessionModule';

export interface ModuleProps {
    settings: any;
    onVisibilityChange?: (isVisible: boolean) => void;
}

export const MODULE_REGISTRY: Record<string, React.ComponentType<ModuleProps>> = {
    'recent-workouts': RecentWorkoutsModule,
    'last-session-stats': LastSessionStatsModule,
    'welcome-athlete': WelcomeAthleteModule,
    'upcoming-workout': UpcomingWorkoutModule,
    'active-session': ActiveSessionModule,
};

export function getModuleComponent(moduleId: string): React.ComponentType<ModuleProps> | null {
    return MODULE_REGISTRY[moduleId] || null;
}
