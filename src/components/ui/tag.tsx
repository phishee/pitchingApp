import React from 'react';
import { X } from 'lucide-react';
import { Badge, BadgeProps } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import systemTags from '@/data/constants/systemTags.json';

export interface TagProps extends Omit<BadgeProps, 'color'> {
    value: string;
    label?: string;
    icon?: React.ReactNode;
    color?: string;
    onRemove?: () => void;
    showIcon?: boolean;
}

export function Tag({
    value,
    label,
    icon,
    color,
    onRemove,
    className,
    variant = 'secondary',
    showIcon = true,
    ...props
}: TagProps) {
    // Try to find system tag details
    const systemTag = systemTags.find((t) => t.id === value);

    // Determine display values (props override system defaults)
    const displayLabel = label || systemTag?.name || (value ? value.replace(/_/g, ' ') : '');
    const displayIcon = icon || (showIcon && systemTag?.icon ? systemTag.icon : null);
    const displayColor = color || systemTag?.color;

    // Calculate styles based on color
    const style = displayColor
        ? {
            backgroundColor: `${displayColor}20`, // 20% opacity
            color: displayColor,
            borderColor: `${displayColor}40`,
        }
        : undefined;

    return (
        <Badge
            variant={variant}
            className={cn('flex items-center gap-1 px-2 py-1', className)}
            style={style}
            {...props}
        >
            {displayIcon && <span className="mr-1">{displayIcon}</span>}
            {displayLabel}
            {onRemove && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                    className="ml-1 rounded-full hover:bg-black/10 p-0.5 transition-colors"
                    aria-label={`Remove ${displayLabel} tag`}
                >
                    <X className="h-3 w-3" />
                </button>
            )}
        </Badge>
    );
}
