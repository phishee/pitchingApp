'use client';

import React, { useState, useEffect } from 'react';
import { Filter, Dumbbell, Target, Trophy } from 'lucide-react';
import { exerciseApi } from '@/app/services-client/exerciseApi';
import { Exercise, ExerciseQueryParams } from '@/models/Exercise';
import { ExercisesHeader } from '@/components/exercises/ExerciseHeader';
import { SearchAndFilters } from '@/components/exercises/SearchFilter';
import { ExerciseCategoryCard } from '@/components/exercises/ExerciseCategoryCard';
import { ExerciseCard } from '@/components/exercises/ExerciseCard';
import { getTypeColor } from '@/lib/exerciseUtils';
import { useRouter } from 'next/navigation';

export default function ExercisesLibraryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exerciseCounts, setExerciseCounts] = useState({
    strength: 0,
    cardio: 0,
    baseball: 0,
    total: 0
  });
  const router = useRouter();

  // Load exercises on component mount
  useEffect(() => {
    loadExercises();
  }, []);

  // Load exercises when search term or type changes
  useEffect(() => {
    if (exercises.length > 0) {
      // If we already have exercises, filter them locally for better UX
      return;
    }
    loadExercises();
  }, [searchTerm, selectedType]);

  const loadExercises = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params: ExerciseQueryParams = {
        search: searchTerm || undefined,
        type: selectedType === 'all' ? undefined : selectedType,
        limit: 100 // Get all exercises
      };

      const response = await exerciseApi.getExercises(params);
      setExercises(response.data);

      // Calculate exercise counts
      const counts = {
        strength: response.filters.availableTypes.includes('strength') 
          ? response.data.filter(ex => ex.exercise_type === 'strength').length 
          : 0,
        cardio: response.filters.availableTypes.includes('cardio') 
          ? response.data.filter(ex => ex.exercise_type === 'cardio').length 
          : 0,
        baseball: response.filters.availableTypes.includes('baseball') 
          ? response.data.filter(ex => ex.exercise_type === 'baseball').length 
          : 0,
        total: response.filters.totalExercises
      };
      setExerciseCounts(counts);

    } catch (err) {
      console.error('Failed to load exercises:', err);
      setError(err instanceof Error ? err.message : 'Failed to load exercises');
    } finally {
      setLoading(false);
    }
  };

  // Filter exercises based on search and type (client-side filtering for better UX)
  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = searchTerm === '' || 
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = selectedType === 'all' || exercise.exercise_type === selectedType;
    
    return matchesSearch && matchesType;
  });

  // Event handlers
  const handleAddExercise = () => {
    console.log('Add exercise clicked');
  };

  const handleViewExercise = (exercise: Exercise) => {
    router.push(`/app/exercises-library/exercise/${exercise.id}`);
  };

  const handleEditExercise = (exercise: Exercise) => {
    console.log('Edit exercise:', exercise.name);
  };

  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
  };

  const handleTypeChange = (newType: string) => {
    setSelectedType(newType);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading exercises...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">Error: {error}</div>
          <button 
            onClick={loadExercises}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
      <ExercisesHeader onAddExercise={handleAddExercise} />
      
      <SearchAndFilters
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
      />

      {/* Exercise Categories */}
      <div className="flex justify-center">
        <div className="flex gap-2 md:gap-4 overflow-x-auto pb-2 px-2">
          <ExerciseCategoryCard
            title="All"
            icon={Filter}
            exerciseCount={exerciseCounts.total}
            bgColor="bg-gray-100"
            iconColor="text-gray-600"
            isSelected={selectedType === 'all'}
            onClick={() => handleTypeChange('all')}
          />
          <ExerciseCategoryCard
            title="Strength"
            icon={Dumbbell}
            exerciseCount={exerciseCounts.strength}
            bgColor="bg-red-100"
            iconColor="text-red-600"
            isSelected={selectedType === 'strength'}
            onClick={() => handleTypeChange('strength')}
          />
          <ExerciseCategoryCard
            title="Cardio"
            icon={Target}
            exerciseCount={exerciseCounts.cardio}
            bgColor="bg-green-100"
            iconColor="text-green-600"
            isSelected={selectedType === 'cardio'}
            onClick={() => handleTypeChange('cardio')}
          />
          <ExerciseCategoryCard
            title="Baseball"
            icon={Trophy}
            exerciseCount={exerciseCounts.baseball}
            bgColor="bg-blue-100"
            iconColor="text-blue-600"
            isSelected={selectedType === 'baseball'}
            onClick={() => handleTypeChange('baseball')}
          />
        </div>
      </div>

      {/* Exercise List */}
      <div className="space-y-4">
        <div className="px-2">
          <h2 className="text-base md:text-lg font-semibold text-gray-900">
            {selectedType === 'all' ? 'All Exercises' : `${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Exercises`}
            <span className="text-xs md:text-sm font-normal text-gray-500 ml-2">
              ({filteredExercises.length} exercises)
            </span>
          </h2>
        </div>
        <div className="space-y-4 md:space-y-6">
          {filteredExercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onClick={handleViewExercise}
              onEdit={handleEditExercise}
            />
          ))}
        </div>
        
        {filteredExercises.length === 0 && !loading && (
          <div className="text-center py-12 md:py-8 text-gray-500">
            <div className="text-sm md:text-base">No exercises found matching your criteria.</div>
          </div>
        )}
      </div>
    </div>
  );
}