import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Target, Users, FileText, Zap } from 'lucide-react';
import { getWorkoutIcon, getWorkoutColor, formatTagName } from '@/lib/workoutLibraryUtils';
import { useWorkout } from '@/providers/workout-context';

export function WorkoutPreviewStep() {
  const { workout, selectedExercises } = useWorkout();

  if (!workout) return null;

  const WorkoutIcon = getWorkoutIcon(workout.tags || []);
  const workoutColor = getWorkoutColor(workout.tags || []);

  const calculateTotalTime = () => {
    return workout.flow.exercises.reduce((total: number, exercise: any) => {
      return total + (exercise.sets * exercise.duration) + (exercise.sets * exercise.rest);
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
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* Cover Image */}
                <div className="relative aspect-video bg-gray-100">
                  {workout.coverImage ? (
                    <img
                      src={workout.coverImage}
                      alt={workout.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <Target className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <Badge className={workoutColor}>
                      {workout.tags && workout.tags[0] ? formatTagName(workout.tags[0]) : 'Workout'}
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
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{workout.name}</h3>
                  <p className="text-gray-700 mb-4">{workout.description}</p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(workout.tags || []).map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {formatTagName(tag)}
                      </Badge>
                    ))}
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {workout.flow.exercises.length}
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
            </div>

            {/* Right Column - Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Questionnaires */}
              {(workout.flow.questionnaires || []).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Pre-Workout Questionnaires
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {(workout.flow.questionnaires || []).map((questionnaire: string) => (
                        <Badge key={questionnaire} variant="secondary" className="bg-blue-100 text-blue-700">
                          {formatTagName(questionnaire)}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Warmup */}
              {(workout.flow.warmup || []).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Warmup Routine
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {(workout.flow.warmup || []).map((warmup: string) => (
                        <Badge key={warmup} variant="secondary" className="bg-green-100 text-green-700">
                          {formatTagName(warmup)}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Exercise Sequence */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Exercise Sequence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {workout.flow.exercises.map((exercise: any, index: number) => (
                      <div key={exercise.id || exercise.exercise_id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{exercise.name}</h4>
                          <div className="text-sm text-gray-500">
                            {exercise.sets || 3} sets × {exercise.reps || 10} reps • {exercise.duration || 60}s • {exercise.rest || 30}s rest
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
