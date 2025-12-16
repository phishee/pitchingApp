import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Target, Users, FileText, Zap } from 'lucide-react';
import { getWorkoutIcon, getWorkoutColor, formatTagName } from '@/lib/workoutLibraryUtils';
import { useWorkout, useWorkoutExercises } from '@/providers/workout-context';

// Workout Overview Card Component
function WorkoutOverviewCard({ workoutMetadata, workoutFlow, calculateTotalTime }: {
  workoutMetadata: any;
  workoutFlow: any;
  calculateTotalTime: () => number;
}) {
  const WorkoutIcon = getWorkoutIcon(workoutMetadata.tags || []);
  const workoutColor = getWorkoutColor(workoutMetadata.tags || []);

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Cover Image */}
      <div className="relative aspect-video bg-gray-100">
        {workoutMetadata.coverImage ? (
          <img
            src={workoutMetadata.coverImage}
            alt={workoutMetadata.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <Target className="w-12 h-12 text-gray-400" />
          </div>
        )}
        <div className="absolute top-4 left-4">
          <Badge className={workoutColor}>
            {workoutMetadata.tags && workoutMetadata.tags[0] ? formatTagName(workoutMetadata.tags[0]) : 'Workout'}
          </Badge>
        </div>
      </div>

      {/* Workout Info */}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-lg ${workoutColor.split(' ')[1]} bg-opacity-20`}>
            <WorkoutIcon className="w-5 h-5" />
          </div>
          <div className="text-sm text-gray-500">
            Created by You
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">{workoutMetadata.name}</h3>
        <p className="text-gray-700 mb-4">{workoutMetadata.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(workoutMetadata.tags || []).map((tag: string, index: number) => (
            <Badge key={index} variant="secondary">
              {formatTagName(tag)}
            </Badge>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {workoutFlow.exercises.length}
            </div>
            <div className="text-xs text-gray-500">Exercises</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              ~{Math.round(calculateTotalTime() / 60)}
            </div>
            <div className="text-xs text-gray-500">Minutes</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Pre-Workout Questionnaires Component
function PreWorkoutQuestionnaires({ questionnaires }: { questionnaires: string[] }) {
  if (questionnaires.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Pre-Workout Questionnaires
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {questionnaires.map((questionnaire: string) => (
            <Badge key={questionnaire} variant="secondary" className="bg-blue-100 text-blue-700">
              {formatTagName(questionnaire)}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Warmup Routine Component
function WarmupRoutine({ warmup }: { warmup: string[] }) {
  if (warmup.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Warmup Routine
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {warmup.map((warmupItem: string) => (
            <Badge key={warmupItem} variant="secondary" className="bg-green-100 text-green-700">
              {formatTagName(warmupItem)}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// RPE Collection Component
function RPECollection({ rpe }: { rpe?: any }) {
  if (!rpe) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          RPE Collection
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Granularity:</span>
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
              {rpe.granularity === 'exercise' ? 'Per Exercise' : 'Session Only'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Input Mode:</span>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              {rpe.mode === 'emoji' ? 'Emoji' : 'Numeric (1-10)'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Exercise Sequence Component
function ExerciseSequence({
  workoutFlow,
  selectedExercises,
  getExerciseById,
  getDefaultMetricsForExerciseId
}: {
  workoutFlow: any;
  selectedExercises: any[];
  getExerciseById: (exerciseId: string) => any;
  getDefaultMetricsForExerciseId: (exerciseId: string) => any;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Exercise Sequence
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {workoutFlow.exercises.map((workoutExercise: any, index: number) => {
            const exerciseInfo = getExerciseById(workoutExercise.exercise_id);
            const sets = getDefaultMetricsForExerciseId(workoutExercise.exercise_id);
            // Use first set for display summary
            const displayMetrics = sets.length > 0 ? sets[0].metrics : {};

            if (!exerciseInfo) {
              return null; // Skip if exercise info not found
            }

            return (
              <div key={workoutExercise.exercise_id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">{exerciseInfo.name}</h4>
                    <Badge variant="secondary" className={getWorkoutColor([exerciseInfo.exercise_type])}>
                      {formatTagName(exerciseInfo.exercise_type)}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    {exerciseInfo.settings.sets_counting && (
                      <span>{sets.length} sets</span>
                    )}
                    {exerciseInfo.settings.sets_counting && exerciseInfo.settings.reps_counting && (
                      <span> × </span>
                    )}
                    {exerciseInfo.settings.reps_counting && (
                      <span>{displayMetrics.reps || 10} reps</span>
                    )}
                    {(exerciseInfo.exercise_type === 'cardio' || exerciseInfo.structure !== 'sets') && (
                      <span> • {displayMetrics.duration || 60}s duration</span>
                    )}
                    <span> • {displayMetrics.rest || 30}s rest</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Main Component
export function WorkoutPreviewStep() {
  const { workoutMetadata, workoutFlow } = useWorkout();
  const { selectedExercises } = useWorkoutExercises();

  if (!workoutMetadata) return null;

  // Helper function to get exercise info by ID
  const getExerciseById = (exerciseId: string) => {
    return selectedExercises.find(ex => ex.id === exerciseId);
  };

  // Helper function to get default metrics for a specific exercise
  const getDefaultMetricsForExerciseId = (exerciseId: string) => {
    const workoutExercise = workoutFlow.exercises?.find(ex => ex.exercise_id === exerciseId);
    return workoutExercise?.sets || [];
  };

  const calculateTotalTime = () => {
    return workoutFlow.exercises.reduce((total: number, exercise: any) => {
      const sets = getDefaultMetricsForExerciseId(exercise.exercise_id);
      if (sets.length === 0) return total;

      // Use first set as representative for duration/rest if they are consistent
      // Or sum them up if we want to be precise. Let's sum them up.
      return sets.reduce((setTotal: number, set: any) => {
        const duration = Number(set.metrics.duration) || 60;
        const rest = Number(set.metrics.rest) || 30;
        return setTotal + duration + rest;
      }, total);
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Workout Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Workout Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Workout Info */}
            <div className="lg:col-span-1">
              <WorkoutOverviewCard
                workoutMetadata={workoutMetadata}
                workoutFlow={workoutFlow}
                calculateTotalTime={calculateTotalTime}
              />
            </div>

            {/* Right Column - Details */}
            <div className="lg:col-span-2 space-y-6">
              <PreWorkoutQuestionnaires questionnaires={workoutFlow.questionnaires || []} />
              <WarmupRoutine warmup={workoutFlow.warmup || []} />
              <ExerciseSequence
                workoutFlow={workoutFlow}
                selectedExercises={selectedExercises}
                getExerciseById={getExerciseById}
                getDefaultMetricsForExerciseId={getDefaultMetricsForExerciseId}
              />
              <RPECollection rpe={workoutFlow.rpe} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
