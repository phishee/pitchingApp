export type ModuleSize = 'small' | 'medium' | 'large' | 'full-width';

export interface DashboardModuleInstance {
    id: string; // Unique instance ID
    moduleId: string; // Type of module (e.g., 'recent-workouts')
    size: ModuleSize;
    settings: Record<string, any>; // Module-specific settings
}

export interface DashboardConfig {
    modules: DashboardModuleInstance[];
}
