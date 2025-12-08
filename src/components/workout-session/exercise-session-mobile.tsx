'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useWorkoutSessionContext } from '@/providers/workout-session-context';
import { ExerciseMetric, MetricValue } from '@/models/Metric';
import { WorkoutSessionSet } from '@/models/WorkoutSession';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
    ArrowLeft,
    Clock,
    Check,
    ChevronDown,
    Maximize2,
    Plus
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { WorkoutSessionBottomBar } from './workout-session-bottom-bar';
import { useAppTheme } from '@/providers/app-theme-provider';

// ==========================================
// Types & Helpers
// ==========================================

interface MetricInputProps {
    metric: ExerciseMetric;
    value: MetricValue;
    onChange: (val: MetricValue) => void;
    readOnly?: boolean;
}

// ==========================================
// Metric Input Components
// ==========================================

function MetricInput({ metric, value, onChange, readOnly }: MetricInputProps) {
    // Default to number_stepper if not specified
    const inputType = metric.inputType || 'number_stepper';

    if (metric.input === 'formula') return null;

    const commonClasses = "flex items-center justify-between py-2";

    switch (inputType) {
        case 'number_stepper':
            const step = metric.step || 1;
            const min = metric.min ?? 0;
            const max = metric.max ?? 999;
            const currentVal = Number(value) || 0;

            const handleDecrement = () => {
                const newVal = Math.max(min, currentVal - step);
                onChange(newVal);
            };

            const handleIncrement = () => {
                const newVal = Math.min(max, currentVal + step);
                onChange(newVal);
            };

            return (
                <div className={commonClasses}>
                    <div className="flex flex-col gap-2 w-full">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-700 capitalize">
                                {metric.label || metric.id}
                            </span>
                            {!readOnly && (
                                <div className="flex gap-2 text-gray-400">
                                    <Maximize2 className="w-4 h-4" />
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleDecrement}
                                disabled={readOnly || currentVal <= min}
                                className="h-10 w-10 rounded-md bg-white shadow-sm hover:bg-gray-100 text-gray-600"
                            >
                                <span className="text-xl font-bold">−</span>
                            </Button>

                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-gray-900">{currentVal}</span>
                                <span className="text-sm font-medium text-gray-500">{metric.unit}</span>
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleIncrement}
                                disabled={readOnly || currentVal >= max}
                                className="h-10 w-10 rounded-md bg-white shadow-sm hover:bg-gray-100 text-gray-600"
                            >
                                <Plus className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            );

        case 'boolean_toggle':
            return (
                <div className={commonClasses}>
                    <span className="font-semibold text-gray-700">{metric.label}</span>
                    <Switch
                        checked={Boolean(value)}
                        onCheckedChange={onChange}
                        disabled={readOnly}
                    />
                </div>
            );

        case 'text':
            return (
                <div className="flex flex-col gap-2 py-2">
                    <span className="font-semibold text-gray-700">{metric.label}</span>
                    <Input
                        value={String(value || '')}
                        onChange={(e) => onChange(e.target.value)}
                        readOnly={readOnly}
                        className="bg-gray-50"
                    />
                </div>
            );

        default:
            // Fallback to simple text/number input
            return (
                <div className={commonClasses}>
                    <span className="font-semibold text-gray-700">{metric.label}</span>
                    <Input
                        type="number"
                        value={String(value || '')}
                        onChange={(e) => onChange(Number(e.target.value))}
                        readOnly={readOnly}
                        className="w-24 text-right"
                    />
                </div>
            );
    }
}

// ==========================================
// Set Card Component
// ==========================================

interface SetCardProps {
    set: WorkoutSessionSet;
    metrics: ExerciseMetric[];
    isActive: boolean;
    onUpdateSet: (setNumber: number, data: Record<string, MetricValue>) => void;
    onCompleteSet: (setNumber: number, values: Record<string, MetricValue>) => void;
    onDeleteSet: (setNumber: number) => void;
}

// ... imports
// Removed useAppTheme import

// ... (MetricInput component remains same)

