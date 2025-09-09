'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BarChart3, Dumbbell, Target, Trophy } from 'lucide-react';
import { fakeExercises } from '@/data/fakeExercises';
import { ExerciseDetailHeader } from '@/components/exercises/ExerciseDetailHeader';
import { ExerciseMediaCard } from '@/components/exercises/ExerciseMediaCard';
import { ExerciseTabs } from '@/components/exercises/ExerciseTabs';
import { ExerciseOverviewTab } from '@/components/exercises/ExerciseOverviewTab';
import { ExerciseInstructionsTab } from '@/components/exercises/ExerciseInstructionsTab';
import { ExerciseMetricsTab } from '@/components/exercises/ExerciseMetricsTab';
import { exerciseApi } from '@/app/services-client/exerciseApi';
import { Exercise } from '@/types/exercise';


export default function ExerciseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Move loadExercise function before useEffect
  const loadExercise = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const exerciseData = await exerciseApi.getExerciseById(id);
      setExercise(exerciseData);
    } catch (err) {
      console.error('Failed to load exercise:', err);
      setError(err instanceof Error ? err.message : 'Failed to load exercise');
      router.push('/app/exercises-library');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      loadExercise(params.id as string);
    }
  }, [params.id, router]);

  if (!exercise) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading exercise...</p>
        </div>
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'strength': return Dumbbell;
      case 'cardio': return Target;
      case 'baseball': return Trophy;
      default: return Dumbbell;
    }
  };

  const TypeIcon = getTypeIcon(exercise.exercise_type);

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    console.log('Edit exercise:', exercise.name);
  };

  const handleAssign = () => {
    console.log('Assign exercise:', exercise.name);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = () => {
    console.log('Share exercise:', exercise.name);
  };

  const handleVideoToggle = () => {
    setIsVideoPlaying(!isVideoPlaying);
  };

  const handleTabChange = (tabId: string) => {
    setSelectedTab(tabId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ExerciseDetailHeader
        exerciseName={exercise.name}
        onBack={handleBack}
        onEdit={handleEdit}
        onAssign={handleAssign}
        onBookmark={handleBookmark}
        onShare={handleShare}
        isBookmarked={isBookmarked}
        canEdit={exercise.owner !== "system"}
      />

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Exercise Image/Video */}
          <div className="lg:col-span-1">
            <ExerciseMediaCard
              exercise={exercise}
              TypeIcon={TypeIcon}
              isVideoPlaying={isVideoPlaying}
              onVideoToggle={handleVideoToggle}
            />
          </div>

          {/* Right Column - Content */}
          <div className="lg:col-span-2">
            {/* Tab Navigation */}
            <div className="bg-white rounded-2xl shadow-sm mb-6">
              <ExerciseTabs
                selectedTab={selectedTab}
                onTabChange={handleTabChange}
              />

              {/* Tab Content */}
              <div className="p-6">
                {selectedTab === 'overview' && (
                  <ExerciseOverviewTab exercise={exercise} />
                )}

                {selectedTab === 'instructions' && (
                  <ExerciseInstructionsTab exercise={exercise} />
                )}

                {selectedTab === 'metrics' && (
                  <ExerciseMetricsTab exercise={exercise} />
                )}

                {selectedTab === 'history' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Exercise History</h3>
                    <div className="text-center py-12 text-gray-500">
                      <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">No workout history yet</p>
                      <p className="text-sm">This exercise hasn't been used in any workouts</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
