'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Plus, Target, Clock, X } from 'lucide-react';
import { getWorkoutColor, formatTagName } from '@/lib/workoutLibraryUtils';
import { Exercise, WorkoutExercise } from '@/models';
import { exerciseApi } from '@/app/services-client/exerciseApi';

interface ExerciseLibraryPopupProps {
  isOpen: boolean;
  onClose: () => void;
  selectedExercises: Exercise[];
  onExerciseSelect: (exercise: Exercise) => void;
  tags?: string[];
}

export function ExerciseLibrarySelection({ 
  selectedExercises, 
  onExerciseSelect,
  tags = []
}: ExerciseLibraryPopupProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);

  const categories = ['all', 'selected', 'strength', 'cardio', 'power', 'mobility', 'baseball'];

  useEffect(() => {
    loadExercises();
    // Auto-select tags if provided, otherwise set to 'all'
    if (tags && tags.length > 0) {
      setSelectedCategory(tags[0]);
    } else {
      setSelectedCategory('all');
    }
  }, []); // Only run once when component mounts

  const loadExercises = async () => {
    setLoading(true);
    try {
      const response = await exerciseApi.getExercises();
      setAllExercises(response.data);
    } catch (error) {
      console.error('Failed to load exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredExercises = allExercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Handle selected category
    if (selectedCategory === 'selected') {
      const isSelected = selectedExercises.some(ex => ex.id === exercise.id);
      return matchesSearch && isSelected;
    }
    
    // Handle other categories
    const matchesCategory = selectedCategory === 'all' || 
                           exercise.exercise_type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const isExerciseSelected = (exerciseId: string) => {
    return selectedExercises.some(ex => ex.id === exerciseId);
  };

  const handleExerciseSelect = (exercise: Exercise) => {
    onExerciseSelect(exercise);
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Search and Filter */}
      <div className="flex gap-4 mb-4">
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
              {category === 'selected' ? 'Selected' : formatTagName(category)}
            </Button>
          ))}
        </div>
      </div>

      {/* Exercise Grid */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading exercises...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExercises.map(exercise => {
              const isSelected = isExerciseSelected(exercise.id);
              
              return (
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
                      onClick={() => handleExerciseSelect(exercise)}
                      variant={isSelected ? "destructive" : "primary"}
                      className={`flex items-center gap-1 ${
                        isSelected 
                          ? "bg-red-500 hover:bg-red-600 text-white" 
                          : "bg-blue-500 hover:bg-blue-600 text-white"
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <X className="w-3 h-3" />
                          Remove
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3" />
                          Add
                        </>
                      )}
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}