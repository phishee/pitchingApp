'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fakeWorkouts } from '@/data/fakeExercises';
import { fakeExercises } from '@/data/fakeExercises';

// Import components
import { WorkoutDetailHeader } from '@/components/workouts/WorkoutDetailHeader';
import { WorkoutCoverCard } from '@/components/workouts/WorkoutCoverCard';
import { WorkoutTabs } from '@/components/workouts/WorkoutTabs';
import { WorkoutOverviewTab } from '@/components/workouts/WorkoutOverviewTab';
import { WorkoutFlowTab } from '@/components/workouts/WorkoutFlowTab';
import { WorkoutExercisesTab } from '@/components/workouts/WorkoutExercisesTab';
import { WorkoutHistoryTab } from '@/components/workouts/WorkoutHistoryTab';

export default function WorkoutDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [workout, setWorkout] = useState<any>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    if (params.id) {
      const foundWorkout = fakeWorkouts.find(w => w.id === params.id);
      if (foundWorkout) {
        setWorkout(foundWorkout);
      } else {
        router.push('/app/workout-library');
      }
    }
  }, [params.id, router]);

  if (!workout) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading workout...</p>
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

  const getExerciseDetails = (exerciseId: string) => {
    return fakeExercises.find(ex => ex.id === exerciseId);
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
