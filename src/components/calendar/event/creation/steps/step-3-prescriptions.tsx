'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Check, Settings, Edit3, RotateCcw, Loader2, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkoutSelection } from '@/providers/workout-assignment/workout-selection.context';
import { useExercisePrescription } from '@/providers/workout-assignment/exercise-prescription.context';
import { exerciseApi } from '@/app/services-client/exerciseApi';
import { Exercise } from '@/models/Exercise';

export function Step3ExercisePrescriptions() {
  const { state: workoutState } = useWorkoutSelection();
  const { state: prescriptionState, updatePrescription, resetExercise } = useExercisePrescription();

  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoadingExercises, setIsLoadingExercises] = useState(false);
  const [exerciseError, setExerciseError] = useState<string | null>(null);

  const selectedWorkout = workoutState.selectedWorkout;

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

  const handleMetricChange = (exerciseId: string, metricKey: string, value: any) => {
    const currentPrescription = prescriptionState.prescriptions[exerciseId];
    if (currentPrescription) {
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
        resetExercise(exerciseId, exercise.default_Metrics);
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
                      
                      {/* Metrics */}
                      <div>
                        <h5 className="font-medium mb-3">Metrics</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {defaultMetrics && Object.entries(defaultMetrics).map(([key, defaultValue]) => (
                            <div key={key} className="space-y-1">
                              <label className="text-sm font-medium capitalize">
                                {key.replace(/_/g, ' ')}
                              </label>
                              <Input
                                type={typeof defaultValue === 'number' ? 'number' : 'text'}
                                value={prescribedMetrics[key] || ''}
                                onChange={(e) => {
                                  const value = typeof defaultValue === 'number' 
                                    ? parseFloat(e.target.value) || 0
                                    : e.target.value;
                                  handleMetricChange(exercise.exercise_id, key, value);
                                }}
                                placeholder={String(defaultValue)}
                                className={cn(
                                  prescribedMetrics[key] !== defaultValue && "border-primary/50"
                                )}
                              />
                              {prescribedMetrics[key] !== defaultValue && (
                                <p className="text-xs text-muted-foreground">
                                  Default: {String(defaultValue)}
                                </p>
                              )}
                            </div>
                          )) || (
                            <div className="col-span-full text-center py-4 text-muted-foreground">
                              <p className="text-sm">No metrics available for this exercise</p>
                            </div>
                          )}
                        </div>
                      </div>

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
