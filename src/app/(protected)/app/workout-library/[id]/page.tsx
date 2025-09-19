'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { workoutApi } from '@/app/services-client/workoutApi';
import { exerciseApi } from '@/app/services-client/exerciseApi';
import { Workout } from '@/models/Workout';
import { Exercise } from '@/models/Exercise';

// Import components
import { WorkoutDetailHeader } from '@/components/workouts/WorkoutDetailHeader';
import { WorkoutCoverCard } from '@/components/workouts/WorkoutCoverCard';
import { WorkoutTabs } from '@/components/workouts/WorkoutTabs';
import { WorkoutOverviewTab } from '@/components/workouts/WorkoutOverviewTab';
import { WorkoutFlowTab } from '@/components/workouts/WorkoutFlowTab';
import { WorkoutExercisesTab } from '@/components/workouts/WorkoutExercisesTab';
import { WorkoutHistoryTab } from '@/components/workouts/WorkoutHistoryTab';
import { useOrganization } from '@/providers/organization-context';

export default function WorkoutDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const { currentOrganization } = useOrganization();
  
  // TODO: Get organizationId from context or props
  const organizationId = currentOrganization?._id; // This should come from your auth context

  useEffect(() => {
    if (params.id) {
      loadWorkout(params.id as string);
    }
  }, [params.id]);

  const loadWorkout = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const workoutData = await workoutApi.getWorkoutById(id, organizationId);
      setWorkout(workoutData);
    } catch (err) {
      console.error('Failed to load workout:', err);
      setError(err instanceof Error ? err.message : 'Failed to load workout');
      // Redirect to workout library if workout not found
      router.push('/app/workout-library');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading workout...</p>
        </div>
      </div>
    );
  }

  if (error || !workout) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 mb-4">Error: {error || 'Workout not found'}</div>
          <button 
            onClick={() => router.push('/app/workout-library')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Workouts
          </button>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    console.log('Edit workout:', workout.name);
  };

  const handleAssign = () => {
    console.log('Assign workout:', workout.name);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = () => {
    console.log('Share workout:', workout.name);
  };

  const getExerciseDetails = async (exerciseId: string): Promise<Exercise | null> => {
    try {
      const exercise = await exerciseApi.getExerciseById(exerciseId);
      return exercise;
    } catch (error) {
      console.error('Failed to load exercise:', error);
      return null;
    }
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'overview':
        return <WorkoutOverviewTab workout={workout} />;
      case 'flow':
        return <WorkoutFlowTab workout={workout} getExerciseDetails={getExerciseDetails} />;
      case 'exercises':
        return <WorkoutExercisesTab workout={workout} getExerciseDetails={getExerciseDetails} />;
      case 'history':
        return <WorkoutHistoryTab />;
      default:
        return <WorkoutOverviewTab workout={workout} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <WorkoutDetailHeader
        workoutName={workout.name}
        isBookmarked={isBookmarked}
        onBack={handleBack}
        onEdit={handleEdit}
        onAssign={handleAssign}
        onBookmark={handleBookmark}
        onShare={handleShare}
      />

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Workout Cover & Info */}
          <div className="lg:col-span-1">
            <WorkoutCoverCard workout={workout} />
          </div>

          {/* Right Column - Content */}
          <div className="lg:col-span-2">
            <WorkoutTabs selectedTab={selectedTab} onTabChange={setSelectedTab}>
              {renderTabContent()}
            </WorkoutTabs>
          </div>
        </div>
      </div>
    </div>
  );
}
