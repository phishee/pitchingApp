import React from 'react';
import { ArrowLeft, Edit3, Plus, Bookmark, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExerciseDetailHeaderProps {
  exerciseName: string;
  onBack: () => void;
  onEdit: () => void;
  onAssign: () => void;
  onBookmark: () => void;
  onShare: () => void;
  isBookmarked: boolean;
  canEdit: boolean;
}

export function ExerciseDetailHeader({
  exerciseName,
  onBack,
  onEdit,
  onAssign,
  onBookmark,
  onShare,
  isBookmarked,
  canEdit
}: ExerciseDetailHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{exerciseName}</h1>
              <p className="text-sm text-gray-600">Exercise Details</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onBookmark}
              className={`p-2 rounded-lg transition-colors ${
                isBookmarked 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={onShare}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
            >
              <Share2 className="w-5 h-5" />
            </button>
            {canEdit && (
              <button
                onClick={onEdit}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
              >
                <Edit3 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onAssign}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Assign
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}