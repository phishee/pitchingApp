import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Plus, X, GripVertical, Clock, Target,
  ClipboardList, Flame, Dumbbell, Star,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { formatTagName, getWorkoutColor } from '@/lib/workoutLibraryUtils';
import { useWorkoutFlow, useWorkoutExercises } from '@/providers/workout-context';
import { DEFAULT_RPE_CONFIG, RPEConfig } from '@/models/RPE';
import { cn } from '@/lib/utils';

const questionnaireTypes = [
  'readiness_to_train',
  'sleep_quality',
  'stress_level',
  'energy_level',
  'muscle_soreness'
];

const warmupTypes = [
  'dynamic_stretching',
  'light_cardio',
  'mobility_drills',
  'activation_exercises',
  'movement_preparation'
];

export function WorkoutFlowStep() {
  const {
    workoutFlow,
    addQuestionnaire,
    removeQuestionnaire,
    addWarmup,
    removeWarmup,
    reorderExercises,
    updateRpe
  } = useWorkoutFlow();
  const { selectedExercises } = useWorkoutExercises();

  // Helper function to get exercise info by ID
  const getExerciseById = (exerciseId: string) => {
    return selectedExercises.find(ex => ex.id === exerciseId);
  };

  // Helper function to get default metrics for a specific exercise
  const getDefaultMetricsForExerciseId = (exerciseId: string) => {
    const workoutExercise = workoutFlow.exercises?.find(ex => ex.exercise_id === exerciseId);
    return workoutExercise?.default_Metrics || {};
  };

  const calculateTotalTime = () => {
    return (workoutFlow.exercises || []).reduce((total: number, exercise: any) => {
      const defaultMetrics = getDefaultMetricsForExerciseId(exercise.exercise_id);
      const sets = Number(defaultMetrics.sets) || 3;
      const duration = Number(defaultMetrics.duration ?? 60);
      const rest = Number(defaultMetrics.rest ?? 30);
      return total + sets * duration + sets * rest;
    }, 0);
  };

  // Toggle Handlers
  const togglePreWorkout = (enabled: boolean) => {
    if (!enabled) {
      // Clear questionnaires if disabled? Or just hide? 
      // Usually better to clear to avoid hidden state, but maybe user wants to keep config.
      // Let's keep config but just hide it visually if we had a separate 'enabled' flag.
      // Since we don't have a separate flag in the model, we'll treat "empty array" as disabled for now,
      // OR we just use the UI state to show/hide and let the user manually add/remove items.
      // BUT the requirement is a toggle button.
      // Let's assume if the user toggles ON, we add a default if empty. If OFF, we clear.
      if (workoutFlow.questionnaires.length > 0) {
        // If clearing, maybe warn? For now, just clear.
        workoutFlow.questionnaires.forEach(q => removeQuestionnaire(q));
      }
    } else {
      if (workoutFlow.questionnaires.length === 0) {
        addQuestionnaire('readiness_to_train');
      }
    }
  };

  const toggleWarmup = (enabled: boolean) => {
    if (!enabled) {
      if (workoutFlow.warmup.length > 0) {
        workoutFlow.warmup.forEach(w => removeWarmup(w));
      }
    } else {
      if (workoutFlow.warmup.length === 0) {
        addWarmup('dynamic_stretching');
      }
    }
  };

  const toggleRpe = (enabled: boolean) => {
    if (enabled) {
      updateRpe(DEFAULT_RPE_CONFIG);
    } else {
      updateRpe(undefined);
    }
  };

  const hasPreWorkout = workoutFlow.questionnaires.length > 0;
  const hasWarmup = workoutFlow.warmup.length > 0;
  const hasRpe = !!workoutFlow.rpe;

  return (
    <div className="space-y-8">
      {/* Top Control Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-6 items-center justify-center sticky top-20 z-10">
        <div className="flex items-center gap-2">
          <Switch
            id="toggle-preworkout"
            checked={hasPreWorkout}
            onCheckedChange={togglePreWorkout}
          />
          <Label htmlFor="toggle-preworkout" className="font-medium cursor-pointer flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-blue-500" />
            Pre-Workout
          </Label>
        </div>

        <div className="h-6 w-px bg-gray-200" />

        <div className="flex items-center gap-2">
          <Switch
            id="toggle-warmup"
            checked={hasWarmup}
            onCheckedChange={toggleWarmup}
          />
          <Label htmlFor="toggle-warmup" className="font-medium cursor-pointer flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            Warmup
          </Label>
        </div>

        <div className="h-6 w-px bg-gray-200" />

        <div className="flex items-center gap-2">
          <Switch
            id="toggle-rpe"
            checked={hasRpe}
            onCheckedChange={toggleRpe}
          />
          <Label htmlFor="toggle-rpe" className="font-medium cursor-pointer flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            RPE Collection
          </Label>
        </div>
      </div>

      {/* Session Timeline */}
      <div className="relative pl-8 border-l-2 border-gray-100 space-y-12">

        {/* 1. Pre-Workout Section */}
        {hasPreWorkout && (
          <div className="relative">
            <div className="absolute -left-[41px] top-0 w-5 h-5 rounded-full bg-blue-100 border-4 border-white shadow-sm flex items-center justify-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
            </div>
            <Card className="border-blue-100 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-blue-900">
                  <ClipboardList className="w-5 h-5 text-blue-500" />
                  Pre-Workout Questionnaire
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {workoutFlow.questionnaires.map((questionnaire: string) => (
                    <Badge key={questionnaire} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                      {formatTagName(questionnaire)}
                      <button onClick={() => removeQuestionnaire(questionnaire)} className="ml-1 hover:text-blue-900">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-50">
                  <span className="text-xs text-gray-400 w-full uppercase font-bold tracking-wider">Add Questionnaires</span>
                  {questionnaireTypes
                    .filter(type => !workoutFlow.questionnaires.includes(type))
                    .map(type => (
                      <button
                        key={type}
                        onClick={() => addQuestionnaire(type)}
                        className="px-3 py-1 text-xs bg-gray-50 text-gray-600 rounded-full hover:bg-gray-100 border border-gray-100 transition-colors"
                      >
                        + {formatTagName(type)}
                      </button>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 2. Warmup Section */}
        {hasWarmup && (
          <div className="relative">
            <div className="absolute -left-[41px] top-0 w-5 h-5 rounded-full bg-orange-100 border-4 border-white shadow-sm flex items-center justify-center">
              <div className="w-2 h-2 bg-orange-500 rounded-full" />
            </div>
            <Card className="border-orange-100 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-orange-900">
                  <Flame className="w-5 h-5 text-orange-500" />
                  Warmup Routine
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {workoutFlow.warmup.map((warmup: string) => (
                    <Badge key={warmup} variant="secondary" className="bg-orange-50 text-orange-700 hover:bg-orange-100">
                      {formatTagName(warmup)}
                      <button onClick={() => removeWarmup(warmup)} className="ml-1 hover:text-orange-900">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-50">
                  <span className="text-xs text-gray-400 w-full uppercase font-bold tracking-wider">Add Drills</span>
                  {warmupTypes
                    .filter(type => !workoutFlow.warmup.includes(type))
                    .map(type => (
                      <button
                        key={type}
                        onClick={() => addWarmup(type)}
                        className="px-3 py-1 text-xs bg-gray-50 text-gray-600 rounded-full hover:bg-gray-100 border border-gray-100 transition-colors"
                      >
                        + {formatTagName(type)}
                      </button>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 3. Main Workout Section (Always Visible) */}
        <div className="relative">
          <div className="absolute -left-[41px] top-0 w-5 h-5 rounded-full bg-gray-900 border-4 border-white shadow-sm flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
          <Card className="border-gray-200 shadow-md ring-1 ring-black/5">
            <CardHeader className="pb-3 bg-gray-50/50 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                  <Dumbbell className="w-5 h-5 text-gray-700" />
                  Main Workout
                </CardTitle>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">
                  <Clock className="w-3.5 h-3.5" />
                  <span>~{Math.round(calculateTotalTime() / 60)} min</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {(workoutFlow.exercises || []).length === 0 ? (
                <div className="text-center py-12 text-gray-400 bg-gray-50/30">
                  <Target className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No exercises added yet</p>
                  <p className="text-sm opacity-70">Go back to "Exercises" step to add some</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {(workoutFlow.exercises || []).map((exercise: any, index: number) => {
                    const exerciseInfo = getExerciseById(exercise.exercise_id);
                    const defaultMetrics = getDefaultMetricsForExerciseId(exercise.exercise_id);

                    if (!exerciseInfo) return null;

                    return (
                      <div key={exercise.exercise_id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {index > 0 && (
                              <button onClick={() => reorderExercises(index, index - 1)} className="p-1 hover:bg-gray-200 rounded">
                                <ChevronUp className="w-3 h-3 text-gray-500" />
                              </button>
                            )}
                            {index < (workoutFlow.exercises || []).length - 1 && (
                              <button onClick={() => reorderExercises(index, index + 1)} className="p-1 hover:bg-gray-200 rounded">
                                <ChevronDown className="w-3 h-3 text-gray-500" />
                              </button>
                            )}
                          </div>
                          <div className="w-8 h-8 bg-gray-900 text-white rounded-lg flex items-center justify-center text-sm font-bold shadow-sm">
                            {index + 1}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900 truncate">{exerciseInfo.name}</h4>
                            <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0 h-5", getWorkoutColor([exerciseInfo.exercise_type]))}>
                              {formatTagName(exerciseInfo.exercise_type)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                            {exerciseInfo.settings.sets_counting && (
                              <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">{defaultMetrics.sets || 3} sets</span>
                            )}
                            {exerciseInfo.settings.reps_counting && (
                              <span>{defaultMetrics.reps || 10} reps</span>
                            )}
                            {(exerciseInfo.exercise_type === 'cardio' || exerciseInfo.structure !== 'sets') && (
                              <span>{defaultMetrics.duration || 60}s</span>
                            )}
                            <span className="text-gray-300">•</span>
                            <span>{defaultMetrics.rest || 30}s rest</span>
                          </div>
                        </div>

                        <GripVertical className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing" />
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 4. RPE Section */}
        {hasRpe && workoutFlow.rpe && (
          <div className="relative">
            <div className="absolute -left-[41px] top-0 w-5 h-5 rounded-full bg-yellow-100 border-4 border-white shadow-sm flex items-center justify-center">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
            </div>
            <Card className="border-yellow-100 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-yellow-900">
                  <Star className="w-5 h-5 text-yellow-500" />
                  RPE Collection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Granularity</Label>
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                      <button
                        onClick={() => updateRpe({ ...workoutFlow.rpe!, granularity: 'session' })}
                        className={cn(
                          "flex-1 py-2 text-sm font-medium rounded-md transition-all",
                          workoutFlow.rpe.granularity === 'session' || !workoutFlow.rpe.granularity
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-500 hover:text-gray-900"
                        )}
                      >
                        Session Only
                      </button>
                      <button
                        onClick={() => updateRpe({ ...workoutFlow.rpe!, granularity: 'exercise' })}
                        className={cn(
                          "flex-1 py-2 text-sm font-medium rounded-md transition-all",
                          workoutFlow.rpe.granularity === 'exercise'
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-500 hover:text-gray-900"
                        )}
                      >
                        Per Exercise
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">
                      {workoutFlow.rpe.granularity === 'exercise'
                        ? "Athletes will rate each exercise individually."
                        : "Athletes will provide a single rating for the entire workout."}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Input Mode</Label>
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                      <button
                        onClick={() => updateRpe({ ...workoutFlow.rpe!, mode: 'emoji' })}
                        className={cn(
                          "flex-1 py-2 text-sm font-medium rounded-md transition-all",
                          workoutFlow.rpe.mode === 'emoji'
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-500 hover:text-gray-900"
                        )}
                      >
                        Emoji
                      </button>
                      <button
                        onClick={() => updateRpe({ ...workoutFlow.rpe!, mode: 'numeric' })}
                        className={cn(
                          "flex-1 py-2 text-sm font-medium rounded-md transition-all",
                          workoutFlow.rpe.mode === 'numeric'
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-500 hover:text-gray-900"
                        )}
                      >
                        Numeric (1-10)
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}
