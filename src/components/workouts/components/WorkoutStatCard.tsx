import React from 'react';

interface WorkoutStatCardProps {
  value: number;
  label: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

export function WorkoutStatCard({ value, label, color }: WorkoutStatCardProps) {
  const getColorClass = () => {
    switch (color) {
      case 'blue':
        return 'text-blue-600';
      case 'green':
        return 'text-green-600';
      case 'purple':
        return 'text-purple-600';
      case 'orange':
        return 'text-orange-600';
      case 'red':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className={`text-2xl font-bold ${getColorClass()}`}>
        {value}
      </div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}
