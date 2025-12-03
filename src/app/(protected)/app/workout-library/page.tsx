'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { workoutApi } from '@/app/services-client/workoutApi';
import { Workout } from '@/models/Workout';

// Import components
import { WorkoutLibraryHeader } from '@/components/workout-library/components/WorkoutLibraryHeader';
import { WorkoutSearchFilters } from '@/components/workout-library/WorkoutSearchFilters';
import { WorkoutStatsGrid } from '@/components/workout-library/WorkoutStatsGrid';
import { WorkoutTemplatesSection } from '@/components/workout-library/WorkoutTemplatesSection';
import { useOrganization } from '@/providers/organization-context';

export default function WorkoutLibraryPage() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTagFilters, setShowTagFilters] = useState(false);
  const { currentOrganization } = useOrganization();

  // TODO: Get organizationId from context or props
  const organizationId = currentOrganization?._id; // This should come from your auth context

  // Load workouts on component mount
  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await workoutApi.getWorkouts({}, organizationId);
      setWorkouts(response.data);
    } catch (err) {
      console.error('Failed to load workouts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load workouts');
    } finally {
      setLoading(false);
    }
  };

  // Get all unique tags from workouts
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    workouts.forEach(workout => {
      workout.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, [workouts]);

  // Filter workouts based on search and tags
  const filteredWorkouts = useMemo(() => {
    return workouts.filter(workout => {
      const matchesSearch = workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workout.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workout.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesTags = selectedTags.length === 0 ||
        selectedTags.some(tag => workout.tags.includes(tag));

      return matchesSearch && matchesTags;
    });
  }, [workouts, searchTerm, selectedTags]);

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
    router.push(`/app/workout-library/${workoutId}/edit`);
  };

  const handleAssignWorkout = (workoutId: string) => {
    router.push(`/app/workout-library/assign?workoutId=${workoutId}`);
  };

  const handleCreateWorkout = () => {
    router.push('/app/workout-library/create');
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading workouts...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">Error: {error}</div>
          <button
            onClick={loadWorkouts}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

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

      <WorkoutStatsGrid workouts={workouts} />

      <WorkoutTemplatesSection
        workouts={filteredWorkouts}
        onViewWorkout={handleViewWorkout}
        onEditWorkout={handleEditWorkout}
        onAssignWorkout={handleAssignWorkout}
      />
    </div>
  );
}

