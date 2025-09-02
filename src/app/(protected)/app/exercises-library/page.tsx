'use client';

import React, { useState } from 'react';
import { Filter, Dumbbell, Target, Trophy } from 'lucide-react';
import { fakeExercises } from '@/data/fakeExercises';
import { ExercisesHeader } from '@/components/exercises/ExerciseHeader';
import { SearchAndFilters } from '@/components/exercises/SearchFilter';
import { ExerciseCategoryCard } from '@/components/exercises/ExerciseCategoryCard';
import { ExerciseCard } from '@/components/exercises/ExerciseCard';
import { getTypeColor } from '@/lib/exerciseUtils';
import { useRouter } from 'next/navigation';

export default function ExercisesLibraryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const router = useRouter();

  // Filter exercises based on search and type
  const filteredExercises = fakeExercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = selectedType === 'all' || exercise.exercise_type === selectedType;
    
    return matchesSearch && matchesType;
  });

  // Get exercise counts by type
  const exerciseCounts = {
    strength: fakeExercises.filter(ex => ex.exercise_type === 'strength').length,
    cardio: fakeExercises.filter(ex => ex.exercise_type === 'cardio').length,
    baseball: fakeExercises.filter(ex => ex.exercise_type === 'baseball').length,
  };

  // Event handlers
  const handleAddExercise = () => {
    console.log('Add exercise clicked');
  };

  const handleViewExercise = (exercise: any) => {
    router.push(`/app/exercises-library/exercise/${exercise.id}`);
  };

  const handleEditExercise = (exercise: any) => {
    console.log('Edit exercise:', exercise.name);
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
      <ExercisesHeader onAddExercise={handleAddExercise} />
      
      <SearchAndFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Exercise Categories */}
      <div className="flex justify-center">
        <div className="flex gap-2 md:gap-4 overflow-x-auto pb-2 px-2">
          <ExerciseCategoryCard
            title="All"
            icon={Filter}
            exerciseCount={fakeExercises.length}
            bgColor="bg-gray-100"
            iconColor="text-gray-600"
            isSelected={selectedType === 'all'}
            onClick={() => setSelectedType('all')}
          />
          <ExerciseCategoryCard
            title="Strength"
            icon={Dumbbell}
            exerciseCount={exerciseCounts.strength}
            bgColor="bg-red-100"
            iconColor="text-red-600"
            isSelected={selectedType === 'strength'}
            onClick={() => setSelectedType('strength')}
          />
          <ExerciseCategoryCard
            title="Cardio"
            icon={Target}
            exerciseCount={exerciseCounts.cardio}
            bgColor="bg-green-100"
            iconColor="text-green-600"
            isSelected={selectedType === 'cardio'}
            onClick={() => setSelectedType('cardio')}
          />
          <ExerciseCategoryCard
            title="Baseball"
            icon={Trophy}
            exerciseCount={exerciseCounts.baseball}
            bgColor="bg-blue-100"
            iconColor="text-blue-600"
            isSelected={selectedType === 'baseball'}
            onClick={() => setSelectedType('baseball')}
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
        
        {filteredExercises.length === 0 && (
          <div className="text-center py-12 md:py-8 text-gray-500">
            <div className="text-sm md:text-base">No exercises found matching your criteria.</div>
          </div>
        )}
      </div>
    </div>
  );
}