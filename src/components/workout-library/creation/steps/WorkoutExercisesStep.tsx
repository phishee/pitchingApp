import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Target, Clock, X } from 'lucide-react';
import { fakeExercises } from '@/data/fakeExercises';
import { getWorkoutColor, formatTagName } from '@/lib/workoutLibraryUtils';

interface WorkoutExercisesStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

export function WorkoutExercisesStep({ data, onUpdate }: WorkoutExercisesStepProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'strength', 'cardio', 'power', 'mobility', 'baseball'];

  // Ensure exercises array exists with fallback
  const exercises = data?.flow?.exercises || [];

  const filteredExercises = fakeExercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           exercise.exercise_type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddExercise = (exercise: any) => {
    const exerciseWithConfig = {
      ...exercise,
      sets: 3,
      reps: 10,
      duration: 60,
      rest: 30
    };
    onUpdate({ 
      flow: {
        ...data.flow,
        exercises: [...exercises, exerciseWithConfig]
      }
    });
  };

  const handleRemoveExercise = (exerciseId: string) => {
    onUpdate({ 
      flow: {
        ...data.flow,
        exercises: exercises.filter((ex: any) => ex.id !== exerciseId)
      }
    });
  };

  const handleUpdateExerciseConfig = (exerciseId: string, field: string, value: any) => {
    onUpdate({
      flow: {
        ...data.flow,
        exercises: exercises.map((ex: any) =>
          ex.id === exerciseId ? { ...ex, [field]: value } : ex
        )
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Selected Exercises */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Selected Exercises ({exercises.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {exercises.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No exercises selected yet</p>
              <p className="text-sm">Add exercises from the library below</p>
            </div>
          ) : (
            <div className="space-y-4">
              {exercises.map((exercise: any, index: number) => (
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
                      <div>
                        <label className="text-gray-600">Sets</label>
                        <Input
                          type="number"
                          value={exercise.sets}
                          onChange={(e) => handleUpdateExerciseConfig(exercise.id, 'sets', parseInt(e.target.value))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-gray-600">Reps</label>
                        <Input
                          type="number"
                          value={exercise.reps}
                          onChange={(e) => handleUpdateExerciseConfig(exercise.id, 'reps', parseInt(e.target.value))}
                          className="mt-1"
                        />
                      </div>
                      {/* <div>
                        <label className="text-gray-600">Duration (s)</label>
                        <Input
                          type="number"
                          value={exercise.duration}
                          onChange={(e) => handleUpdateExerciseConfig(exercise.id, 'duration', parseInt(e.target.value))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-gray-600">Rest (s)</label>
                        <Input
                          type="number"
                          value={exercise.rest}
                          onChange={(e) => handleUpdateExerciseConfig(exercise.id, 'rest', parseInt(e.target.value))}
                          className="mt-1"
                        />
                      </div> */}
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exercise Library */}
      <Card>
        <CardHeader>
          <CardTitle>Exercise Library</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search exercises..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {formatTagName(category)}
                </Button>
              ))}
            </div>
          </div>

          {/* Exercise Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExercises.map(exercise => (
              <div key={exercise.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{exercise.name}</h4>
                    <Badge variant="secondary" className={getWorkoutColor([exercise.exercise_type])}>
                      {formatTagName(exercise.exercise_type)}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAddExercise(exercise)}
                    disabled={exercises.some((ex: any) => ex.id === exercise.id)}
                    className="flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add
                  </Button>
                </div>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {exercise.description}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    <span>{exercise.metrics?.length || 0} metrics</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>~15 min</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}