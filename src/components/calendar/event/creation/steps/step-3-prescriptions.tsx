'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertCircle, Check, Settings, Edit3, RotateCcw, Loader2, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkoutSelection } from '@/providers/workout-assignment/workout-selection.context';
import { useExercisePrescription } from '@/providers/workout-assignment/exercise-prescription.context';
import { exerciseApi } from '@/app/services-client/exerciseApi';
import { Exercise } from '@/models/Exercise';

export function Step3ExercisePrescriptions() {
  const { state: workoutState } = useWorkoutSelection();
  const { state: prescriptionState, updatePrescription, resetExercise, initializePrescriptions } = useExercisePrescription();

  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoadingExercises, setIsLoadingExercises] = useState(false);
  const [exerciseError, setExerciseError] = useState<string | null>(null);

  const selectedWorkout = workoutState.selectedWorkout;

  console.log("selectedWorkout: ", selectedWorkout);

  // Fetch exercise details when workout is selected
  useEffect(() => {
    const fetchExerciseDetails = async () => {
      if (!selectedWorkout || !selectedWorkout.flow.exercises.length) {
        setExercises([]);
        return;
      }

      setIsLoadingExercises(true);
      setExerciseError(null);

      try {
        const exerciseIds = selectedWorkout.flow.exercises.map(ex => ex.exercise_id);
        const exerciseDetails = await exerciseApi.getExercisesByIds(exerciseIds);
        setExercises(exerciseDetails);
      } catch (error) {
        console.error('Failed to fetch exercise details:', error);
        setExerciseError('Failed to load exercise details');
      } finally {
        setIsLoadingExercises(false);
      }
    };

    fetchExerciseDetails();
  }, [selectedWorkout]);

  // Ensure prescriptions are initialized if missing (safety check)
  useEffect(() => {
    if (selectedWorkout && Object.keys(prescriptionState.prescriptions).length === 0) {
      console.log('Initializing prescriptions from Step 3 (safety check)');
      initializePrescriptions(selectedWorkout.flow.exercises);
    }
  }, [selectedWorkout, prescriptionState.prescriptions, initializePrescriptions]);

  const handleMetricChange = (exerciseId: string, metricKey: string, value: any) => {
    const currentPrescription = prescriptionState.prescriptions[exerciseId];
    if (currentPrescription && !Array.isArray(currentPrescription.prescribedMetrics)) {
      updatePrescription(exerciseId, {
        prescribedMetrics: {
          ...currentPrescription.prescribedMetrics,
          [metricKey]: value
        }
      });
    }
  };

  const handleNotesChange = (exerciseId: string, notes: string) => {
    updatePrescription(exerciseId, { notes });
  };

  const resetToDefaults = (exerciseId: string) => {
    if (selectedWorkout) {
      const exercise = selectedWorkout.flow.exercises.find(e => e.exercise_id === exerciseId);
      if (exercise) {
        resetExercise(exerciseId, exercise.default_Metrics, exercise.default_Metrics_sets);
      }
    }
  };

  const getModifiedCount = () => {
    return Object.values(prescriptionState.prescriptions).filter(prescription => prescription.isModified).length;
  };

  const getExerciseDetails = (exerciseId: string): Exercise | undefined => {
    return exercises.find(ex => ex.id === exerciseId);
  };

  if (!selectedWorkout) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-4">Exercise Prescriptions</h3>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-muted-foreground">Please select a workout first</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Exercise Prescriptions</h3>

      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Customize Exercise Metrics
            </div>
            <Badge variant="outline" className="text-xs">
              {getModifiedCount()} of {selectedWorkout.flow.exercises.length} modified
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Customize exercise metrics and add notes for each exercise in the workout.
            Leave unchanged to use workout defaults.
          </p>
        </CardContent>
      </Card>

      {/* Exercise List */}
      <div className="space-y-3">
        {isLoadingExercises ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">Loading exercise details...</span>
          </div>
        ) : exerciseError ? (
          <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg text-red-900 dark:text-red-200">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <p className="text-sm">{exerciseError}</p>
          </div>
        ) : (
          selectedWorkout.flow.exercises.map((exercise, index) => {
            const exerciseDetails = getExerciseDetails(exercise.exercise_id);
            const prescription = prescriptionState.prescriptions[exercise.exercise_id];
            const isExpanded = expandedExercise === exercise.exercise_id;
            const isModified = prescription?.isModified || false;
            const defaultMetrics = exercise.default_Metrics || {};
            const prescribedMetrics = prescription?.prescribedMetrics || defaultMetrics;
            const isPerSet = Array.isArray(prescribedMetrics);

            // Helper to get global metrics for display/init even when in per-set mode
            const currentGlobalMetrics = isPerSet
              ? (prescribedMetrics.length > 0 ? prescribedMetrics[0].metrics : defaultMetrics)
              : prescribedMetrics;

            const handleTogglePerSet = (checked: boolean) => {
              if (checked) {
                // Switch TO per-set
                const setsCount = Number(isPerSet ? prescribedMetrics.length : currentGlobalMetrics.sets) || 1;
                const { sets: _sets, ...metricsWithoutSets } = isPerSet ? currentGlobalMetrics : (prescribedMetrics as Record<string, any>);

                const newSets = Array.from({ length: setsCount }, (_, i) => ({
                  setNumber: i + 1,
                  metrics: { ...metricsWithoutSets }
                }));
                updatePrescription(exercise.exercise_id, { prescribedMetrics: newSets });
              } else {
                // Switch FROM per-set (to global)
                // Use first set's metrics + sets count
                if (isPerSet && prescribedMetrics.length > 0) {
                  const firstSetMetrics = prescribedMetrics[0].metrics;
                  const setsCount = prescribedMetrics.length;
                  updatePrescription(exercise.exercise_id, {
                    prescribedMetrics: { ...firstSetMetrics, sets: setsCount }
                  });
                } else {
                  updatePrescription(exercise.exercise_id, { prescribedMetrics: defaultMetrics });
                }
              }
            };

            const handleSetMetricChange = (setIndex: number, metricKey: string, value: any) => {
              if (!Array.isArray(prescribedMetrics)) return;

              const newSets = [...prescribedMetrics];
              if (!newSets[setIndex]) return;

              newSets[setIndex] = {
                ...newSets[setIndex],
                metrics: {
                  ...newSets[setIndex].metrics,
                  [metricKey]: value
                }
              };
              updatePrescription(exercise.exercise_id, { prescribedMetrics: newSets });
            };

            return (
              <Card key={exercise.exercise_id} className={cn(
                "transition-all",
                isModified && "border-primary/50 bg-primary/5"
              )}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium flex-shrink-0">
                        {index + 1}
                      </div>

                      {/* Exercise Image */}
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {exerciseDetails?.image || exerciseDetails?.photoCover ? (
                          <img
                            src={exerciseDetails.image || exerciseDetails.photoCover}
                            alt={exerciseDetails.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <ImageIcon className={cn("h-6 w-6 text-muted-foreground", exerciseDetails?.image || exerciseDetails?.photoCover ? "hidden" : "")} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">
                          {exerciseDetails?.name || `Exercise ${index + 1}`}
                        </h4>
                        <p className="text-sm text-muted-foreground truncate">
                          {exerciseDetails?.exercise_type || exerciseDetails?.description || 'Exercise Type'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isModified && (
                        <Badge variant="secondary" className="text-xs">
                          Modified
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedExercise(isExpanded ? null : exercise.exercise_id)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {/* Exercise Description */}
                      {exerciseDetails?.description && (
                        <div>
                          <h5 className="font-medium mb-2">Description</h5>
                          <p className="text-sm text-muted-foreground">{exerciseDetails.description}</p>
                        </div>
                      )}

                      {/* Metrics Header with Toggle */}
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium">Metrics</h5>
                        {exerciseDetails?.settings?.sets_counting && (
                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`per-set-${exercise.exercise_id}`}
                              checked={isPerSet}
                              onCheckedChange={handleTogglePerSet}
                            />
                            <Label htmlFor={`per-set-${exercise.exercise_id}`}>Configure per set</Label>
                          </div>
                        )}
                      </div>

                      {/* Global Metrics */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Always show Sets count */}
                        {exerciseDetails?.settings?.sets_counting && (
                          <div className="space-y-1">
                            <label className="text-sm font-medium capitalize">Sets</label>
                            <Input
                              type="number"
                              value={isPerSet ? prescribedMetrics.length : (prescribedMetrics as any).sets || ''}
                              onChange={(e) => {
                                const newSetsCount = parseFloat(e.target.value) || 0;

                                if (isPerSet) {
                                  // Resize per-set array
                                  const currentSets = prescribedMetrics as Array<any>;
                                  let newSetsArray = [...currentSets];

                                  if (newSetsCount > currentSets.length) {
                                    const setsToAdd = newSetsCount - currentSets.length;
                                    const templateMetrics = currentSets.length > 0
                                      ? currentSets[currentSets.length - 1].metrics
                                      : {}; // Should have metrics

                                    for (let i = 0; i < setsToAdd; i++) {
                                      newSetsArray.push({
                                        setNumber: currentSets.length + i + 1,
                                        metrics: { ...templateMetrics }
                                      });
                                    }
                                  } else if (newSetsCount < currentSets.length) {
                                    newSetsArray = newSetsArray.slice(0, newSetsCount);
                                  }

                                  if (newSetsArray.length !== currentSets.length) {
                                    updatePrescription(exercise.exercise_id, { prescribedMetrics: newSetsArray });
                                  }
                                } else {
                                  handleMetricChange(exercise.exercise_id, 'sets', newSetsCount);
                                }
                              }}
                              placeholder={String(defaultMetrics.sets || '')}
                              className={cn(
                                (isPerSet ? prescribedMetrics.length : (prescribedMetrics as any).sets) !== defaultMetrics.sets && "border-primary/50"
                              )}
                            />
                          </div>
                        )}

                        {/* Show other global metrics ONLY if NOT per-set */}
                        {!isPerSet && defaultMetrics && Object.entries(defaultMetrics).map(([key, defaultValue]) => {
                          if (key === 'sets') return null; // Already handled
                          return (
                            <div key={key} className="space-y-1">
                              <label className="text-sm font-medium capitalize">
                                {key.replace(/_/g, ' ')}
                              </label>
                              <Input
                                type={typeof defaultValue === 'number' ? 'number' : 'text'}
                                value={(prescribedMetrics as any)[key] || ''}
                                onChange={(e) => {
                                  const value = typeof defaultValue === 'number'
                                    ? parseFloat(e.target.value) || 0
                                    : e.target.value;
                                  handleMetricChange(exercise.exercise_id, key, value);
                                }}
                                placeholder={String(defaultValue)}
                                className={cn(
                                  (prescribedMetrics as any)[key] !== defaultValue && "border-primary/50"
                                )}
                              />
                              {(prescribedMetrics as any)[key] !== defaultValue && (
                                <p className="text-xs text-muted-foreground">
                                  Default: {String(defaultValue)}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Per Set Metrics Inputs */}
                      {isPerSet && (
                        <div className="space-y-3 pl-4 border-l-2 border-gray-100">
                          {(prescribedMetrics as any[]).map((set, setIndex) => (
                            <div key={set.setNumber} className="flex flex-col gap-2 bg-muted/30 p-3 rounded-md">
                              <span className="text-sm font-medium text-muted-foreground">Set {set.setNumber}</span>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {Object.entries(set.metrics).map(([key, value]) => {
                                  if (key === 'sets') return null;
                                  return (
                                    <div key={key}>
                                      <label className="text-xs text-muted-foreground capitalize mb-1 block">
                                        {key.replace(/_/g, ' ')}
                                      </label>
                                      <Input
                                        type={typeof value === 'number' ? 'number' : 'text'}
                                        value={value as string | number | readonly string[] || ''}
                                        onChange={(e) => {
                                          const newVal = typeof value === 'number'
                                            ? parseFloat(e.target.value) || 0
                                            : e.target.value;
                                          handleSetMetricChange(setIndex, key, newVal);
                                        }}
                                        className="h-8 text-sm"
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Notes */}
                      <div>
                        <h5 className="font-medium mb-3">Notes</h5>
                        <Textarea
                          value={prescription?.notes || ''}
                          onChange={(e) => handleNotesChange(exercise.exercise_id, e.target.value)}
                          placeholder="Add specific instructions or notes for this exercise..."
                          rows={3}
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex justify-between items-center pt-2 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resetToDefaults(exercise.exercise_id)}
                          disabled={!isModified}
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Reset to Defaults
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedExercise(null)}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Done
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Summary */}
      {getModifiedCount() > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary" />
              <p className="text-sm text-primary font-medium">
                {getModifiedCount()} exercise{getModifiedCount() !== 1 ? 's' : ''} customized
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
