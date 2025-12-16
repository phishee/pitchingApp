import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { getWorkoutColor, formatTagName } from '@/lib/workoutLibraryUtils';
import { Exercise, WorkoutExercise } from '@/models';

interface WorkoutExerciseRowProps {
    exercise: Exercise;
    index: number;
    workoutExercise: WorkoutExercise | undefined;
    onUpdateConfig: (exerciseId: string, field: string, value: any) => void;
    onRemove: (exerciseId: string) => void;
}

export function WorkoutExerciseRow({
    exercise,
    index,
    workoutExercise,
    onUpdateConfig,
    onRemove
}: WorkoutExerciseRowProps) {
    const [showFormulas, setShowFormulas] = useState(false);
    // Local state to toggle between simple (bulk edit) and per-set (detailed) view
    // We default to simple if all sets are identical, otherwise per-set
    const [isPerSet, setIsPerSet] = useState(() => {
        const sets = workoutExercise?.sets || [];
        if (sets.length <= 1) return false;

        // Check if all sets are identical
        const firstSetMetrics = JSON.stringify(sets[0].metrics);
        return sets.some(s => JSON.stringify(s.metrics) !== firstSetMetrics);
    });

    const sets = workoutExercise?.sets || [];
    // For simple view, we use the first set as the "template"
    const defaultMetrics = sets.length > 0 ? sets[0].metrics : {};
    const setsCount = sets.length;

    const handleTogglePerSet = (checked: boolean) => {
        setIsPerSet(checked);
    };

    const handleUpdateSetMetric = (setIndex: number, metricId: string, value: any) => {
        const newSets = [...sets];
        if (!newSets[setIndex]) return;

        newSets[setIndex] = {
            ...newSets[setIndex],
            metrics: {
                ...newSets[setIndex].metrics,
                [metricId]: value
            }
        };
        onUpdateConfig(exercise.id, 'sets', newSets);
    };

    const handleUpdateAllSetsMetric = (metricId: string, value: any) => {
        const newSets = sets.map(s => ({
            ...s,
            metrics: {
                ...s.metrics,
                [metricId]: value
            }
        }));
        onUpdateConfig(exercise.id, 'sets', newSets);
    };

    const handleUpdateSetsCount = (newCount: number) => {
        let newSets = [...sets];

        if (newCount > sets.length) {
            // Add sets
            const setsToAdd = newCount - sets.length;
            const templateMetrics = sets.length > 0 ? sets[sets.length - 1].metrics : {};

            for (let i = 0; i < setsToAdd; i++) {
                newSets.push({
                    setNumber: sets.length + i + 1,
                    metrics: { ...templateMetrics }
                });
            }
        } else if (newCount < sets.length) {
            // Remove sets
            newSets = newSets.slice(0, newCount);
        }

        onUpdateConfig(exercise.id, 'sets', newSets);
    };

    const renderMetricInput = (metric: any, value: any, onChange: (val: any) => void, isSmall = false) => {
        return (
            <div key={metric.id}>
                <label className={`${isSmall ? 'text-xs text-gray-400' : 'text-gray-600'} capitalize`}>
                    {metric.label || metric.id} {metric.unit ? `(${metric.unit})` : ''}
                </label>
                <Input
                    type={metric.inputType === 'text' ? 'text' : 'number'}
                    value={String(value ?? '')}
                    onChange={(e) => {
                        const val = e.target.value;
                        const finalVal = metric.inputType === 'text' ? val : (val === '' ? null : Number(val));
                        onChange(finalVal);
                    }}
                    className={isSmall ? 'h-8 text-sm' : 'mt-1'}
                    placeholder={metric.input === 'formula' ? 'Calculated automatically' : String(metric.defaultValue || '')}
                    disabled={metric.input === 'formula'}
                />
            </div>
        );
    };

    const formulaMetrics = exercise.metrics?.filter(m => m.input === 'formula') || [];
    const regularMetrics = exercise.metrics?.filter(m => m.input !== 'formula' && !['sets', 'reps', 'duration', 'rest'].includes(m.id)) || [];

    return (
        <div className="flex flex-col gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                </div>

                <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">{exercise.name}</h4>
                            <Badge variant="secondary" className={getWorkoutColor([exercise.exercise_type])}>
                                {formatTagName(exercise.exercise_type)}
                            </Badge>
                        </div>

                        {exercise.settings.sets_counting && (
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id={`per-set-${exercise.id}`}
                                    checked={isPerSet}
                                    onCheckedChange={handleTogglePerSet}
                                />
                                <Label htmlFor={`per-set-${exercise.id}`}>Configure per set</Label>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-sm">
                        {exercise.settings.sets_counting && (
                            <div>
                                <label className="text-gray-600">Sets</label>
                                <Input
                                    type="number"
                                    value={setsCount}
                                    onChange={(e) => handleUpdateSetsCount(parseInt(e.target.value) || 0)}
                                    className="mt-1"
                                />
                            </div>
                        )}

                        {!isPerSet && (
                            <>
                                {exercise.settings.reps_counting && (
                                    <div>
                                        <label className="text-gray-600">Reps</label>
                                        <Input
                                            type="number"
                                            value={Number(defaultMetrics.reps) || 0}
                                            onChange={(e) => handleUpdateAllSetsMetric('reps', parseInt(e.target.value) || 0)}
                                            className="mt-1"
                                        />
                                    </div>
                                )}
                                {(exercise.exercise_type === 'cardio' || exercise.structure !== 'sets') && (
                                    <div>
                                        <label className="text-gray-600">Duration (min)</label>
                                        <Input
                                            type="number"
                                            value={Number(defaultMetrics.duration) || 0}
                                            onChange={(e) => handleUpdateAllSetsMetric('duration', parseInt(e.target.value) || 0)}
                                            className="mt-1"
                                        />
                                    </div>
                                )}

                                {regularMetrics.map(metric =>
                                    renderMetricInput(metric, defaultMetrics[metric.id], (val) => handleUpdateAllSetsMetric(metric.id, val))
                                )}

                                {showFormulas && formulaMetrics.map(metric =>
                                    renderMetricInput(metric, defaultMetrics[metric.id], (val) => handleUpdateAllSetsMetric(metric.id, val))
                                )}

                                <div>
                                    <label className="text-gray-600">Rest (sec)</label>
                                    <Input
                                        type="number"
                                        value={Number(defaultMetrics.rest) || 0}
                                        onChange={(e) => handleUpdateAllSetsMetric('rest', parseInt(e.target.value) || 0)}
                                        className="mt-1"
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    {!isPerSet && formulaMetrics.length > 0 && (
                        <div className="mt-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowFormulas(!showFormulas)}
                                className="text-xs text-gray-500 hover:text-gray-700 p-0 h-auto flex items-center gap-1"
                            >
                                {showFormulas ? (
                                    <>Show less <ChevronUp className="w-3 h-3" /></>
                                ) : (
                                    <>Show more metrics <ChevronDown className="w-3 h-3" /></>
                                )}
                            </Button>
                        </div>
                    )}
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(exercise.id)}
                    className="text-red-600 hover:text-red-700"
                >
                    <X className="w-4 h-4" />
                </Button>
            </div>

            {isPerSet && sets.length > 0 && (
                <div className="pl-12 space-y-3">
                    {sets.map((set, setIndex) => (
                        <div key={set.setNumber} className="flex flex-col gap-2 bg-white p-3 rounded border border-gray-100">
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium text-gray-500 w-12">Set {set.setNumber}</span>

                                <div className="grid grid-cols-4 gap-4 flex-1">
                                    {exercise.settings.reps_counting && (
                                        <div>
                                            <label className="text-xs text-gray-400">Reps</label>
                                            <Input
                                                type="number"
                                                value={Number(set.metrics.reps) || 0}
                                                onChange={(e) => handleUpdateSetMetric(setIndex, 'reps', parseInt(e.target.value) || 0)}
                                                className="h-8 text-sm"
                                            />
                                        </div>
                                    )}

                                    {(exercise.exercise_type === 'cardio' || exercise.structure !== 'sets') && (
                                        <div>
                                            <label className="text-xs text-gray-400">Duration</label>
                                            <Input
                                                type="number"
                                                value={Number(set.metrics.duration) || 0}
                                                onChange={(e) => handleUpdateSetMetric(setIndex, 'duration', parseInt(e.target.value) || 0)}
                                                className="h-8 text-sm"
                                            />
                                        </div>
                                    )}

                                    {regularMetrics.map(metric =>
                                        renderMetricInput(metric, set.metrics[metric.id], (val) => handleUpdateSetMetric(setIndex, metric.id, val), true)
                                    )}

                                    {showFormulas && formulaMetrics.map(metric =>
                                        renderMetricInput(metric, set.metrics[metric.id], (val) => handleUpdateSetMetric(setIndex, metric.id, val), true)
                                    )}

                                    <div>
                                        <label className="text-xs text-gray-400">Rest</label>
                                        <Input
                                            type="number"
                                            value={Number(set.metrics.rest) || 0}
                                            onChange={(e) => handleUpdateSetMetric(setIndex, 'rest', parseInt(e.target.value) || 0)}
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {formulaMetrics.length > 0 && (
                        <div className="pl-16">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowFormulas(!showFormulas)}
                                className="text-xs text-gray-500 hover:text-gray-700 p-0 h-auto flex items-center gap-1"
                            >
                                {showFormulas ? (
                                    <>Show less <ChevronUp className="w-3 h-3" /></>
                                ) : (
                                    <>Show more metrics <ChevronDown className="w-3 h-3" /></>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
