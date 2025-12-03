import React from 'react';
import { Play, Pause } from 'lucide-react';
import { Tag } from '@/components/ui/tag';

interface ExerciseMediaCardProps {
  exercise: any;
  TypeIcon: React.ComponentType<any>;
  isVideoPlaying: boolean;
  onVideoToggle: () => void;
}

export function ExerciseMediaCard({
  exercise,
  TypeIcon,
  isVideoPlaying,
  onVideoToggle
}: ExerciseMediaCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Main Image */}
      <div className="relative aspect-video bg-gray-100">
        {exercise?.photoCover ? (
          <img
            src={exercise?.photoCover}
            alt={exercise?.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <TypeIcon className="w-16 h-16 text-gray-400" />
          </div>
        )}

        {/* Video Play Button Overlay */}
        {/* {exercise.instructions?.video && (
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
            <button
              onClick={onVideoToggle}
              className="bg-white bg-opacity-90 hover:bg-opacity-100 p-4 rounded-full transition-all duration-200 transform hover:scale-110"
            >
              {isVideoPlaying ? (
                <Pause className="w-8 h-8 text-gray-800" />
              ) : (
                <Play className="w-8 h-8 text-gray-800 ml-1" />
              )}
            </button>
          </div>
        )} */}
      </div>

      {/* Exercise Info */}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4 justify-between">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${exercise.exercise_type === 'strength' ? 'bg-red-100 text-red-700' : exercise.exercise_type === 'cardio' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
              {exercise?.exercise_type}
            </span>
            <span className="text-sm text-gray-500">v{exercise?.version}</span>
          </div>
          <span className="text-sm text-gray-600">by: {exercise?.owner}</span>
        </div>

        <p className="text-gray-700 mb-4">{exercise?.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {exercise?.tags?.map((tag: string, index: number) => (
            <Tag key={index} value={tag} className="rounded-full" />
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {exercise?.metrics?.length || 0}
            </div>
            <div className="text-xs text-gray-500">Metrics</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {exercise?.instructions?.text?.length || 0}
            </div>
            <div className="text-xs text-gray-500">Steps</div>
          </div>
        </div>
      </div>
    </div>
  );
}