function SetCard({ set, metrics, isActive, onUpdateSet, onCompleteSet, onDeleteSet }: SetCardProps) {
    // Removed useAppTheme hook
    const isCompleted = set.status === 'completed';

    // Sort metrics: required first
    const sortedMetrics = useMemo(() => {
        return [...metrics].sort((a, b) => {
            if (a.required && !b.required) return -1;
            if (!a.required && b.required) return 1;
            return 0;
        });
    }, [metrics]);

    // Local state for the active set inputs to avoid jitter/lag
    const [localValues, setLocalValues] = useState<Record<string, MetricValue>>({});

    useEffect(() => {
        // Initialize local values from set data
        const initialValues: Record<string, MetricValue> = {};
        metrics.forEach(m => {
            const val = set.performed?.[m.id] ?? set.prescribed?.[m.id] ?? m.defaultValue ?? 0;
            initialValues[m.id] = val;
        });
        setLocalValues(initialValues);
    }, [set, metrics]);

    const handleMetricChange = (metricId: string, val: MetricValue) => {
        const newValues = { ...localValues, [metricId]: val };
        setLocalValues(newValues);
        onUpdateSet(set.setNumber, newValues);
    };

    if (isCompleted) {
        // Generate summary string (e.g., "135 lbs • 10 reps")
        const summary = sortedMetrics
            .map(m => {
                const val = localValues[m.id];
                if (val === undefined || val === null) return null;
                if (m.unit) return `${val} ${m.unit}`;
                return `${val}`;
            })
            .filter(Boolean)
            .join(' • ');

        return (
            <div className="bg-white/60 dark:bg-zinc-900/60 rounded-xl p-4 shadow-sm mb-2 border border-status-completed flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-8 w-8 rounded-full bg-status-completed flex items-center justify-center text-status-completed-foreground">
                        <Check className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm">Set {set.setNumber}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{summary}</p>
                    </div>
                </div>
                <div className="text-xs font-bold text-status-completed-foreground bg-status-completed px-2 py-1 rounded-md">
                    Done
                </div>
            </div>
        );
    }

    if (isActive) {
        return (
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 shadow-md mb-4 ring-2 ring-primary/30 border-primary/20 border relative">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">Set {set.setNumber}</h3>
                    <div className="flex items-center gap-2">
                        {set.isAdded && (
                            <button
                                onClick={() => onDeleteSet(set.setNumber)}
                                className="text-red-400 hover:text-red-600 dark:hover:text-red-300 text-xs font-medium px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                                Delete
                            </button>
                        )}
                        <span className="text-sm text-gray-400 font-medium">Active</span>
                    </div>
                </div>

                <div className="space-y-6">
                    {sortedMetrics.map(metric => (
                        <MetricInput
                            key={metric.id}
                            metric={metric}
                            value={localValues[metric.id]}
                            onChange={(val) => handleMetricChange(metric.id, val)}
                            readOnly={false}
                        />
                    ))}
                </div>

                <Button
                    className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg h-12 rounded-xl shadow-lg"
                    onClick={() => onCompleteSet(set.setNumber, localValues)}
                >
                    <Check className="w-5 h-5 mr-2" />
                    Mark as Done
                </Button>
            </div>
        );
    }

    // Upcoming Set
    return (
        <div className="rounded-xl p-4 mb-4 border border-status-upcoming bg-status-upcoming">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-600 dark:text-gray-400">Set {set.setNumber}</h3>
                <span className="text-sm text-gray-400 font-medium">Upcoming</span>
            </div>

            <div className="space-y-4 opacity-60 pointer-events-none">
                {sortedMetrics.map(metric => (
                    <MetricInput
                        key={metric.id}
                        metric={metric}
                        value={localValues[metric.id]}
                        onChange={() => { }}
                        readOnly={true}
                    />
                ))}
            </div>

            <Button
                variant="ghost"
                className="w-full mt-4 bg-gray-200/50 dark:bg-zinc-800/50 text-gray-500 dark:text-gray-400 font-semibold rounded-lg h-12"
                disabled
            >
                <Check className="w-4 h-4 mr-2" />
                Mark as Done
            </Button>
        </div>
    );
}

