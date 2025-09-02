import { Dumbbell, Target, Trophy } from 'lucide-react';

export const getTypeIcon = (type: string) => {
  switch (type) {
    case 'strength': return Dumbbell;
    case 'cardio': return Target;
    case 'baseball': return Trophy;
    default: return Dumbbell;
  }
};

export const getTypeColor = (type: string) => {
  switch (type) {
    case 'strength': return 'bg-red-100 text-red-700';
    case 'cardio': return 'bg-green-100 text-green-700';
    case 'baseball': return 'bg-blue-100 text-blue-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};