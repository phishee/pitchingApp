'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WorkoutSessionBottomBarProps {
    isVisible?: boolean;
    label?: string;
    onAction?: () => void;
    variant?: 'primary' | 'mono' | 'destructive' | 'secondary' | 'outline' | 'dashed' | 'ghost' | 'dim' | 'foreground' | 'inverse';
    className?: string;
}

export function WorkoutSessionBottomBar({
    isVisible = true,
    label = "Finish Exercise",
    onAction,
    variant = 'primary',
    className
}: WorkoutSessionBottomBarProps) {
    if (!isVisible) return null;

    return (
        <div className={cn(
            "fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#FFE4C4] to-transparent pt-8 z-50",
            className
        )}>
            <Button
                onClick={onAction}
                variant={variant}
                className={cn(
                    "w-full font-bold text-lg h-14 rounded-xl shadow-lg transition-all",
                    variant === 'primary' && "bg-[#FF7F50] hover:bg-[#FF6347] text-white"
                )}
            >
                {label}
            </Button>
        </div>
    );
}
