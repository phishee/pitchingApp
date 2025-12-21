'use client';

import React, { useState } from 'react';
import { Users, User, Check } from 'lucide-react';

interface StepSelectTargetsProps {
    teamName: string;
    teamMembers: { id: string; name: string; avatarUrl?: string }[];
    initialTargetType?: 'team' | 'athletes';
    initialSelectedIds?: string[];
    onSelectionChange: (selection: { type: 'team' | 'athletes'; athleteIds: string[] }) => void;
}

export function StepSelectTargets({ teamName, teamMembers, initialTargetType = 'team', initialSelectedIds = [], onSelectionChange }: StepSelectTargetsProps) {
    const [targetType, setTargetType] = useState<'team' | 'athletes'>(initialTargetType);
    const [selectedAthletes, setSelectedAthletes] = useState<string[]>(initialSelectedIds);

    // Initial sync
    React.useEffect(() => {
        if (initialSelectedIds.length > 0) {
            onSelectionChange({ type: initialTargetType, athleteIds: initialSelectedIds });
        }
    }, []);

    const handleTypeChange = (type: 'team' | 'athletes') => {
        setTargetType(type);
        if (type === 'team') {
            // Select all
            const allIds = teamMembers.map(m => m.id);
            setSelectedAthletes(allIds);
            onSelectionChange({ type: 'team', athleteIds: allIds });
        } else {
            // Keep current selection or clear? Standard is usually clear or keep.
            // Let's keep current selection to verify.
            onSelectionChange({ type: 'athletes', athleteIds: selectedAthletes });
        }
    };

    const toggleAthlete = (id: string) => {
        let newSelection = [...selectedAthletes];
        if (selectedAthletes.includes(id)) {
            newSelection = newSelection.filter(a => a !== id);
            // If we were in team mode and deselected someone, switch to individual
            if (targetType === 'team') {
                setTargetType('athletes');
                onSelectionChange({ type: 'athletes', athleteIds: newSelection }); // Immediate update
                return; // Early return to avoid double select
            }
        } else {
            newSelection.push(id);
            // If we selected everyone manually, check if we should switch to team? 
            // Maybe too much magic. matching 'team' length is enough.
        }

        setSelectedAthletes(newSelection);
        onSelectionChange({ type: targetType === 'team' ? 'athletes' : targetType, athleteIds: newSelection });
        // Note: if in team mode and we add (impossible since all selected), but handled above.
    };

    // Auto-select all on mount if team mode is default and empty selection?
    React.useEffect(() => {
        // Only auto-select if NO initial selection was provided and we are in team mode
        if (targetType === 'team' && selectedAthletes.length === 0 && teamMembers.length > 0 && initialSelectedIds.length === 0) {
            const allIds = teamMembers.map(m => m.id);
            setSelectedAthletes(allIds);
            onSelectionChange({ type: 'team', athleteIds: allIds });
        }
    }, [teamMembers]);

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Who is this for?</label>
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => handleTypeChange('team')}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${targetType === 'team'
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-gray-100 hover:border-gray-200 text-gray-600'
                            }`}
                    >
                        <Users className="w-6 h-6 mb-2" />
                        <span className="font-medium">Entire Team</span>
                        <span className="text-xs opacity-70 mt-1">{teamName}</span>
                    </button>
                    <button
                        onClick={() => handleTypeChange('athletes')}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${targetType === 'athletes'
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-gray-100 hover:border-gray-200 text-gray-600'
                            }`}
                    >
                        <User className="w-6 h-6 mb-2" />
                        <span className="font-medium">Specific Athletes</span>
                        <span className="text-xs opacity-70 mt-1">Select from list</span>
                    </button>
                </div>
            </div>

            {/* Always show list now, or visible in both modes with visual indication */}
            <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-200">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-700">
                        {targetType === 'team' ? 'Included Members' : 'Select Athletes'}
                    </label>
                    <span className="text-xs text-slate-500">
                        {selectedAthletes.length} / {teamMembers.length} selected
                    </span>
                </div>
                <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 max-h-60 overflow-y-auto bg-white">
                    {teamMembers.map(member => (
                        <div
                            key={member.id}
                            onClick={() => toggleAthlete(member.id)}
                            className={`flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors ${selectedAthletes.includes(member.id) ? 'bg-blue-50/30' : ''
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                {member.avatarUrl ? (
                                    <img src={member.avatarUrl} alt={member.name} className="w-8 h-8 rounded-full object-cover border border-gray-100" />
                                ) : (
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${selectedAthletes.includes(member.id)
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {member.name.substring(0, 2).toUpperCase()}
                                    </div>
                                )}
                                <span className={`text-sm ${selectedAthletes.includes(member.id) ? 'text-blue-900 font-medium' : 'text-gray-700'
                                    }`}>
                                    {member.name}
                                </span>
                            </div>
                            {selectedAthletes.includes(member.id) && (
                                <Check className="w-4 h-4 text-blue-600" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
