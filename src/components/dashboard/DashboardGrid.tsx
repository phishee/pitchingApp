import React from 'react';
import { DashboardConfig, ModuleSize } from '@/models/Dashboard';
import { getModuleComponent } from './ModuleRegistry';
import { Card } from '@/components/ui/card';

interface DashboardGridProps {
    config: DashboardConfig;
}

const getSizeClasses = (size: ModuleSize): string => {
    switch (size) {
        case 'small':
            return 'col-span-1 md:col-span-1 lg:col-span-1'; // 1/4 on large, 1/2 on medium
        case 'medium':
            return 'col-span-1 md:col-span-2 lg:col-span-2'; // 2/4 on large, full on medium
        case 'large':
            return 'col-span-1 md:col-span-2 lg:col-span-3'; // 3/4 on large
        case 'full-width':
            return 'col-span-1 md:col-span-2 lg:col-span-4'; // Full width
        default:
            return 'col-span-1';
    }
};

const DashboardModuleItem = React.memo(({
    module,
    onVisibilityChange,
    isHidden
}: {
    module: any;
    onVisibilityChange: (moduleId: string, isVisible: boolean) => void;
    isHidden: boolean;
}) => {
    const ModuleComponent = getModuleComponent(module.moduleId);
    const sizeClass = getSizeClasses(module.size);

    const handleModuleVisibilityChange = React.useCallback((visible: boolean) => {
        onVisibilityChange(module.id, visible);
    }, [module.id, onVisibilityChange]);

    if (!ModuleComponent) {
        return (
            <Card className={`${sizeClass} p-4 flex items-center justify-center bg-red-50 border-red-200`}>
                <p className="text-red-500 text-sm">Unknown Module: {module.moduleId}</p>
            </Card>
        );
    }

    if (isHidden) {
        return (
            <div className="hidden">
                <ModuleComponent
                    settings={module.settings}
                    onVisibilityChange={handleModuleVisibilityChange}
                />
            </div>
        );
    }

    return (
        <div className={sizeClass}>
            <ModuleComponent
                settings={module.settings}
                onVisibilityChange={handleModuleVisibilityChange}
            />
        </div>
    );
});

export function DashboardGrid({ config }: DashboardGridProps) {
    const [hiddenModuleIds, setHiddenModuleIds] = React.useState<Set<string>>(new Set());

    const handleVisibilityChange = React.useCallback((moduleId: string, isVisible: boolean) => {
        setHiddenModuleIds((prev) => {
            const next = new Set(prev);
            if (isVisible) {
                // Only update if it was hidden
                if (next.has(moduleId)) {
                    next.delete(moduleId);
                    return next;
                }
            } else {
                // Only update if it wasn't hidden
                if (!next.has(moduleId)) {
                    next.add(moduleId);
                    return next;
                }
            }
            return prev;
        });
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
            {config.modules.map((module) => (
                <DashboardModuleItem
                    key={module.id}
                    module={module}
                    onVisibilityChange={handleVisibilityChange}
                    isHidden={hiddenModuleIds.has(module.id)}
                />
            ))}
        </div>
    );
}
