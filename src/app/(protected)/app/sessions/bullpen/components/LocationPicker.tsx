import React from 'react';
import { cn } from '@/lib/utils';

interface LocationPickerProps {
    selectedZone: string | null;
    onSelect: (zone: string) => void;
    prescribedZone?: string;
    className?: string;
}

export function LocationPicker({ selectedZone, onSelect, prescribedZone, className }: LocationPickerProps) {
    // Helper to render a zone button
    const renderZone = (id: string, label: string, extraClasses: string = "") => {
        const isPrescribed = prescribedZone === id;
        const isSelected = selectedZone === id;

        let bgClass = "bg-white text-slate-800 hover:bg-blue-50"; // Default

        if (isSelected) {
            if (prescribedZone) {
                // If there IS a prescription, we judge the selection
                if (isPrescribed) {
                    bgClass = "bg-green-600 !text-white z-10 ring-2 ring-green-200 shadow-md"; // Correct!
                } else {
                    bgClass = "bg-red-500 !text-white z-10 ring-2 ring-red-200"; // Wrong!
                }
            } else {
                // No prescription, just normal blue selection
                bgClass = "bg-blue-600 !text-white z-10 shadow-md";
            }
        } else if (isPrescribed) {
            // Not selected, but this IS the target -> show gray hint
            bgClass = "bg-gray-200 text-slate-500 font-bold hover:bg-gray-300 ring-1 ring-inset ring-gray-300";
        }

        return (
            <button
                key={id}
                className={cn(
                    "flex items-center justify-center transition-all duration-200 focus:outline-none relative",
                    bgClass,
                    extraClasses
                )}
                onClick={() => onSelect(id)}
            >
                <span className={cn("text-lg", isSelected ? "text-white font-black" : (isPrescribed ? "font-bold text-slate-600 opacity-50" : "font-bold text-slate-900"))}>
                    {label}
                </span>
            </button>
        );
    };

    return (
        <div className={cn("flex flex-col items-center", className)}>
            {/* Main Container - Aspect Ratio approx 4:5 to match typical charts */}
            <div className="relative w-[240px] h-[300px] border-[3px] border-slate-900 bg-white shadow-sm select-none">

                {/* Outer Zones (11-14) - Background Layout */}
                {/* We use a grid that covers the whole area, but we'll overlay the center */}
                <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                    <div className="border-r border-b border-slate-300 flex items-start justify-start p-2">
                        {renderZone('11', '11', "w-full h-full rounded-sm !justify-start !items-start pl-1 pt-1")}
                    </div>
                    <div className="border-b border-slate-300 flex items-start justify-end p-2">
                        {renderZone('12', '12', "w-full h-full rounded-sm !justify-end !items-start pr-1 pt-1")}
                    </div>
                    <div className="border-r border-slate-300 flex items-end justify-start p-2">
                        {renderZone('13', '13', "w-full h-full rounded-sm !justify-start !items-end pl-1 pb-1")}
                    </div>
                    <div className="flex items-end justify-end p-2">
                        {renderZone('14', '14', "w-full h-full rounded-sm !justify-end !items-end pr-1 pb-1")}
                    </div>
                </div>

                {/* Inner Strike Zone (1-9) - Centered Overlay */}
                {/* Positioned absolutely in the center with a thick border */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[55%] border-[2px] border-slate-900 z-20 bg-transparent">
                    <div className="w-full h-full grid grid-cols-3 grid-rows-3 bg-white">
                        {/* Row 1 */}
                        {renderZone('1', '1', "border-r border-b border-slate-400")}
                        {renderZone('2', '2', "border-r border-b border-slate-400")}
                        {renderZone('3', '3', "border-b border-slate-400")}

                        {/* Row 2 */}
                        {renderZone('4', '4', "border-r border-b border-slate-400")}
                        {renderZone('5', '5', "border-r border-b border-slate-400")}
                        {renderZone('6', '6', "border-b border-slate-400")}

                        {/* Row 3 */}
                        {renderZone('7', '7', "border-r border-slate-400")}
                        {renderZone('8', '8', "border-r border-slate-400")}
                        {renderZone('9', '9', "")}
                    </div>
                </div>

            </div>
            <div className="text-center mt-3 text-xs text-gray-400 font-medium">Click to set actual location</div>
        </div>
    );
}
