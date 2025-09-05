import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, X, GripVertical, Clock, Target } from 'lucide-react';
import { formatTagName } from '@/lib/workoutLibraryUtils';

interface WorkoutFlowStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

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

export function WorkoutFlowStep({ data, onUpdate }: WorkoutFlowStepProps) {
  const [newQuestionnaire, setNewQuestionnaire] = useState('');
  const [newWarmup, setNewWarmup] = useState('');

  const handleAddQuestionnaire = (type: string) => {
    if (!data.flow.questionnaires.includes(type)) {
      onUpdate({
        flow: {
          ...data.flow,
          questionnaires: [...data.flow.questionnaires, type]
        }
      });
    }
  };

  const handleRemoveQuestionnaire = (type: string) => {
    onUpdate({
      flow: {
        ...data.flow,
        questionnaires: data.flow.questionnaires.filter((q: string) => q !== type)
      }
    });
  };

  const handleAddWarmup = (type: string) => {
    if (!data.flow.warmup.includes(type)) {
      onUpdate({
        flow: {
          ...data.flow,
          warmup: [...data.flow.warmup, type]
        }
      });
    }
  };

  const handleRemoveWarmup = (type: string) => {
    onUpdate({
      flow: {
        ...data.flow,
        warmup: data.flow.warmup.filter((w: string) => w !== type)
      }
    });
  };

  const handleMoveExercise = (fromIndex: number, toIndex: number) => {
    const newExercises = [...data.exercises];
    const [movedExercise] = newExercises.splice(fromIndex, 1);
    newExercises.splice(toIndex, 0, movedExercise);
    onUpdate({ exercises: newExercises });
  };

  const calculateTotalTime = () => {
    return data.exercises.reduce((total: number, exercise: any) => {
      return total + (exercise.sets * exercise.duration) + (exercise.sets * exercise.rest);
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
            {data.flow.questionnaires.map((questionnaire: string) => (
              <Badge
                key={questionnaire}
                variant="secondary"
                className="flex items-center gap-1 bg-blue-100 text-blue-700"
              >
                {formatTagName(questionnaire)}
                <button
                  onClick={() => handleRemoveQuestionnaire(questionnaire)}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {questionnaireTypes
              .filter(type => !data.flow.questionnaires.includes(type))
              .map(type => (
                <button
                  key={type}
                  onClick={() => handleAddQuestionnaire(type)}
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
            {data.flow.warmup.map((warmup: string) => (
              <Badge
                key={warmup}
                variant="secondary"
                className="flex items-center gap-1 bg-green-100 text-green-700"
              >
                {formatTagName(warmup)}
                <button
                  onClick={() => handleRemoveWarmup(warmup)}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {warmupTypes
              .filter(type => !data.flow.warmup.includes(type))
              .map(type => (
                <button
                  key={type}
                  onClick={() => handleAddWarmup(type)}
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
          {data.exercises.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No exercises in sequence</p>
              <p className="text-sm">Add exercises in the previous step</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.exercises.map((exercise: any, index: number) => (
                <div key={exercise.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{exercise.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <span>{exercise.sets} sets</span>
                      <span>{exercise.reps} reps</span>
                      <span>{exercise.duration}s duration</span>
                      <span>{exercise.rest}s rest</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    {index > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMoveExercise(index, index - 1)}
                      >
                        ↑
                      </Button>
                    )}
                    {index < data.exercises.length - 1 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMoveExercise(index, index + 1)}
                      >
                        ↓
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}