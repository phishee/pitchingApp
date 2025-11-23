'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Plus, Target, Clock, X, Check } from 'lucide-react';
import { getWorkoutColor, formatTagName } from '@/lib/workoutLibraryUtils';
import { WorkoutExercise, Exercise } from '@/models';
import { useWorkoutFlow, useWorkoutExercises } from '@/providers/workout-context';
import { ExerciseLibrarySelection } from '../ExerciseLibrarySelection';

export function WorkoutExercisesStep() {
  const { workoutFlow, addExercise, removeExercise, updateExercise } = useWorkoutFlow();
  const { selectedExercises } = useWorkoutExercises();
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  // Ensure exercises array exists with fallback
  const exercises = workoutFlow?.exercises || [];

  // Memoize the helper function to prevent unnecessary re-renders
  const getDefaultMetricsForExerciseId = useCallback((exerciseId: string) => {
    const workoutExercise = exercises.find(ex => ex.exercise_id === exerciseId);
    return workoutExercise?.default_Metrics || {};
  }, [exercises]);

  // Helper function to determine which metrics to include based on exercise settings
  const getDefaultMetricsForExercise = useCallback((exercise: Exercise) => {
    const defaultMetrics: { [key: string]: any } = {};

    // Add sets if sets_counting is enabled
    if (exercise.settings.sets_counting) {
      defaultMetrics.sets = 3;
    }

    // Add reps if reps_counting is enabled
    if (exercise.settings.reps_counting) {
      defaultMetrics.reps = 10;
    }

    // Add duration for time-based exercises
    if (exercise.exercise_type === 'cardio' || exercise.structure !== 'sets') {
      defaultMetrics.duration = 60;
    }

    // Add rest time
    defaultMetrics.rest = 30;

    // Add custom metrics from the exercise definition
    if (exercise.metrics) {
      exercise.metrics.forEach(metric => {
        // Avoid overwriting existing standard metrics if they were already set
        if (defaultMetrics[metric.id] === undefined) {
          defaultMetrics[metric.id] = metric.defaultValue ?? null;
        }
      });
    }

    return defaultMetrics;
  }, []);

  const handleAddExercise = useCallback((exercise: Exercise) => {
    const exerciseWithConfig: WorkoutExercise = {
      exercise_id: exercise.id,
      default_Metrics: getDefaultMetricsForExercise(exercise)
    };
    addExercise(exerciseWithConfig, exercise);
  }, [addExercise, getDefaultMetricsForExercise]);

  const handleRemoveExercise = useCallback((exerciseId: string) => {
    removeExercise(exerciseId);
  }, [removeExercise]);

  const handleUpdateExerciseConfig = useCallback((exerciseId: string, field: string, value: any) => {
    updateExercise(exerciseId, field, value);
  }, [updateExercise]);

  const handleCloseLibrary = useCallback(() => {
    setIsLibraryOpen(false);
  }, []);

  // Memoize the selected exercises component to prevent unnecessary re-renders
  const ShowSelectedExercises = useMemo(() => {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center w-full justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Selected Exercises ({selectedExercises.length})
            </div>
            <Button onClick={() => setIsLibraryOpen(true)} className="flex items-center gap-2 rounded-full">
              <Plus className="w-4 h-4" />
              Add Exercise
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedExercises.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No exercises selected yet</p>
              <p className="text-sm">Click "Add Exercise" to browse the library</p>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedExercises.map((exercise: Exercise, index: number) => {
                const defaultMetrics = getDefaultMetricsForExerciseId(exercise.id);

                return (
                  <div key={exercise.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-900">{exercise.name}</h4>
                        <Badge variant="secondary" className={getWorkoutColor([exercise.exercise_type])}>
                          {formatTagName(exercise.exercise_type)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-4 gap-4 text-sm">
                        {exercise.settings.sets_counting && (
                          <div>
                            <label className="text-gray-600">Sets</label>
                            <Input
                              type="number"
                              value={Number(defaultMetrics.sets) || 0}
                              onChange={(e) => handleUpdateExerciseConfig(exercise.id, 'sets', parseInt(e.target.value) || 0)}
                              className="mt-1"
                            />
                          </div>
                        )}
                        {exercise.settings.reps_counting && (
                          <div>
                            <label className="text-gray-600">Reps</label>
                            <Input
                              type="number"
                              value={Number(defaultMetrics.reps) || 0}
                              onChange={(e) => handleUpdateExerciseConfig(exercise.id, 'reps', parseInt(e.target.value) || 0)}
                              className="mt-1"
                            />
                          </div>
                        )}
                        {exercise.exercise_type === 'cardio' || exercise.structure !== 'sets' ? (
                          <div>
                            <label className="text-gray-600">Duration (min)</label>
                            <Input
                              type="number"
                              value={Number(defaultMetrics.duration) || 0}
                              onChange={(e) => handleUpdateExerciseConfig(exercise.id, 'duration', parseInt(e.target.value) || 0)}
                              className="mt-1"
                            />
                          </div>
                        ) : null}

                        {/* Dynamic Metrics Inputs */}
                        {exercise.metrics?.map(metric => {
                          // Skip metrics that are already handled explicitly above (sets, reps, duration, rest)
                          if (['sets', 'reps', 'duration', 'rest'].includes(metric.id)) return null;

                          return (
                            <div key={metric.id}>
                              <label className="text-gray-600 capitalize">{metric.label || metric.id} {metric.unit ? `(${metric.unit})` : ''}</label>
                              <Input
                                type={metric.inputType === 'text' ? 'text' : 'number'}
                                value={String(defaultMetrics[metric.id] ?? '')}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const finalVal = metric.inputType === 'text' ? val : (val === '' ? null : Number(val));
                                  handleUpdateExerciseConfig(exercise.id, metric.id, finalVal);
                                }}
                                className="mt-1"
                                placeholder={metric.input === 'formula' ? 'Calculated automatically' : String(metric.defaultValue || '')}
                                disabled={metric.input === 'formula'}
                              />
                            </div>
                          );
                        })}

                        <div>
                          <label className="text-gray-600">Rest (sec)</label>
                          <Input
                            type="number"
                            value={Number(defaultMetrics.rest) || 0}
                            onChange={(e) => handleUpdateExerciseConfig(exercise.id, 'rest', parseInt(e.target.value) || 0)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveExercise(exercise.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }, [selectedExercises, getDefaultMetricsForExerciseId, handleUpdateExerciseConfig, handleRemoveExercise]);

  return (
    <div className="space-y-6">
      {ShowSelectedExercises}

      <Dialog open={isLibraryOpen} onOpenChange={setIsLibraryOpen}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Exercise Library</DialogTitle>
          </DialogHeader>

          <ExerciseLibrarySelection
            selectedExercises={selectedExercises}
            onExerciseSelect={handleAddExercise}
          />

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleCloseLibrary} className='bg-green-500 text-white font-bold hover:bg-green-600'>
              Done
              <Check className="w-4 h-4 text-white" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}