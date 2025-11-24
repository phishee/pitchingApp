'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
    RPEConfig,
    RPEValue,
    RPEMode,
    RPE_EMOJI_OPTIONS,
    DEFAULT_RPE_CONFIG,
    getEmojiOption,
    numericToEmojiCategory,
    emojiCategoryToNumeric
} from '@/models/RPE';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { ChevronRight, Info, ArrowLeft } from 'lucide-react';

export interface RpeExerciseData {
    id: string;
    name: string;
    image?: string;
    sets?: number;
    reps?: string;
}

interface RpeCollectionProps {
    config?: RPEConfig;
    exercises?: RpeExerciseData[];
    initialValue?: RPEValue;
    initialExerciseValues?: Record<string, RPEValue>;
    onSubmit: (result: { overall: RPEValue; exerciseValues?: Record<string, RPEValue> }) => void;
    isSubmitting?: boolean;
    onBack?: () => void;
}

export function RpeCollection({
    config = DEFAULT_RPE_CONFIG,
    exercises = [],
    initialValue,
    initialExerciseValues = {},
    onSubmit,
    isSubmitting = false,
    onBack
}: RpeCollectionProps) {
    const granularity = config.granularity ?? 'session';
    const [mode, setMode] = useState<RPEMode>(config.mode);

    // Session-level state
    const [numericValue, setNumericValue] = useState<number>(initialValue?.numeric ?? 5);
    const [selectedEmojiCategory, setSelectedEmojiCategory] = useState<string | undefined>(
        initialValue?.emojiCategory
    );

    // Exercise-level state
    const [exerciseValues, setExerciseValues] = useState<Record<string, RPEValue>>(initialExerciseValues);

    // Helper to update exercise RPE
    const updateExerciseRpe = (exerciseId: string, value: RPEValue) => {
        setExerciseValues(prev => ({
            ...prev,
            [exerciseId]: value
        }));
    };

    const handleSessionEmojiSelect = (category: string) => {
        setSelectedEmojiCategory(category);
        setNumericValue(emojiCategoryToNumeric(category as any));
    };

    const handleSessionNumericChange = (val: number) => {
        setNumericValue(val);
    };

    const handleSubmit = () => {
        if (granularity === 'session') {
            const result: RPEValue = {
                numeric: numericValue,
                emojiCategory: mode === 'emoji' ? (selectedEmojiCategory as any) : undefined
            };
            onSubmit({ overall: result });
        } else {
            // Calculate overall average from exercises
            const values = Object.values(exerciseValues);
            if (values.length === 0) return;

            const sum = values.reduce((acc, v) => acc + v.numeric, 0);
            const avg = Math.round((sum / values.length) * 2) / 2;

            // Determine if we should use emoji category for overall
            // If all exercises used emoji, we can try to map back, but usually numeric average is safer
            // unless we want to map avg to nearest emoji category.
            const overall: RPEValue = {
                numeric: avg,
                emojiCategory: undefined // Keep overall as numeric for precision
            };

            onSubmit({ overall, exerciseValues });
        }
    };

    const toggleMode = () => {
        if (!config.allowModeToggle) return;
        setMode(prev => prev === 'emoji' ? 'numeric' : 'emoji');
    };

    // Check if all exercises have a value
    const allExercisesRated = exercises.every(ex => exerciseValues[ex.id]);
    const canSubmit = granularity === 'session'
        ? (mode === 'numeric' || selectedEmojiCategory !== undefined)
        : allExercisesRated;

    const renderEmojiSelector = (
        currentValue: RPEValue | undefined,
        onSelect: (val: RPEValue) => void,
        compact = false
    ) => (
        <div className={cn("grid gap-2", compact ? "grid-cols-4" : "grid-cols-2")}>
            {RPE_EMOJI_OPTIONS.map((option) => {
                const isSelected = currentValue?.emojiCategory === option.category;
                return (
                    <button
                        key={option.category}
                        onClick={() => onSelect({
                            numeric: option.midpoint,
                            emojiCategory: option.category
                        })}
                        className={cn(
                            "flex flex-col items-center justify-center rounded-xl border-2 transition-all duration-200",
                            compact ? "p-2" : "p-6",
                            isSelected
                                ? "border-[#FF7F50] bg-[#FFF5EE] shadow-md scale-105"
                                : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"
                        )}
                    >
                        <span className={cn("mb-1", compact ? "text-2xl" : "text-4xl")}>{option.emoji}</span>
                        <span className={cn("font-bold text-gray-900", compact ? "text-xs" : "")}>{option.label}</span>
                        {!compact && (
                            <span className="text-xs text-center text-gray-500 mt-1">
                                {option.description}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );

    const renderNumericSelector = (
        currentValue: RPEValue | undefined,
        onChange: (val: RPEValue) => void
    ) => {
        const val = currentValue?.numeric ?? 5;
        return (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                <div className="text-center">
                    <span className="text-4xl font-black text-[#FF7F50]">{val}</span>
                    <span className="text-gray-400 text-lg font-medium">/10</span>
                </div>
                <Slider
                    value={[val]}
                    min={1}
                    max={10}
                    step={0.5}
                    onValueChange={(vals) => onChange({ numeric: vals[0] })}
                    className="py-4"
                />
                <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <span>Easy</span>
                    <span>Max</span>
                </div>
            </div>
        );
    };

    if (granularity === 'exercise') {
        return (
            <div className="flex flex-col min-h-screen bg-gray-50">
                <div className="bg-white px-6 pt-12 pb-6 shadow-sm z-10 sticky top-0">
                    <div className="flex items-center gap-4 mb-4">
                        {onBack && (
                            <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
                                <ArrowLeft className="w-6 h-6 text-gray-900" />
                            </button>
                        )}
                        <h1 className="text-2xl font-bold text-gray-900">How Did It Feel?</h1>
                    </div>
                    <p className="text-gray-500">Rate each exercise to complete your workout.</p>
                </div>

                <div className="flex-1 p-4 space-y-4 pb-32">
                    {exercises.map((exercise) => (
                        <div key={exercise.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-4 mb-4">
                                {exercise.image ? (
                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                                        <Image
                                            src={exercise.image}
                                            alt={exercise.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-16 h-16 rounded-lg bg-gray-100 shrink-0 flex items-center justify-center text-2xl">
                                        🏋️
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-bold text-gray-900">{exercise.name}</h3>
                                    <p className="text-sm text-gray-500">
                                        {exercise.sets ? `${exercise.sets} sets` : ''}
                                        {exercise.sets && exercise.reps ? ' • ' : ''}
                                        {exercise.reps ? exercise.reps : ''}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-sm font-medium text-gray-900">
                                    How did {exercise.name} feel today?
                                </p>
                                {mode === 'emoji'
                                    ? renderEmojiSelector(
                                        exerciseValues[exercise.id],
                                        (val) => updateExerciseRpe(exercise.id, val),
                                        true
                                    )
                                    : renderNumericSelector(
                                        exerciseValues[exercise.id],
                                        (val) => updateExerciseRpe(exercise.id, val)
                                    )
                                }
                            </div>
                        </div>
                    ))}
                </div>

                <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100">
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !canSubmit}
                        className="w-full h-14 text-lg font-bold rounded-xl bg-[#00C896] hover:bg-[#00B084] text-white shadow-lg shadow-green-100"
                    >
                        {isSubmitting ? 'Saving...' : 'Save & Finish'}
                    </Button>
                </div>
            </div>
        );
    }

    // Session Granularity (Original View)
    return (
        <div className="flex flex-col h-full max-w-md mx-auto p-6">
            <div className="flex-1 flex flex-col justify-center space-y-8">
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-gray-900">How did that feel?</h2>
                    <p className="text-gray-500">Rate the overall intensity of your workout</p>
                </div>

                {mode === 'emoji' ? (
                    <div className="grid grid-cols-2 gap-4">
                        {RPE_EMOJI_OPTIONS.map((option) => (
                            <button
                                key={option.category}
                                onClick={() => handleSessionEmojiSelect(option.category)}
                                className={cn(
                                    "flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-200",
                                    selectedEmojiCategory === option.category
                                        ? "border-[#FF7F50] bg-[#FFF5EE] shadow-md scale-105"
                                        : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"
                                )}
                            >
                                <span className="text-4xl mb-3">{option.emoji}</span>
                                <span className="font-bold text-gray-900">{option.label}</span>
                                <span className="text-xs text-center text-gray-500 mt-1">
                                    {option.description}
                                </span>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-8">
                        <div className="text-center">
                            <span className="text-6xl font-black text-[#FF7F50]">
                                {numericValue}
                            </span>
                            <span className="text-gray-400 text-xl font-medium">/10</span>
                        </div>

                        <div className="space-y-4">
                            <Slider
                                value={[numericValue]}
                                min={1}
                                max={10}
                                step={0.5}
                                onValueChange={(vals) => handleSessionNumericChange(vals[0])}
                                className="py-4"
                            />
                            <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-wider">
                                <span>Easy</span>
                                <span>Moderate</span>
                                <span>Max Effort</span>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-3">
                            <Info className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                            <p className="text-sm text-gray-600">
                                {getEmojiOption(numericToEmojiCategory(numericValue))?.description}
                            </p>
                        </div>
                    </div>
                )}

                {config.allowModeToggle && (
                    <button
                        onClick={toggleMode}
                        className="text-sm font-medium text-gray-500 hover:text-gray-900 underline decoration-dotted underline-offset-4"
                    >
                        Switch to {mode === 'emoji' ? 'Numeric Scale' : 'Emoji Mode'}
                    </button>
                )}
            </div>

            <div className="mt-auto pt-8">
                <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || (mode === 'emoji' && !selectedEmojiCategory)}
                    className="w-full h-14 text-lg font-bold rounded-xl bg-[#FF7F50] hover:bg-[#FF6347] shadow-lg shadow-orange-200"
                >
                    {isSubmitting ? 'Saving...' : 'Finish Workout'}
                    {!isSubmitting && <ChevronRight className="w-5 h-5 ml-2" />}
                </Button>
            </div>
        </div>
    );
}
