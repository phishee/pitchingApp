'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WorkoutSessionBottomBarProps {
    isVisible?: boolean;
    label?: string;
    onAction?: () => void;
    variant?: 'primary' | 'secondary';
    className?: string;
}

export function WorkoutSessionBottomBar({
    isVisible = true,
    label = "Next Exercise",
    onAction,
    variant = 'primary',
    className
}: WorkoutSessionBottomBarProps) {
    if (!isVisible) return null;

    return (
        <div className={cn(
            "fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-t border-gray-200 dark:border-zinc-800 z-50 safe-area-bottom",
            className
        )}>
            <Button
                onClick={onAction}
                variant={variant}
                className={cn(
                    "w-full font-bold text-lg h-14 rounded-xl shadow-lg transition-all",
                    variant === 'primary' && "bg-primary hover:bg-primary/90 text-primary-foreground"
                )}
            >
                {label}
            </Button>
        </div>
    );
}
