import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PITCH_TYPES } from '@/models/Bullpen';

interface PitchTypeSelectorProps {
    selectedType: string;
    onSelect: (type: string) => void;
    prescribedType?: string;
}

export function PitchTypeSelector({ selectedType, onSelect, prescribedType }: PitchTypeSelectorProps) {

    const typesToRender = prescribedType
        ? PITCH_TYPES.filter(t => t.value === prescribedType)
        : PITCH_TYPES;

    return (
        <div className="grid grid-cols-3 gap-2">
            {typesToRender.map((type) => (
                <Button
                    key={type.id}
                    variant={selectedType === type.value ? 'default' : 'secondary'}
                    className={cn(
                        "h-10 text-xs font-medium transition-all shadow-sm",
                        selectedType === type.value
                            ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md ring-2 ring-blue-200"
                            : "bg-gray-100/80 hover:bg-gray-200 text-gray-700 border border-transparent hover:border-gray-300"
                    )}
                    onClick={() => onSelect(type.value)}
                >
                    {type.label}
                </Button>
            ))}
            {/* If prescribed, show a small message/indicator or just the button is enough */}
        </div>
    );
}