export function ExerciseSessionMobile() {
    const {
        session,
        exercises,
    } = useWorkoutSessionContext();

    const activeExerciseId = exercises.activeExerciseId;

    // Find the full exercise data from the session (which contains sets)
    const activeSessionExercise = useMemo(() => {
        return session.data?.exercises.find(e => e.exerciseId === activeExerciseId);
    }, [session.data, activeExerciseId]);

    // Get metrics definition for this exercise
    const activeExerciseDef = useMemo(() => {
        return exercises.list.find(def => def.id === activeExerciseId);
    }, [exercises.list, activeExerciseId]);

    // Get metrics definition for this exercise
    const exerciseMetrics = useMemo(() => {
        return activeExerciseDef?.metrics || [];
    }, [activeExerciseDef]);

    // Derived state
    const sets = activeSessionExercise?.sets || [];
    const completedSetsCount = sets.filter(s => s.status === 'completed').length;
    const totalSets = sets.length;
    const progress = totalSets > 0 ? (completedSetsCount / totalSets) * 100 : 0;

    // ==========================================
    // Handlers
    // ==========================================

    const handleUpdateSet = (setNumber: number, data: Record<string, MetricValue>) => {
        console.log('[Mobile] handleUpdateSet called:', setNumber, data);
        if (!session.data || !activeSessionExercise) return;

        // Create a deep copy to ensure we trigger updates and don't mutate state directly
        const newSession = JSON.parse(JSON.stringify(session.data));

        const exerciseIndex = newSession.exercises.findIndex((e: any) => e.exerciseId === exercises.activeExerciseId);
        if (exerciseIndex === -1) {
            console.error('[Mobile] Exercise not found in session');
            return;
        }

        const setIndex = newSession.exercises[exerciseIndex].sets.findIndex((s: any) => s.setNumber === setNumber);
        if (setIndex === -1) {
            console.error('[Mobile] Set not found in exercise');
            return;
        }

        // Update performed data
        newSession.exercises[exerciseIndex].sets[setIndex].performed = {
            ...newSession.exercises[exerciseIndex].sets[setIndex].performed,
            ...data
        };

        console.log('[Mobile] Updated set performed data:', newSession.exercises[exerciseIndex].sets[setIndex].performed);

        // For typing updates, we just set the session state locally/optimistically
        // We don't save to server on every keystroke
        session.setSession(newSession);
    };

    const handleCompleteSet = async (setNumber: number, values: Record<string, MetricValue>) => {
        if (!session.data || !activeSessionExercise) return;

        // Create deep copy
        const newSession = JSON.parse(JSON.stringify(session.data));
        const exerciseIndex = newSession.exercises.findIndex((e: any) => e.exerciseId === exercises.activeExerciseId);
        if (exerciseIndex === -1) return;

        const setIndex = newSession.exercises[exerciseIndex].sets.findIndex((s: any) => s.setNumber === setNumber);
        if (setIndex === -1) return;

        // Update performed data with the values passed from the UI (ensures defaults are captured)
        newSession.exercises[exerciseIndex].sets[setIndex].performed = {
            ...newSession.exercises[exerciseIndex].sets[setIndex].performed,
            ...values
        };

        // Mark as completed
        newSession.exercises[exerciseIndex].sets[setIndex].status = 'completed';

        // Update summary
        const sets = newSession.exercises[exerciseIndex].sets;
        newSession.exercises[exerciseIndex].summary.completedSets = sets.filter((s: any) => s.status === 'completed').length;
        newSession.exercises[exerciseIndex].summary.compliancePercent =
            Math.round((newSession.exercises[exerciseIndex].summary.completedSets / newSession.exercises[exerciseIndex].summary.totalSets) * 100);

        const setBeingSaved = newSession.exercises[exerciseIndex].sets[setIndex];
        console.log('[Mobile] Completing set:', setNumber);
        console.log('[Mobile] Performed data:', JSON.stringify(setBeingSaved.performed));

        // Save to server
        console.log('[Mobile] Saving session after completion...');
        await session.saveSession({ exercises: newSession.exercises });
    };

    const handleAddSet = async () => {
        if (!session.data || !activeSessionExercise) return;

        const newSession = { ...session.data };
        const exerciseIndex = newSession.exercises.findIndex(e => e.exerciseId === exercises.activeExerciseId);
        if (exerciseIndex === -1) return;

        const currentSets = newSession.exercises[exerciseIndex].sets;
        const lastSet = currentSets[currentSets.length - 1];

        // Copy metrics from last set (performed if available, else prescribed)
        const newPrescribed = lastSet.performed || lastSet.prescribed;

        const newSet: WorkoutSessionSet = {
            setNumber: lastSet.setNumber + 1,
            status: 'pending',
            isAdded: true,
            prescribed: { ...newPrescribed },
            performed: { ...newPrescribed } // Pre-fill performed with same values
        };

        newSession.exercises[exerciseIndex].sets.push(newSet);

        // Save to server
        console.log('[Mobile] Saving session after adding set...');
        await session.saveSession({ exercises: newSession.exercises });
    };

    const handleDeleteSet = async (setNumber: number) => {
        if (!session.data || !activeSessionExercise) return;

        const newSession = { ...session.data };
        const exerciseIndex = newSession.exercises.findIndex(e => e.exerciseId === exercises.activeExerciseId);
        if (exerciseIndex === -1) return;

        // Filter out the set
        newSession.exercises[exerciseIndex].sets = newSession.exercises[exerciseIndex].sets.filter(s => s.setNumber !== setNumber);

        // Re-number sets
        newSession.exercises[exerciseIndex].sets.forEach((s, idx) => {
            s.setNumber = idx + 1;
        });

        // Save to server
        await session.saveSession({ exercises: newSession.exercises });
    };

    const router = useRouter();

    if (!activeSessionExercise || !activeExerciseDef) {
        return <div className="p-4">Loading exercise...</div>;
    }

    // Calculate progress based on ORIGINAL (non-added) sets
    const originalSets = activeSessionExercise.sets.filter(s => !s.isAdded);
    const completedOriginalSets = originalSets.filter(s => s.status === 'completed').length;
    const progressPercent = Math.min(100, Math.round((completedOriginalSets / originalSets.length) * 100));

    // Determine if "Add Set" should be enabled
    // Enabled if we are on the last set (active set is the last one in the list)
    const activeSetIndex = activeSessionExercise.sets.findIndex(s => s.status === 'pending');
    const isLastSet = activeSetIndex === activeSessionExercise.sets.length - 1 || activeSetIndex === -1; // If all completed, activeSetIndex is -1, still allow adding
    const canAddSet = isLastSet;

    const handleFinishExercise = async () => {
        if (!session.data || !activeSessionExercise) return;

        // 1. Save current state one last time to be safe
        await session.saveSession({ exercises: session.data.exercises });

        // 2. Determine next step
        const currentExerciseIndex = session.data.exercises.findIndex(e => e.exerciseId === activeExerciseId);
        const isLastExercise = currentExerciseIndex === session.data.exercises.length - 1;

        if (isLastExercise) {
            // Go to RPE page
            router.push(`/app/workout-session/${session.data._id}/rpe`);
        } else {
            // Go to next exercise
            const nextExercise = session.data.exercises[currentExerciseIndex + 1];
            router.push(`/app/workout-session/${session.data._id}/exercises/${nextExercise.exerciseId}`);
        }
    };

    // Determine button label
    const currentExerciseIndex = session.data?.exercises.findIndex(e => e.exerciseId === activeExerciseId) ?? -1;
    const isLastExercise = session.data?.exercises ? currentExerciseIndex === session.data.exercises.length - 1 : false;
    const buttonLabel = isLastExercise ? "Finish Workout" : "Next Exercise";

    return (
        <div className="min-h-screen bg-primary/5 pb-24 font-sans -mt-20 -mx-4 pt-20 px-4">
            <div className="space-y-6">
                {/* Title */}
                <h1 className="text-3xl font-extrabold text-[#1A2333] dark:text-white">
                    {activeSessionExercise.exerciseName}
                </h1>

                {/* Media & Tips */}
                <div className="relative rounded-2xl overflow-hidden shadow-lg bg-gray-900 aspect-video">
                    {activeExerciseDef.image ? (
                        <div className="relative w-full h-full">
                            <Image
                                src={activeExerciseDef.image}
                                alt={activeSessionExercise.exerciseName}
                                fill
                                className="object-cover opacity-90"
                            />
                        </div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                            No Image
                        </div>
                    )}

                    {/* Tip Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                        <p className="text-white text-sm font-medium leading-relaxed">
                            {activeExerciseDef.instructions?.text?.[0] || "Focus on form and control."}
                        </p>
                    </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                    {activeExerciseDef.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 rounded-full bg-white/60 dark:bg-zinc-800/60 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm font-bold text-gray-600 dark:text-gray-400">
                        <span>{completedOriginalSets}/{originalSets.length} sets</span>
                        <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>00:45</span>
                        </div>
                    </div>
                    <Progress value={progressPercent} className="h-3 bg-gray-200 dark:bg-zinc-800" indicatorClassName="bg-primary" />
                </div>

                {/* Sets List */}
                <div className="space-y-4">
                    {activeSessionExercise.sets.map((set, index) => {
                        const isActive = index === activeSetIndex;
                        return (
                            <SetCard
                                key={set.setNumber}
                                set={set}
                                metrics={activeExerciseDef.metrics}
                                isActive={isActive}
                                onUpdateSet={handleUpdateSet}
                                onCompleteSet={handleCompleteSet}
                                onDeleteSet={handleDeleteSet}
                            />
                        );
                    })}
                </div>

                {/* Add Set Button */}
                <Button
                    variant="outline"
                    className="w-full border-2 border-dashed border-gray-300 dark:border-zinc-700 text-gray-500 dark:text-gray-400 hover:border-primary hover:text-primary h-12 rounded-xl font-bold"
                    onClick={handleAddSet}
                    disabled={!canAddSet}
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Set
                </Button>
            </div>

            {/* Fixed Footer Button */}
            <WorkoutSessionBottomBar
                isVisible={true}
                label={buttonLabel}
                onAction={handleFinishExercise}
            />
        </div>
    );
}
