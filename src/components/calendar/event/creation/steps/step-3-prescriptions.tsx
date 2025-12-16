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
      initializePrescriptions(selectedWorkout.flow.exercises);
    }
  }, [selectedWorkout, prescriptionState.prescriptions, initializePrescriptions]);

  const handleMetricChange = (exerciseId: string, metricKey: string, value: any) => {
    const currentPrescription = prescriptionState.prescriptions[exerciseId];
    if (currentPrescription && Array.isArray(currentPrescription.prescribedMetrics)) {
      const newSets = currentPrescription.prescribedMetrics.map(set => ({
        ...set,
        metrics: {
          ...set.metrics,
          [metricKey]: value
        }
      }));
      updatePrescription(exerciseId, { prescribedMetrics: newSets });
    }
  };

  const handleNotesChange = (exerciseId: string, notes: string) => {
    updatePrescription(exerciseId, { notes });
  };

  const resetToDefaults = (exerciseId: string) => {
    if (selectedWorkout) {
      const exercise = selectedWorkout.flow.exercises.find(e => e.exercise_id === exerciseId);
      if (exercise) {
        resetExercise(exerciseId, exercise.sets);
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

            // Normalized: always use sets array
            const defaultSets = exercise.sets || [];
            const prescribedSets = prescription?.prescribedMetrics || defaultSets;

            // Determine if we are in "per set" mode based on whether sets have different metrics
            // or if the user has explicitly toggled it (we might need local state for this if we want to force it)
            // For now, let's derive it: if any set is different from the first, it's per-set.
            // But we also want to allow the user to toggle it ON even if they are same.
            // So we might need a local state or just rely on the UI toggle which we can implement as a "view mode".
            // Let's use a local state for view mode if we want to toggle between "Bulk Edit" and "Per Set Edit".
            // However, the previous implementation used `isPerSet` derived from data structure.
            // Now the data structure is ALWAYS per-set (array).
            // So `isPerSet` becomes purely a UI state: "Show individual sets" vs "Show summary/bulk edit".
            // We can default to "Bulk Edit" if all sets are identical, and "Per Set" if they differ.

            const areAllSetsIdentical = prescribedSets.every(s =>
              JSON.stringify(s.metrics) === JSON.stringify(prescribedSets[0]?.metrics)
            );

            // We can use a simple heuristic: if they are identical, show bulk edit by default.
            // But we need to allow toggling.
            // Since we don't have per-component state easily here without extracting a component,
            // let's extract the row into a separate component or use a local state map.
            // For now, let's just use the heuristic and maybe add a "Customize per set" toggle that forces the view.
            // Actually, let's just use `!areAllSetsIdentical` as the base, and maybe we can't easily toggle back to bulk if they are different without resetting?
            // Let's stick to: "Configure per set" toggle expands the set list.

            // Wait, I can't easily add local state for each row here without extracting a component.
            // I will extract `ExercisePrescriptionRow` in a future refactor.
            // For now, I will use a simple approach:
            // If `areAllSetsIdentical` is true, show Bulk Edit inputs.
            // If `areAllSetsIdentical` is false, show Per Set inputs.
            // AND provide a toggle to switch.
            // But where to store the toggle state?
            // I can store it in `expandedExercise`? No, that's for expanding the card.

            // Let's assume for now:
            // If sets are identical, we show Bulk Edit.
            // If user wants to edit per set, they click "Configure per set", which effectively
            // might just show the per-set inputs.
            // If they edit one set, `areAllSetsIdentical` becomes false, so it stays in per-set mode.
            // If they want to go back to bulk, they might need to "Reset" or we provide a "Sync all sets" button.

            const isPerSetView = !areAllSetsIdentical;

            // Helper to get metrics for bulk display/edit
            const firstSetMetrics = prescribedSets.length > 0 ? prescribedSets[0].metrics : {};

            const handleTogglePerSet = (checked: boolean) => {
              if (!checked) {
                // Sync all sets to the first set's metrics
                if (prescribedSets.length > 0) {
                  const templateMetrics = prescribedSets[0].metrics;
                  const newSets = prescribedSets.map(s => ({
                    ...s,
                    metrics: { ...templateMetrics }
                  }));
                  updatePrescription(exercise.exercise_id, { prescribedMetrics: newSets });
                }
              } else {
                // Just switch view (implicitly handled by isPerSetView if we force a change? No)
                // If we are already identical, checking this doesn't change data, so `isPerSetView` remains false.
                // We need a way to force per-set view even if identical.
                // Since I cannot add state easily, I will just show the Per Set view if `!areAllSetsIdentical`.
                // And maybe I can't support "Force Per Set View" for identical sets without a refactor.
                // OR I can use a hack: add a dummy property? No.

                // Let's just implement the "Bulk Edit" (default) and "Per Set Edit" (if different).
                // And if user wants to edit per set, they can maybe just see the list?
                // Actually, the previous code had `isPerSet` derived from `Array.isArray`.
                // Now it is always array.

                // Let's try to keep it simple:
                // Always show "Bulk Edit" controls at the top.
                // Always show "Per Set" list below if expanded?
                // Or use a toggle that effectively just shows/hides the per-set list.
                // But I don't have state for that toggle.

                // OK, I will extract the row to a component `ExercisePrescriptionRow` in this file.
                // This is the cleanest way.
              }
            };

            return (
              <ExercisePrescriptionRow
                key={exercise.exercise_id}
                index={index}
                exercise={exercise}
                exerciseDetails={exerciseDetails}
                prescription={prescription}
                expandedExercise={expandedExercise}
                setExpandedExercise={setExpandedExercise}
                updatePrescription={updatePrescription}
                resetToDefaults={resetToDefaults}
              />
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

function ExercisePrescriptionRow({
  index,
  exercise,
  exerciseDetails,
  prescription,
  expandedExercise,
  setExpandedExercise,
  updatePrescription,
  resetToDefaults
}: {
  index: number;
  exercise: any;
  exerciseDetails: Exercise | undefined;
  prescription: any;
  expandedExercise: string | null;
  setExpandedExercise: (id: string | null) => void;
  updatePrescription: (id: string, data: any) => void;
  resetToDefaults: (id: string) => void;
}) {
  const isExpanded = expandedExercise === exercise.exercise_id;
  const isModified = prescription?.isModified || false;

  // Normalized: always use sets array
  const defaultSets = exercise.sets || [];
  const prescribedSets = prescription?.prescribedMetrics || defaultSets;

  // Determine if we are in "per set" mode based on whether sets have different metrics
  const areAllSetsIdentical = prescribedSets.every((s: any) =>
    JSON.stringify(s.metrics) === JSON.stringify(prescribedSets[0]?.metrics)
  );

  const isPerSetView = !areAllSetsIdentical;

  // Helper to get metrics for bulk display/edit
  const firstSetMetrics = prescribedSets.length > 0 ? prescribedSets[0].metrics : {};

  const handleTogglePerSet = (checked: boolean) => {
    if (!checked) {
      // Sync all sets to the first set's metrics
      if (prescribedSets.length > 0) {
        const templateMetrics = prescribedSets[0].metrics;
        const newSets = prescribedSets.map((s: any) => ({
          ...s,
          metrics: { ...templateMetrics }
        }));
        updatePrescription(exercise.exercise_id, { prescribedMetrics: newSets });
      }
    } else {
      // Just switch view (implicitly handled by isPerSetView if we force a change? No)
      // If we are already identical, checking this doesn't change data, so `isPerSetView` remains false.
      // We need a way to force per-set view even if identical.
      // Since I cannot add state easily, I will just show the Per Set view if `!areAllSetsIdentical`.
      // And maybe I can't support "Force Per Set View" for identical sets without a refactor.
      // OR I can use a hack: add a dummy property? No.

      // Let's just implement the "Bulk Edit" (default) and "Per Set Edit" (if different).
      // And if user wants to edit per set, they can maybe just see the list?
      // Actually, the previous code had `isPerSet` derived from `Array.isArray`.
      // Now it is always array.

      // Let's try to keep it simple:
      // Always show "Bulk Edit" controls at the top.
      // Always show "Per Set" list below if expanded?
      // Or use a toggle that effectively just shows/hides the per-set list.
      // But I don't have state for that toggle.

      // OK, I will extract the row to a component `ExercisePrescriptionRow` in this file.
      // This is the cleanest way.
    }
  };

  const handleMetricChange = (metricKey: string, value: any) => {
    const newSets = prescribedSets.map((set: any) => ({
      ...set,
      metrics: {
        ...set.metrics,
        [metricKey]: value
      }
    }));
    updatePrescription(exercise.exercise_id, { prescribedMetrics: newSets });
  };

  const handleSetMetricChange = (setIndex: number, metricKey: string, value: any) => {
    const newSets = [...prescribedSets];
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
    <Card className={cn(
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
              {/* Toggle removed for now as we just show both or switch based on state */}
            </div>

            {/* Global Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Always show Sets count */}
              {exerciseDetails?.settings?.sets_counting && (
                <div className="space-y-1">
                  <label className="text-sm font-medium capitalize">Sets</label>
                  <Input
                    type="number"
                    value={prescribedSets.length}
                    onChange={(e) => {
                      const newSetsCount = parseFloat(e.target.value) || 0;
                      // Resize sets array
                      const currentSets = prescribedSets;
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
                    }}
                    placeholder={String(defaultSets.length || '')}
                    className={cn(
                      prescribedSets.length !== defaultSets.length && "border-primary/50"
                    )}
                  />
                </div>
              )}

              {/* Show other global metrics (bulk edit) */}
              {!isPerSetView && firstSetMetrics && Object.entries(firstSetMetrics).map(([key, value]) => {
                if (key === 'sets') return null; // Already handled
                const defaultValue = defaultSets[0]?.metrics[key];
                return (
                  <div key={key} className="space-y-1">
                    <label className="text-sm font-medium capitalize">
                      {key.replace(/_/g, ' ')}
                    </label>
                    <Input
                      type={typeof value === 'number' ? 'number' : 'text'}
                      value={value as string | number | readonly string[] || ''}
                      onChange={(e) => {
                        const newVal = typeof value === 'number'
                          ? parseFloat(e.target.value) || 0
                          : e.target.value;
                        handleMetricChange(key, newVal);
                      }}
                      placeholder={String(defaultValue)}
                      className={cn(
                        value !== defaultValue && "border-primary/50"
                      )}
                    />
                    {value !== defaultValue && (
                      <p className="text-xs text-muted-foreground">
                        Default: {String(defaultValue)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Per Set Metrics Inputs */}
            {/* Always show per-set inputs if sets differ, OR if we want to allow editing individual sets */}
            {/* For now, let's show them if isPerSetView is true */}
            {isPerSetView && (
              <div className="space-y-3 pl-4 border-l-2 border-gray-100">
                {(prescribedSets as any[]).map((set, setIndex) => (
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
                onChange={(e) => updatePrescription(exercise.exercise_id, { notes: e.target.value })}
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
}
