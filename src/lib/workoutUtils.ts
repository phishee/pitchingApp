import { 
    Dumbbell, 
    Heart, 
    Zap, 
    Trophy, 
    Activity, 
    TrendingUp, 
    Target,
    LucideIcon 
  } from 'lucide-react';
  
  export const getWorkoutIcon = (tags: string[]): LucideIcon => {
    if (tags.includes('strength')) return Dumbbell;
    if (tags.includes('cardio')) return Heart;
    if (tags.includes('power')) return Zap;
    if (tags.includes('baseball')) return Trophy;
    if (tags.includes('mobility')) return Activity;
    if (tags.includes('speed')) return TrendingUp;
    if (tags.includes('recovery')) return Heart;
    return Target;
  };
  
  export const getWorkoutColor = (tags: string[]): string => {
    if (tags.includes('strength')) return 'bg-blue-100 text-blue-700';
    if (tags.includes('cardio')) return 'bg-green-100 text-green-700';
    if (tags.includes('power')) return 'bg-purple-100 text-purple-700';
    if (tags.includes('baseball')) return 'bg-orange-100 text-orange-700';
    if (tags.includes('mobility')) return 'bg-indigo-100 text-indigo-700';
    if (tags.includes('speed')) return 'bg-red-100 text-red-700';
    if (tags.includes('recovery')) return 'bg-pink-100 text-pink-700';
    return 'bg-gray-100 text-gray-700';
  };
  
  export const formatTagName = (tag: string): string => {
    return tag.replace(/_/g, ' ');
  };