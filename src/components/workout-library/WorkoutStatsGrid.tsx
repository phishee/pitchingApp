import React from 'react';
import { BookOpen, Target, Users, TrendingUp } from 'lucide-react';
import { StatCard } from './components/StatCard';
import { calculateWorkoutStats } from '@/lib/workoutLibraryUtils';

interface WorkoutStatsGridProps {
  workouts: any[];
}

export function WorkoutStatsGrid({ workouts }: WorkoutStatsGridProps) {
  const stats = calculateWorkoutStats(workouts);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        icon={BookOpen}
        value={stats.totalWorkouts}
        label="Total Workouts"
        color="blue"
      />
      <StatCard
        icon={Target}
        value={stats.totalExercises}
        label="Total Exercises"
        color="green"
      />
      <StatCard
        icon={Users}
        value={stats.teamsUsing}
        label="Teams Using"
        color="purple"
      />
      <StatCard
        icon={TrendingUp}
        value={stats.baseballFocus}
        label="Baseball Focus"
        color="orange"
      />
    </div>
  );
}