import { 
    Dumbbell, 
    Heart, 
    Zap, 
    Target,
    TrendingUp,
    LucideIcon 
  } from 'lucide-react';
  
  export const getWorkoutIcon = (tags: string[]): LucideIcon => {
    if (tags.includes('strength')) return Dumbbell;
    if (tags.includes('cardio')) return Heart;
    if (tags.includes('power')) return Zap;
    if (tags.includes('baseball')) return TrendingUp;
    return Target;
  };
  
  export const getWorkoutColor = (tags: string[]): string => {
    if (tags.includes('strength')) return 'bg-blue-100 text-blue-700';
    if (tags.includes('cardio')) return 'bg-green-100 text-green-700';
    if (tags.includes('power')) return 'bg-purple-100 text-purple-700';
    if (tags.includes('baseball')) return 'bg-orange-100 text-orange-700';
    return 'bg-gray-100 text-gray-700';
  };
  
  export const formatTagName = (tag: string): string => {
    return tag.replace(/_/g, ' ');
  };
  
  export const calculateWorkoutStats = (workouts: any[]) => {
    return {
      totalWorkouts: workouts.length,
      totalExercises: workouts.reduce((total, workout) => total + workout.flow.exercises.length, 0),
      teamsUsing: new Set(workouts.flatMap(w => w.teamIds)).size,
      baseballFocus: workouts.filter(w => w.tags.includes('baseball')).length
    };
  };