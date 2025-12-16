'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Search, Plus, Target, Clock, X, Check } from 'lucide-react';
import { getWorkoutColor, formatTagName } from '@/lib/workoutLibraryUtils';
import { WorkoutExercise, Exercise } from '@/models';
import { useWorkoutFlow, useWorkoutExercises } from '@/providers/workout-context';
import { ExerciseLibrarySelection } from '../ExerciseLibrarySelection';
import { WorkoutExerciseRow } from './WorkoutExerciseRow';

export function WorkoutExercisesStep() {
  const { workoutFlow, addExercise, removeExercise, updateExercise } = useWorkoutFlow();
  const { selectedExercises } = useWorkoutExercises();
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  // Ensure exercises array exists with fallback
  const exercises = workoutFlow?.exercises || [];

  // Memoize the helper function to prevent unnecessary re-renders
  const getDefaultMetricsForExerciseId = useCallback((exerciseId: string) => {
    const workoutExercise = exercises.find(ex => ex.exercise_id === exerciseId);
    return workoutExercise?.sets || [];
  }, [exercises]);

  // Helper function to determine which metrics to include based on exercise settings
  const getDefaultMetricsForExercise = useCallback((exercise: Exercise) => {
    const metrics: { [key: string]: any } = {};

    // Add reps if reps_counting is enabled
    if (exercise.settings.reps_counting) {
      metrics.reps = 10;
    }

    // Add duration for time-based exercises
    if (exercise.exercise_type === 'cardio' || exercise.structure !== 'sets') {
      metrics.duration = 60;
    }

    // Add rest time
    metrics.rest = 30;

    // Add custom metrics from the exercise definition
    if (exercise.metrics) {
      exercise.metrics.forEach(metric => {
        // Avoid overwriting existing standard metrics if they were already set
        if (metrics[metric.id] === undefined) {
          metrics[metric.id] = metric.defaultValue ?? null;
        }
      });
    }

    // Determine number of sets
    const setsCount = exercise.settings.sets_counting ? 3 : 1;

    // Generate sets array
    return Array.from({ length: setsCount }, (_, i) => ({
      setNumber: i + 1,
      metrics: { ...metrics }
    }));
  }, []);

  const handleAddExercise = useCallback((exercise: Exercise) => {
    const exerciseWithConfig: WorkoutExercise = {
      exercise_id: exercise.id,
      sets: getDefaultMetricsForExercise(exercise)
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
                const workoutExercise = exercises.find(ex => ex.exercise_id === exercise.id);

                return (
                  <WorkoutExerciseRow
                    key={exercise.id}
                    exercise={exercise}
                    index={index}
                    workoutExercise={workoutExercise}
                    onUpdateConfig={handleUpdateExerciseConfig}
                    onRemove={handleRemoveExercise}
                  />
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }, [selectedExercises, exercises, handleUpdateExerciseConfig, handleRemoveExercise]);

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