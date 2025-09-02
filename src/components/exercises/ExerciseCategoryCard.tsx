'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ExerciseCategoryCardProps {
  title: string;
  icon: LucideIcon;
  exerciseCount: number;
  bgColor: string;
  iconColor: string;
  isSelected: boolean;
  onClick: () => void;
}

export function ExerciseCategoryCard({
  title,
  icon: Icon,
  exerciseCount,
  bgColor,
  iconColor,
  isSelected,
  onClick
}: ExerciseCategoryCardProps) {
  return (
    <div 
      className={`flex items-center gap-2 md:gap-3 p-2 md:p-4 rounded-lg border cursor-pointer transition-colors whitespace-nowrap flex-shrink-0 ${
        isSelected ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200 hover:bg-gray-50'
      }`}
      onClick={onClick}
    >
      <div className={`p-1 md:p-2 ${bgColor} rounded-lg`}>
        <Icon className={`w-3 h-3 md:w-5 md:h-5 ${iconColor}`} />
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 text-sm md:text-base">{title}</h3>
        <p className="text-xs md:text-sm text-gray-600">{exerciseCount} exercises</p>
      </div>
    </div>
  );
}