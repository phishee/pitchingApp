import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, X, GripVertical, Clock, Target } from 'lucide-react';
import { formatTagName, getWorkoutColor } from '@/lib/workoutLibraryUtils';
import { useWorkoutFlow, useWorkoutExercises } from '@/providers/workout-context';

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
    reorderExercises 
  } = useWorkoutFlow();
  const { selectedExercises } = useWorkoutExercises();
  const [newQuestionnaire, setNewQuestionnaire] = useState('');
  const [newWarmup, setNewWarmup] = useState('');

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

  return (
    <div className="space-y-6">
      {/* Pre-Workout Questionnaires */}
      <Card>
        <CardHeader>
          <CardTitle>Pre-Workout Questionnaires</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {workoutFlow.questionnaires.map((questionnaire: string) => (
              <Badge
                key={questionnaire}
                variant="secondary"
                className="flex items-center gap-1 bg-blue-100 text-blue-700"
              >
                {formatTagName(questionnaire)}
                <button
                  onClick={() => removeQuestionnaire(questionnaire)}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {questionnaireTypes
              .filter(type => !workoutFlow.questionnaires.includes(type))
              .map(type => (
                <button
                  key={type}
                  onClick={() => addQuestionnaire(type)}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                >
                  {formatTagName(type)}
                </button>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Warmup Routine */}
      <Card>
        <CardHeader>
          <CardTitle>Warmup Routine</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {workoutFlow.warmup.map((warmup: string) => (
              <Badge
                key={warmup}
                variant="secondary"
                className="flex items-center gap-1 bg-green-100 text-green-700"
              >
                {formatTagName(warmup)}
                <button
                  onClick={() => removeWarmup(warmup)}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {warmupTypes
              .filter(type => !workoutFlow.warmup.includes(type))
              .map(type => (
                <button
                  key={type}
                  onClick={() => addWarmup(type)}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                >
                  {formatTagName(type)}
                </button>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Exercise Sequence */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Exercise Sequence</span>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>~{Math.round(calculateTotalTime() / 60)} minutes</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(workoutFlow.exercises || []).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No exercises in sequence</p>
              <p className="text-sm">Add exercises in the previous step</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(workoutFlow.exercises || []).map((exercise: any, index: number) => {
                const exerciseInfo = getExerciseById(exercise.exercise_id);
                const defaultMetrics = getDefaultMetricsForExerciseId(exercise.exercise_id);
                
                if (!exerciseInfo) {
                  return null; // Skip if exercise info not found
                }

                return (
                  <div key={exercise.exercise_id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-900">{exerciseInfo.name}</h4>
                        <Badge variant="secondary" className={getWorkoutColor([exerciseInfo.exercise_type])}>
                          {formatTagName(exerciseInfo.exercise_type)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {exerciseInfo.settings.sets_counting && (
                          <span>{defaultMetrics.sets || 3} sets</span>
                        )}
                        {exerciseInfo.settings.reps_counting && (
                          <span>{defaultMetrics.reps || 10} reps</span>
                        )}
                        {(exerciseInfo.exercise_type === 'cardio' || exerciseInfo.structure !== 'sets') && (
                          <span>{defaultMetrics.duration || 60}s duration</span>
                        )}
                        <span>{defaultMetrics.rest || 30}s rest</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      {index > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => reorderExercises(index, index - 1)}
                        >
                          ↑
                        </Button>
                      )}
                      {index < (workoutFlow.exercises || []).length - 1 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => reorderExercises(index, index + 1)}
                        >
                          ↓
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
