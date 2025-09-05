'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { fakeWorkouts } from '@/data/fakeExercises';

// Import components
import { WorkoutLibraryHeader } from '@/components/workout-library/components/WorkoutLibraryHeader';
import { WorkoutSearchFilters } from '@/components/workout-library/WorkoutSearchFilters';
import { WorkoutStatsGrid } from '@/components/workout-library/WorkoutStatsGrid';
import { WorkoutTemplatesSection } from '@/components/workout-library/WorkoutTemplatesSection';

export default function WorkoutLibraryPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTagFilters, setShowTagFilters] = useState(false);

  // Get all unique tags from workouts
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    fakeWorkouts.forEach(workout => {
      workout.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, []);

  // Filter workouts based on search and tags
  const filteredWorkouts = useMemo(() => {
    return fakeWorkouts.filter(workout => {
      const matchesSearch = workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           workout.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           workout.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesTags = selectedTags.length === 0 || 
                         selectedTags.some(tag => workout.tags.includes(tag));
      
      return matchesSearch && matchesTags;
    });
  }, [searchTerm, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearAllTags = () => {
    setSelectedTags([]);
  };

  const handleViewWorkout = (workoutId: string) => {
    router.push(`/app/workout-library/${workoutId}`);
  };

  const handleEditWorkout = (workoutId: string) => {
    router.push(`/app/workout-library/edit/${workoutId}`);
  };

  const handleAssignWorkout = (workoutId: string) => {
    console.log('Assign workout:', workoutId);
  };

  const handleCreateWorkout = () => {
    router.push('/app/workout-library/create');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <WorkoutLibraryHeader onCreateWorkout={handleCreateWorkout} />
      
      <WorkoutSearchFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        allTags={allTags}
        selectedTags={selectedTags}
        onTagToggle={toggleTag}
        onClearAllTags={clearAllTags}
        showTagFilters={showTagFilters}
        onToggleTagFilters={() => setShowTagFilters(!showTagFilters)}
      />

      <WorkoutStatsGrid workouts={fakeWorkouts} />

      <WorkoutTemplatesSection
        workouts={filteredWorkouts}
        onViewWorkout={handleViewWorkout}
        onEditWorkout={handleEditWorkout}
        onAssignWorkout={handleAssignWorkout}
      />
    </div>
  );
}

